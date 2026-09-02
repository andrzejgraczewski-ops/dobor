// Pobiera Barlow i Barlow Condensed z Google Fonts i zapisuje je lokalnie.
// Aplikacja musi działać bez internetu (plik offline, PWA), więc czcionek nie
// wolno ładować z CDN-u. Zestaw krojów i grubości jest dokładnie taki sam jak
// w prototypie: Barlow 400/500/700 + Barlow Condensed 400/600, latin i latin-ext
// (polskie znaki diakrytyczne siedzą w latin-ext).
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../public/fonts');
const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;700&family=Barlow+Condensed:wght@400;600&display=swap';
// nowoczesny UA — bez niego Google odsyła TTF zamiast woff2
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const get = async (url, asText) => {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' — ' + url);
  return asText ? r.text() : Buffer.from(await r.arrayBuffer());
};

await mkdir(outDir, { recursive: true });
let css = await get(CSS_URL, true);

// Google odsyła komplet podzbiorów (cyrylica, greka, wietnamski…). Zostawiamy
// wyłącznie latin i latin-ext — reszta tylko powiększałaby plik offline.
const KEEP = ['latin', 'latin-ext'];
css = css
  .split(/(?=\/\*\s*[a-z-]+\s*\*\/)/)
  .filter((block) => {
    const m = /^\/\*\s*([a-z-]+)\s*\*\//.exec(block.trim());
    return !m || KEEP.includes(m[1]);
  })
  .join('');

const urls = [...new Set([...css.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)].map((m) => m[1]))];
let n = 0;
for (const url of urls) {
  const name = 'barlow-' + String(++n).padStart(2, '0') + '.woff2';
  await writeFile(resolve(outDir, name), await get(url, false));
  // ścieżka względem samego fonts.css, który leży obok plików woff2
  css = css.split(url).join('./' + name);
}

await writeFile(
  resolve(outDir, 'fonts.css'),
  '/* Wygenerowane przez scripts/fetch-fonts.mjs — Barlow + Barlow Condensed, hostowane lokalnie. */\n' + css
);
console.log('Zapisano ' + urls.length + ' plików woff2 + fonts.css w public/fonts/');
