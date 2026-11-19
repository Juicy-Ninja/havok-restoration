/* Havok blog: theme toggle, reading progress, TOC highlight, copy link, index filter + search */
(function () {
  var doc = document.documentElement;

  // always open a post or the index at the top (unless a #section was asked for)
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  function toTop() { if (!location.hash || /^#cat-/.test(location.hash)) window.scrollTo(0, 0); }
  toTop();
  window.addEventListener("load", toTop);
  window.addEventListener("pageshow", function (ev) { if (ev.persisted) toTop(); });

  // theme (shares the 'havok-theme' key with the home page)
  var tbtn = document.querySelector("[data-theme-toggle]");
  if (tbtn) tbtn.addEventListener("click", function () {
    var next = doc.getAttribute("data-theme") === "light" ? "dark" : "light";
    doc.setAttribute("data-theme", next);
    try { localStorage.setItem("havok-theme", next); } catch (e) {}
  });

  // reading progress (articles only)
  var bar = document.querySelector("[data-progress]");
  var art = document.querySelector(".b-prose");
  if (bar && art) {
    var tick = function () {
      var r = art.getBoundingClientRect(), h = r.height - window.innerHeight * 0.6;
      var p = Math.min(1, Math.max(0, -r.top / (h > 0 ? h : 1)));
      bar.style.transform = "scaleX(" + p + ")";
    };
    window.addEventListener("scroll", tick, { passive: true }); tick();
  }

  // table of contents highlight
  var tocLinks = [].slice.call(document.querySelectorAll("[data-toc]"));
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute("data-toc")] = a; });
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove("on"); a.removeAttribute("aria-current"); });
          var a = map[en.target.id]; if (a) { a.classList.add("on"); a.setAttribute("aria-current", "true"); }
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var h = document.getElementById(id); if (h) io.observe(h); });
  }

  // copy link
  var cp = document.querySelector("[data-copy]");
  if (cp) cp.addEventListener("click", function () {
    var url = cp.getAttribute("data-copy"), label = cp.querySelector("span");
    var done = function () { cp.classList.add("ok"); label.textContent = "Link copied"; setTimeout(function () { cp.classList.remove("ok"); label.textContent = "Copy link"; }, 2200); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
  });

  // index: category filter + search
  var cards = [].slice.call(document.querySelectorAll(".b-list .b-card"));
  if (!cards.length) return;
  var chips = [].slice.call(document.querySelectorAll("[data-filter]"));
  var q = document.querySelector("[data-search]"), empty = document.querySelector("[data-empty]");
  var feat = document.querySelector(".b-feat"), cat = "all";
  function apply() {
    var term = (q && q.value || "").trim().toLowerCase(), shown = 0;
    cards.forEach(function (c) {
      var ok = (cat === "all" || c.getAttribute("data-cat") === cat) && (!term || c.getAttribute("data-text").indexOf(term) > -1);
      c.hidden = !ok; if (ok) shown++;
    });
    if (feat) feat.hidden = !feat.querySelector(".b-card:not([hidden])");
    if (empty) empty.hidden = shown > 0;
  }
  function setCat(c) {
    cat = c;
    chips.forEach(function (b) { var on = b.getAttribute("data-filter") === c; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    apply();
  }
  chips.forEach(function (b) { b.addEventListener("click", function () { setCat(b.getAttribute("data-filter")); }); });
  if (q) q.addEventListener("input", apply);
  [].slice.call(document.querySelectorAll("[data-jump]")).forEach(function (a) {
    a.addEventListener("click", function (ev) { ev.preventDefault(); setCat(a.getAttribute("data-jump")); document.querySelector(".b-tools").scrollIntoView({ behavior: "smooth", block: "start" }); });
  });
  var m = location.hash.match(/^#cat-(.+)$/);
  if (m && chips.some(function (b) { return b.getAttribute("data-filter") === m[1]; })) setCat(m[1]);
})();
