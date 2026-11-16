/* HAVOK engine — shared across pages.
   Sound, cursor, transitions, tilt, scan reveal, morphing dispatch, ETA clock. */
(function () {
  "use strict";

  var CONFIG = {
    phone: (window.BRAND && window.BRAND.phone) || "[DISPATCH NUMBER]",     // single source for the 24/7 line; set per market
    onsiteMinutes: 60,              // Havok Standard on-site target (confirm before launch)
    market: "Bay Area"
  };
  window.HAVOK = CONFIG;

  var html = document.documentElement;
  var hasGSAP = typeof window.gsap !== "undefined";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set: function (k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) { } },
    del: function (k, s) { try { (s ? sessionStorage : localStorage).removeItem(k); } catch (e) { } }
  };
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (hasGSAP) {
    gsap.defaults({ ease: "power3.out" });
    // "lock" — fast travel, hard seat: the motion signature of the whole site
    if (window.CustomEase) CustomEase.create("lock", "M0,0 C0.18,0.72 0.24,1.06 0.5,1.02 0.7,0.99 0.82,1 1,1");
  }
  var LOCK = hasGSAP && window.CustomEase ? "lock" : "expo.out";

  /* ------------------------------------------------------------------ SOUND */
  var Sound = {
    ctx: null, master: null, on: store.get("havok-sound") !== "off",
    ensure: function () {
      if (!this.on) return null;
      if (!this.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = (window.BRAND && window.BRAND.soundGain) || 0.55;
        var comp = this.ctx.createDynamicsCompressor();
        this.master.connect(comp); comp.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    },
    noise: function (dur) {
      var c = this.ctx, len = Math.max(1, Math.floor(c.sampleRate * dur)), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var s = c.createBufferSource(); s.buffer = b; return s;
    },
    latch: function () {
      var c = this.ensure(); if (!c) return; var t = c.currentTime;
      var o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(118, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.7, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.18);
      var n = this.noise(0.03), f = c.createBiquadFilter(), ng = c.createGain();
      f.type = "highpass"; f.frequency.value = 2400;
      ng.gain.setValueAtTime(0.28, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.028);
      n.connect(f); f.connect(ng); ng.connect(this.master); n.start(t); n.stop(t + 0.03);
      var n2 = this.noise(0.02), f2 = c.createBiquadFilter(), g2 = c.createGain();
      f2.type = "bandpass"; f2.frequency.value = 3800; f2.Q.value = 3;
      g2.gain.setValueAtTime(0.0001, t + 0.045); g2.gain.exponentialRampToValueAtTime(0.18, t + 0.05); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      n2.connect(f2); f2.connect(g2); g2.connect(this.master); n2.start(t + 0.04); n2.stop(t + 0.08);
    },
    swipe: function () {
      var c = this.ensure(); if (!c) return; var t = c.currentTime;
      var n = this.noise(0.5), f = c.createBiquadFilter(), g = c.createGain();
      f.type = "bandpass"; f.Q.value = 0.9; f.frequency.setValueAtTime(380, t); f.frequency.exponentialRampToValueAtTime(3600, t + 0.38);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.46);
      n.connect(f); f.connect(g); g.connect(this.master); n.start(t); n.stop(t + 0.5);
    },
    tick: function () {
      var c = this.ensure(); if (!c) return; var t = c.currentTime;
      var o = c.createOscillator(), g = c.createGain();
      o.type = "triangle"; o.frequency.value = 1800;
      g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.04);
    },
    routed: function () {
      var c = this.ensure(); if (!c) return; var t = c.currentTime, self = this;
      [[392, 0], [587.33, 0.14], [783.99, 0.28]].forEach(function (n) {
        var o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
        o.type = "sine"; o2.type = "sine"; o.frequency.value = n[0]; o2.frequency.value = n[0] * 2.005;
        var s = t + n[1];
        g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.32, s + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, s + 1.1);
        var g2 = c.createGain(); g2.gain.value = 0.18;
        o.connect(g); o2.connect(g2); g2.connect(g); g.connect(self.master);
        o.start(s); o2.start(s); o.stop(s + 1.2); o2.stop(s + 1.2);
      });
    },
    set: function (on) {
      this.on = on; store.set("havok-sound", on ? "on" : "off");
      $$("[data-sound-toggle]").forEach(function (b) {
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.setAttribute("aria-label", on ? "Mute interface sound" : "Turn interface sound on");
        var l = $(".snd-label", b); if (l) l.textContent = on ? "Sound on" : "Muted";
        b.classList.toggle("is-muted", !on);
      });
      if (!on && this.ctx) this.ctx.suspend();
    }
  };
  window.HavokSound = Sound;

  /* ------------------------------------------------------------- PHONE / UI */
  $$("[data-phone]").forEach(function (el) { el.textContent = CONFIG.phone; });
  $$("[data-onsite]").forEach(function (el) { el.textContent = CONFIG.onsiteMinutes; });
  $$("[data-copy-phone]").forEach(function (b) {
    b.addEventListener("click", function () {
      var done = function () { var l = $(".copy-label", b); if (l) { var o = l.textContent; l.textContent = "Copied"; setTimeout(function () { l.textContent = o; }, 1600); } };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(CONFIG.phone).then(done, done); else done();
    });
  });

  var menuBtn = $(".menu-btn"), nav = $(".nav");
  if (menuBtn && nav) menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  $$("[data-sound-toggle]").forEach(function (b) {
    b.addEventListener("click", function () { Sound.set(!Sound.on); if (Sound.on) Sound.latch(); });
  });
  Sound.set(Sound.on);

  // Theme: explicit choice overrides the system; remembered per viewer
  $$("[data-theme-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var cur = html.getAttribute("data-theme") || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      var next = cur === "light" ? "dark" : "light";
      if (hasGSAP && !reduce) {
        var flash = document.createElement("div");
        flash.style.cssText = "position:fixed;inset:0;z-index:400;pointer-events:none;background:" + (next === "light" ? "#F3F5F7" : "#090B0E");
        document.body.appendChild(flash);
        gsap.fromTo(flash, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.35, ease: "expo.in", onComplete: function () {
          html.setAttribute("data-theme", next);
          gsap.to(flash, { clipPath: "inset(0 0 0 100%)", duration: 0.45, ease: "expo.out", onComplete: function () { flash.remove(); } });
        } });
      } else html.setAttribute("data-theme", next);
      store.set("havok-theme", next);
      Sound.swipe();
    });
  });

  document.addEventListener("pointerdown", function (e) {
    var t = e.target.closest("button, .btn, .chip span, [data-latch]");
    if (t && !t.matches("[data-sound-toggle]")) Sound.latch();
  });

  // Live clock
  function clock() {
    var d = new Date();
    var s = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    $$("[data-clock]").forEach(function (el) { el.textContent = s; });
  }
  clock(); setInterval(clock, 1000);

  /* ------------------------------------------------------------- CURSOR */
  if (finePointer && hasGSAP && !reduce) {
    html.classList.add("has-cursor");
    var cur = document.createElement("div");
    cur.className = "cursor"; cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = '<div class="cursor__ring"></div><div class="cursor__x"></div><div class="cursor__y"></div><div class="cursor__label"></div>';
    var dot = document.createElement("div"); dot.className = "cursor__dot"; dot.setAttribute("aria-hidden", "true");
    document.body.appendChild(cur); document.body.appendChild(dot);
    var lbl = $(".cursor__label", cur);
    // elastic lag: ring trails with spring, dot is near-instant
    var rx = gsap.quickTo(cur, "x", { duration: 0.6, ease: "elastic.out(1, 0.75)" });
    var ry = gsap.quickTo(cur, "y", { duration: 0.6, ease: "elastic.out(1, 0.75)" });
    var dx = gsap.quickTo(dot, "x", { duration: 0.08, ease: "none" });
    var dy = gsap.quickTo(dot, "y", { duration: 0.08, ease: "none" });
    var magnetTarget = null;
    window.addEventListener("pointermove", function (e) {
      dx(e.clientX); dy(e.clientY);
      if (magnetTarget) {
        var r = magnetTarget.getBoundingClientRect();
        rx(r.left + r.width / 2 + (e.clientX - (r.left + r.width / 2)) * 0.25);
        ry(r.top + r.height / 2 + (e.clientY - (r.top + r.height / 2)) * 0.25);
      } else { rx(e.clientX); ry(e.clientY); }
    }, { passive: true });
    document.addEventListener("pointerover", function (e) {
      var t = e.target.closest("[data-cursor], a, button, .chip, [data-tilt]");
      cur.classList.remove("is-x", "is-label", "is-fill");
      magnetTarget = null;
      if (!t) return;
      var label = t.getAttribute("data-cursor");
      if (label) { lbl.textContent = label; cur.classList.add("is-x", "is-label"); }
      else if (t.matches("[data-tilt]")) { cur.classList.add("is-fill"); }
      else { cur.classList.add("is-x"); }
      if (t.matches("[data-magnetic], .btn")) magnetTarget = t;
    });
    document.addEventListener("pointerleave", function () { gsap.to([cur, dot], { opacity: 0, duration: 0.2 }); });
    document.addEventListener("pointerenter", function () { gsap.to([cur, dot], { opacity: 1, duration: 0.2 }); });
  }

  /* ------------------------------------------------------------- MAGNETIC */
  if (finePointer && hasGSAP && !reduce) {
    $$("[data-magnetic]").forEach(function (el) {
      var mx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      var my = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.28); my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("pointerleave", function () { mx(0); my(0); });
    });
  }

  /* ------------------------------------------------------------- TILT */
  if (finePointer && hasGSAP && !reduce) {
    $$("[data-tilt]").forEach(function (card) {
      var body = $(".tilt__body", card) || card;
      var face = $(".tilt__face", card);
      gsap.set(body, { transformPerspective: 1500 });
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(body, { rotateY: x * 12, rotateX: -y * 10, duration: 0.6, ease: "power3.out" });
        if (face) { face.style.setProperty("--fx", (-x * 16).toFixed(1) + "px"); face.style.setProperty("--fy", (-y * 14).toFixed(1) + "px"); }
      });
      card.addEventListener("pointerleave", function () {
        gsap.to(body, { rotateY: 0, rotateX: 0, duration: 0.9, ease: "elastic.out(1, 0.6)" });
      });
    });
  }

  /* ------------------------------------------------------------- MARQUEES */
  $$(".marquee__track").forEach(function (track) {
    if (track.dataset.cloned) return;
    track.innerHTML += track.innerHTML; // seamless loop: -50% equals one full set
    track.dataset.cloned = "1";
    $$(".marquee__item", track).slice(track.children.length / 2).forEach(function (n) { n.setAttribute("aria-hidden", "true"); });
  });

  /* ------------------------------------------------------------- THERMAL MAP */
  // Builds a moisture/thermal false-color field on a small canvas, scaled up by CSS.
  function thermal(canvas) {
    var spec; try { spec = JSON.parse(canvas.getAttribute("data-blobs") || "[]"); } catch (e) { spec = []; }
    var W = 240, H = Math.round(240 * (canvas.clientHeight / Math.max(1, canvas.clientWidth)) || 150);
    canvas.width = W; canvas.height = H;
    var g = canvas.getContext("2d");
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter";
    spec.forEach(function (b) {
      var x = b[0] * W, y = b[1] * H, r = b[2] * W, a = b[3];
      var grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, "rgba(255,255,255," + a + ")"); grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd; g.beginPath(); g.ellipse(x, y, r, r * (b[4] || 1), 0, 0, Math.PI * 2); g.fill();
    });
    var img = g.getImageData(0, 0, W, H), d = img.data;
    var stops = [[0, [8, 18, 60]], [0.25, [20, 90, 200]], [0.45, [40, 210, 255]], [0.62, [120, 255, 160]], [0.78, [255, 220, 60]], [1, [255, 70, 30]]];
    for (var i = 0; i < d.length; i += 4) {
      var v = Math.min(1, d[i] / 255 + Math.random() * 0.03);
      var k = 0; while (k < stops.length - 2 && v > stops[k + 1][0]) k++;
      var a0 = stops[k], a1 = stops[k + 1], t = (v - a0[0]) / (a1[0] - a0[0]);
      d[i] = a0[1][0] + (a1[1][0] - a0[1][0]) * t; d[i + 1] = a0[1][1] + (a1[1][1] - a0[1][1]) * t; d[i + 2] = a0[1][2] + (a1[1][2] - a0[1][2]) * t; d[i + 3] = 255;
    }
    g.globalCompositeOperation = "source-over";
    g.putImageData(img, 0, 0);
  }
  $$("canvas[data-thermal]").forEach(function (c) { thermal(c); });

  /* ------------------------------------------------------------- SCAN REVEAL */
  // [data-scan]: --p 0..100. Before (damage) on the left of the bar, restored on the right… reversed:
  // the light bar sweeps left→right and leaves restored structure behind it.
  $$("[data-scan]").forEach(function (scan) {
    var from = parseFloat(scan.getAttribute("data-from") || "0");
    var to = parseFloat(scan.getAttribute("data-to") || "100");
    var unit = scan.getAttribute("data-unit") || "%";
    var readout = $("[data-readout]", scan);
    var state = { p: parseFloat(scan.getAttribute("data-start") || "38") };
    function paint() {
      scan.style.setProperty("--p", state.p.toFixed(2));
      if (readout) {
        var v = from + (to - from) * (state.p / 100);
        readout.textContent = (Math.round(v * 10) / 10).toFixed(1) + unit;
      }
    }
    paint();
    var mode = scan.getAttribute("data-scan");
    if (mode === "scroll" && hasGSAP && window.ScrollTrigger && !reduce) {
      gsap.fromTo(state, { p: 4 }, {
        p: 100, ease: "none", onUpdate: paint,
        scrollTrigger: { trigger: scan.closest("[data-scan-pin]") || scan, start: "top top", end: "+=140%", scrub: 0.6, pin: scan.closest("[data-scan-pin]") || false, anticipatePin: 1 }
      });
    } else if (mode === "sweep" && hasGSAP && !reduce) {
      gsap.fromTo(state, { p: 0 }, { p: state.p, duration: 2.4, delay: 0.9, ease: "power2.inOut", onUpdate: paint });
    }
    // Drag / keyboard control on any mode except scroll-pinned
    var handle = $(".scan__handle", scan);
    if (handle && mode !== "scroll") {
      var dragging = false;
      var setFrom = function (clientX) {
        var r = scan.getBoundingClientRect();
        state.p = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)); paint();
      };
      scan.addEventListener("pointerdown", function (e) { dragging = true; scan.setPointerCapture(e.pointerId); if (hasGSAP) gsap.killTweensOf(state); setFrom(e.clientX); });
      scan.addEventListener("pointermove", function (e) { if (dragging) setFrom(e.clientX); });
      scan.addEventListener("pointerup", function () { dragging = false; });
      scan.addEventListener("pointercancel", function () { dragging = false; });
      handle.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault(); if (hasGSAP) gsap.killTweensOf(state);
          state.p = Math.max(0, Math.min(100, state.p + (e.key === "ArrowRight" ? 4 : -4))); paint(); Sound.tick();
          handle.setAttribute("aria-valuenow", Math.round(state.p));
        }
      });
    }
  });

  /* ------------------------------------------------------------- ENTRANCE */
  function entrance() {
    if (!hasGSAP || reduce) return;
    var tl = gsap.timeline({ defaults: { ease: LOCK } });
    var bar = $(".topbar__in");
    if (bar) tl.from(bar, { yPercent: -140, duration: 0.9 }, 0);
    // Heavy panels: travel fast, seat hard. Transforms only — content is readable at rest.
    $$("[data-lock]").forEach(function (el, i) {
      var dir = el.getAttribute("data-lock") || "up";
      var v = { up: { y: 90, rotateX: -12 }, left: { x: -120, rotateY: 8 }, right: { x: 120, rotateY: -8 }, down: { y: -60 } }[dir] || { y: 90 };
      v.duration = 1.05; v.transformPerspective = 1400; v.transformOrigin = "50% 100%";
      tl.from(el, v, 0.12 + i * 0.07);
    });
    $$("[data-split]").forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.setAttribute("aria-label", el.textContent.trim());
      el.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true" style="display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.04em"><span style="display:inline-block">' + w + "</span></span>"; }).join(" ");
      tl.from($$(".w > span", el), { yPercent: 108, duration: 1, stagger: 0.06 }, 0.2);
    });
    if (window.ScrollTrigger) {
      $$("[data-lock-scroll]").forEach(function (group) {
        var kids = group.hasAttribute("data-stagger") ? Array.prototype.slice.call(group.children) : [group];
        gsap.from(kids, {
          y: 70, rotateX: -10, transformPerspective: 1400, transformOrigin: "50% 100%", duration: 1, ease: LOCK, stagger: 0.08,
          scrollTrigger: { trigger: group, start: "top 88%", once: true }
        });
      });
      $$("[data-count]").forEach(function (el) {
        var end = parseFloat(el.getAttribute("data-count")), dec = (el.getAttribute("data-count").split(".")[1] || "").length;
        var o = { v: 0 };
        ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: function () {
          gsap.to(o, { v: end, duration: 1.6, ease: "expo.out", onUpdate: function () { el.textContent = o.v.toFixed(dec); } });
        } });
      });
    }
  }

  /* ------------------------------------------------------------- TRANSITIONS */
  function buildShutter() {
    var s = $(".shutter");
    if (!s) {
      s = document.createElement("div"); s.className = "shutter"; s.setAttribute("aria-hidden", "true");
      s.innerHTML = "<span></span><span></span><span></span><span></span><span></span>" +
        '<div class="shutter__mark"><div><svg width="44" height="44" viewBox="0 0 32 32" fill="none"><rect x="1" y="1" width="30" height="30" rx="3" stroke="#D4892F" stroke-width="2"/><path d="M9 7v18M23 7v18M9 16h14" stroke="#E9EEF3" stroke-width="3"/></svg><div class="shutter__bar"><i></i></div><span class="mono" style="color:var(--muted)">Routing</span></div></div>';
      document.body.appendChild(s);
    }
    return s;
  }
  var shutter = buildShutter();
  function enter() {
    if (!html.classList.contains("is-entering")) { entrance(); return; }
    store.del("havok-nav", true);
    if (!hasGSAP) { html.classList.remove("is-entering"); return; }
    var spans = $$("span", shutter).filter(function (s) { return s.parentNode === shutter; });
    gsap.timeline({ onComplete: function () { html.classList.remove("is-entering"); gsap.set(spans, { clearProps: "all" }); gsap.set($(".shutter__mark", shutter), { clearProps: "all" }); } })
      .to($(".shutter__mark", shutter), { opacity: 0, duration: 0.25 }, 0.15)
      .to(spans, { scaleY: 0, duration: 0.75, ease: "expo.inOut", stagger: { each: 0.06, from: "center" } }, 0.2)
      .add(entrance, 0.45);
  }
  function leave(href) {
    Sound.swipe();
    store.set("havok-nav", "1", true);
    if (!hasGSAP || reduce) { location.href = href; return; }
    shutter.style.visibility = "visible";
    var spans = $$("span", shutter).filter(function (s) { return s.parentNode === shutter; });
    gsap.timeline({ onComplete: function () { location.href = href; } })
      .fromTo(spans, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: "expo.inOut", stagger: { each: 0.05, from: "edges" } })
      .to($(".shutter__mark", shutter), { opacity: 1, duration: 0.2 }, "-=0.15");
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(https?:|mailto:|tel:|sms:)/i.test(href)) return;
    if (!/\.html(#.*)?$|^\.\/?(#.*)?$/.test(href)) return;
    e.preventDefault(); leave(href);
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) { html.classList.remove("is-entering"); shutter.style.visibility = ""; if (hasGSAP) gsap.set($$("span", shutter), { clearProps: "all" }); }
  });

  /* ------------------------------------------------------------- ETA CLOCK */
  var ETA_KEY = "havok-ticket";
  function ticket() { try { return JSON.parse(store.get(ETA_KEY, true) || "null"); } catch (e) { return null; } }
  function etaTick() {
    var t = ticket(), total = CONFIG.onsiteMinutes * 60;
    var left = t ? Math.max(0, total - Math.floor((Date.now() - t.at) / 1000)) : total;
    var mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
    $$("[data-eta]").forEach(function (el) { el.textContent = mm + ":" + ss; });
    $$("[data-eta-ring]").forEach(function (c) {
      var len = parseFloat(c.getAttribute("data-len") || "0") || (c.getTotalLength ? c.getTotalLength() : 0);
      c.setAttribute("data-len", len);
      c.style.strokeDasharray = len; c.style.strokeDashoffset = len * (1 - left / total);
    });
    $$("[data-eta-state]").forEach(function (el) { el.textContent = t ? "Crew en route · " + t.id : "Standing by · 24/7"; });
    html.classList.toggle("is-dispatched", !!t);
  }
  etaTick(); setInterval(etaTick, 1000);
  window.HavokTicket = ticket;

  /* ------------------------------------------------------------- DISPATCH MORPH */
  /* Brand-configurable intake. window.BRAND (set before this script) overrides the Havok defaults. */
  var B = window.BRAND || {};
  var SERVICES = B.services || [
    ["water", "Water / flood", "Burst pipe, leak"], ["fire", "Fire & smoke", "Soot, odor"], ["mold", "Mold", "Visible or smell"], ["storm", "Storm / wind", "Roof, tree, hail"],
    ["sewage", "Sewage backup", "Category 3"], ["bio", "Biohazard", "Habio team"], ["odor", "Hoarding / odor", "Habio team"], ["other", "Something else", "Tell us"]
  ];
  var Q2 = B.q2 || { legend: "Is it still happening?", missing: "whether it's still happening", tipOn: "active",
    tip: "If water is running, shut off the main valve now. If anything smells like gas or wiring is wet, leave and call 911 first.",
    opts: [["active", "Yes, it's active", "Water running, smoke, spreading"], ["stopped", "It's stopped", "Need cleanup and drying"]] };
  var Q5 = B.q5 || { legend: "Photos and insurance", opts: [["yes", "Filing a claim", "We work with your adjuster"], ["unsure", "Not sure yet", "We'll help you decide"], ["no", "Paying direct", "Written estimate first"]] };
  var TXT = Object.assign({
    live: "Dispatch open", title: "Urgent dispatch", lede: "Five quick answers. A Havok dispatcher calls you back, and a crew is assigned while you talk.",
    q1: "What happened?", q3: "Where is it?", q4: "Who do we call?", photos: "Add photos of the damage", photosSub: "Your project lead sees them before the truck arrives.",
    submit: "Route to dispatch", submitCursor: "ROUTE IT", routedTag: "Request routed", routedTitle: "Help is moving.",
    routedLede: "Keep your phone close. A dispatcher calls within minutes to confirm the address and what to do until the crew arrives.",
    cell2k: "On-site target", cell2v: '<span data-onsite>60</span> min', cell3k: "Updates", cell3v: "ClaimTrak",
    link: { href: "track.html", label: "Open my live tracker", cursor: "LIVE TRACK" }, ring: true, prefix: "HV-", phoneLabel: "Prefer to talk? Dispatch line:"
  }, B.text || {});
  function esc(s) { return String(s).replace(/'/g, "&#39;"); }
  function sheetMarkup() {
    var ring = TXT.ring ? '<svg class="routed__ring" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(196,214,232,.14)" stroke-width="6"/><circle data-eta-ring cx="60" cy="60" r="52" fill="none" stroke="#D4892F" stroke-width="6" stroke-linecap="round" transform="rotate(-90 60 60)"/><text x="60" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="17" fill="#E9EEF3" data-eta>60:00</text><text x="60" y="78" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" letter-spacing="1.5" fill="#93A0AD">ON-SITE</text></svg>'
      : '<svg class="routed__ring" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="#46DF8C" stroke-width="3"/><path d="M38 61l15 15 30-32" fill="none" stroke="#46DF8C" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return '' +
      '<div class="dispatch-scrim" data-close></div>' +
      '<div class="dispatch-sheet" role="dialog" aria-modal="true" aria-labelledby="dispatch-title">' +
      '<div class="dispatch-sheet__fill"></div>' +
      '<div class="dispatch-sheet__inner">' +
      '<div class="sheet-head"><span class="live"><i></i><span class="mono">' + TXT.live + '</span></span>' +
      '<h2 id="dispatch-title" class="h-lg sheet-title">' + TXT.title + '</h2>' +
      '<span class="timer num" data-clock></span>' +
      '<button class="btn btn--ghost btn--icon" type="button" data-close aria-label="Close form"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<form class="sheet-body" id="dispatch-form" novalidate>' +
      '<p class="lede" style="font-size:.98rem">' + TXT.lede + '</p>' +
      '<fieldset class="q" data-q><legend><b>01</b>' + TXT.q1 + '</legend><div class="chips">' +
      SERVICES.map(function (s, i) { return '<label class="chip"><input type="radio" name="what" id="what-' + s[0] + '" value="' + s[0] + '"' + (i === 0 ? " required" : "") + '><span>' + s[1] + '<small>' + s[2] + '</small></span></label>'; }).join("") +
      '</div></fieldset>' +
      '<fieldset class="q" data-q><legend><b>02</b>' + Q2.legend + '</legend><div class="chips chips--2">' +
      Q2.opts.map(function (o, i) { return '<label class="chip"><input type="radio" name="active" id="q2-' + o[0] + '" value="' + o[0] + '"' + (i === 0 ? " required" : "") + '><span>' + o[1] + '<small>' + o[2] + '</small></span></label>'; }).join("") +
      '</div>' + (Q2.tip ? '<p class="mono" style="color:var(--warn);margin:0;letter-spacing:.06em;text-transform:none;font-size:.78rem" data-active-tip hidden>' + Q2.tip + '</p>' : '') + '</fieldset>' +
      '<fieldset class="q" data-q><legend><b>03</b>' + TXT.q3 + '</legend><div class="fields fields--2">' +
      '<div class="field-i" style="grid-column:1/-1"><label for="d-addr">Street address</label><input id="d-addr" name="addr" autocomplete="street-address" required placeholder="1450 Market St"></div>' +
      '<div class="field-i"><label for="d-city">City</label><input id="d-city" name="city" autocomplete="address-level2" required placeholder="San Jose"></div>' +
      '<div class="field-i"><label for="d-zip">ZIP</label><input id="d-zip" name="zip" inputmode="numeric" autocomplete="postal-code" pattern="[0-9]{5}" required placeholder="95112"></div>' +
      '</div></fieldset>' +
      '<fieldset class="q" data-q><legend><b>04</b>' + TXT.q4 + '</legend><div class="fields fields--2">' +
      '<div class="field-i"><label for="d-name">Your name</label><input id="d-name" name="name" autocomplete="name" required placeholder="Full name"></div>' +
      '<div class="field-i"><label for="d-phone">Mobile number</label><input id="d-phone" name="phone" type="tel" autocomplete="tel" required placeholder="(555) 555-0123" pattern="[0-9()+\\-. ]{10,}"></div>' +
      '</div></fieldset>' +
      '<fieldset class="q" data-q><legend><b>05</b>' + Q5.legend + ' <span style="color:var(--dim)">· optional</span></legend>' +
      '<label class="drop" for="d-photos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="4"/></svg><span><b style="font-weight:500">' + TXT.photos + '</b><br><span style="color:var(--muted);font-size:.82rem">' + TXT.photosSub + '</span></span><input id="d-photos" type="file" accept="image/*" multiple></label>' +
      '<div class="thumbs" data-thumbs></div>' +
      '<div class="chips" style="grid-template-columns:repeat(3,minmax(0,1fr))">' +
      Q5.opts.map(function (o) { return '<label class="chip"><input type="radio" name="ins" id="ins-' + o[0] + '" value="' + o[0] + '"><span>' + o[1] + '<small>' + o[2] + '</small></span></label>'; }).join("") +
      '</div></fieldset>' +
      '<div class="sheet-foot"><p class="sheet-note" data-form-msg role="status">' + TXT.phoneLabel + ' <span class="copy-num" data-phone></span></p>' +
      '<button class="btn btn--signal btn--xl" type="submit" data-cursor="' + esc(TXT.submitCursor) + '"><span class="pulse-dot"></span>' + TXT.submit + '</button></div>' +
      '</form>' +
      '<div class="routed" data-routed aria-live="polite">' +
      '<div style="display:flex;gap:22px;align-items:center;flex-wrap:wrap">' + ring +
      '<div style="display:grid;gap:8px;min-width:0"><span class="tag tag--ok">' + TXT.routedTag + '</span><h3 class="display h-xl">' + TXT.routedTitle + '</h3><p class="lede" style="font-size:.98rem">' + TXT.routedLede + '</p></div></div>' +
      '<div class="routed__grid"><div><span class="mono" style="color:var(--muted)">Reference</span><b data-ticket-id>' + TXT.prefix + '0000</b></div><div><span class="mono" style="color:var(--muted)">' + TXT.cell2k + '</span><b>' + TXT.cell2v + '</b></div><div><span class="mono" style="color:var(--muted)">' + TXT.cell3k + '</span><b>' + TXT.cell3v + '</b></div></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' + (TXT.link ? '<a class="btn btn--signal" href="' + TXT.link.href + '" data-cursor="' + esc(TXT.link.cursor) + '">' + TXT.link.label + '</a>' : '') + '<button class="btn btn--ghost" type="button" data-close>Close</button></div>' +
      '<p class="proto-note">Prototype · this form is not connected yet</p>' +
      '</div></div></div>';
  }
  var layer = document.createElement("div");
  layer.className = "dispatch-layer"; layer.innerHTML = sheetMarkup();
  document.body.appendChild(layer);
  $$("[data-phone]", layer).forEach(function (el) { el.textContent = CONFIG.phone; });
  $$("[data-onsite]", layer).forEach(function (el) { el.textContent = CONFIG.onsiteMinutes; });
  var sheet = $(".dispatch-sheet", layer), fill = $(".dispatch-sheet__fill", layer), inner = $(".dispatch-sheet__inner", layer), scrim = $(".dispatch-scrim", layer);
  var form = $("#dispatch-form", layer), routed = $("[data-routed]", layer);
  var origin = null, lastFocus = null;

  function targetRect() {
    var vw = window.innerWidth, vh = window.innerHeight;
    if (vw < 700) return { left: 0, top: 0, width: vw, height: vh, radius: 0 };
    var w = Math.min(780, vw - 64), h = Math.min(vh - 64, 900);
    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h, radius: 6 };
  }
  function openDispatch(btn) {
    origin = btn; lastFocus = document.activeElement;
    var pre = btn.getAttribute("data-service");
    if (pre) { var radio = $("#what-" + pre, form); if (radio) radio.checked = true; }
    var r = btn.getBoundingClientRect(), t = targetRect();
    layer.classList.add("is-open"); document.body.style.overflow = "hidden";
    Sound.swipe();
    if (!hasGSAP || reduce) {
      Object.assign(sheet.style, { left: t.left + "px", top: t.top + "px", width: t.width + "px", height: t.height + "px", borderRadius: t.radius + "px" });
      fill.style.opacity = 0; inner.style.opacity = 1; scrim.style.opacity = 1; focusFirst(); return;
    }
    btn.style.visibility = "hidden";
    gsap.set(sheet, { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 4 });
    gsap.set(fill, { opacity: 1 }); gsap.set(inner, { opacity: 0 });
    gsap.timeline({ onComplete: focusFirst })
      .to(scrim, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0)
      .to(sheet, { left: t.left + t.width * 0.06, top: r.top - 6, width: t.width * 0.88, height: r.height + 12, duration: 0.32, ease: "power3.in" }, 0)
      .to(sheet, { left: t.left, top: t.top, width: t.width, height: t.height, borderRadius: t.radius, duration: 0.62, ease: LOCK }, 0.3)
      .to(fill, { opacity: 0, duration: 0.35, ease: "power2.out" }, 0.62)
      .to(inner, { opacity: 1, duration: 0.2 }, 0.7)
      .from($$(".sheet-head, .sheet-body > *", layer), { y: 26, rotateX: -12, transformPerspective: 1200, duration: 0.6, stagger: 0.05, ease: LOCK }, 0.72);
  }
  function focusFirst() { var f = $("input:not([type=hidden])", form.hidden ? routed : form) || $("[data-close]", layer); if (f) f.focus({ preventScroll: true }); }
  function closeDispatch() {
    var done = function () {
      layer.classList.remove("is-open"); document.body.style.overflow = "";
      if (origin) origin.style.visibility = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      if (hasGSAP) gsap.set([sheet, fill, inner, scrim], { clearProps: "all" });
    };
    Sound.swipe();
    if (!hasGSAP || reduce || !origin) { done(); return; }
    var r = origin.getBoundingClientRect();
    gsap.timeline({ onComplete: done })
      .to(inner, { opacity: 0, duration: 0.15 }, 0)
      .to(fill, { opacity: 1, duration: 0.2 }, 0.05)
      .to(sheet, { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 4, duration: 0.55, ease: "expo.inOut" }, 0.1)
      .to(scrim, { opacity: 0, duration: 0.35 }, 0.25);
  }
  window.HavokDispatch = { open: openDispatch, close: closeDispatch };
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-dispatch]");
    if (b) { e.preventDefault(); openDispatch(b); return; }
    if (e.target.closest("[data-close]") && layer.classList.contains("is-open")) closeDispatch();
  });
  document.addEventListener("keydown", function (e) {
    if (!layer.classList.contains("is-open")) return;
    if (e.key === "Escape") closeDispatch();
    if (e.key === "Tab") { // keep focus inside the sheet
      var f = $$("button, a[href], input, select, textarea", sheet).filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  $$("input[name=active]", form).forEach(function (r) {
    r.addEventListener("change", function () { var tip = $("[data-active-tip]", form); if (tip) tip.hidden = r.value !== Q2.tipOn || !r.checked; });
  });
  var photos = $("#d-photos", form), thumbs = $("[data-thumbs]", form), drop = $(".drop", form);
  function showThumbs(files) {
    thumbs.innerHTML = "";
    Array.prototype.slice.call(files, 0, 8).forEach(function (f) {
      if (!/^image\//.test(f.type)) return;
      var img = document.createElement("img"); img.alt = "Damage photo " + f.name; img.src = URL.createObjectURL(f); thumbs.appendChild(img);
    });
  }
  photos.addEventListener("change", function () { showThumbs(photos.files); });
  ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("is-over"); }); });
  ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("is-over"); }); });
  drop.addEventListener("drop", function (e) { if (e.dataTransfer && e.dataTransfer.files) showThumbs(e.dataTransfer.files); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = $("[data-form-msg]", form), missing = [];
    if (!form.querySelector("input[name=what]:checked")) missing.push("what happened");
    if (!form.querySelector("input[name=active]:checked")) missing.push(Q2.missing || "question 2");
    ["d-addr", "d-city", "d-zip", "d-name", "d-phone"].forEach(function (id) { var i = $("#" + id, form); if (!i.checkValidity()) missing.push(i.previousElementSibling.textContent.toLowerCase()); });
    if (missing.length) {
      msg.innerHTML = '<span style="color:var(--warn)">Still need: ' + missing.join(", ") + ".</span>";
      var firstBad = null;
      $$("fieldset", form).some(function (fs) { var rs = $$("input[type=radio][required]", fs); if (rs.length && !fs.querySelector("input:checked")) { firstBad = rs[0]; return true; } return false; });
      if (!firstBad) firstBad = form.querySelector("input:invalid");
      if (firstBad) firstBad.focus();
      if (hasGSAP && !reduce) gsap.fromTo(msg, { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1,0.3)" });
      return;
    }
    var id = TXT.prefix + String(Math.floor(1000 + Math.random() * 9000));
    var what = form.querySelector("input[name=what]:checked");
    store.set(ETA_KEY, JSON.stringify({ id: id, at: Date.now(), what: what.value, label: what.nextElementSibling.firstChild.textContent, city: $("#d-city", form).value, name: $("#d-name", form).value.split(" ")[0] }), true);
    $("[data-ticket-id]", routed).textContent = id;
    etaTick();
    Sound.routed();
    if (hasGSAP && !reduce) {
      gsap.timeline()
        .to(form, { y: -20, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: function () { form.hidden = true; routed.classList.add("is-on"); inner.scrollTop = 0; } })
        .fromTo(fill, { opacity: 0.0 }, { opacity: 0.85, duration: 0.12 }).to(fill, { opacity: 0, duration: 0.5 })
        .from(routed.children, { y: 40, rotateX: -10, transformPerspective: 1200, duration: 0.8, stagger: 0.07, ease: LOCK }, "-=0.45");
    } else { form.hidden = true; routed.classList.add("is-on"); }
    var link = $("a", routed); if (link) setTimeout(function () { link.focus({ preventScroll: true }); }, 900);
  });

  /* ------------------------------------------------------------- BOOT */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enter); else enter();
  window.addEventListener("load", function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
})();
