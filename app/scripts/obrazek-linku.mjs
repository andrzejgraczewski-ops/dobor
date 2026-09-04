// Składa obrazek pokazywany przy linku do aplikacji w komunikatorach i mediach
// społecznościowych (Open Graph, 1200 × 630 px). Uruchamiane ręcznie, tylko gdy
// zmienia się logo albo hasło — wynik leży w public/ i jest kopiowany do dist/.
//
//   node scripts/obrazek-linku.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const app = resolve(fileURLToPath(import.meta.url), '../..');
const MIME = { '.html': 'text/html', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.css': 'text/css' };

const STRONA = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="/fonts/fonts.css">
<style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;overflow:hidden;background:#29265b;color:#fff;
       font-family:Barlow,system-ui,sans-serif;display:flex;flex-direction:column}
  .gora{padding:52px 64px 0;display:flex;align-items:center;justify-content:space-between}
  /* logo jest granatowe — na granatowym tle wybielamy je filtrem */
  .logo{height:66px;filter:brightness(0) invert(1);opacity:.95}
  .adres{font:600 20px/1 Barlow,sans-serif;letter-spacing:.16em;text-transform:uppercase;opacity:.7}
  .tresc{flex:1;padding:38px 64px 0;display:flex;flex-direction:column;justify-content:center}
  h1{font:600 78px/0.98 'Barlow Condensed',Barlow,sans-serif;max-width:14ch}
  p{margin-top:20px;font:400 26px/1.45 Barlow,sans-serif;opacity:.85;max-width:33ch}
  .pasek{margin:0 64px;padding:22px 0;display:flex;border-top:3px solid rgba(255,255,255,.2)}
  .pasek span{font:600 19px/1 Barlow,sans-serif;letter-spacing:.13em;text-transform:uppercase;opacity:.9;
              padding-right:24px;margin-right:24px;border-right:1px solid rgba(255,255,255,.25)}
  .pasek span:last-child{border:0}
  .zdjecie{height:162px;width:100%;object-fit:cover;object-position:72% 62%;display:block}
</style>
<div class="gora">
  <img class="logo" src="/assets/dkm-logo.png" alt="">
  <div class="adres">dobor.dkmpower.pl</div>
</div>
<div class="tresc">
  <h1>Dobór przekładni ślimakowych</h1>
  <p>Od mocy silnika do gotowego zamówienia — z cenami netto i dostępnością.</p>
</div>
<div class="pasek"><span>DKM025 – DKM150</span><span>0,06 – 15 kW</span><span>silnik i falownik</span></div>
<img class="zdjecie" src="/assets/hero-przekladnia.png" alt="">`;

const server = createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(STRONA); }
  try {
    const sciezka = join(app, 'public', normalize(url));
    const buf = await readFile(sciezka);
    res.writeHead(200, { 'Content-Type': MIME[extname(sciezka)] || 'application/octet-stream' });
    res.end(buf);
  } catch { res.writeHead(404).end('nie ma'); }
});
await new Promise((r) => server.listen(0, r));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:' + server.address().port + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const cel = join(app, 'public', 'obrazek-linku.png');
await page.screenshot({ path: cel });
await browser.close();
server.close();
console.log('obrazek-linku.png — 1200 × 630 px → public/');
