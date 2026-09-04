// Generuje service workera dla wersji wystawionej na serwerze (podstrona + PWA).
// Lista plików do pobrania z góry powstaje ze zbudowanego dist/, a wersja cache'u
// z sumy kontrolnej tej listy — po każdym wdrożeniu stary cache jest sprzątany.
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = resolve(fileURLToPath(import.meta.url), '../../dist');
const zrodla = resolve(fileURLToPath(import.meta.url), '../../src');
// adres, pod którym aplikacja stoi naprawdę — stąd adres kanoniczny, mapa strony
// i adresy obrazków w podglądzie linku; wersja offline i podstrona go nie dostają
const ADRES = process.env.DKM_ADRES || 'https://dobor.dkmpower.pl/';

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    if ((await stat(p)).isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

// Nota o prawach autorskich w zbudowanych plikach. Nie zatrzyma nikogo technicznie,
// ale usuwa wymówkę „nie wiedziałem, że to cudze" — a to ma znaczenie w sporze.
const stamp = new Date().toISOString().slice(0, 10);
const banner = (buildId) => `/*! DKM \u00b7 Dob\u00f3r przek\u0142adni \u015blimakowych \u2014 \u00a9 2026 DKM Power Transmission Sp. z o.o.
 * Wszelkie prawa zastrze\u017cone. Kod aplikacji, baza katalogu i cennika oraz spos\u00f3b doboru
 * stanowi\u0105 w\u0142asno\u015b\u0107 DKM Power Transmission Sp. z o.o. Kopiowanie, modyfikowanie,
 * rozpowszechnianie i wykorzystywanie w innych systemach bez pisemnej zgody w\u0142a\u015bciciela
 * jest zabronione. Proprietary and confidential \u2014 unauthorized copying or use is prohibited.
 * Wydanie: ${buildId} \u00b7 ${stamp} \u00b7 sklep@d-k-m.eu
 */
`;

for (const dir of ['build']) {
  for (const name of await readdir(join(dist, dir))) {
    if (!/\.(js|css)$/.test(name)) continue;
    const p = join(dist, dir, name);
    const body = await readFile(p, 'utf8');
    if (body.startsWith('/*! DKM')) continue;
    await writeFile(p, banner(name.replace(/\.[^.]+$/, '')) + body);
  }
}

const files = (await walk(dist))
  .map((p) => './' + relative(dist, p).split('\\').join('/'))
  // sw.js sam siebie nie cache'uje; obrazek podglądu linku, robots i mapa strony
  // są dla wyszukiwarek i komunikatorów, aplikacji offline do niczego nie służą
  .filter((p) => !['./sw.js', './obrazek-linku.png', './robots.txt', './sitemap.xml',
                   './CNAME'].includes(p))
  .sort();

const hash = createHash('sha1');
for (const f of files) hash.update(f).update(await readFile(join(dist, f.slice(2))));
const version = hash.digest('hex').slice(0, 12);

// Podział na to, co musi być od razu, i to, co dociąga się w tle.
// Pierwsze wejście na telefonie w terenie ma nie ciągnąć 7 MB skanów kart
// katalogowych — te są potrzebne dopiero na karcie zestawu.
const isShell = (f) =>
  f === './index.html' || f === './manifest.webmanifest' ||
  f.startsWith('./build/') || f.startsWith('./fonts/') ||
  /assets\/(tile-|app-icon-|dkm-logo)/.test(f);
const shell = files.filter(isShell);
const rest = files.filter((f) => !isShell(f));

const sw = `// Service worker aplikacji DKM Dobór — generowany przez scripts/postbuild.mjs.
//
// SHELL pobiera się przy instalacji (aplikacja od razu działa offline w zakresie
// doboru), RESZTA — rysunki wymiarowe i karty katalogowe — dociąga się w tle po
// aktywacji. Dzięki temu pierwsze wejście na telefonie nie kosztuje kilku megabajtów,
// a po chwili komplet i tak leży w pamięci urządzenia.
const CACHE = 'dkm-dobor-${version}';
const SHELL = ${JSON.stringify(shell, null, 2)};
const RESZTA = ${JSON.stringify(rest, null, 2)};

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => caches.open(CACHE))
      // pojedynczo i bez pośpiechu — brak sieci w trakcie nie może wywrócić aktywacji
      .then((c) => RESZTA.reduce(
        (p, url) => p.then(() => c.match(url).then((hit) => hit ? null : c.add(url).catch(() => null))),
        Promise.resolve()))
      .catch(() => null)
  );
});

// otwarcie aplikacji: najpierw pytamy serwer, z pamięci korzystamy dopiero,
// gdy sieci nie ma albo za długo nie odpowiada. Cennik zmienia się codziennie,
// więc zainstalowana aplikacja nie może pokazywać cen sprzed tygodnia tylko
// dlatego, że nikt jej nie zamknął. Reszta plików ma nazwy ze skrótem treści
// — nowa wersja to nowa nazwa — więc te bierzemy z pamięci od razu.
const CZEKAM_NA_SIEC = 3000;

function zPamieci(req) {
  return caches.match(req, { ignoreSearch: true })
    .then((hit) => hit || caches.match('./index.html'));
}

function swiezaStrona(req) {
  const zapas = new Promise((ok) => setTimeout(() => ok(null), CZEKAM_NA_SIEC));
  const siec = fetch(req).then((res) => {
    if (res && res.ok && res.type === 'basic') {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put('./index.html', copy));
    }
    return res;
  }).catch(() => null);
  return Promise.race([siec, zapas]).then((res) => res || siec.catch(() => null))
    .then((res) => res || zPamieci(req));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // wysyłka formularza i cokolwiek spoza tego adresu idzie prosto do sieci
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') { e.respondWith(swiezaStrona(req)); return; }
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
        .catch(() => Promise.reject());
    })
  );
});
`;

await writeFile(join(dist, 'sw.js'), sw);

// --- co widzi wyszukiwarka i komunikator -----------------------------------
// Data w mapie strony to data raportu magazynowego, a nie dzień budowania:
// mówi wyszukiwarce, kiedy naprawdę zmieniła się treść, a ta zmienia się
// codziennie razem z cennikiem.
const cennik = await readFile(join(zrodla, 'data/price-data.js'), 'utf8');
const dm = cennik.match(/updated:\s*'stan na (\d{2})\.(\d{2})\.(\d{4})'/);
const dataTresci = dm ? `${dm[3]}-${dm[2]}-${dm[1]}` : stamp;

await writeFile(join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${ADRES}</loc>
    <lastmod>${dataTresci}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`);

const TYTUL = 'DKM · Dobór przekładni ślimakowych';
const OPIS = 'Dobierz przekładnię ślimakową, silnik i falownik na podstawie warunków '
  + 'pracy maszyny — z cenami netto i dostępnością magazynową. Korpusy DKM025–DKM150, '
  + 'moce 0,06–15 kW.';

const dane = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: TYTUL,
  url: ADRES,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  inLanguage: 'pl-PL',
  description: OPIS,
  image: ADRES + 'obrazek-linku.png',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'PLN' },
  publisher: {
    '@type': 'Organization',
    name: 'DKM Power Transmission Sp. z o.o.',
    url: 'https://www.dkmpower.pl/',
    email: 'sklep@d-k-m.eu',
    telephone: '+48512082994',
  },
};

const glowa = [
  `<link rel="canonical" href="${ADRES}">`,
  `<meta property="og:type" content="website">`,
  `<meta property="og:site_name" content="DKM Power Transmission">`,
  `<meta property="og:locale" content="pl_PL">`,
  `<meta property="og:title" content="${TYTUL}">`,
  `<meta property="og:description" content="${OPIS}">`,
  `<meta property="og:url" content="${ADRES}">`,
  `<meta property="og:image" content="${ADRES}obrazek-linku.png">`,
  `<meta property="og:image:width" content="1200">`,
  `<meta property="og:image:height" content="630">`,
  `<meta property="og:image:alt" content="Dobór przekładni ślimakowych DKM">`,
  `<meta name="twitter:card" content="summary_large_image">`,
  `<script type="application/ld+json">${JSON.stringify(dane)}</script>`,
].join('\n');

const strona = await readFile(join(dist, 'index.html'), 'utf8');
await writeFile(join(dist, 'index.html'), strona.replace('</head>', glowa + '\n</head>'));
console.log('sitemap.xml — treść z ' + dataTresci + ' · index.html — kanoniczny, Open Graph, JSON-LD');
console.log('sw.js — ' + shell.length + ' plików od razu, ' + rest.length + ' w tle, wersja ' + version);
