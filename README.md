# Havok Restoration of Central PA — website

Modern, local-SEO-focused static site for Havok Restoration of Central PA (Johnstown, PA).
Built with [Astro 5](https://astro.build). No CMS required: services, service areas and
testimonials live in one data file, and blog posts are Markdown files.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serve dist/ locally
```

## Staging environment (GitHub Pages)

Every push to `main` runs `.github/workflows/deploy-staging.yml`, which builds the site in staging
mode and publishes it to the `gh-pages` branch. GitHub Pages serves it at:

**https://juicyninja.github.io/havok-restoration/**

Staging differs from production in three ways, all handled by `scripts/build-staging.mjs`:

- It runs under the `/havok-restoration/` subfolder, so root-absolute links are prefixed after the build.
- Every page carries `noindex, nofollow` and `robots.txt` disallows everything, so Google never indexes it.
- A small "Staging preview" banner shows at the top of each page.

Canonical URLs still point at `centralpa.havokrestoration.com`, so nothing needs changing at launch.
To build staging locally: `npm run build:staging`.

### Going live later

1. Point a production host (Netlify, Vercel, Cloudflare Pages, or GitHub Pages with a custom domain) at this repo with build command `npm run build` and publish directory `dist`. That is the normal build with no staging flags.
2. Switch DNS for `centralpa.havokrestoration.com` to the new host.
3. Keep or delete the staging workflow. It does not affect production.

## Where things live

| What | Where |
|---|---|
| Business name, phone, email, address, hours, form endpoint | `src/data/site.ts` (top `site` object) |
| Services (copy, FAQs, process steps, meta tags) | `src/data/site.ts` → `services` |
| Before/after image pairs | `src/data/site.ts` → `pairs` and `public/images/before-after/` |
| Service-area towns (local copy, neighborhoods, coordinates) | `src/data/site.ts` → `areas` |
| Testimonials and insurer list | `src/data/site.ts` |
| Blog posts | `src/content/blog/*.md` |
| Blog images | `public/images/blog/` |
| Global styles / design tokens | `src/styles/global.css` |
| JSON-LD schema builders | `src/lib/schema.ts` |
| Page layout, SEO head tags | `src/layouts/Base.astro` |

## Adding a blog post

Create `src/content/blog/my-post-slug.md`:

```md
---
title: "Post title"
description: "Meta description, 170 characters max."
pubDate: 2026-10-01
category: "Water Damage"   # one of: Water Damage, Fire Damage, Storm & Weather, Insurance Claims, Biohazard & Cleanup, Mold, Homeowner Tips
tags: ["johnstown", "water damage"]
heroImage: "/images/blog/my-image.jpg"
heroAlt: "Describe the image"
faq:                        # optional; renders an FAQ section + FAQPage schema
  - q: "Question?"
    a: "Answer."
---

Post body in Markdown. `## Headings` become the in-article table of contents.
```

The post appears on `/blog/`, its category page, the RSS feed, the sitemap and the home page automatically.

## Before you launch (TODO)

1. **Street address.** `site.address.street` is blank. Add it so the footer, contact page and LocalBusiness schema show the full NAP. It should match the Google Business Profile exactly.
2. **Contact form.** `site.formEndpoint` is blank, so the form currently opens a pre-filled email. Set it to a Formspree / Basin / Netlify Forms / CRM webhook URL and the form will POST there instead.
3. **Social links.** Update `site.social` with the real Facebook and Google Business Profile URLs.
4. **Testimonials.** The four reviews in `site.ts` are placeholders based on the old site. Replace with real Google reviews (with permission) and consider adding `AggregateRating` to the schema once you have a real count.
5. **Photos.** The before/after pairs and hero images are AI-generated stand-ins created with Runware so the site launches looking complete. Swap in real job photos as you collect them: keep the same filenames in `public/images/before-after/` (16:9 works best) and nothing else needs to change.
6. **Certifications.** Confirm the IICRC certification list on `/about/` and the PA HIC number wording match what the business actually holds.
7. **Deploy.** Output is fully static. Netlify, Vercel, Cloudflare Pages or any host that serves `dist/` works. Set the build command to `npm run build` and publish directory to `dist`.
8. **Google Search Console.** Submit `https://centralpa.havokrestoration.com/sitemap-index.xml`.

## SEO features included

- Unique title/meta description per page, canonical URLs, Open Graph and Twitter cards
- JSON-LD: LocalBusiness (with GeoCircle service area and offer catalog), Service, FAQPage, BreadcrumbList, BlogPosting
- Dedicated landing page for each of 9 services and 9 service-area towns with local copy
- XML sitemap, RSS feed, robots.txt, geo meta tags
- Semantic headings, alt text on every image, lazy loading below the fold
- Mobile sticky call bar, click-to-call everywhere

## Before/after scroll effect

`src/components/Showcase.astro` is the home-page sticky scrollytelling section (the image pins while
six damage types scroll past, each wiping from "before" to "after"). `src/components/BeforeAfter.astro`
is the standalone version used on service and area pages: it wipes as it scrolls into view and can be
dragged to compare. Both respect `prefers-reduced-motion`.
