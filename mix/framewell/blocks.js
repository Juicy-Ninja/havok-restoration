/* Framewell · content blocks rendered from site data.
   Each element with data-block="name" is filled here before reveals and interactions boot. */
(function () {
  "use strict";
  var FW = window.FW, S = FW.SVG, esc = FW.esc, $ = FW.$, $$ = FW.$$;

  function money(n) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  /* page parameters travel in the hash (service.html#kitchen-rebuild), the only part an artifact link keeps */
  function q() { var h = location.hash.replace(/^#/, ""); return h ? decodeURIComponent(h) : null; }
  FW.q = q; FW.money = money;

  var B = {};

  /* numbered service index */
  B.services = function (n) {
    var lim = +(n.getAttribute("data-limit") || 99), skip = n.getAttribute("data-skip");
    n.classList.add.apply(n.classList, ("svc").split(" ").filter(Boolean));
    n.innerHTML = FW.SERVICES.filter(function (s) { return s.slug !== skip; }).slice(0, lim).map(function (s, i) {
      return '<a class="rv" data-d="' + (i % 2 * .06).toFixed(2) + '" href="service.html#' + s.slug + '" data-cursor="VIEW"><span class="n">' + s.n + '</span><span class="t">' + esc(s.name) + "<small>" + esc(s.short) + "</small></span>" + S.arrow + "</a>";
    }).join("");
  };

  /* six-phase timeline; data-now marks the current phase on a sample job */
  B.phases = function (n) {
    var now = +(n.getAttribute("data-now") || 0), detail = n.hasAttribute("data-detail");
    n.classList.add.apply(n.classList, ("phases" + (detail ? "" : " phases--h")).split(" ").filter(Boolean));
    n.innerHTML = FW.PHASES.map(function (p, i) {
      var st = now ? (i + 1 < now ? "is-done" : i + 1 === now ? "is-now" : "") : "";
      return '<li class="phase rv ' + st + '" data-d="' + (i * .07).toFixed(2) + '"><span class="phase__dot">' + (st === "is-done" ? S.check.replace("<svg", '<svg width="16" height="16"') : p.k) + "</span>" +
        '<div class="phase__body"><span class="mono">' + p.d + (st === "is-now" ? " · in progress" : st === "is-done" ? " · done" : "") + '</span><h3 class="h3">' + p.name + "</h3>" +
        (detail || i < 6 ? "<ul>" + p.items.slice(0, detail ? 3 : 2).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") + "</div></li>";
    }).join("");
  };

  /* sample job schedule */
  B.gantt = function (n) {
    var rows = [
      ["Demo and protection", "Havok hand-off", 0, 2, "done"],
      ["Framing repairs", "Hall wall", 2, 3, "done", 5],
      ["Plumbing and electrical", "Licensed trades", 4, 4, "done", 8],
      ["Insulation and drywall", "Hang, tape, texture", 8, 5, "now", 9],
      ["Cabinets and counters", "Templated day 15", 13, 5, "next"],
      ["Tile and flooring", "Kitchen and hall", 17, 4, "next"],
      ["Paint and trim", "Matched sheen", 20, 3, "next"],
      ["Walkthrough", "Punch list, then keys", 23, 2, "next", 24]
    ];
    var days = 25, today = 11;
    var head = '<div class="g-l" style="grid-row:1;border-top:0"></div>' + [0, 5, 10, 15, 20].map(function (d) { return '<div class="g-wk" style="grid-column:' + (d + 2) + "/span 5\">WK " + (d / 5 + 1) + "</div>"; }).join("");
    var body = rows.map(function (r, i) {
      var row = i + 2;
      return '<div class="g-l" style="grid-row:' + row + '">' + esc(r[0]) + "<small>" + esc(r[1]) + "</small></div>" +
        '<div class="g-t" style="grid-row:' + row + ";grid-column:" + (r[2] + 2) + "/span " + r[3] + '"><div class="g-b ' + r[4] + ' rv-rule" style="width:100%" data-d="' + (i * .06).toFixed(2) + '"></div></div>' +
        (r[5] !== undefined ? '<div class="g-t" style="grid-row:' + row + ";grid-column:" + (r[5] + 2) + '/span 1;border-top:0;justify-content:center"><i class="g-i" title="Inspection"></i></div>' : "");
    }).join("");
    n.classList.add.apply(n.classList, ("card sched").split(" ").filter(Boolean));
    n.innerHTML =
      '<div class="sched__head"><div class="stack" style="--g:6px"><span class="mono muted">Sample job FW-1182 · kitchen and hall · 5 weeks</span><span class="h3">Day ' + today + " of " + days + ' working days</span></div>' +
      '<div class="legend"><span><i style="--c:var(--ok)"></i>Done</span><span><i style="--c:#D4892F"></i>In progress</span><span><i style="--c:transparent;--bd:1px dashed var(--hairline-strong)"></i>Scheduled</span><span><i class="dia" style="--c:var(--slate)"></i>Inspection</span></div></div>' +
      '<div class="gantt-x"><div class="gantt">' + head + body +
      '<div class="g-now" style="left:calc(24px + 190px + (100% - 48px - 190px) * ' + (today / days).toFixed(4) + ')"><span>TODAY · DAY ' + today + "</span></div></div></div>";
  };

  /* estimate with insurance and upgrades kept apart; data-filter adds the view toggle */
  var LINES = [
    ["Replace drywall, kitchen and hall", "Hang, tape, texture to match", 420, "sf", "ins", 2940],
    ["Base cabinets, like kind and quality", "Matched to the removed units", 14, "lf", "ins", 5320],
    ["Laminate countertop", "Replaces existing", 28, "sf", "ins", 1120],
    ["Vinyl plank flooring", "Kitchen and hall", 310, "sf", "ins", 2170],
    ["Paint walls and ceiling", "Two coats, matched sheen", 980, "sf", "ins", 1470],
    ["Upgrade to quartz countertop", "Difference over laminate", 28, "sf", "you", 1680],
    ["Upgrade to white oak cabinet doors", "Difference over standard", 14, "lf", "you", 1260]
  ];
  B.estimate = function (n) {
    var filter = n.hasAttribute("data-filter");
    function rows(f) {
      return LINES.filter(function (l) { return f === "all" || l[4] === f; }).map(function (l) {
        return '<tr class="' + (l[4] === "you" ? "up" : "") + '"><td>' + esc(l[0]) + "<small>" + esc(l[1]) + '</small></td><td class="r">' + l[2] + " " + l[3] +
          '</td><td><span class="payer' + (l[4] === "you" ? " payer--you" : "") + '">' + (l[4] === "you" ? "You" : "Insurance") + '</span></td><td class="r">' + money(l[5]) + "</td></tr>";
      }).join("");
    }
    var ins = LINES.filter(function (l) { return l[4] === "ins"; }).reduce(function (a, l) { return a + l[5]; }, 0);
    var you = LINES.filter(function (l) { return l[4] === "you"; }).reduce(function (a, l) { return a + l[5]; }, 0);
    n.classList.add.apply(n.classList, ("split split--top").split(" ").filter(Boolean));
    n.innerHTML =
      '<div class="card est rv">' +
        (filter ? '<div class="toggle-row"><div class="seg" role="group" aria-label="Show lines"><button type="button" aria-pressed="true" data-f="all">All lines</button><button type="button" aria-pressed="false" data-f="ins">Insurance</button><button type="button" aria-pressed="false" data-f="you">Your upgrades</button></div></div>' : "") +
        '<div class="est-x"><table><caption class="sr">Sample rebuild estimate</caption><thead><tr><th>Line</th><th class="r">Qty</th><th>Paid by</th><th class="r">Amount</th></tr></thead><tbody data-rows>' + rows("all") + "</tbody></table></div>" +
        '<p class="caption mt-s">Sample figures for illustration</p></div>' +
      '<div class="stack rv" data-d=".1" style="--g:16px"><div class="totals"><div><span>Insurance scope</span><b>' + money(ins) + "</b></div><div><span>Your upgrades</span><b>" + money(you) +
        '</b></div><div><span>Your deductible</span><b>Per policy</b></div><div class="grand"><span>You pay us</span><b>' + money(you) + " + deductible</b></div></div>" +
        '<p class="body-sm muted"><b style="color:var(--ink);font-weight:600">Supplements.</b> Found something behind a wall that wasn\'t in the original estimate? We photograph it, measure it and send a supplement to your adjuster before that work is billed.</p></div>';
    if (filter) {
      var tb = $("[data-rows]", n);
      $$(".seg button", n).forEach(function (b) {
        b.addEventListener("click", function () {
          $$(".seg button", n).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          tb.innerHTML = rows(b.getAttribute("data-f")); FW.sfx.tick();
        });
      });
    }
  };

  /* project cards: hover shows the after photo; tilt reveals the blueprint grid */
  B.projects = function (n) {
    var lim = +(n.getAttribute("data-limit") || 99);
    n.classList.add.apply(n.classList, ("proj-grid").split(" ").filter(Boolean));
    n.innerHTML = FW.PROJECTS.slice(0, lim).map(function (p, i) {
      return '<a class="proj rv' + (p.wide && lim > 2 ? " proj--wide" : "") + '" data-d="' + (i % 2 * .08).toFixed(2) + '" data-loss="' + esc(p.loss.toLowerCase()) + '" href="projects.html#' + p.id + '" data-cursor="VIEW PROJECT">' +
        '<div class="proj__in"><div class="proj__bp" data-dim="' + p.sf + ' SF · ' + p.weeks + ' WK"></div>' +
        '<div class="proj__img"><img src="' + p.before + '" alt="' + esc(p.title) + ' before the rebuild" loading="lazy" decoding="async"><img class="after" src="' + p.after + '" alt="' + esc(p.title) + ' after the rebuild" loading="lazy" decoding="async">' +
        '<span class="tag tag--tl">Sample project</span><span class="tag tag--br"><i></i>Hover for after</span></div></div>' +
        '<div class="proj__meta"><h3 class="h2">' + esc(p.title) + '</h3><span class="mono">' + p.id + "</span><p>" + esc(p.text) + '</p><div class="proj__facts"><span class="chip">' + esc(p.city) + '</span><span class="chip">' + esc(p.loss) + '</span><span class="chip">' + p.weeks + " weeks</span></div></div></a>";
    }).join("");
  };

  /* service area: rings from the Livermore shop */
  B.ring = function (n) {
    var max = 30, cx = 260, cy = 260, R = 230;
    /* approximate compass bearings from the Livermore shop (0 = east, 90 = north), spread slightly so labels don't collide */
    var ang = { livermore: 0, pleasanton: 196, dublin: 158, "san-ramon": 138, fremont: 214, hayward: 190, "castro-valley": 172, danville: 118, "union-city": 202, tracy: 6, milpitas: 236, brentwood: 66 };
    var pts = FW.ZONES.map(function (z) {
      var a = (ang[z.slug] || 0) * Math.PI / 180, r = z.mi / max * R, x = cx + Math.cos(a) * r, y = cy - Math.sin(a) * r;
      if (z.slug === "livermore") return '<a href="area.html#livermore" aria-label="Livermore, home shop"><circle class="shop" cx="' + cx + '" cy="' + cy + '" r="7"/><text x="' + (cx + 12) + '" y="' + (cy + 4) + '">Livermore shop</text></a>';
      var tx = x + (Math.cos(a) >= 0 ? 9 : -9), anchor = Math.cos(a) >= 0 ? "start" : "end";
      return '<a href="area.html#' + z.slug + '" aria-label="' + esc(z.name) + ", " + z.mi + ' miles"><circle class="pt" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4"/><text x="' + tx.toFixed(1) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="' + anchor + '">' + esc(z.name.split(" and ")[0].split(",")[0]) + "</text></a>";
    }).join("");
    var rings = [10, 20, 30].map(function (m) { var r = m / max * R; return '<circle class="rg" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/><text x="' + (cx + 4) + '" y="' + (cy - r - 5) + '">' + m + " MI</text>"; }).join("");
    n.classList.add.apply(n.classList, ("ring rv").split(" ").filter(Boolean));
    n.innerHTML = '<svg viewBox="0 0 520 520" role="img" aria-label="Launch service area rings around the Livermore shop"><line class="ax" x1="20" y1="260" x2="500" y2="260"/><line class="ax" x1="260" y1="20" x2="260" y2="500"/>' + rings + pts + "</svg>";
  };

  B.zones = function (n) {
    var lim = +(n.getAttribute("data-limit") || 99), next = n.hasAttribute("data-next");
    n.classList.add.apply(n.classList, ("zones").split(" ").filter(Boolean));
    var html = FW.ZONES.slice(0, lim).map(function (z, i) {
      return '<a class="rv" data-d="' + (i % 4 * .05).toFixed(2) + '" href="area.html#' + z.slug + '" data-cursor="OPEN"><span class="mono">' + (z.mi ? z.mi.toFixed(1) + " MI" : "HOME SHOP") + " · " + esc(z.county) + '</span><span class="z">' + esc(z.name) + S.arrow + "</span><small>" + esc(z.hoods.split(", ").slice(0, 3).join(", ")) + "</small></a>";
    }).join("");
    if (next) html += FW.NEXT_ZONES.map(function (z) { return '<div class="soon zones-soon" style="display:grid;gap:6px;padding:20px 18px 20px 0;border-bottom:1px solid var(--hairline)"><span class="mono" style="color:var(--dim)">' + z.mi.toFixed(1) + " MI · Month " + z.m + '</span><span class="z" style="font-family:var(--f-display);font-size:1.25rem;font-weight:500">' + esc(z.name) + '</span><small class="caption">Opening in the expansion plan</small></div>'; }).join("");
    n.innerHTML = html;
  };

  /* FAQ from a JSON list in the element */
  B.faq = function (n) {
    var items = JSON.parse(n.getAttribute("data-items") || "[]");
    n.classList.add.apply(n.classList, ("faq").split(" ").filter(Boolean));
    n.innerHTML = items.map(function (f) { return '<details class="rv"><summary>' + esc(f[0]) + "<i>" + S.plus + '</i></summary><div class="a"><p>' + esc(f[1]) + "</p></div></details>"; }).join("");
    $$("summary", n).forEach(function (s) { s.addEventListener("click", function () { FW.sfx.tick(); }); });
  };

  B.marquee = function (n) {
    var a = ["<b>Built to</b> the approved insurance scope", "<b>Permits</b> pulled, posted and inspected", "<b>Same file</b> from mitigation to keys", "<b>Claim work</b> and upgrades kept apart", "<b>Matched</b> texture, trim and sheen", "<b>Punch list</b>, then keys", "<b>Licensed</b> electrical, plumbing and HVAC"];
    var b = FW.ZONES.map(function (z) { return "<b>" + esc(z.name) + "</b> " + (z.mi ? z.mi.toFixed(1) + " mi" : "home shop"); });
    function row(list, rev, t) { var s = list.map(function (x) { return "<span>" + x + "</span>"; }).join(""); return '<div class="mq__row' + (rev ? " mq__row--rev" : "") + '" style="--t:' + t + 's">' + s + s + "</div>"; }
    n.classList.add.apply(n.classList, ("mq").split(" ").filter(Boolean)); n.setAttribute("aria-hidden", "true");
    n.innerHTML = row(a, false, 70) + row(b, true, 80);
  };

  FW.renderBlocks = function () { $$("[data-block]").forEach(function (n) { var f = B[n.getAttribute("data-block")]; if (f) f(n); }); };
})();
