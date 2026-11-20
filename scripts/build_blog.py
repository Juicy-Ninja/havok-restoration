#!/usr/bin/env python3
"""Havok blog builder.

Turns blog-src/posts/*.md (YAML front matter + Markdown) into static,
SEO-ready pages:

  blog.html              blog index (featured post, search, category filter)
  blog/<slug>.html       one page per post (TOC, FAQ, sources, related posts)
  blog/feed.xml          RSS 2.0 feed
  sitemap.xml            home + blog URLs

Images live in media/blog/: <name>.webp (1600w), <name>-800.webp and
<name>-og.jpg (1200x630) for heroes. Reference inline images in Markdown as
![alt](image-name "caption").

Usage:  python3 scripts/build_blog.py
Needs:  pip install markdown pyyaml
"""
import datetime as dt
import html
import json
import math
import pathlib
import re
import sys

import markdown
import yaml
import hashlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "blog-src" / "posts"
OUT_DIR = ROOT / "blog"
MEDIA = "media/blog"

def _ver():
    h = hashlib.sha1()
    for n in ("blog.css", "blog.js"):
        h.update((pathlib.Path(__file__).resolve().parent.parent / "blog" / n).read_bytes())
    return h.hexdigest()[:8]
VER = _ver()

# ---- site settings (change BASE_URL when this moves to havokrestoration.com) ----
BASE_URL = "https://demo-site.havokrestoration.com"
BRAND = "Havok Restoration"
AUTHOR = "Havok Restoration, Bay Area"
DISPATCH_PATH = "index.html#dispatch"       # opens home at the top with the dispatch sheet up
LOGO_NIGHT = "media/cpa/logo-night.svg"
LOGO_DAY = "media/cpa/logo-day.svg"
CATEGORIES = ["Water damage", "Insurance", "Mold", "Fire and smoke", "Storm"]

ARR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'
SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.6"/></svg>'
LINK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
SEARCH = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16 16l5 5" stroke="currentColor" stroke-width="1.6"/></svg>'

e = html.escape


# ------------------------------------------------------------------ loading
def load_posts():
    posts = []
    for f in sorted(SRC.glob("*.md")):
        raw = f.read_text(encoding="utf-8")
        m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
        if not m:
            sys.exit(f"{f.name}: missing front matter")
        meta = yaml.safe_load(m.group(1))
        meta["slug"] = f.stem
        meta["body_md"] = m.group(2).strip()
        for k in ("date", "updated"):
            if isinstance(meta.get(k), str):
                meta[k] = dt.date.fromisoformat(meta[k])
        meta.setdefault("updated", meta["date"])
        if meta["category"] not in CATEGORIES:
            sys.exit(f"{f.name}: unknown category {meta['category']!r}")
        words = len(re.findall(r"\w+", meta["body_md"]))
        meta["words"] = words
        meta.setdefault("read_minutes", max(3, math.ceil(words / 220)))
        check_seo(meta)
        posts.append(meta)
    posts.sort(key=lambda p: p["date"], reverse=True)
    return posts


def check_seo(p):
    """Warn (don't fail) when the basics drift out of range."""
    warn = []
    if len(p["seo_title"]) > 65:
        warn.append(f"seo_title is {len(p['seo_title'])} chars (aim for 50-60)")
    if not 120 <= len(p["description"]) <= 165:
        warn.append(f"description is {len(p['description'])} chars (aim for 140-160)")
    kw = p["keyword"].lower()
    first = p["body_md"][:600].lower()
    if not any(w in first for w in kw.split()[:2]):
        warn.append("keyword idea not in the opening paragraph")
    if p["words"] < 800:
        warn.append(f"only {p['words']} words")
    for w in warn:
        print(f"  ! {p['slug']}: {w}")


# ------------------------------------------------------------------ markdown
def render_body(md_text, rel_root):
    md = markdown.Markdown(extensions=["toc", "tables", "attr_list", "sane_lists"],
                           extension_configs={"toc": {"toc_depth": "2-2"}})
    out = md.convert(md_text.replace("{{dispatch}}", rel_root + DISPATCH_PATH))
    toc = [(t["id"], t["name"]) for t in md.toc_tokens]

    def fig(m):
        alt, src, cap = m.group(1), m.group(2), m.group(3) or ""
        if "/" not in src and "." not in src:
            src = f"{rel_root}{MEDIA}/{src}.webp"
        return (f'<figure class="b-fig"><div class="b-fig__img"><img src="{src}" alt="{alt}" width="1264" height="848" '
                f'loading="lazy" decoding="async"><span class="illus">Illustrative</span></div>'
                + (f"<figcaption>{cap}</figcaption>" if cap else "") + "</figure>")
    out = re.sub(r'<p><img alt="([^"]*)" src="([^"]+)"(?: title="([^"]*)")? ?/?></p>', fig, out)
    out = re.sub(r"<blockquote>\s*<p><strong>Havok note:</strong>",
                 '<aside class="b-note" role="note"><p class="b-note__k">Havok note</p><p>', out)
    out = out.replace("</blockquote>", "</aside>") if "b-note" in out else out
    out = out.replace("<table>", '<div class="b-tbl"><table>').replace("</table>", "</table></div>")
    out = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" rel="noopener" target="_blank"', out)
    return out, toc


# ------------------------------------------------------------------ chrome
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,500..900&family=JetBrains+Mono:wght@500;600&family=Sora:wght@300;400;600;700&display=swap" rel="stylesheet">')
THEME_BOOT = ("<script>(function(){try{var t=localStorage.getItem('havok-theme');t=t&&t.replace(/\"/g,'');"
              "if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()</script>")


def head(title, desc, canonical, rel, extra=""):
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{canonical}">
<link rel="alternate" type="application/rss+xml" title="{BRAND} blog" href="{BASE_URL}/blog/feed.xml">
<meta name="theme-color" content="#16212C">
{THEME_BOOT}
{FONTS}
<link rel="stylesheet" href="{rel}blog/blog.css?v={VER}">
{extra}
</head>"""


def chrome_top(rel, current="blog"):
    nav = [("Services", "index.html#services"), ("Insurance", "index.html#insurance-claims"),
           ("How it works", "index.html#how-it-works"), ("Blog", "blog.html"), ("About", "index.html#about")]
    links = "".join(f'<a href="{rel}{h}"{" aria-current=\"page\" class=\"cur\"" if t.lower() == current else ""}>{t}</a>' for t, h in nav)
    return f"""<a class="skip" href="#main">Skip to content</a>
<div class="b-progress" aria-hidden="true"><i data-progress></i></div>
<div class="ubar" role="region" aria-label="Emergency line"><div class="wrap">
  <div><b>Crews on call 24/7</b> &nbsp;·&nbsp; Dispatch <span class="tbc">[DISPATCH NUMBER]</span></div>
  <div class="ub-r"><span>Bay Area · Owner-run</span><div data-wx data-prep="{rel}blog/atmospheric-river-prep-checklist-east-bay.html" data-dispatch="{rel}{DISPATCH_PATH}"></div></div>
</div></div>
<header class="site"><div class="wrap">
  <a class="logo" href="{rel}index.html" aria-label="{BRAND} home"><img class="lg-night" src="{rel}{LOGO_NIGHT}" alt="{BRAND}" width="168" height="40"><img class="lg-day" src="{rel}{LOGO_DAY}" alt="{BRAND}" width="168" height="40"></a>
  <nav class="nav" aria-label="Primary">{links}</nav>
  <div class="tools">
    <button class="icon-btn" type="button" data-theme-toggle aria-label="Switch light or dark theme">{SUN}</button>
    <a class="btn btn-signal btn-sm" href="{rel}{DISPATCH_PATH}">Request dispatch</a>
  </div>
</div></header>"""


def chrome_bottom(rel):
    return f"""<section class="wrap b-close" aria-label="Request help">
  <div><p class="eyebrow"><span class="dot"></span>Dispatch open</p><h2 class="d-l">Water, fire, mold or storm.<br><span class="soft">A person answers.</span></h2>
  <p class="lead">One named project lead, readings and photos in your job tracker, and a written price before work starts.</p></div>
  <div class="b-close__acts"><a class="btn btn-signal btn-lg" href="{rel}{DISPATCH_PATH}">Request dispatch {ARR}</a><small>Insurance details can wait. We will ask on site.</small></div>
</section>
<footer class="foot"><div class="wrap">
  <div class="f-grid">
    <div><a class="logo" href="{rel}index.html" aria-label="{BRAND} home"><img class="lg-night" src="{rel}{LOGO_NIGHT}" alt="{BRAND}" width="168" height="40"><img class="lg-day" src="{rel}{LOGO_DAY}" alt="{BRAND}" width="168" height="40"></a>
      <p>Water, fire, mold and storm damage across the Bay Area. Owner-run, locally accountable.</p></div>
    <div><h5>Services</h5><ul><li><a href="{rel}index.html#water-damage-restoration">Water damage</a></li><li><a href="{rel}index.html#fire-damage-restoration">Fire and smoke</a></li><li><a href="{rel}index.html#mold-remediation">Mold remediation</a></li><li><a href="{rel}index.html#storm-damage-restoration">Storm damage</a></li></ul></div>
    <div><h5>Blog</h5><ul>{"".join(f'<li><a href="{rel}blog.html#cat-{slugify(c)}">{c}</a></li>' for c in CATEGORIES)}</ul></div>
    <div><h5>The family</h5><ul><li>Havok Restoration</li><li>Habio Specialty Cleaning &amp; Decon</li><li>Framewell Reconstruction</li></ul></div>
  </div>
  <div class="f-bot"><span>© {dt.date.today().year} {BRAND}. Images on this blog are illustrative.</span><a href="{rel}blog/feed.xml">RSS feed</a></div>
</div></footer>
<script src="{rel}blog/blog.js?v={VER}" defer></script>
<script src="{rel}media/wx/storm-watch.js" defer></script>
</body></html>"""


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def fmt(d):
    return d.strftime("%b %-d, %Y")


def img(name, rel, alt, sizes, eager=False):
    return (f'<img src="{rel}{MEDIA}/{name}.webp" srcset="{rel}{MEDIA}/{name}-800.webp 800w, {rel}{MEDIA}/{name}.webp 1600w" '
            f'sizes="{sizes}" alt="{e(alt)}" width="1600" height="893" '
            + ('fetchpriority="high" decoding="async"' if eager else 'loading="lazy" decoding="async"') + ">")


def card(p, rel, big=False):
    return f"""<article class="b-card{' b-card--big' if big else ''}" data-cat="{slugify(p['category'])}" data-text="{e((p['title'] + ' ' + p['description'] + ' ' + p['keyword']).lower())}">
  <a class="b-card__img" href="{rel}blog/{p['slug']}.html" tabindex="-1" aria-hidden="true">{img(p['hero'], rel, '', '(max-width: 760px) 100vw, ' + ('60vw' if big else '33vw'), eager=big)}</a>
  <div class="b-card__body">
    <p class="b-meta"><span class="b-cat">{e(p['category'])}</span><span>{p['read_minutes']} min read</span></p>
    <h3 class="{'d-m' if big else 'd-s'}"><a href="{rel}blog/{p['slug']}.html">{e(p['title'])}</a></h3>
    <p class="b-card__ex">{e(p['description'])}</p>
    <p class="b-card__foot"><time datetime="{p['date'].isoformat()}">{fmt(p['date'])}</time><span class="go" aria-hidden="true">{ARR}</span></p>
  </div>
</article>"""


# ------------------------------------------------------------------ pages
def build_post(p, posts):
    rel = "../"
    body, toc = render_body(p["body_md"], rel)
    url = f"{BASE_URL}/blog/{p['slug']}"
    og = f"{BASE_URL}/{MEDIA}/{p['hero']}-og.jpg"
    title = p["seo_title"] if len(p["seo_title"]) > 52 else f"{p['seo_title']} | Havok"
    related = [q for q in posts if q["slug"] != p["slug"] and q["category"] == p["category"]]
    related += [q for q in posts if q["slug"] != p["slug"] and q not in related]
    related = related[:3]

    ld = [
        {"@context": "https://schema.org", "@type": "BlogPosting", "headline": p["title"], "description": p["description"],
         "image": [og, f"{BASE_URL}/{MEDIA}/{p['hero']}.webp"], "datePublished": p["date"].isoformat(),
         "dateModified": p["updated"].isoformat(), "author": {"@type": "Organization", "name": AUTHOR, "url": BASE_URL},
         "publisher": {"@type": "Organization", "name": BRAND, "logo": {"@type": "ImageObject", "url": f"{BASE_URL}/{LOGO_DAY}"}},
         "mainEntityOfPage": {"@type": "WebPage", "@id": url}, "keywords": p["keyword"], "articleSection": p["category"],
         "wordCount": p["words"], "inLanguage": "en-US"},
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{BASE_URL}/blog"},
            {"@type": "ListItem", "position": 3, "name": p["title"], "item": url}]},
    ]
    if p.get("faq"):
        ld.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": f["q"], "acceptedAnswer": {"@type": "Answer", "text": f["a"]}} for f in p["faq"]]})

    extra = f"""<meta property="og:type" content="article">
<meta property="og:site_name" content="{BRAND}">
<meta property="og:title" content="{e(p['title'])}">
<meta property="og:description" content="{e(p['description'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{e(p['hero_alt'])}">
<meta property="article:published_time" content="{p['date'].isoformat()}">
<meta property="article:modified_time" content="{p['updated'].isoformat()}">
<meta property="article:section" content="{e(p['category'])}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" as="image" href="../{MEDIA}/{p['hero']}.webp" imagesrcset="../{MEDIA}/{p['hero']}-800.webp 800w, ../{MEDIA}/{p['hero']}.webp 1600w" imagesizes="100vw">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>"""

    toc_html = "".join(f'<li><a href="#{i}" data-toc="{i}">{e(n)}</a></li>' for i, n in toc)
    faq = "".join(f'<details{" open" if k == 0 else ""}><summary>{e(f["q"])}<i aria-hidden="true"></i></summary><div class="ans"><p>{e(f["a"])}</p></div></details>'
                  for k, f in enumerate(p.get("faq", [])))
    src = "".join(f'<li><a href="{e(s["url"])}" rel="noopener" target="_blank">{e(s["title"])}</a></li>' for s in p.get("sources", []))
    take = "".join(f"<li>{e(t)}</li>" for t in p.get("takeaways", []))
    rel_cards = "".join(card(q, rel) for q in related)
    updated = (f' · <span>Updated <time datetime="{p["updated"].isoformat()}">{fmt(p["updated"])}</time></span>'
               if p["updated"] != p["date"] else "")

    page = head(title, p["description"], url, rel, extra) + f"""
<body class="b-post">
{chrome_top(rel)}
<main id="main">
<article class="b-article" itemscope itemtype="https://schema.org/BlogPosting">
  <header class="wrap b-ahead">
    <nav class="b-crumbs" aria-label="Breadcrumb"><ol><li><a href="../index.html">Home</a></li><li><a href="../blog.html">Blog</a></li><li><a href="../blog.html#cat-{slugify(p['category'])}">{e(p['category'])}</a></li></ol></nav>
    <p class="eyebrow"><span class="b-cat">{e(p['category'])}</span><span class="dim">{p['read_minutes']} min read</span></p>
    <h1 class="d-l b-h1" itemprop="headline">{e(p['title'])}</h1>
    <p class="lead b-dek" itemprop="description">{e(p['description'])}</p>
    <p class="b-byline"><span class="b-av" aria-hidden="true">H</span><span><b itemprop="author">{AUTHOR}</b><br><span>Published <time datetime="{p['date'].isoformat()}" itemprop="datePublished">{fmt(p['date'])}</time>{updated}</span></span>
      <button class="btn btn-ghost btn-sm b-copy" type="button" data-copy="{url}">{LINK}<span>Copy link</span></button></p>
  </header>
  <figure class="wrap b-hero">
    <div class="frame b-hero__img">{img(p['hero'], rel, p['hero_alt'], '(max-width: 1320px) 100vw, 1320px', eager=True)}<span class="illus">Illustrative</span></div>
    <figcaption>{e(p['hero_caption'])}</figcaption>
  </figure>
  <div class="wrap b-layout">
    <aside class="b-toc" aria-label="On this page"><p class="eyebrow dim">On this page</p><ol>{toc_html}</ol>
      <a class="b-svc" href="../index.html{p['service_href']}"><span class="eyebrow dim">Service</span><b>{e(p['service_label'])}</b>{ARR}</a></aside>
    <div class="b-prose" itemprop="articleBody">
      <section class="b-take" aria-label="Key takeaways"><p class="eyebrow">In short</p><ul>{take}</ul></section>
      {body}
      <section class="b-faq faq" aria-labelledby="faq-h"><h2 id="faq-h">Frequently asked questions</h2>{faq}</section>
      <section class="b-src" aria-labelledby="src-h"><h2 id="src-h" class="eyebrow dim">Sources</h2><ol>{src}</ol>
        <p class="b-disc">This article is general information, not legal, insurance or medical advice. Images are illustrative.</p></section>
    </div>
  </div>
</article>
<section class="wrap b-related" aria-labelledby="rel-h"><div class="b-sec-h"><p class="eyebrow">Keep reading</p><h2 class="d-m" id="rel-h">Related guides</h2><a class="link" href="../blog.html">All posts</a></div>
  <div class="b-grid">{rel_cards}</div></section>
</main>
{chrome_bottom(rel)}"""
    (OUT_DIR / f"{p['slug']}.html").write_text(page, encoding="utf-8")


def build_index(posts):
    rel = ""
    url = f"{BASE_URL}/blog"
    feat, rest = posts[0], posts[1:]
    counts = {c: sum(1 for p in posts if p["category"] == c) for c in CATEGORIES}
    chips = ['<button type="button" class="chip on" data-filter="all" aria-pressed="true">All <span>' + str(len(posts)) + "</span></button>"]
    chips += [f'<button type="button" class="chip" data-filter="{slugify(c)}" aria-pressed="false">{e(c)} <span>{n}</span></button>'
              for c, n in counts.items() if n]
    ld = [{"@context": "https://schema.org", "@type": "Blog", "name": f"{BRAND} blog", "url": url,
           "description": "Straight answers on water, fire, mold and storm damage and insurance claims for Bay Area homeowners.",
           "publisher": {"@type": "Organization", "name": BRAND},
           "blogPost": [{"@type": "BlogPosting", "headline": p["title"], "url": f"{BASE_URL}/blog/{p['slug']}",
                         "datePublished": p["date"].isoformat(), "image": f"{BASE_URL}/{MEDIA}/{p['hero']}-og.jpg"} for p in posts]},
          {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
              {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE_URL}/"},
              {"@type": "ListItem", "position": 2, "name": "Blog", "item": url}]}]
    extra = f"""<meta property="og:type" content="website"><meta property="og:title" content="{BRAND} blog">
<meta property="og:description" content="Straight answers on water, fire, mold and storm damage for Bay Area homeowners.">
<meta property="og:url" content="{url}"><meta property="og:image" content="{BASE_URL}/{MEDIA}/{feat['hero']}-og.jpg">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>"""
    page = head("Water, Fire, Mold & Storm Damage Guides | Havok Restoration Blog",
                "Straight answers for Bay Area homeowners: what to do after water damage, fire and storms, when to file an insurance claim, and how to handle mold.",
                url, rel, extra) + f"""
<body class="b-index">
{chrome_top(rel)}
<main id="main">
<section class="b-ihero bp"><div class="wrap">
  <nav class="b-crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li><li aria-current="page">Blog</li></ol></nav>
  <div class="b-ihero__grid">
    <div><p class="eyebrow"><span class="dot"></span>Havok field notes</p>
      <h1 class="d-xl">Straight answers<br><span class="soft">for the worst day at home.</span></h1></div>
    <p class="lead">Written by the crews who answer the 2 a.m. calls. What to do first, what it costs, what your insurer owes you, and when to call someone.</p>
  </div>
  <div class="b-tools" role="search">
    <label class="b-search">{SEARCH}<span class="sr">Search the blog</span><input type="search" placeholder="Search guides: mold, claim, storm..." data-search autocomplete="off"></label>
    <div class="chips" role="group" aria-label="Filter by topic">{''.join(chips)}</div>
  </div>
</div></section>
<section class="wrap b-list" aria-label="Posts">
  <div class="b-feat">{card(feat, rel, big=True)}</div>
  <div class="b-grid" data-grid>{''.join(card(p, rel) for p in rest)}</div>
  <p class="b-empty" data-empty hidden>No guides match that yet. Try another word, or <a class="link" href="{DISPATCH_PATH}">ask us directly</a>.</p>
</section>
<section class="wrap b-topics" aria-labelledby="top-h"><div class="b-sec-h"><p class="eyebrow">Browse by topic</p><h2 class="d-m" id="top-h">Start with what happened.</h2></div>
  <div class="b-topic-grid">{''.join(f'<a class="b-topic" href="#cat-{slugify(c)}" data-jump="{slugify(c)}"><span class="eyebrow dim">{n} {"guide" if n == 1 else "guides"}</span><b>{e(c)}</b>{ARR}</a>' for c, n in counts.items())}</div>
</section>
</main>
{chrome_bottom(rel)}"""
    (ROOT / "blog.html").write_text(page, encoding="utf-8")


def build_feed(posts):
    items = "".join(f"""<item><title>{e(p['title'])}</title><link>{BASE_URL}/blog/{p['slug']}</link><guid isPermaLink="true">{BASE_URL}/blog/{p['slug']}</guid>
<pubDate>{dt.datetime.combine(p['date'], dt.time(8)).strftime('%a, %d %b %Y %H:%M:%S -0800')}</pubDate><category>{e(p['category'])}</category><description>{e(p['description'])}</description></item>""" for p in posts)
    (OUT_DIR / "feed.xml").write_text(f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>{BRAND} blog</title><link>{BASE_URL}/blog</link>
<atom:link href="{BASE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
<description>Straight answers on water, fire, mold and storm damage for Bay Area homeowners.</description><language>en-us</language>{items}</channel></rss>
""", encoding="utf-8")


def build_sitemap(posts):
    urls = [(f"{BASE_URL}/", dt.date.today()), (f"{BASE_URL}/blog", posts[0]["updated"])]
    urls += [(f"{BASE_URL}/blog/{p['slug']}", p["updated"]) for p in posts]
    body = "".join(f"<url><loc>{u}</loc><lastmod>{d.isoformat()}</lastmod></url>" for u, d in urls)
    (ROOT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}</urlset>\n', encoding="utf-8")


def main():
    OUT_DIR.mkdir(exist_ok=True)
    posts = load_posts()
    for p in posts:
        build_post(p, posts)
    build_index(posts)
    build_feed(posts)
    build_sitemap(posts)
    print(f"built {len(posts)} posts -> blog.html, blog/*.html, blog/feed.xml, sitemap.xml")
    for p in posts:
        print(f"  {p['date']}  {p['words']:>5}w  {p['read_minutes']}m  {p['slug']}")


if __name__ == "__main__":
    main()
