/**
 * Staging build for GitHub Pages.
 *
 * GitHub Pages serves a project site from a subfolder (/havok-restoration/), but the site is
 * written with root-absolute links (/services/, /images/...) because production lives at the
 * domain root. This script:
 *   1. runs `astro build` with BASE_PATH and PUBLIC_STAGING set,
 *   2. prefixes every root-absolute href/src/action in the built HTML with the base path,
 *   3. replaces robots.txt with a disallow-all so the staging copy is never indexed.
 *
 * Production builds (`npm run build`) are untouched by any of this.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE = (process.env.BASE_PATH || '/havok-restoration').replace(/\/$/, '');
const DIST = 'dist';

// Call the Astro CLI entry directly with the current Node binary (npx + shell hangs on Windows).
const build = spawnSync(process.execPath, ['node_modules/astro/astro.js', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, BASE_PATH: BASE, PUBLIC_STAGING: 'true' },
});
if (build.status !== 0) process.exit(build.status ?? 1);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const baseNoSlash = BASE.slice(1); // "havok-restoration"
// Matches href="/x", src="/x", action="/x", poster="/x" but not "//cdn", and not already-prefixed paths.
const attr = new RegExp(`(\\s(?:href|src|action|poster)=")/(?!/|${baseNoSlash}/)`, 'g');

let files = 0;
let rewrites = 0;
for (const file of walk(DIST)) {
  if (!file.endsWith('.html')) continue;
  const html = readFileSync(file, 'utf8');
  const out = html.replace(attr, (_, pre) => {
    rewrites++;
    return `${pre}${BASE}/`;
  });
  if (out !== html) {
    writeFileSync(file, out);
    files++;
  }
}

writeFileSync(join(DIST, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
writeFileSync(join(DIST, '.nojekyll'), '');

console.log(`\n[staging] base path ${BASE}: rewrote ${rewrites} links in ${files} HTML files; robots.txt set to disallow all.`);
