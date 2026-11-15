# Havok Restoration demo site

Static client-demo build served at https://demo-site.havokrestoration.com (Vercel project `havok-demo`, branch `demo-site`).

- `index.html` is the whole site (hash-routed single page).
- `media/` holds illustrative stills and loops generated with Runware. Replace with real job photos before launch.
- Not indexed: `noindex` meta tag plus `X-Robots-Tag` header in `vercel.json`.

This branch is separate from `main` (the Astro build) and does not trigger the staging workflow.
