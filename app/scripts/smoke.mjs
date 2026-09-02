// Testy dymne w Chromium na zbudowanej wersji z dist/.
// Sprawdzają przypadki kontrolne z CLAUDE.md: wyszukiwarkę zamienników,
// wymagane fs z wykresu i pełną ścieżkę doboru aż do koszyka.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(fileURLToPath(import.meta.url), '../../dist');
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const path = join(root, normalize(url === '/' ? '/index.html' : url));
  try {
    const buf = await readFile(path);
    res.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'application/octet-stream' });
    res.end(buf);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port + '/';

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log((ok ? '  OK   ' : '  BŁĄD ') + name + (detail ? ' — ' + detail : ''));
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const errors = [];

async function newPage(width = 520, height = 900) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  // baner zgody na analitykę zasłania dolny pasek — w testach odpowiadamy z góry
  await page.addInitScript(() => {
    try { localStorage.setItem('dkm-analytics-consent', 'no'); } catch (e) {}
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(base, { waitUntil: 'networkidle' });
  return { ctx, page };
}

// ——— wyszukiwarka zamienników ———
{
  const { ctx, page } = await newPage();
  await page.getByRole('button', { name: /Zamiennik/ }).first().click();
  const input = page.locator('input[placeholder*="NMRV063"]');

  const hits = async (q) => {
    await input.fill(q);
    await page.waitForTimeout(60);
    return page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')].filter((b) => /Odpowiednik DKM|Przekładnia DKM|Rozmiar DKM/.test(b.textContent || ''));
      return btns.map((b) => {
        const t = (b.textContent || '');
        const tag = /Odpowiednik DKM/.test(t) ? 'Odpowiednik DKM' : (/Rozmiar DKM/.test(t) ? 'Rozmiar DKM' : 'Przekładnia DKM');
        const box = (t.match(/DKM\d{3}/) || [''])[0];
        return { tag, box };
      });
    });
  };

  let h = await hits('vmr 3');
  check('„vmr 3" → DKM030 z etykietą zamiennika', h.length === 1 && h[0].box === 'DKM030' && h[0].tag === 'Odpowiednik DKM', JSON.stringify(h));

  h = await hits('cmi9');
  check('„cmi9" → DKM090 z etykietą zamiennika', h.length === 1 && h[0].box === 'DKM090' && h[0].tag === 'Odpowiednik DKM', JSON.stringify(h));

  h = await hits('wm');
  check('„wm" → dziesięć rozmiarów', h.length === 10, h.length + ' trafień');

  h = await hits('nmrv');
  check('„nmrv" → dziesięć rozmiarów', h.length === 10, h.length + ' trafień');

  h = await hits('vf44');
  check('„vf44" → brak trafień', h.length === 0, h.length + ' trafień');

  for (const [q, box] of [['mr150', 'DKM150'], ['rv063', 'DKM063'], ['wi90', 'DKM090'], ['tm40', 'DKM040'], ['pm40', 'DKM040']]) {
    h = await hits(q);
    check('„' + q + '" → ' + box + ' bez etykiety zamiennika',
      h.length === 1 && h[0].box === box && h[0].tag === 'Przekładnia DKM', JSON.stringify(h));
  }

  h = await hits('pm');
  check('„pm" bez numeru → dziesięć rozmiarów', h.length === 10, h.length + ' trafień');

  h = await hits('pmrv40');
  check('„pmrv40" → DKM040 z etykietą zamiennika', h.length === 1 && h[0].box === 'DKM040' && h[0].tag === 'Odpowiednik DKM', JSON.stringify(h));

  // SKU falownika — wcześniej wyjątek przez przesłoniętą funkcję num()
  await input.fill('E500');
  await page.waitForTimeout(80);
  const invHit = await page.locator('button', { hasText: 'Falownik' }).count();
  check('SKU falownika „E500" nie wywraca ekranu', invHit > 0, invHit + ' trafień');

  await ctx.close();
}

// ——— wymagane fs z wykresu katalogowego ———
{
  const { ctx, page } = await newPage();
  await page.getByRole('button', { name: /Moment obrotowy na wale wyjściowym/ }).first().click();
  const fsHead = page.locator('text=Orientacyjne fs').locator('xpath=following-sibling::span[1]');
  check('domyślne warunki (B · 8 h · Z 10 · do 30 °C) → fs ≥ 1,3', (await fsHead.textContent()).trim() === '≥ 1,3', await fsHead.textContent());

  await page.getByRole('button', { name: /C · ciężkie udary/ }).click();
  await page.getByRole('button', { name: '24 h', exact: true }).click();
  check('C + 24 h → fs ≥ 2,0', (await fsHead.textContent()).trim() === '≥ 2,0', await fsHead.textContent());
  await ctx.close();
}

// ——— pełna ścieżka: moc → Karta A → Karta B → wyniki → karta zestawu → koszyk ———
{
  const { ctx, page } = await newPage();
  await page.getByRole('button', { name: /Moc silnika/ }).first().click();
  await page.locator('button', { hasText: /^0,55/ }).first().click();
  check('po wyborze mocy wchodzimy w Kartę A', await page.locator('text=Krok 2 z 3 · Zawężenie doboru').isVisible());

  await page.getByRole('button', { name: /Dalej · warunki pracy/ }).click();
  check('Karta B — warunki pracy', await page.locator('text=Jak będzie pracowała maszyna?').isVisible());

  await page.getByRole('button', { name: /Pokaż wyniki/ }).click();
  const rows = await page.locator('button', { hasText: /obr\/min/ }).filter({ hasText: /Nm/ }).count();
  check('lista wyników ma pozycje', rows > 0, rows + ' pozycji');

  await page.locator('button', { hasText: /Motoreduktor 3F/ }).first().click();
  check('karta zestawu otwarta', await page.locator('text=Proponowany dobór').first().isVisible());

  await page.getByRole('button', { name: /Dodaj do koszyka/ }).click();
  check('pozycja trafia do zamówienia', await page.locator('h2', { hasText: 'Zamówienie' }).isVisible());

  await page.getByRole('button', { name: /Dalej →/ }).click();
  check('etap 2 wymaga danych kontaktowych', await page.locator('text=Dane do zamówienia').isVisible());
  await ctx.close();
}

// ——— układ webowy (≥ 900 px) ———
{
  const { ctx, page } = await newPage(1280, 900);
  const w = await page.evaluate(() => {
    const el = document.querySelector('#app > div');
    return getComputedStyle(el).maxWidth;
  });
  check('szeroki ekran → arkusz 1180 px', w === '1180px', w);
  await ctx.close();
}

// ——— PWA: po instalacji service workera aplikacja działa bez sieci ———
{
  const ctx = await browser.newContext({ viewport: { width: 520, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    try { localStorage.setItem('dkm-analytics-consent', 'no'); } catch (e) {}
  });
  await page.goto(base, { waitUntil: 'networkidle' });
  const ready = await page.evaluate(() =>
    navigator.serviceWorker.ready.then(() => true).catch(() => false));
  check('service worker instaluje się poprawnie', ready);

  await ctx.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Znajdźmy napęd idealny', { timeout: 20000 });
  await page.getByRole('button', { name: /Moc silnika/ }).first().click();
  const off = await page.locator('text=Moc znamionowa silnika').isVisible();
  const font = await page.evaluate(() => document.fonts.check('600 25px "Barlow Condensed"'));
  check('bez sieci aplikacja startuje z pamięci urządzenia', off);
  check('bez sieci czcionki firmowe są dostępne', font);
  await ctx.setOffline(false);
  await ctx.close();
}

// ——— plik offline (jeśli zbudowany) — otwarty z dysku, bez sieci ———
{
  const offline = resolve(fileURLToPath(import.meta.url), '../../dist-offline/DKM Dobor przekladni v3.html');
  let exists = true;
  try { await readFile(offline); } catch { exists = false; }
  if (!exists) {
    console.log('  —    plik offline pominięty (uruchom `npm run build:offline`)');
  } else {
    const ctx = await browser.newContext({ viewport: { width: 520, height: 900 }, offline: true });
    const page = await ctx.newPage();
    const offErr = [];
    page.on('pageerror', (e) => offErr.push(String(e)));
    await page.addInitScript(() => {
      try { localStorage.setItem('dkm-analytics-consent', 'no'); } catch (e) {}
    });
    await page.goto('file://' + offline);
    await page.waitForSelector('text=Znajdźmy napęd idealny', { timeout: 15000 });
    check('plik offline startuje bez sieci', true);

    const logoOk = await page.evaluate(() => {
      const img = document.querySelector('img[alt="DKM Power Transmission"]');
      return !!img && img.src.startsWith('data:') && img.naturalWidth > 0;
    });
    check('plik offline — logo wbudowane w plik', logoOk);

    const tileOk = await page.evaluate(() => {
      const el = [...document.querySelectorAll('span[role="img"]')].find((s) => /background-image/.test(s.getAttribute('style') || ''));
      return !!el && /url\("data:/.test(getComputedStyle(el).backgroundImage);
    });
    check('plik offline — ikony kryteriów wbudowane', tileOk);

    await page.getByRole('button', { name: /Moc silnika/ }).first().click();
    await page.locator('button', { hasText: /^0,55/ }).first().click();
    check('plik offline — dobór działa', await page.locator('text=Krok 2 z 3 · Zawężenie doboru').isVisible());

    if (offErr.length) errors.push(...offErr.map((e) => 'offline: ' + e));
    await ctx.close();
  }
}

await browser.close();
server.close();

if (errors.length) {
  console.log('\nBłędy w konsoli / wyjątki:');
  for (const e of [...new Set(errors)]) console.log('  ' + e);
}
const bad = results.filter((r) => !r.ok).length;
console.log('\n' + (results.length - bad) + '/' + results.length + ' testów przeszło' + (errors.length ? (', ' + new Set(errors).size + ' błędów w konsoli') : ''));
process.exit(bad || errors.length ? 1 : 0);
