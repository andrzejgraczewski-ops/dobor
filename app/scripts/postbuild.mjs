// Generuje service workera dla wersji wystawionej na serwerze (podstrona + PWA).
// Lista plików do pobrania z góry powstaje ze zbudowanego dist/, a wersja cache'u
// z sumy kontrolnej tej listy — po każdym wdrożeniu stary cache jest sprzątany.
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = resolve(fileURLToPath(import.meta.url), '../../dist');

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    if ((await stat(p)).isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const files = (await walk(dist))
  .map((p) => './' + relative(dist, p).split('\\').join('/'))
  .filter((p) => p !== './sw.js')
  .sort();

const hash = createHash('sha1');
for (const f of files) hash.update(f).update(await readFile(join(dist, f.slice(2))));
const version = hash.digest('hex').slice(0, 12);

const sw = `// Service worker aplikacji DKM Dobór — generowany przez scripts/postbuild.mjs.
// Wszystko, czego aplikacja potrzebuje (katalog, cennik, rysunki, czcionki),
// leży w cache'u, więc po pierwszym wejściu działa bez internetu.
const CACHE = 'dkm-dobor-${version}';
const FILES = ${JSON.stringify(files, null, 2)};

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // wysyłka formularza i cokolwiek spoza tego adresu idzie prosto do sieci
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => (req.mode === 'navigate' ? caches.match('./index.html') : Promise.reject()));
    })
  );
});
`;

await writeFile(join(dist, 'sw.js'), sw);
console.log('sw.js — ' + files.length + ' plików w cache, wersja ' + version);
