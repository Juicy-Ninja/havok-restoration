/* Framewell Reconstruction · shared behaviour
   Chrome (header, menu, footer, intake sheet), theme + sound, page wipes, reveals,
   before/after comparison with scan sweep, project tilt, drafting cursor, intake flow. */
(function () {
  "use strict";
  var FW = window.FW, C = FW.CONFIG, S = FW.SVG;
  var doc = document, root = doc.documentElement, body = doc.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var page = (location.pathname.split("/").pop() || "home.html");
  if (!/\.html$/.test(page)) page += ".html";

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function sstore(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function el(html) { var t = doc.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  FW.esc = esc; FW.$ = $; FW.$$ = $$; FW.el = el;

  /* ---------- theme ---------- */
  /* system theme by default; an explicit choice is remembered per viewer */
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  var saved = store("fw-theme");
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  var theme = root.getAttribute("data-theme") || (mq.matches ? "dark" : "light");
  if (mq.addEventListener) mq.addEventListener("change", function () { if (!root.getAttribute("data-theme")) { theme = mq.matches ? "dark" : "light"; $$("[data-theme-btn]").forEach(paintThemeBtn); } });
  function setTheme(t) { theme = t; root.setAttribute("data-theme", t); store("fw-theme", t); $$("[data-theme-btn]").forEach(paintThemeBtn); }
  function paintThemeBtn(b) { b.innerHTML = theme === "dark" ? S.sun : S.moon; b.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme"); }

  /* ---------- sound: soft, synthesized, off by default ---------- */
  var soundOn = store("fw-sound") === "on", actx = null;
  function ctx() { if (!actx) { var A = window.AudioContext || window.webkitAudioContext; if (A) actx = new A(); } return actx; }
  function tone(f, d, type, g, when) {
    var a = ctx(); if (!a) return; var t = a.currentTime + (when || 0);
    var o = a.createOscillator(), v = a.createGain(), lp = a.createBiquadFilter();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
    lp.type = "lowpass"; lp.frequency.value = 1800;
    v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(g || 0.06, t + 0.008); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(lp); lp.connect(v); v.connect(a.destination); o.start(t); o.stop(t + d + 0.02);
  }
  function air(d) {
    var a = ctx(); if (!a) return; var n = Math.floor(a.sampleRate * d), buf = a.createBuffer(1, n, a.sampleRate), ch = buf.getChannelData(0);
    for (var i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    var s = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain();
    s.buffer = buf; bp.type = "bandpass"; bp.frequency.value = 2400; bp.Q.value = .6; g.gain.value = .05;
    s.connect(bp); bp.connect(g); g.connect(a.destination); s.start();
  }
  var sfx = {
    latch: function () { if (!soundOn) return; tone(140, .09, "triangle", .07); tone(420, .04, "square", .015, .012); },
    swipe: function () { if (!soundOn) return; air(.28); },
    tick: function () { if (!soundOn) return; tone(880, .03, "sine", .02); },
    chime: function () { if (!soundOn) return; tone(523.25, .5, "sine", .05); tone(659.25, .55, "sine", .04, .09); tone(783.99, .8, "sine", .035, .18); }
  };
  FW.sfx = sfx;
  function setSound(on) { soundOn = on; store("fw-sound", on ? "on" : "off"); if (on) { ctx(); if (actx && actx.state === "suspended") actx.resume(); sfx.latch(); } $$("[data-sound-btn]").forEach(paintSoundBtn); }
  function paintSoundBtn(b) { b.setAttribute("aria-pressed", soundOn ? "true" : "false"); b.innerHTML = (soundOn ? S.sound : S.mute) + '<span class="sr">' + (soundOn ? "Sound on" : "Sound off") + "</span>"; b.setAttribute("aria-label", soundOn ? "Turn interface sound off" : "Turn interface sound on"); }

  /* ---------- chrome ---------- */
  function navLinks(cls) {
    return FW.NAV.map(function (n, i) {
      var cur = page === n.href || (n.href === "services.html" && /^service/.test(page)) || (n.href === "bay-area.html" && page === "area.html");
      return '<a href="' + n.href + '"' + (cur ? ' aria-current="page"' : "") + ">" + (cls ? n.label + "<span>0" + (i + 1) + "</span>" : n.label) + "</a>";
    }).join("");
  }
  var header = el(
    '<header class="top" data-top><div class="wrap"><div class="top__in">' +
      '<a class="brand" href="home.html" aria-label="Framewell Reconstruction home">' + FW.LOGO + "</a>" +
      '<nav class="nav" aria-label="Main">' + navLinks() + "</nav>" +
      '<div class="tools">' +
        '<a class="btn btn--ghost tel" href="' + C.phoneHref + '" data-cursor="CALL">' + S.phone + "<span>" + C.phone + "</span></a>" +
        '<button class="btn btn--ghost btn--icon thm" type="button" data-theme-btn></button>' +
        '<button class="btn btn--ghost btn--icon snd" type="button" data-sound-btn></button>' +
        '<button class="btn btn--primary btn--sm" type="button" data-intake data-cursor="START">Start a rebuild</button>' +
        '<button class="btn btn--ghost btn--icon menu-btn" type="button" aria-expanded="false" aria-controls="drawer" aria-label="Open menu" data-menu>' + S.menu + "</button>" +
      "</div></div></div></header>"
  );
  var drawer = el(
    '<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu">' +
      '<div class="drawer__head"><a class="brand" href="home.html" aria-label="Framewell Reconstruction home">' + FW.LOGO + '</a><button class="btn btn--ghost btn--icon" type="button" data-menu-close aria-label="Close menu">' + S.close + "</button></div>" +
      "<nav aria-label=\"Main\">" + navLinks(true) + "</nav>" +
      '<div class="drawer__foot"><button class="btn btn--primary" type="button" data-intake>Start a rebuild ' + S.arrow + '</button><a class="btn btn--line" href="' + C.phoneHref + '">' + S.phone + " " + C.phone + '</a>' +
      '<div class="settings"><button class="btn btn--line btn--sm" type="button" data-theme-btn-wide>Theme</button><button class="btn btn--line btn--sm" type="button" data-sound-btn></button></div></div>' +
    "</div>"
  );
  var svcLinks = FW.SERVICES.slice(0, 6).map(function (s) { return '<li><a href="service.html#' + s.slug + '">' + esc(s.name) + "</a></li>"; }).join("");
  var footer = el(
    '<footer class="foot"><div class="wrap">' +
      '<div class="foot__grid">' +
        '<div class="foot__brand"><a class="brand" href="home.html" aria-label="Framewell Reconstruction home">' + FW.LOGO + '</a><p class="foot__tag">From bare studs to move-in ready.</p>' +
          '<p class="caption">a Havok Restoration company</p></div>' +
        "<div><h4>Rebuilds</h4><ul>" + svcLinks + '<li><a href="services.html">All rebuild services</a></li></ul></div>' +
        '<div><h4>Homeowners</h4><ul><li><a href="how-a-rebuild-works.html">How a rebuild works</a></li><li><a href="working-with-insurance.html">Working with insurance</a></li><li><a href="about.html#warranty">Warranty</a></li><li><a href="projects.html">Projects</a></li><li><a href="start.html">Start a rebuild</a></li></ul></div>' +
        '<div><h4>Bay Area</h4><ul><li><a href="bay-area.html">Service area</a></li>' + FW.ZONES.slice(0, 5).map(function (z) { return '<li><a href="area.html#' + z.slug + '">' + esc(z.name) + "</a></li>"; }).join("") +
        '<li><a href="' + C.phoneHref + '">' + C.phone + "</a></li></ul></div>" +
      "</div>" +
      '<div class="foot__base"><p class="caption">© 2026 Framewell Reconstruction, a Havok Restoration company · ' + esc(C.license) + "</p>" +
        '<div class="family"><a href="https://havokrestoration.com/">Havok Restoration</a><a href="https://habioclean.com/">Habio Specialty Cleaning &amp; Decon</a><a href="home.html">Framewell Reconstruction</a></div></div>' +
    "</div></footer>"
  );
  body.insertBefore(el('<a class="skip" href="#main">Skip to content</a>'), body.firstChild);
  body.insertBefore(el('<div class="paper" aria-hidden="true"></div>'), body.firstChild);
  var main = $("#main");
  body.insertBefore(header, main);
  body.appendChild(drawer);
  main.after(footer);
  body.appendChild(el('<div class="wipe" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></div>'));
  body.appendChild(el('<div class="mbar" data-mbar><a class="btn btn--line" href="' + C.phoneHref + '">' + S.phone + ' Call</a><button class="btn btn--primary" type="button" data-intake>Start a rebuild</button></div>'));

  $$("[data-theme-btn]").forEach(function (b) { paintThemeBtn(b); b.addEventListener("click", function () { setTheme(theme === "dark" ? "light" : "dark"); sfx.tick(); }); });
  $$("[data-theme-btn-wide]").forEach(function (b) { b.addEventListener("click", function () { setTheme(theme === "dark" ? "light" : "dark"); }); });
  $$("[data-sound-btn]").forEach(function (b) { paintSoundBtn(b); b.addEventListener("click", function () { setSound(!soundOn); }); });

  /* sticky header + mobile bar */
  var top = $("[data-top]"), mbar = $("[data-mbar]");
  function onScroll() { var y = window.scrollY; top.classList.toggle("is-stuck", y > 12); mbar.classList.toggle("on", y > 520); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* menu */
  var menuBtn = $("[data-menu]"), lastFocus = null;
  function openMenu(o) {
    drawer.classList.toggle("is-open", o); menuBtn.setAttribute("aria-expanded", o ? "true" : "false");
    body.style.overflow = o ? "hidden" : "";
    if (o) { lastFocus = doc.activeElement; setTimeout(function () { $("[data-menu-close]").focus(); }, 60); sfx.swipe(); } else if (lastFocus) lastFocus.focus();
  }
  menuBtn.addEventListener("click", function () { openMenu(true); });
  $("[data-menu-close]").addEventListener("click", function () { openMenu(false); });

  /* ---------- page wipe between pages ---------- */
  if (sstore("fw-nav") === "1" && !reduce) {
    root.classList.add("is-arriving");
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add("is-arrived"); }); });
    setTimeout(function () { root.classList.remove("is-arriving", "is-arrived"); }, 1100);
  }
  sstore("fw-nav", "0");
  doc.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === "_blank") return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(tel:|mailto:|https?:)/.test(href)) return;
    if (href.split("#")[0] === page && href.indexOf("#") > -1) { if (body.hasAttribute("data-hash-page")) { e.preventDefault(); location.hash = href.split("#")[1]; location.reload(); } return; }
    e.preventDefault();
    sstore("fw-nav", "1");
    if (reduce) { location.href = href; return; }
    sfx.swipe();
    root.classList.add("is-leaving");
    setTimeout(function () { location.href = href; }, 560);
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted) root.classList.remove("is-leaving", "is-arriving", "is-arrived"); });

  /* ---------- reveals ---------- */
  function reveal() {
    /* hero panels lock in on load (a fully clipped element never reports an intersection) */
    $$(".lock").forEach(function (t) {
      var d = reduce ? 0 : parseFloat(t.getAttribute("data-d") || 0) + (root.classList.contains("is-arriving") ? .35 : 0);
      setTimeout(function () { t.classList.add("in"); }, d * 1000);
    });
    var targets = $$(".rv,.rv-rule");
    if (reduce || !("IntersectionObserver" in window)) { targets.forEach(function (t) { t.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target, d = parseFloat(t.getAttribute("data-d") || 0);
        setTimeout(function () { t.classList.add("in"); }, d * 1000);
        io.unobserve(t);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    targets.forEach(function (t) { io.observe(t); });
  }
  FW.reveal = reveal;

  /* hero panels lock into place in sequence */
  function heroLock() {
    var items = $$("[data-lock]");
    items.forEach(function (n, i) { n.classList.add("lock"); n.setAttribute("data-d", (0.12 + i * 0.09).toFixed(2)); });
  }

  /* ---------- before / after with scan sweep ---------- */
  FW.initBA = function (scope) {
    $$(".ba", scope).forEach(function (ba) {
      if (ba._ba) return; ba._ba = 1;
      var knob = $(".ba__knob", ba), x = 50, dragging = false;
      function set(v) { x = Math.max(0, Math.min(100, v)); ba.style.setProperty("--x", x + "%"); knob.setAttribute("aria-valuenow", Math.round(x)); }
      function fromEvent(e) { var r = ba.getBoundingClientRect(); var cx = e.touches ? e.touches[0].clientX : e.clientX; set((cx - r.left) / r.width * 100); }
      ba.addEventListener("pointerdown", function (e) { dragging = true; ba.setPointerCapture(e.pointerId); fromEvent(e); ba.classList.add("is-sweeping"); sfx.tick(); });
      ba.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
      ["pointerup", "pointercancel"].forEach(function (t) { ba.addEventListener(t, function () { dragging = false; ba.classList.remove("is-sweeping"); }); });
      knob.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { set(x - 5); e.preventDefault(); } else if (e.key === "ArrowRight") { set(x + 5); e.preventDefault(); }
        else if (e.key === "Home") { set(0); e.preventDefault(); } else if (e.key === "End") { set(100); e.preventDefault(); }
      });
      set(ba.getAttribute("data-start") ? +ba.getAttribute("data-start") : 50);
      /* scroll-driven sweep: the light bar passes from damaged to rebuilt as the frame crosses the viewport */
      if (!reduce && ba.hasAttribute("data-sweep")) {
        var touched = false;
        ba.addEventListener("pointerdown", function () { touched = true; });
        var tick = function () {
          if (touched) return;
          var r = ba.getBoundingClientRect(), vh = window.innerHeight;
          var p = 1 - (r.top + r.height * .5) / (vh + r.height * .2);
          p = Math.max(0, Math.min(1, (p - .15) / .6));
          set(92 - p * 84); ba.classList.toggle("is-sweeping", p > 0 && p < 1);
        };
        window.addEventListener("scroll", function () { requestAnimationFrame(tick); }, { passive: true }); tick();
      }
    });
  };
  FW.baHTML = function (before, after, opts) {
    opts = opts || {};
    return '<div class="ba" ' + (opts.sweep ? "data-sweep " : "") + 'style="' + (opts.style || "") + '" data-cursor="DRAG">' +
      '<img src="' + before + '" alt="' + esc(opts.altBefore || "Before the rebuild") + '" loading="lazy" decoding="async">' +
      '<img class="ba__after" src="' + after + '" alt="' + esc(opts.altAfter || "After the rebuild") + '" loading="lazy" decoding="async">' +
      '<div class="ba__sweep"></div><div class="ba__bar"></div>' +
      '<button class="ba__knob" type="button" role="slider" aria-label="Compare before and after" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">' + S.drag + "</button>" +
      '<span class="tag tag--tl">' + esc(opts.lb || "Before") + '</span><span class="tag tag--tr"><i></i>' + esc(opts.la || "After") + "</span></div>";
  };

  /* ---------- project tilt ---------- */
  FW.initTilt = function (scope) {
    if (!fine || reduce) return;
    $$(".proj", scope).forEach(function (p) {
      var inn = $(".proj__in", p), raf = 0;
      p.addEventListener("pointermove", function (e) {
        var r = p.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () { inn.style.transform = "perspective(1500px) rotateX(" + (-dy * 5).toFixed(2) + "deg) rotateY(" + (dx * 6).toFixed(2) + "deg)"; });
      });
      p.addEventListener("pointerleave", function () { cancelAnimationFrame(raf); inn.style.transform = ""; });
    });
  };

  /* ---------- drafting cursor ---------- */
  function cursor() {
    if (!fine || reduce) return;
    var c = el('<div class="cursor" aria-hidden="true"><div class="cursor__x"></div><div class="cursor__y"></div><div class="cursor__ring"></div><div class="cursor__lbl"></div></div>');
    body.appendChild(c);
    var lbl = $(".cursor__lbl", c), mx = -100, my = -100, cx = -100, cy = -100, vx = 0, vy = 0;
    window.addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; c.classList.add("on"); }, { passive: true });
    doc.addEventListener("pointerleave", function () { c.classList.remove("on"); });
    window.addEventListener("pointerdown", function () { c.classList.add("is-down"); });
    window.addEventListener("pointerup", function () { c.classList.remove("is-down"); });
    (function loop() {
      /* spring follow: lags, overshoots slightly, settles */
      vx = (vx + (mx - cx) * .16) * .72; vy = (vy + (my - cy) * .16) * .72; cx += vx; cy += vy;
      c.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      requestAnimationFrame(loop);
    })();
    doc.addEventListener("pointerover", function (e) {
      var t = e.target.closest && e.target.closest("a,button,summary,label.opt,[data-cursor],input,select,textarea");
      if (!t || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) { c.classList.remove("is-target", "has-lbl"); return; }
      var word = t.getAttribute("data-cursor") || (t.closest("[data-cursor]") && t.closest("[data-cursor]").getAttribute("data-cursor"));
      c.classList.add("is-target"); c.classList.toggle("has-lbl", !!word); lbl.textContent = word || "";
    });
  }

  /* ---------- intake sheet ---------- */
  var SERV = [
    ["water", "Water damage", "Leak, burst pipe, slab leak"], ["fire", "Fire or smoke", "House, kitchen or garage fire"],
    ["mold", "Mold", "After remediation"], ["storm", "Storm", "Roof, windows, siding"],
    ["kitchen-bath", "Kitchen or bath", "Rebuild or upgrade"], ["other", "Something else", "Tell us in a sentence"]
  ];
  var sheetHTML =
    '<div class="sheet-scrim" data-sheet-scrim></div>' +
    '<aside class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-h" data-sheet>' +
      '<div class="sheet__head"><div><p class="eyebrow">Start a rebuild</p><h2 class="h2" id="sheet-h">Tell us what needs rebuilding.</h2></div>' +
        '<button class="btn btn--ghost btn--icon" type="button" data-sheet-close aria-label="Close">' + S.close + "</button></div>" +
      '<div class="sheet__prog" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' +
      '<form class="sheet__body" novalidate data-intake-form>' +
        '<div class="step" data-step="1"><fieldset><legend>What happened?</legend><p class="body-sm muted">Pick the closest one. You can add detail later.</p><div class="opts">' +
          SERV.map(function (s, i) { return '<label class="opt"><input type="radio" name="loss" value="' + s[0] + '"' + (i === 0 ? " required" : "") + "><span>" + s[1] + "<small>" + s[2] + "</small></span></label>"; }).join("") +
        '</div><p class="err" data-err="loss"></p></fieldset></div>' +
        '<div class="step" data-step="2"><fieldset><legend>Did Havok handle the cleanup?</legend><p class="body-sm muted">If yes, we pull your mitigation file today. Readings, photos and scope carry over.</p><div class="opts opts--1">' +
          '<label class="opt"><input type="radio" name="havok" value="yes"><span>Yes, Havok did the mitigation<small>We\'ll link your existing ClaimTrak file</small></span></label>' +
          '<label class="opt"><input type="radio" name="havok" value="other"><span>Another company did it<small>We\'ll ask for their drying records</small></span></label>' +
          '<label class="opt"><input type="radio" name="havok" value="none"><span>No mitigation yet<small>We\'ll connect you with Havok first</small></span></label>' +
        '</div><div class="fld" data-havok-job hidden><label for="f-job">Havok job number <span class="muted">(optional)</span></label><input class="inp" id="f-job" name="job" inputmode="text" autocomplete="off" placeholder="HV-0000"></div><p class="err" data-err="havok"></p></fieldset></div>' +
        '<div class="step" data-step="3"><fieldset><legend>Where is the insurance claim?</legend><div class="opts opts--1">' +
          '<label class="opt"><input type="radio" name="claim" value="approved"><span>Estimate approved<small>The adjuster has written the rebuild scope</small></span></label>' +
          '<label class="opt"><input type="radio" name="claim" value="open"><span>Claim open, no estimate yet<small>We can review it with you when it arrives</small></span></label>' +
          '<label class="opt"><input type="radio" name="claim" value="none"><span>No claim<small>Paying directly, or still deciding</small></span></label>' +
          '<label class="opt"><input type="radio" name="claim" value="unsure"><span>Not sure<small>That\'s fine. We\'ll help you sort it out</small></span></label>' +
        '</div><p class="err" data-err="claim"></p></fieldset></div>' +
        '<div class="step" data-step="4"><fieldset><legend>Photos help us scope it.</legend><p class="body-sm muted">Optional. Wide shots of each room, plus the adjuster\'s estimate if you have it.</p>' +
          '<label class="drop" data-drop>' + S.upload + '<span>Add photos or a PDF</span><span class="caption">JPG, PNG, HEIC or PDF</span><input class="sr" type="file" name="files" accept="image/*,.pdf" multiple data-files></label>' +
          '<div class="thumbs" data-thumbs></div>' +
          '<div class="fld"><label for="f-note">Anything we should know?</label><textarea class="inp" id="f-note" name="note" placeholder="Kitchen and hall, cabinets removed, adjuster visited last week."></textarea></div></fieldset></div>' +
        '<div class="step" data-step="5"><fieldset><legend>How do we reach you?</legend>' +
          '<div class="fld"><label for="f-name">Your name</label><input class="inp" id="f-name" name="name" autocomplete="name" required><p class="err" data-err="name"></p></div>' +
          '<div class="row2"><div class="fld"><label for="f-phone">Mobile</label><input class="inp" id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required><p class="err" data-err="phone"></p></div>' +
          '<div class="fld"><label for="f-zip">ZIP code</label><input class="inp" id="f-zip" name="zip" inputmode="numeric" autocomplete="postal-code" maxlength="5" required><p class="err" data-err="zip"></p></div></div>' +
          '<div class="fld"><label for="f-email">Email <span class="muted">(optional)</span></label><input class="inp" id="f-email" name="email" type="email" autocomplete="email"></div>' +
          '<div class="fld"><span class="mono muted">Best time to call</span><div class="opts">' +
            '<label class="opt"><input type="radio" name="when" value="morning" checked><span>Morning</span></label><label class="opt"><input type="radio" name="when" value="afternoon"><span>Afternoon</span></label></div></div>' +
          '<p class="caption">We use this only to schedule your walkthrough. Text updates come from your project lead.</p></fieldset></div>' +
        '<div class="step" data-step="done"><div class="done" aria-live="polite"><span class="chip chip--ok">' + S.check + ' Received</span><p class="mono muted">Request number</p><p class="done__id" data-done-id></p>' +
          '<h3 class="h1">We\'ll call you to set the walkthrough.</h3><div class="summary" data-summary></div>' +
          '<ol><li><b>01</b><span>A project lead calls you, usually the same business day.</span></li><li><b>02</b><span>Walkthrough: we measure, photograph and review your estimate with you.</span></li><li><b>03</b><span>You get a written scope and schedule before anything is signed.</span></li></ol></div></div>' +
      "</form>" +
      '<div class="sheet__foot"><button class="btn btn--ghost" type="button" data-back>Back</button><span class="mono muted" data-count></span><button class="btn btn--primary" type="button" data-next data-cursor="NEXT">Next ' + S.arrow + "</button></div>" +
    "</aside>";
  body.insertAdjacentHTML("beforeend", sheetHTML);
  var sheet = $("[data-sheet]"), scrim = $("[data-sheet-scrim]"), form = $("[data-intake-form]");
  var steps = $$(".step", form), prog = $$(".sheet__prog i", sheet), nextB = $("[data-next]"), backB = $("[data-back]"), count = $("[data-count]");
  var cur = 0, opener = null, files = [];
  function show(i) {
    cur = i; steps.forEach(function (s, k) { s.classList.toggle("is-on", k === i); });
    prog.forEach(function (p, k) { p.classList.toggle("on", k <= i); });
    var done = steps[i].getAttribute("data-step") === "done";
    backB.style.visibility = i === 0 || done ? "hidden" : "visible";
    nextB.innerHTML = done ? "Close" : (i === 4 ? "Send request " + S.arrow : "Next " + S.arrow);
    nextB.setAttribute("data-cursor", done ? "CLOSE" : i === 4 ? "SEND" : "NEXT");
    count.textContent = done ? "" : "Step " + (i + 1) + " of 5";
    var f = $("input,textarea", steps[i]); if (f && !done) setTimeout(function () { f.focus({ preventScroll: true }); }, 80);
  }
  function err(name, msg) { var e = $('[data-err="' + name + '"]', form); if (e) e.textContent = msg || ""; var inp = form.elements[name]; if (inp && inp.setAttribute && !inp.length) inp.setAttribute("aria-invalid", msg ? "true" : "false"); }
  function valid(i) {
    var ok = true, f = form.elements;
    if (i === 0 && !f.loss.value) { err("loss", "Choose what happened."); ok = false; } else if (i === 0) err("loss");
    if (i === 1 && !f.havok.value) { err("havok", "Choose one."); ok = false; } else if (i === 1) err("havok");
    if (i === 2 && !f.claim.value) { err("claim", "Choose one."); ok = false; } else if (i === 2) err("claim");
    if (i === 4) {
      if (f.name.value.trim().length < 2) { err("name", "Enter your name."); ok = false; } else err("name");
      if (f.phone.value.replace(/\D/g, "").length < 10) { err("phone", "Enter a 10-digit number."); ok = false; } else err("phone");
      if (!/^\d{5}$/.test(f.zip.value)) { err("zip", "Enter a 5-digit ZIP."); ok = false; } else err("zip");
    }
    return ok;
  }
  form.addEventListener("change", function (e) {
    if (e.target.name === "havok") $("[data-havok-job]", form).hidden = e.target.value !== "yes";
    if (e.target.type === "radio") { sfx.tick(); err(e.target.name); }
  });
  var fileIn = $("[data-files]", form), thumbs = $("[data-thumbs]", form), drop = $("[data-drop]", form);
  function addFiles(list) {
    Array.prototype.forEach.call(list, function (f) {
      files.push(f);
      if (/^image\//.test(f.type)) { var u = URL.createObjectURL(f); thumbs.insertAdjacentHTML("beforeend", '<img src="' + u + '" alt="' + esc(f.name) + '">'); }
      else thumbs.insertAdjacentHTML("beforeend", '<span class="chip">' + esc(f.name.slice(0, 14)) + "</span>");
    });
  }
  fileIn.addEventListener("change", function () { addFiles(fileIn.files); });
  ["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("is-over"); }); });
  ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("is-over"); if (t === "drop" && e.dataTransfer) addFiles(e.dataTransfer.files); }); });

  function submit() {
    var f = form.elements, id = "FW-" + (Date.now() % 100000).toString().padStart(5, "0");
    var labels = { water: "Water damage", fire: "Fire or smoke", mold: "Mold", storm: "Storm", "kitchen-bath": "Kitchen or bath", other: "Something else" };
    var hv = { yes: "Havok" + (f.job.value ? " · " + f.job.value : ""), other: "Another company", none: "Not yet" };
    var cl = { approved: "Estimate approved", open: "Claim open", none: "No claim", unsure: "Not sure" };
    var payload = { id: id, brand: "framewell", market: C.marketSlug, loss: f.loss.value, mitigation: f.havok.value, job: f.job.value, claim: f.claim.value, note: f.note.value,
      name: f.name.value.trim(), phone: f.phone.value, zip: f.zip.value, email: f.email.value, when: f.when.value, files: files.length, page: page, at: new Date().toISOString() };
    if (C.intakeEndpoint) {
      var fd = new FormData(); fd.append("payload", JSON.stringify(payload)); files.forEach(function (x) { fd.append("files", x); });
      fetch(C.intakeEndpoint, { method: "POST", body: fd }).catch(function () {});
    }
    sstore("fw-last-intake", JSON.stringify(payload));
    $("[data-done-id]", form).textContent = id;
    $("[data-summary]", form).innerHTML =
      "<div><span>Loss</span><b>" + esc(labels[payload.loss]) + "</b></div><div><span>Mitigation</span><b>" + esc(hv[payload.mitigation]) + "</b></div>" +
      "<div><span>Claim</span><b>" + esc(cl[payload.claim]) + "</b></div><div><span>Photos</span><b>" + files.length + "</b></div><div><span>ZIP</span><b>" + esc(payload.zip) + "</b></div>";
    show(5); sfx.chime();
  }
  nextB.addEventListener("click", function () {
    if (steps[cur].getAttribute("data-step") === "done") { closeSheet(); return; }
    if (!valid(cur)) { sfx.tick(); return; }
    sfx.latch();
    if (cur === 4) submit(); else show(cur + 1);
  });
  backB.addEventListener("click", function () { if (cur > 0) { show(cur - 1); sfx.tick(); } });
  form.addEventListener("submit", function (e) { e.preventDefault(); nextB.click(); });
  form.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); nextB.click(); } });

  function openSheet(btn, preset) {
    opener = btn;
    if (preset && form.elements.loss) { var r = $('input[name="loss"][value="' + preset + '"]', form); if (r) r.checked = true; }
    if (steps[cur].getAttribute("data-step") === "done") { form.reset(); files = []; thumbs.innerHTML = ""; $("[data-havok-job]", form).hidden = true; cur = 0; if (preset) { var rr = $('input[name="loss"][value="' + preset + '"]', form); if (rr) rr.checked = true; } }
    show(preset && cur === 0 ? 1 : cur);
    sfx.latch();
    body.style.overflow = "hidden";
    scrim.classList.add("is-open");
    if (!reduce && btn && btn.getBoundingClientRect) {
      /* the button grows into the sheet: FLIP from the button's box to the sheet's box */
      var b = btn.getBoundingClientRect(); sheet.style.visibility = "hidden"; sheet.classList.add("is-open");
      var s = sheet.getBoundingClientRect(); sheet.classList.remove("is-open"); sheet.style.visibility = "";
      var m = el('<div class="morph"></div>'); body.appendChild(m);
      m.style.left = b.left + "px"; m.style.top = b.top + "px"; m.style.width = b.width + "px"; m.style.height = b.height + "px";
      m.animate([
        { left: b.left + "px", top: b.top + "px", width: b.width + "px", height: b.height + "px", background: "#D4892F", borderRadius: "2px" },
        { left: s.left + "px", top: s.top + "px", width: s.width + "px", height: s.height + "px", background: getComputedStyle(root).getPropertyValue("--surface").trim() || "#fff", borderRadius: "0px" }
      ], { duration: 520, easing: "cubic-bezier(.7,0,.15,1)", fill: "forwards" }).onfinish = function () { setTimeout(function () { m.remove(); }, 260); };
    }
    sheet.classList.add("is-open");
  }
  function closeSheet() {
    sheet.classList.remove("is-open"); scrim.classList.remove("is-open"); body.style.overflow = "";
    sfx.swipe(); if (opener && opener.focus) opener.focus();
  }
  FW.openSheet = openSheet;
  doc.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-intake]");
    if (b) { e.preventDefault(); if (drawer.classList.contains("is-open")) openMenu(false); openSheet(b, b.getAttribute("data-intake") || null); }
  });
  $("[data-sheet-close]").addEventListener("click", closeSheet);
  scrim.addEventListener("click", closeSheet);
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (sheet.classList.contains("is-open")) closeSheet(); else if (drawer.classList.contains("is-open")) openMenu(false);
  });
  /* keep focus inside open dialogs */
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var box = sheet.classList.contains("is-open") ? sheet : drawer.classList.contains("is-open") ? drawer : null; if (!box) return;
    var f = $$("a[href],button:not([disabled]),input:not([type=hidden]),textarea,select", box).filter(function (n) { return n.offsetParent !== null && n.style.visibility !== "hidden"; });
    if (!f.length) return; var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && doc.activeElement === a) { z.focus(); e.preventDefault(); } else if (!e.shiftKey && doc.activeElement === z) { a.focus(); e.preventDefault(); }
  });

  /* ---------- in-page TOC highlighting ---------- */
  function toc() {
    var links = $$(".toc a"); if (!links.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) links.forEach(function (l) { l.classList.toggle("on", l.getAttribute("href") === "#" + en.target.id); }); });
    }, { rootMargin: "-30% 0px -60% 0px" });
    links.forEach(function (l) { var t = $(l.getAttribute("href")); if (t) io.observe(t); });
  }

  /* ---------- boot ---------- */
  FW.boot = function () {
    heroLock(); reveal(); FW.initBA(); FW.initTilt(); toc(); cursor();
  };
  FW.icon = function (n) { return S[n] || ""; };
})();
