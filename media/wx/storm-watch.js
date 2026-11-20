/* Havok Storm Watch — utility-bar weather chip + 48-hour popup (12 × 4-hour blocks).
   Drop-in: <div data-wx></div> anywhere in the amber utility bar, then load this file.
   Data: Open-Meteo hourly forecast (no key) + NWS active alerts for the selected zone.
   Optional attributes on [data-wx]:
     data-zones='[{"id":"oak","name":"East Bay","place":"Oakland","lat":37.8044,"lon":-122.2712}]'
     data-tz="America/Los_Angeles"  data-prep="blog/atmospheric-river-prep-checklist-east-bay.html"
     data-dispatch="index.html#dispatch" */
(function () {
  var host = document.querySelector("[data-wx]");
  if (!host) return;

  var ZONES = [
    { id: "oak", name: "East Bay", place: "Oakland", lat: 37.8044, lon: -122.2712 },
    { id: "liv", name: "Tri-Valley", place: "Livermore", lat: 37.6819, lon: -121.768 },
    { id: "sjc", name: "South Bay", place: "San Jose", lat: 37.3382, lon: -121.8863 },
    { id: "smo", name: "Peninsula", place: "San Mateo", lat: 37.563, lon: -122.3255 }
  ];
  try { if (host.dataset.zones) ZONES = JSON.parse(host.dataset.zones); } catch (e) {}
  var TZ = host.dataset.tz || "America/Los_Angeles";
  var PREP = host.dataset.prep || "blog/atmospheric-river-prep-checklist-east-bay.html";
  var DISPATCH = host.dataset.dispatch || "index.html#dispatch";
  var KEY = "havok-wx-zone", TTL = 30 * 60 * 1000;

  // Thresholds per 4-hour block (inches / mph / %). "Watch" = worth acting on.
  var T = { rainHeavy: 0.5, rainWatch: 0.2, gustWatch: 35, gustHeavy: 45, chanceLikely: 60 };

  /* ---------------- styles ---------------- */
  var css = "" +
    ".wx{position:relative}" +
    ".wx-btn{display:inline-flex;align-items:center;gap:8px;height:28px;padding:0 10px;margin:-4px 0;border:1px solid rgba(27,38,50,.35);border-radius:4px;background:transparent;color:#1B2632;font:700 13px/1 Sora,system-ui,sans-serif;cursor:pointer;white-space:nowrap;transition:background .2s cubic-bezier(.4,0,.2,1),border-color .2s cubic-bezier(.4,0,.2,1),color .2s cubic-bezier(.4,0,.2,1)}" +
    ".wx-btn:hover{background:rgba(27,38,50,.1);border-color:#1B2632}" +
    ".wx-btn:focus-visible{outline:2px solid #1B2632;outline-offset:2px}" +
    ".wx-btn[aria-expanded=true]{background:#1B2632;color:#F7F7F6;border-color:#1B2632}" +
    ".wx-btn svg{width:16px;height:16px;flex:none}" +
    ".wx-btn .wx-t{font:600 12px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.02em}" +
    ".wx-btn .wx-lv{display:inline-flex;align-items:center;gap:6px;font:700 10px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase}" +
    ".wx-btn .wx-lv em{font-style:normal}" +
    ".wx-btn .wx-lv i{width:7px;height:7px;background:currentColor;transform:rotate(45deg)}" +
    ".wx-btn[data-lv=watch] .wx-lv{color:#7A1E14}.wx-btn[data-lv=watch][aria-expanded=true] .wx-lv{color:#F08A7E}" +
    ".wx-btn[data-lv=watch] .wx-lv i{animation:wxp 1.6s cubic-bezier(.4,0,.2,1) infinite}" +
    "@keyframes wxp{50%{opacity:.25}}" +
    ".wx-sep{width:1px;height:14px;background:currentColor;opacity:.3}" +
    ".wx-pop{position:absolute;right:0;top:calc(100% + 10px);z-index:120;width:min(560px,calc(100vw - 24px));max-height:min(680px,calc(100vh - 80px));overflow:auto;overscroll-behavior:contain;background:#1D2A37;color:#F7F7F6;border:1px solid rgba(169,187,199,.26);border-radius:4px;box-shadow:0 1px 0 rgba(0,0,0,.35),0 16px 40px rgba(6,10,14,.45);opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .22s cubic-bezier(.4,0,.2,1),transform .22s cubic-bezier(.2,.9,.1,1),visibility 0s linear .22s;text-align:left;font:400 13px/1.45 Sora,system-ui,sans-serif}" +
    ".wx-pop.open{opacity:1;visibility:visible;transform:none;transition:opacity .22s cubic-bezier(.4,0,.2,1),transform .22s cubic-bezier(.2,.9,.1,1)}" +
    ".wx-pop::before,.wx-pop::after{content:'';position:absolute;width:12px;height:12px;border:2px solid #D4892F;pointer-events:none}" +
    ".wx-pop::before{top:-1px;left:-1px;border-right:0;border-bottom:0}.wx-pop::after{bottom:-1px;right:-1px;border-left:0;border-top:0}" +
    ".wx-hd{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:18px 18px 14px;border-bottom:1px solid rgba(169,187,199,.14);background:linear-gradient(rgba(169,187,199,.05) 1px,transparent 1px) 0 0/16px 16px,linear-gradient(90deg,rgba(169,187,199,.05) 1px,transparent 1px) 0 0/16px 16px}" +
    ".wx-k{margin:0 0 6px;font:600 11px/16px 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#D4892F}" +
    ".wx-h{margin:0;font:800 22px/1 Archivo,'Arial Black',sans-serif;text-transform:uppercase;letter-spacing:-.01em}" +
    ".wx-x{width:32px;height:32px;flex:none;display:grid;place-items:center;border:1px solid rgba(169,187,199,.26);border-radius:4px;background:none;color:#A9BBC7;cursor:pointer;transition:all .2s cubic-bezier(.4,0,.2,1)}" +
    ".wx-x:hover{color:#F7F7F6;border-color:#A9BBC7;background:#253445}.wx-x svg{width:14px;height:14px}" +
    ".wx-zones{display:flex;flex-wrap:wrap;gap:4px;padding:12px 18px 0}" +
    ".wx-z{height:30px;padding:0 10px;border:1px solid rgba(169,187,199,.26);border-radius:4px;background:none;color:#A9BBC7;font:600 12px/1 Sora,system-ui,sans-serif;cursor:pointer;transition:all .18s cubic-bezier(.4,0,.2,1)}" +
    ".wx-z:hover{color:#F7F7F6;border-color:#A9BBC7}.wx-z[aria-pressed=true]{background:#F7F7F6;color:#16212C;border-color:#F7F7F6}" +
    ".wx-z:focus-visible,.wx-x:focus-visible,.wx-a:focus-visible{outline:2px solid #D4892F;outline-offset:2px}" +
    ".wx-alert{margin:12px 18px 0;padding:12px 14px;border:1px solid rgba(240,138,126,.45);border-left:3px solid #F08A7E;border-radius:4px;background:rgba(240,138,126,.08)}" +
    ".wx-alert b{display:block;font:800 13px/1.2 Archivo,sans-serif;text-transform:uppercase;letter-spacing:.01em;color:#F08A7E}" +
    ".wx-alert p{margin:4px 0 0;color:#D6DEE4;font-size:12px}.wx-alert a{color:#F7F7F6;text-decoration:underline;text-underline-offset:2px}" +
    ".wx-sum{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;margin:12px 18px 0;background:rgba(169,187,199,.14);border:1px solid rgba(169,187,199,.14);border-radius:4px;overflow:hidden}" +
    ".wx-sum div{padding:10px 12px;background:#1D2A37}" +
    ".wx-sum small{display:block;font:600 10px/14px 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#8796A3}" +
    ".wx-sum b{display:block;margin-top:4px;font:800 20px/1 Archivo,sans-serif;font-variant-numeric:tabular-nums}" +
    ".wx-sum .hot{color:#F08A7E}" +
    ".wx-chart{display:grid;grid-template-columns:repeat(12,1fr);align-items:end;gap:4px;height:64px;margin:16px 18px 0;padding-bottom:1px;border-bottom:1px solid rgba(169,187,199,.26)}" +
    ".wx-chart i{display:block;min-height:2px;background:#8CC3E6;transform-origin:bottom;animation:wxg .5s cubic-bezier(.2,.9,.1,1) both}" +
    ".wx-chart i.w{background:#D4892F}.wx-chart i.h{background:#F08A7E}" +
    "@keyframes wxg{from{transform:scaleY(0)}}" +
    ".wx-cap{display:flex;justify-content:space-between;margin:6px 18px 0;font:500 10px/14px 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.08em;color:#8796A3;text-transform:uppercase}" +
    ".wx-list{list-style:none;margin:12px 0 0;padding:0 10px}" +
    ".wx-row{display:grid;grid-template-columns:86px 26px 46px minmax(70px,1fr) 58px 72px;align-items:center;gap:10px;padding:9px 8px;border-top:1px solid rgba(169,187,199,.1);border-radius:4px;transition:background .18s cubic-bezier(.4,0,.2,1)}" +
    ".wx-row:hover{background:#253445}" +
    ".wx-row .tm{font:600 12px/1.25 'JetBrains Mono',ui-monospace,monospace;color:#D6DEE4}.wx-row .tm small{display:block;font-size:10px;color:#8796A3;letter-spacing:.06em;text-transform:uppercase}" +
    ".wx-row svg{width:22px;height:22px;color:#A9BBC7}" +
    ".wx-row .tp{font:800 16px/1 Archivo,sans-serif;font-variant-numeric:tabular-nums}" +
    ".wx-bar{position:relative;display:block;height:6px;background:rgba(169,187,199,.14);border-radius:1px;overflow:hidden}.wx-bar i{position:absolute;inset:0 auto 0 0;background:#8CC3E6}" +
    ".wx-pc{display:block;margin-top:5px;font:500 11px/1 'JetBrains Mono',ui-monospace,monospace;color:#A9BBC7}" +
    ".wx-row .in,.wx-row .gu{font:600 12px/1.2 'JetBrains Mono',ui-monospace,monospace;text-align:right;color:#D6DEE4;font-variant-numeric:tabular-nums}" +
    ".wx-row .gu small,.wx-row .in small{display:block;font-size:10px;color:#8796A3}" +
    ".wx-row.w .tm{color:#E7B577}.wx-row.w .wx-bar i{background:#D4892F}.wx-row.w svg{color:#E7B577}" +
    ".wx-row.h{background:rgba(240,138,126,.07)}.wx-row.h .tm,.wx-row.h svg{color:#F08A7E}.wx-row.h .wx-bar i{background:#F08A7E}" +
    ".wx-hot{color:#F08A7E!important}" +
    ".wx-ft{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;margin-top:12px;padding:14px 18px 16px;border-top:1px solid rgba(169,187,199,.14)}" +
    ".wx-acts{display:flex;gap:8px}" +
    ".wx-a{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 12px;border-radius:4px;border:1px solid rgba(169,187,199,.26);color:#F7F7F6;font:600 12px/1 Sora,system-ui,sans-serif;text-decoration:none;transition:all .2s cubic-bezier(.4,0,.2,1)}" +
    ".wx-a:hover{background:#253445;border-color:#A9BBC7;transform:translateY(-1px)}" +
    ".wx-a.p{background:#D4892F;border-color:#D4892F;color:#1B2632}.wx-a.p:hover{box-shadow:0 0 0 3px rgba(212,137,47,.25);background:#D4892F}" +
    ".wx-src{font:500 10px/14px 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.06em;color:#8796A3}" +
    ".wx-msg{padding:28px 18px;color:#A9BBC7}" +
    ".wx-skel{height:12px;margin:10px 18px;background:linear-gradient(90deg,#253445,#2d3f52,#253445);background-size:200% 100%;animation:wxs 1.2s linear infinite;border-radius:2px}" +
    "@keyframes wxs{to{background-position:-200% 0}}" +
    "@media (max-width:640px){.wx-pop{position:fixed;left:12px;right:12px;top:48px;width:auto;max-height:calc(100vh - 140px)}.wx-btn{padding:0 8px;gap:6px}.wx-btn .wx-lv em,.wx-btn .wx-rn{display:none}.wx-btn .wx-sep{display:none}.mix-btn{white-space:nowrap;padding:0 8px!important;font-size:12px!important}.wx-row{grid-template-columns:62px 22px 40px minmax(40px,1fr) 50px;gap:8px}.wx-row .gu{display:none}.wx-sum{grid-template-columns:repeat(2,1fr)}.wx-ft{flex-direction:column;align-items:stretch}.wx-acts .wx-a{flex:1;justify-content:center}}" +
    "@media (prefers-reduced-motion:reduce){.wx-pop,.wx-chart i,.wx-btn .wx-lv i{animation:none!important;transition:none!important}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* ---------------- icons ---------------- */
  var S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  var CL = '<path d="M7 18h10a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 7.1 9.5 4.25 4.25 0 0 0 7 18Z"/>';
  var ICON = {
    sun: '<svg ' + S + '><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>',
    moon: '<svg ' + S + '><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z"/></svg>',
    part: '<svg ' + S + '><path d="M8 3.5v1.2M3.5 8h1.2M4.8 4.8l.9.9M11.2 4.8l-.9.9"/><path d="M5.6 10.2A3 3 0 0 1 10.6 7"/><path d="M8 20h9a3.5 3.5 0 0 0 .5-6.96A4.8 4.8 0 0 0 8.3 12 3.9 3.9 0 0 0 8 20Z"/></svg>',
    cloud: '<svg ' + S + '>' + CL + '</svg>',
    fog: '<svg ' + S + '><path d="M4 9h13M3 13h18M5 17h14M8 21h8"/></svg>',
    rain: '<svg ' + S + '><path d="M7 15h10a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 7.1 6.5 4.25 4.25 0 0 0 7 15Z"/><path d="M9 18l-1 2.5M13 18l-1 2.5M17 18l-1 2.5"/></svg>',
    heavy: '<svg ' + S + '><path d="M7 13h10a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 7.1 4.5 4.25 4.25 0 0 0 7 13Z"/><path d="M8 16l-1.5 4M12 16l-1.5 4M16 16l-1.5 4M10 15.5l-.5 1.2M14 15.5l-.5 1.2"/></svg>',
    storm: '<svg ' + S + '><path d="M7 13h10a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 7.1 4.5 4.25 4.25 0 0 0 7 13Z"/><path d="M12.5 13.5 10 17.5h3.5L11 21.5"/></svg>',
    wind: '<svg ' + S + '><path d="M3 9h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17h7"/></svg>',
    x: '<svg ' + S + '><path d="M6 6l12 12M18 6 6 18"/></svg>',
    arr: '<svg ' + S + ' style="width:14px;height:14px"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };
  function iconFor(b) {
    var c = b.code;
    if (c >= 95) return "storm";
    if (b.rain >= T.rainHeavy || c === 65 || c === 82) return "heavy";
    if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82) || b.rain >= 0.02) return "rain";
    if (b.gust >= T.gustWatch) return "wind";
    if (c === 45 || c === 48) return "fog";
    if (c === 3) return "cloud";
    if (c === 1 || c === 2) return "part";
    return b.day ? "sun" : "moon";
  }
  function words(b) {
    var i = iconFor(b);
    return { storm: "Thunderstorms", heavy: "Heavy rain", rain: b.rain >= 0.1 ? "Rain" : "Showers", wind: "Gusty", fog: "Fog", cloud: "Overcast", part: "Partly cloudy", sun: "Clear", moon: "Clear" }[i];
  }

  /* ---------------- data ---------------- */
  function zone() {
    var id; try { id = localStorage.getItem(KEY); } catch (e) {}
    for (var i = 0; i < ZONES.length; i++) if (ZONES[i].id === id) return ZONES[i];
    return ZONES[0];
  }
  var Z = zone(), DATA = null, ALERTS = [], STATE = "load";

  function cacheGet(k) { try { var v = JSON.parse(sessionStorage.getItem(k)); if (v && Date.now() - v.t < TTL) return v.d; } catch (e) {} return null; }
  function cacheSet(k, d) { try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {} }

  function getForecast(z) {
    var k = "havok-wx-" + z.id, c = cacheGet(k);
    if (c) return Promise.resolve(c);
    var u = "https://api.open-meteo.com/v1/forecast?latitude=" + z.lat + "&longitude=" + z.lon +
      "&hourly=temperature_2m,precipitation_probability,precipitation,wind_gusts_10m,weather_code,is_day" +
      "&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=" + encodeURIComponent(TZ) +
      "&forecast_hours=48";
    return fetch(u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { cacheSet(k, j); return j; });
  }
  function getAlerts(z) {
    var k = "havok-wxa-" + z.id, c = cacheGet(k);
    if (c) return Promise.resolve(c);
    return fetch("https://api.weather.gov/alerts/active?point=" + z.lat + "," + z.lon, { headers: { Accept: "application/geo+json" } })
      .then(function (r) { return r.ok ? r.json() : { features: [] }; })
      .then(function (j) {
        var a = (j.features || []).map(function (f) { var p = f.properties || {}; return { ev: p.event, head: p.headline, sev: p.severity, ends: p.ends || p.expires, url: p["@id"] || p.id }; })
          .filter(function (a) { return a.ev; });
        cacheSet(k, a); return a;
      }).catch(function () { return []; });
  }

  function blocks(j) {
    var h = j.hourly, out = [];
    for (var i = 0; i < 48 && i < h.time.length; i += 4) {
      var b = { start: h.time[i], temp: Math.round(h.temperature_2m[i]), chance: 0, rain: 0, gust: 0, code: 0, day: h.is_day ? h.is_day[i] : 1 };
      for (var k = i; k < i + 4 && k < h.time.length; k++) {
        b.chance = Math.max(b.chance, h.precipitation_probability[k] || 0);
        b.rain += h.precipitation[k] || 0;
        b.gust = Math.max(b.gust, h.wind_gusts_10m[k] || 0);
        b.code = Math.max(b.code, h.weather_code[k] || 0);
      }
      b.rain = Math.round(b.rain * 100) / 100; b.gust = Math.round(b.gust);
      b.lv = (b.rain >= T.rainHeavy || b.gust >= T.gustHeavy || b.code >= 95) ? "h" :
             (b.rain >= T.rainWatch || b.gust >= T.gustWatch || (b.chance >= T.chanceLikely && b.rain >= 0.05)) ? "w" : "";
      out.push(b);
    }
    return out;
  }

  function summary(bs) {
    var s = { rain: 0, gust: 0, chance: 0, hi: -99, lo: 199, lv: "calm", first: null };
    bs.forEach(function (b) {
      s.rain += b.rain; s.gust = Math.max(s.gust, b.gust); s.chance = Math.max(s.chance, b.chance);
      s.hi = Math.max(s.hi, b.temp); s.lo = Math.min(s.lo, b.temp);
      if (b.lv && !s.first) s.first = b;
    });
    s.rain = Math.round(s.rain * 100) / 100;
    var hasH = bs.some(function (b) { return b.lv === "h"; }), hasW = bs.some(function (b) { return b.lv; });
    var sevAlert = ALERTS.some(function (a) { return /Severe|Extreme/.test(a.sev) || /Flood|Wind|Storm|Rain/i.test(a.ev); });
    s.lv = (hasH || sevAlert || s.rain >= 1) ? "watch" : hasW ? "rain" : "calm";
    return s;
  }

  /* ---------------- formatting ---------------- */
  function parse(t) { var p = t.split(/[-T:]/); return new Date(+p[0], p[1] - 1, +p[2], +p[3], +p[4] || 0); }
  function hr(d) { var h = d.getHours(), ap = h < 12 ? "a" : "p"; h = h % 12 || 12; return h + ap; }
  function dayName(d, ref) {
    var a = new Date(d.getFullYear(), d.getMonth(), d.getDate()), b = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
    var n = Math.round((a - b) / 864e5);
    return n === 0 ? "Today" : n === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
  }
  function inch(v) { return v < 0.01 ? "0" : v < 0.1 ? v.toFixed(2).replace(/^0/, "") : v.toFixed(2).replace(/0$/, ""); }

  /* ---------------- render ---------------- */
  host.classList.add("wx");
  host.innerHTML = '<button class="wx-btn" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="wx-pop" data-lv="load">' +
    ICON.cloud + '<span class="wx-lv"><i></i><em>Storm watch</em></span><span class="wx-sep" aria-hidden="true"></span><span class="wx-t"><span class="wx-tp">48h</span><span class="wx-rn"></span></span></button>' +
    '<div class="wx-pop" id="wx-pop" role="dialog" aria-modal="false" aria-label="Storm watch, 48-hour forecast"></div>';
  var btn = host.querySelector(".wx-btn"), pop = host.querySelector(".wx-pop");

  function paintChip() {
    if (STATE !== "ok") {
      btn.dataset.lv = STATE;
      btn.querySelector(".wx-tp").textContent = STATE === "err" ? "Forecast" : "48h";
      return;
    }
    var bs = blocks(DATA), s = summary(bs), now = bs[0];
    btn.dataset.lv = s.lv;
    btn.firstChild.outerHTML = ICON[iconFor(now)];
    btn.querySelector(".wx-lv em").textContent = s.lv === "rain" ? "Rain ahead" : "Storm watch";
    btn.querySelector(".wx-tp").textContent = now.temp + "°";
    btn.querySelector(".wx-rn").textContent = s.rain >= 0.01 ? " · " + inch(s.rain) + "″ / 48h" : " · Dry 48h";
    btn.setAttribute("aria-label", "Storm watch for " + Z.name + ": " + now.temp + " degrees now, " + (s.rain >= 0.01 ? inch(s.rain) + " inches of rain" : "no rain") + " in the next 48 hours. Open forecast.");
  }

  function paintPop() {
    var zones = '<div class="wx-zones" role="group" aria-label="Forecast area">' + ZONES.map(function (z) {
      return '<button type="button" class="wx-z" data-z="' + z.id + '" aria-pressed="' + (z.id === Z.id) + '">' + z.name + "</button>";
    }).join("") + "</div>";
    var head = '<div class="wx-hd"><div><p class="wx-k">Storm watch · ' + Z.name + ' · ' + Z.place + '</p><h2 class="wx-h">Next 48 hours</h2></div>' +
      '<button class="wx-x" type="button" aria-label="Close forecast">' + ICON.x + "</button></div>";
    var body;
    if (STATE === "load") body = '<div style="padding:8px 0 18px"><div class="wx-skel" style="width:60%"></div><div class="wx-skel"></div><div class="wx-skel"></div><div class="wx-skel" style="width:80%"></div></div>';
    else if (STATE === "err") body = '<p class="wx-msg">The forecast is not loading right now. Check <a style="color:#F7F7F6" href="https://forecast.weather.gov/MapClick.php?lat=' + Z.lat + "&lon=" + Z.lon + '" target="_blank" rel="noopener">weather.gov</a> for ' + Z.place + ", or call us if water is already coming in.</p>";
    else {
      var bs = blocks(DATA), s = summary(bs), ref = parse(bs[0].start);
      var alerts = ALERTS.slice(0, 2).map(function (a) {
        return '<div class="wx-alert" role="alert"><b>' + a.ev + "</b><p>" + (a.head || "") + (a.url ? ' <a href="' + a.url + '" target="_blank" rel="noopener">NWS details</a>' : "") + "</p></div>";
      }).join("");
      var maxR = Math.max(0.25, Math.max.apply(null, bs.map(function (b) { return b.rain; })));
      var chart = '<div class="wx-chart" aria-hidden="true">' + bs.map(function (b, i) {
        var hgt = Math.max(3, Math.round(b.rain / maxR * 100));
        return '<i class="' + b.lv + '" style="height:' + hgt + "%;animation-delay:" + i * 30 + 'ms" title="' + inch(b.rain) + '″"></i>';
      }).join("") + '</div><div class="wx-cap"><span>Rain per 4 hours</span><span>' + hr(ref) + " → +48h</span></div>";
      var sum = '<div class="wx-sum">' +
        '<div><small>Rain total</small><b' + (s.rain >= 1 ? ' class="hot"' : "") + ">" + inch(s.rain) + "″</b></div>" +
        '<div><small>Peak gust</small><b' + (s.gust >= T.gustWatch ? ' class="hot"' : "") + ">" + s.gust + "<span style='font-size:12px'> mph</span></b></div>" +
        "<div><small>Peak chance</small><b>" + s.chance + "%</b></div>" +
        "<div><small>Temp range</small><b>" + s.lo + "–" + s.hi + "°</b></div></div>";
      var rows = '<ol class="wx-list">' + bs.map(function (b) {
        var d = parse(b.start), e = new Date(d.getTime() + 4 * 36e5);
        return '<li class="wx-row ' + b.lv + '"><span class="tm">' + hr(d) + "–" + hr(e) + "<small>" + dayName(d, ref) + "</small></span>" +
          ICON[iconFor(b)] + '<span class="tp">' + b.temp + "°</span>" +
          '<span><span class="wx-bar"><i style="width:' + b.chance + '%"></i></span><span class="wx-pc">' + b.chance + "% · " + words(b) + "</span></span>" +
          '<span class="in">' + inch(b.rain) + "″<small>rain</small></span>" +
          '<span class="gu' + (b.gust >= T.gustWatch ? " wx-hot" : "") + '">' + b.gust + " mph<small>gusts</small></span></li>";
      }).join("") + "</ol>";
      body = alerts + sum + chart + rows;
    }
    var foot = '<div class="wx-ft"><span class="wx-src">Open-Meteo forecast · NWS alerts' + (STATE === "ok" ? " · updated " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "") + "</span>" +
      '<span class="wx-acts"><a class="wx-a" href="' + PREP + '">Storm prep checklist</a><a class="wx-a p" href="' + DISPATCH + '">Request dispatch ' + ICON.arr + "</a></span></div>";
    pop.innerHTML = head + zones + body + foot;
  }

  function load() {
    STATE = "load"; paintChip(); if (pop.classList.contains("open")) paintPop();
    Promise.all([getForecast(Z), getAlerts(Z)]).then(function (r) {
      DATA = r[0]; ALERTS = r[1]; STATE = "ok";
    }).catch(function () { STATE = "err"; }).then(function () {
      paintChip(); if (pop.classList.contains("open")) paintPop();
    });
  }

  /* ---------------- behaviour ---------------- */
  function open() {
    paintPop();
    if (window.innerWidth <= 640) pop.style.top = Math.round(btn.getBoundingClientRect().bottom + 10) + "px"; else pop.style.top = ""; pop.classList.add("open"); btn.setAttribute("aria-expanded", "true");
    document.dispatchEvent(new CustomEvent("havok:menu-open", { detail: "wx" }));
    var f = pop.querySelector(".wx-z[aria-pressed=true]") || pop.querySelector(".wx-x"); if (f) f.focus({ preventScroll: true });
  }
  function close(refocus) {
    if (!pop.classList.contains("open")) return;
    pop.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); if (refocus) btn.focus({ preventScroll: true });
  }
  btn.addEventListener("click", function () { pop.classList.contains("open") ? close() : open(); });
  pop.addEventListener("click", function (e) {
    if (e.target.closest(".wx-x")) return close(true);
    var z = e.target.closest(".wx-z");
    if (z) {
      for (var i = 0; i < ZONES.length; i++) if (ZONES[i].id === z.dataset.z) Z = ZONES[i];
      try { localStorage.setItem(KEY, Z.id); } catch (er) {}
      load(); paintPop(); var nz = pop.querySelector('.wx-z[data-z="' + Z.id + '"]'); if (nz) nz.focus({ preventScroll: true });
    }
    if (e.target.closest(".wx-a")) close();
  });
  document.addEventListener("click", function (e) { if (e.composedPath().indexOf(host) < 0) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(true); });
  // close when the service-mix menu (or any other) opens
  var mixBtn = document.querySelector(".mix-btn");
  if (mixBtn) mixBtn.addEventListener("click", function () { close(); });

  load();
  setInterval(function () { if (document.visibilityState === "visible") load(); }, TTL);
})();
