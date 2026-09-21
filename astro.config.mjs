import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// BASE_PATH is only set by the staging build (scripts/build-staging.mjs) so the site can run
// from a subfolder on GitHub Pages. Production builds serve from the domain root.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: 'https://centralpa.havokrestoration.com',
  base,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  build: { inlineStylesheets: 'auto' },
});
