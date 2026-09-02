// Porównanie wizualne: prototyp (renderowany własnym runtime'em Claude Design)
// obok zbudowanej aplikacji. Zrzuty trafiają do dist-compare/, a skrypt podaje
// procent różniących się pikseli dla każdego ekranu.
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const app = resolve(fileURLToPath(import.meta.url), '../..');
const repo = resolve(app, '..');
const proto = join(repo, 'project');
const out = join(app, 'dist-compare');
await mkdir(out, { recursive: true });

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
};
const serve = async (root) => {
  const s = createServer(async (req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    const path = join(root, normalize(url === '/' ? '/index.html' : url));
    try {
      const buf = await readFile(path);
      res.writeHead(200, {
        'Content-Type': MIME[extname(path)] || 'application/octet-stream',
        // czcionki dla prototypu idą z innego portu — bez CORS przeglądarka je odrzuci
        'Access-Control-Allow-Origin': '*',
      });
      res.end(buf);
    } catch { res.writeHead(404).end('404'); }
  });
  await new Promise((r) => s.listen(0, r));
  return { s, base: 'http://127.0.0.1:' + s.address().port + '/' };
};

const A = await serve(join(app, 'dist'));
const B = await serve(proto);

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

// prosty licznik różnic — bez zależności, na surowych pikselach PNG przez canvas
async function diff(pageForCanvas, aBuf, bBuf) {
  return pageForCanvas.evaluate(async ([a, b]) => {
    const load = (d) => new Promise((res) => {
      const i = new Image();
      i.onload = () => res(i);
      i.src = 'data:image/png;base64,' + d;
    });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, w, h).data;
    x.clearRect(0, 0, w, h);
    x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, w, h).data;
    let n = 0;
    for (let i = 0; i < da.length; i += 4) {
      if (Math.abs(da[i] - db[i]) > 12 || Math.abs(da[i + 1] - db[i + 1]) > 12 || Math.abs(da[i + 2] - db[i + 2]) > 12) n++;
    }
    return { pct: +(100 * n / (w * h)).toFixed(2), w, h, sizeA: [ia.width, ia.height], sizeB: [ib.width, ib.height] };
  }, [aBuf.toString('base64'), bBuf.toString('base64')]);
}

// wybór mocy 0,55 kW — w obu wersjach kafelek zaczyna się od tej liczby
const pickPower = async (p) => {
  const b = p.locator('button').filter({ hasText: /^\s*0,55\s*kW/ }).first();
  await b.waitFor({ state: 'visible', timeout: 20000 });
  await b.click();
};

const SCREENS = [
  { name: 'start', steps: async () => {} },
  { name: 'moc', steps: async (p) => { await p.getByRole('button', { name: /Moc silnika/ }).first().click(); } },
  { name: 'przelozenie', steps: async (p) => { await p.getByRole('button', { name: /Przełożenie/ }).first().click(); } },
  { name: 'zamiennik', steps: async (p) => { await p.getByRole('button', { name: /Zamiennik/ }).first().click(); } },
  { name: 'moment', steps: async (p) => { await p.getByRole('button', { name: /Moment obrotowy na wale wyjściowym/ }).first().click(); } },
  { name: 'srednica', steps: async (p) => { await p.getByRole('button', { name: /Średnica wału/ }).first().click(); } },
  { name: 'kartaA', steps: async (p) => { await p.getByRole('button', { name: /Moc silnika/ }).first().click(); await pickPower(p); } },
  { name: 'kartaB', steps: async (p) => { await p.getByRole('button', { name: /Moc silnika/ }).first().click(); await pickPower(p); await p.getByRole('button', { name: /Dalej · warunki pracy/ }).click(); } },
  { name: 'wyniki', steps: async (p) => { await p.getByRole('button', { name: /Moc silnika/ }).first().click(); await pickPower(p); await p.getByRole('button', { name: /Dalej · warunki pracy/ }).click(); await p.getByRole('button', { name: /Pokaż wyniki/ }).click(); } },
  { name: 'karta-zestawu', steps: async (p) => { await p.getByRole('button', { name: /Moc silnika/ }).first().click(); await pickPower(p); await p.getByRole('button', { name: /Dalej · warunki pracy/ }).click(); await p.getByRole('button', { name: /Pokaż wyniki/ }).click(); await p.locator('button', { hasText: /Motoreduktor 3F/ }).first().click(); } },
  // Teksty prawne poprawione 02.09.2026 (zgodność z RODO — GA4 i Formspree),
  // więc różnica wobec prototypu na tych dwóch ekranach jest zamierzona.
  { name: 'regulamin', zmienione: true, steps: async (p) => { await p.getByRole('button', { name: 'Regulamin', exact: true }).first().click(); } },
  { name: 'rodo', zmienione: true, steps: async (p) => { await p.getByRole('button', { name: /Informacje prawne/ }).first().click(); } },
];

const WIDTHS = [520, 1280];
const helper = await (await browser.newContext()).newPage();
const rows = [];

for (const width of WIDTHS) {
  for (const sc of SCREENS) {
    const shots = [];
    for (const [label, srv] of [['nowa', A], ['prototyp', B]]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      // Prototyp ciągnie Barlow z Google Fonts, a przeglądarka w tym środowisku
      // nie ma tam dostępu i podstawiłaby inny krój — wtedy porównanie mierzyłoby
      // różnicę czcionek, nie układu. Podajemy mu te same pliki lokalne.
      await ctx.route(/fonts\.googleapis\.com/, async (route) => {
        const css = (await readFile(join(app, 'dist', 'fonts', 'fonts.css'), 'utf8'))
          .split('url(./').join('url(' + A.base + 'fonts/');
        await route.fulfill({ status: 200, contentType: 'text/css', body: css });
      });
      const page = await ctx.newPage();
      await page.addInitScript(() => {
        try { localStorage.setItem('dkm-analytics-consent', 'no'); } catch (e) {}
      });
      const url = srv === B ? srv.base + encodeURIComponent('DKM Dobór - telefon v3.dc.html') : srv.base;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForSelector('text=Znajdźmy napęd idealny', { timeout: 20000 });
      await sc.steps(page);
      await page.waitForTimeout(350);
      await page.evaluate(() => window.scrollTo(0, 0));
      const buf = await page.screenshot({ fullPage: true });
      const { writeFile } = await import('node:fs/promises');
      await writeFile(join(out, `${width}-${sc.name}-${label}.png`), buf);
      shots.push(buf);
      await ctx.close();
    }
    const d = await diff(helper, shots[0], shots[1]);
    rows.push({ width, name: sc.name, zmienione: !!sc.zmienione, ...d });
    const odbiega = d.pct > 1 || Math.abs(d.sizeA[1] - d.sizeB[1]) > 4;
    const flag = sc.zmienione ? '  (zmienione celowo)' : (odbiega ? ' ‹—' : '');
    console.log(`${String(width).padStart(4)}px ${sc.name.padEnd(14)} różnica ${String(d.pct).padStart(5)}%  wysokość ${d.sizeA[1]} / ${d.sizeB[1]}${flag}`);
  }
}

await browser.close();
A.s.close(); B.s.close();
const worst = rows.filter((r) => !r.zmienione && (r.pct > 1 || Math.abs(r.sizeA[1] - r.sizeB[1]) > 4));
const zmienione = [...new Set(rows.filter((r) => r.zmienione).map((r) => r.name))];
console.log('\nZrzuty w ' + out);
if (zmienione.length) {
  console.log('Celowo różne od prototypu: ' + zmienione.join(', ')
    + ' — teksty prawne poprawione 02.09.2026 (RODO: GA4 i Formspree).');
}
console.log(worst.length
  ? worst.length + ' ekranów do obejrzenia'
  : 'Wszystkie pozostałe ekrany zgodne poniżej 1% pikseli');
process.exit(worst.length ? 1 : 0);
