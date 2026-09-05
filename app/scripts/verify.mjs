// Weryfikacja analityki GA4 i wysyłki zamówień/zapytań.
//
// Żądania do Google i Formspree są przechwytywane, więc test nie wysyła nic na
// zewnątrz — sprawdza dokładnie to, co poleciałoby na produkcji: adres, metodę,
// nagłówki i treść, a także bramki zgody, walidację i blokadę dubli.
//
// Uruchomienie:  npm run build && npm run verify
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
  } catch { res.writeHead(404).end('404'); }
});
await new Promise((r) => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port + '/';

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok });
  console.log((ok ? '  OK   ' : '  BŁĄD ') + name + (detail ? ' — ' + detail : ''));
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

// wspólne przygotowanie strony: przechwytujemy Google i Formspree
// formDelay — opóźnienie odpowiedzi (ms); formHang — odpowiedź nie przychodzi wcale
async function open({ consent = null, formStatus = 200, formDelay = 0, formHang = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 520, height: 900 } });
  const google = [];       // adresy żądań do Google
  const posts = [];        // przechwycone wysyłki formularza
  await ctx.route(/googletagmanager\.com|google-analytics\.com/, async (route) => {
    google.push(route.request().url());
    // pusty skrypt — aplikacja i tak sama definiuje window.gtag przed jego załadowaniem
    await route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
  });
  await ctx.route(/formspree\.io/, async (route) => {
    const req = route.request();
    posts.push({
      url: req.url(), method: req.method(), headers: req.headers(),
      body: (() => { try { return JSON.parse(req.postData() || '{}'); } catch { return { __raw: req.postData() }; } })(),
    });
    if (formHang) return;                       // celowo bez odpowiedzi — test limitu czasu
    if (formDelay) await new Promise((r) => setTimeout(r, formDelay));
    await route.fulfill({
      status: formStatus,
      contentType: 'application/json',
      body: formStatus === 200 ? '{"ok":true}' : '{"error":"test"}',
    });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  if (consent !== null) {
    await page.addInitScript((c) => {
      try { localStorage.setItem('dkm-analytics-consent', c); } catch (e) {}
    }, consent);
  }
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Znajdźmy napęd idealny', { timeout: 20000 });
  return { ctx, page, google, posts, errors };
}

const dl = (page) => page.evaluate(() =>
  (window.dataLayer || []).map((a) => Array.prototype.slice.call(a)));

// dojście do karty zestawu i dodanie pozycji do koszyka
async function addToCart(page) {
  await page.getByRole('button', { name: /Moc silnika/ }).first().click();
  await page.locator('button').filter({ hasText: /^\s*0,55\s*kW/ }).first().click();
  await page.getByRole('button', { name: /Dalej · warunki pracy/ }).click();
  await page.getByRole('button', { name: /Pokaż wyniki/ }).click();
  await page.locator('button', { hasText: /3F · .* kW · / }).first().click();
  await page.getByRole('button', { name: /Dodaj do koszyka/ }).click();
  await page.locator('h2', { hasText: 'Zamówienie' }).waitFor();
}

// wypełnienie danych kontaktowych i przejście na etap 3
async function fillContact(page) {
  await page.getByRole('button', { name: /Dalej →/ }).click();
  await page.locator('input[placeholder="imię"]').fill('Jan');
  await page.locator('input[placeholder="nazwisko"]').fill('Testowy');
  await page.locator('input[placeholder="adres@firma.pl"]').fill('jan.testowy@example.com');
  await page.locator('input[placeholder="+48"]').fill('500600700');
  await page.locator('input[placeholder="np. 3 Maja 20"]').fill('3 Maja 20');
  await page.locator('input[placeholder="87-640"]').fill('87-640');
  await page.locator('input[placeholder="np. Czernikowo"]').fill('Czernikowo');
  await page.getByRole('button', { name: /Dalej →/ }).click();
  await page.locator('text=Płatność i potwierdzenie').waitFor();
}

console.log('\n— Analityka GA4 (G-79013G7BXL) —');

// 1. przed decyzją — cisza
{
  const { ctx, page, google } = await open();
  const banner = await page.locator('text=Pomóż nam poprawić konfigurator').isVisible();
  check('baner zgody widoczny przed podjęciem decyzji', banner);
  await page.waitForTimeout(600);
  const layer = await dl(page);
  check('przed zgodą: zero żądań do Google', google.length === 0, google.join(', '));
  check('przed zgodą: brak dataLayer (gtag nie wystartował)', layer.length === 0, JSON.stringify(layer).slice(0, 120));
  await ctx.close();
}

// 2. odmowa zgody
{
  const { ctx, page, google } = await open();
  await page.getByRole('button', { name: 'Nie zgadzam się' }).click();
  await page.waitForTimeout(400);
  const st = await page.evaluate(() => ({
    ls: localStorage.getItem('dkm-analytics-consent'),
    disable: window['ga-disable-G-79013G7BXL'],
  }));
  check('odmowa: zapis „no" w pamięci przeglądarki', st.ls === 'no', String(st.ls));
  check('odmowa: ustawiona blokada ga-disable', st.disable === true, String(st.disable));
  check('odmowa: zero żądań do Google', google.length === 0, google.join(', '));
  const gone = await page.locator('text=Pomóż nam poprawić konfigurator').isVisible();
  check('odmowa: baner znika', !gone);
  await ctx.close();
}

// 3. zgoda — gtag.js z właściwym identyfikatorem + zdarzenia
{
  const { ctx, page, google } = await open();
  await page.getByRole('button', { name: 'Akceptuję analitykę' }).click();
  await page.waitForTimeout(700);
  check('zgoda: pobranie gtag.js z identyfikatorem G-79013G7BXL',
    google.some((u) => u.includes('gtag/js') && u.includes('G-79013G7BXL')), google.join(', '));
  let layer = await dl(page);
  const has = (name, pred) => layer.some((a) => a[0] === 'event' && a[1] === name && (!pred || pred(a[2] || {})));
  check('zgoda: config z anonimizacją IP',
    layer.some((a) => a[0] === 'config' && a[1] === 'G-79013G7BXL' && a[2] && a[2].anonymize_ip === true));
  check('zgoda: zdarzenie analytics_consent', has('analytics_consent'));
  check('zgoda: consent update = granted',
    layer.some((a) => a[0] === 'consent' && a[1] === 'update' && a[2] && a[2].analytics_storage === 'granted'));

  // odsłony ekranów — aplikacja jednostronicowa musi zgłaszać je sama
  const widoki = () => layer.filter((a) => a[0] === 'event' && a[1] === 'page_view').map((a) => a[2] || {});
  check('config nie wysyła odsłony sam (żeby nie liczyć jej dwa razy)',
    layer.some((a) => a[0] === 'config' && a[2] && a[2].send_page_view === false));
  check('odsłona ekranu startowego po zgodzie',
    widoki().some((p) => p.page_title === 'Ekran startowy' && p.page_path === '/'),
    JSON.stringify(widoki().map((p) => p.page_title)));

  // zdarzenia z realnej ścieżki klienta
  await page.getByRole('button', { name: /Moc silnika/ }).first().click();
  await page.locator('button').filter({ hasText: /^\s*0,55\s*kW/ }).first().click();
  await page.getByRole('button', { name: /Tak, zawężmy wybór/ }).click();
  await page.getByRole('button', { name: /Pomiń — pokaż wszystkie/ }).click();
  await page.getByRole('button', { name: /Dalej · warunki pracy/ }).click();
  await page.getByRole('button', { name: /Pokaż wyniki/ }).click();
  await page.locator('button', { hasText: /3F · .* kW · / }).first().click();
  await page.getByRole('button', { name: /Dodaj do koszyka/ }).click();
  await page.locator('h2', { hasText: 'Zamówienie' }).waitFor();
  layer = await dl(page);
  check('zdarzenie select_criterion z wybranym kryterium',
    has('select_criterion', (p) => p.criterion === 'p1'));
  check('odsłona ekranu kryterium wejściowego',
    widoki().some((p) => p.page_title === 'Kryterium · Moc silnika'
      && p.page_path.endsWith('/kryterium/moc-silnika')));
  check('ścieżka i adres odsłony są zgodne',
    widoki().every((p) => typeof p.page_location === 'string'
      && p.page_location.endsWith(p.page_path)),
    JSON.stringify(widoki().map((p) => p.page_path)));
  check('zdarzenie refine_step · narrow', has('refine_step', (p) => p.choice === 'narrow'));
  check('zdarzenie refine_step · skip', has('refine_step', (p) => p.choice === 'skip'));
  check('zdarzenie add_to_cart z kodem korpusu', has('add_to_cart', (p) => /^DKM\d{3}$/.test(p.box || '')));
  // view_cart leci wyłącznie z dolnego paska koszyka — wejście prosto z karty
  // zestawu („Dodaj do koszyka") go nie wywołuje, tak samo jak w prototypie
  check('wejście z karty zestawu nie liczy się jako view_cart (jak w prototypie)', !has('view_cart'));
  await page.getByRole('button', { name: /Dobieraj dalej/ }).click();
  await page.locator('button', { hasText: /Twój koszyk/ }).click();
  layer = await dl(page);
  check('zdarzenie view_cart z dolnego paska koszyka', has('view_cart', (p) => typeof p.items === 'number'));

  // do analityki nie mogą trafić dane kontaktowe
  await fillContact(page);
  layer = await dl(page);
  const leak = JSON.stringify(layer).match(/jan\.testowy|Testowy|500600700/i);
  check('analityka nie zbiera danych kontaktowych', !leak, leak ? leak[0] : '');
  await ctx.close();
}

// 4. cofnięcie i ponowne udzielenie zgody
{
  const { ctx, page } = await open({ consent: 'yes' });
  await page.evaluate(() => { document.cookie = '_ga=GA1.1.test; path=/'; });
  await page.getByRole('button', { name: /Informacje prawne/ }).first().click();
  // nazwa kafelka pada też w treści polityki prywatności — bierzemy pierwszy, czyli kafelek
  await page.locator('text=Analityka · RODO').first().waitFor();
  const stateOn = await page.locator('text=Analityka włączona').isVisible();
  check('ekran prawny pokazuje aktualny stan zgody', stateOn);

  await page.getByRole('button', { name: 'Cofnij zgodę' }).click();
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => ({
    disable: window['ga-disable-G-79013G7BXL'],
    cookie: document.cookie.includes('_ga=GA1.1.test'),
    denied: (window.dataLayer || []).some((a) => a[0] === 'consent' && a[1] === 'update' && a[2] && a[2].analytics_storage === 'denied'),
    ls: localStorage.getItem('dkm-analytics-consent'),
  }));
  check('cofnięcie: ga-disable = true', after.disable === true);
  check('cofnięcie: consent update = denied', after.denied);
  check('cofnięcie: ciasteczko _ga wygaszone', !after.cookie);
  check('cofnięcie: zapis „no" w pamięci', after.ls === 'no');
  const off = await page.locator('text=Analityka wyłączona').isVisible();
  check('cofnięcie: opis stanu się zmienia', off);

  await page.getByRole('button', { name: 'Wyraź zgodę' }).click();
  await page.waitForTimeout(300);
  const again = await page.evaluate(() => ({
    disable: window['ga-disable-G-79013G7BXL'],
    granted: (window.dataLayer || []).filter((a) => a[0] === 'consent' && a[2] && a[2].analytics_storage === 'granted').length,
  }));
  check('ponowna zgoda: blokada zdjęta, pomiar wraca', again.disable === false && again.granted > 0,
    JSON.stringify(again));
  const tags = await page.evaluate(() =>
    document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').length);
  check('ponowna zgoda nie dokłada drugiego gtag.js', tags === 1, tags + ' znaczników script');
  await ctx.close();
}

console.log('\n— Wysyłka zamówienia i zapytania (Formspree) —');

// 5. walidacja przed wysyłką
{
  const { ctx, page, posts } = await open({ consent: 'no' });
  await addToCart(page);
  await page.getByRole('button', { name: /Dalej →/ }).click();
  await page.getByRole('button', { name: /Dalej →/ }).click();
  const stuck = await page.locator('text=Uzupełnij imię, nazwisko, e-mail, telefon i adres dostawy').isVisible();
  check('bez danych kontaktowych nie da się przejść do płatności', stuck);
  check('brak niepotrzebnej wysyłki', posts.length === 0, posts.length + ' żądań');

  // adres dostawy jest wymagany — jedyny sposób dostawy to wysyłka kurierem
  await page.locator('input[placeholder="imię"]').fill('Jan');
  await page.locator('input[placeholder="nazwisko"]').fill('Testowy');
  await page.locator('input[placeholder="adres@firma.pl"]').fill('jan.testowy@example.com');
  await page.locator('input[placeholder="+48"]').fill('500600700');
  await page.getByRole('button', { name: /Dalej →/ }).click();
  check('sam kontakt bez adresu nie wystarcza przy wysyłce kurierem',
    await page.locator('text=Uzupełnij imię, nazwisko, e-mail, telefon i adres dostawy').isVisible());

  await page.locator('input[placeholder="np. 3 Maja 20"]').fill('3 Maja 20');
  await page.locator('input[placeholder="87-640"]').fill('87-640');
  await page.locator('input[placeholder="np. Czernikowo"]').fill('Czernikowo');
  await page.getByRole('button', { name: /Dalej →/ }).click();
  check('z pełnym adresem przechodzimy do płatności',
    await page.locator('text=Płatność i potwierdzenie').isVisible());
  await ctx.close();
}

// 6. brak akceptacji regulaminu blokuje zamówienie
{
  const { ctx, page, posts } = await open({ consent: 'no' });
  await addToCart(page);
  await fillContact(page);
  await page.locator('[data-order-btn]').click();
  await page.waitForTimeout(400);
  const err = await page.locator('text=/Do złożenia zamówienia brakuje/').isVisible();
  check('bez akceptacji regulaminu zamówienie nie wychodzi', err && posts.length === 0,
    posts.length + ' żądań');
  await ctx.close();
}

// 7. poprawne zamówienie — adres, metoda, nagłówki i treść
{
  const { ctx, page, posts } = await open({ consent: 'yes' });
  await addToCart(page);
  await fillContact(page);
  await page.getByRole('button', { name: /Zapoznałem się z/ }).click();
  await page.locator('[data-order-btn]').click();
  await page.waitForSelector('text=Numer zgłoszenia', { timeout: 15000 });

  check('jedno żądanie wysyłki', posts.length === 1, posts.length + ' żądań');

  // bez wartości i liczby pozycji GA4 pokazuje same sztuki zgłoszeń, a nie to,
  // ile aplikacja realnie przynosi
  const wyslano = await page.evaluate(() => (window.dataLayer || [])
    .map((a) => Array.prototype.slice.call(a))
    .filter((a) => a[0] === 'event' && /^submit_(order|rfq)$/.test(a[1])));
  check('wysyłka zgłasza się do analityki', wyslano.length === 1,
    JSON.stringify(wyslano).slice(0, 120));
  const par = (wyslano[0] || [])[2] || {};
  check('zdarzenie wysyłki niesie wartość zamówienia',
    typeof par.value === 'number' && par.value > 0 && par.currency === 'PLN',
    JSON.stringify(par));
  check('zdarzenie wysyłki niesie liczbę pozycji', par.items >= 1, String(par.items));

  const p = posts[0] || { headers: {}, body: {} };
  check('adres: https://formspree.io/f/mgaewanz', p.url === 'https://formspree.io/f/mgaewanz', p.url);
  check('metoda POST', p.method === 'POST', p.method);
  check('nagłówki JSON', /application\/json/.test(p.headers['content-type'] || '') && /application\/json/.test(p.headers['accept'] || ''),
    (p.headers['content-type'] || '') + ' / ' + (p.headers['accept'] || ''));

  const b = p.body || {};
  const wanted = ['_subject', 'numer_zgloszenia', 'rodzaj', 'imie', 'nazwisko', 'firma', 'nip', 'email', 'telefon', 'adres_dostawy', 'dostawa', 'platnosc', 'pozycje', 'wiadomosc'];
  const missing = wanted.filter((k) => !(k in b));
  check('komplet pól w zgłoszeniu', missing.length === 0, missing.join(', '));
  check('numer zgłoszenia w formacie DKM-RRRRMMDD-GGMMSS-XXX',
    /^DKM-\d{8}-\d{6}-\d{3}$/.test(b.numer_zgloszenia || ''), b.numer_zgloszenia);
  check('rodzaj = Zamówienie', b.rodzaj === 'Zamówienie', b.rodzaj);
  check('dane kontaktowe w treści', b.imie === 'Jan' && b.nazwisko === 'Testowy' && b.email === 'jan.testowy@example.com' && b.telefon === '500600700');
  check('adres dostawy w zgłoszeniu', b.adres_dostawy === '3 Maja 20, 87-640 Czernikowo', b.adres_dostawy);
  check('adres dostawy w treści maila', (b.wiadomosc || '').includes('Adres dostawy: 3 Maja 20, 87-640 Czernikowo'));
  check('dostawa i płatność', b.dostawa === 'Kurier / spedycja' && b.platnosc === 'Proforma', b.dostawa + ' / ' + b.platnosc);
  check('pozycje wypisane w zgłoszeniu', /DKM\d{3}/.test(b.pozycje || ''), (b.pozycje || '').slice(0, 60));
  check('pełna treść maila dołączona', (b.wiadomosc || '').includes('ZAMÓWIENIE') && (b.wiadomosc || '').includes('Razem brutto'),
    String((b.wiadomosc || '').length) + ' znaków');
  check('temat zawiera numer zgłoszenia', (b._subject || '').includes(b.numer_zgloszenia || 'x'), b._subject);

  // numer na ekranie musi być tym samym, co w wysłanym zgłoszeniu
  const shown = (await page.locator('text=Numer zgłoszenia').textContent()).replace('Numer zgłoszenia: ', '').trim();
  check('numer na ekranie zgodny z wysłanym', shown === b.numer_zgloszenia, shown + ' / ' + b.numer_zgloszenia);

  // blokada dubli — trzy dotknięcia po sukcesie
  await page.locator('[data-order-btn]').click({ force: true }).catch(() => {});
  await page.locator('[data-order-btn]').click({ force: true }).catch(() => {});
  await page.waitForTimeout(500);
  check('blokada dubli: kolejne kliknięcia nie tworzą nowych zamówień', posts.length === 1, posts.length + ' żądań');

  // zdarzenie analityczne o wysłanym zamówieniu
  const layer = await dl(page);
  check('zdarzenie submit_order z formą płatności',
    layer.some((a) => a[0] === 'event' && a[1] === 'submit_order' && a[2] && a[2].payment === 'proforma'));

  // po 5 s powrót na start i wyczyszczony koszyk
  await page.waitForTimeout(6000);
  const home = await page.locator('text=Znajdźmy napęd idealny').isVisible();
  const cart = await page.evaluate(() => localStorage.getItem('dkm-rfq-v2'));
  check('po wysłaniu zamówienia powrót na ekran startowy', home);
  check('koszyk wyczyszczony po zamówieniu', !cart || cart === '[]', String(cart).slice(0, 40));
  await ctx.close();
}

// 8. awaria wysyłki — panel ratunkowy
{
  const { ctx, page, posts } = await open({ consent: 'no', formStatus: 500 });
  await addToCart(page);
  await fillContact(page);
  await page.getByRole('button', { name: /Zapoznałem się z/ }).click();
  await page.locator('[data-order-btn]').click();
  await page.waitForSelector('text=Wysyłka nie udała się', { timeout: 15000 });
  check('błąd wysyłki: komunikat dla klienta', true);
  const copy = await page.getByRole('button', { name: /Kopiuj treść zapytania/ }).isVisible();
  const mail = await page.locator('a[href^="mailto:sklep@d-k-m.eu"]').isVisible();
  const body = await page.locator('text=/ZAMÓWIENIE — przekładnie/').isVisible();
  check('błąd wysyłki: przycisk kopiowania treści', copy);
  check('błąd wysyłki: awaryjny mailto na sklep@d-k-m.eu', mail);
  check('błąd wysyłki: pełna treść widoczna do skopiowania', body);
  check('błąd wysyłki: koszyk nie zniknął', !!(await page.evaluate(() => localStorage.getItem('dkm-rfq-v2'))));
  check('jedno żądanie mimo błędu', posts.length === 1, posts.length + ' żądań');
  await ctx.close();
}

// 8b. informacja zwrotna w trakcie wysyłki
{
  const { ctx, page } = await open({ consent: 'no', formDelay: 2500 });
  await addToCart(page);
  await fillContact(page);
  await page.getByRole('button', { name: /Zapoznałem się z/ }).click();
  await page.locator('[data-order-btn]').click();
  await page.waitForTimeout(600);
  const label = (await page.locator('[data-order-btn]').textContent()).trim();
  check('w trakcie wysyłki przycisk mówi „Wysyłam zamówienie…"', label === 'Wysyłam zamówienie…', label);
  await page.waitForSelector('text=Numer zgłoszenia', { timeout: 15000 });
  const done = (await page.locator('[data-order-btn]').textContent()).trim();
  check('po wysłaniu przycisk potwierdza wysyłkę', done === '✓ zamówienie wysłane', done);
  const panelInView = await page.evaluate(() => {
    const el = document.querySelector('[data-sent-panel]');
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight + 1;
  });
  check('potwierdzenie samo przewija się na ekran', panelInView);
  await ctx.close();
}

// 8c. wysyłka bez odpowiedzi — przerwanie po 20 s zamiast wiszenia w nieskończoność
{
  const { ctx, page } = await open({ consent: 'no', formHang: true });
  await addToCart(page);
  await fillContact(page);
  await page.getByRole('button', { name: /Zapoznałem się z/ }).click();
  const t0 = Date.now();
  await page.locator('[data-order-btn]').click();
  await page.waitForSelector('text=Wysyłka nie udała się', { timeout: 40000 });
  const sec = Math.round((Date.now() - t0) / 1000);
  check('brak odpowiedzi serwera przerywa wysyłkę po ~20 s', sec >= 18 && sec <= 30, sec + ' s');
  const msg = await page.locator('text=/Wysyłka trwała zbyt długo/').isVisible();
  check('komunikat mówi wprost, że zamówienie NIE zostało wysłane', msg);
  check('koszyk zostaje po przerwanej wysyłce',
    !!(await page.evaluate(() => localStorage.getItem('dkm-rfq-v2'))));
  await ctx.close();
}

console.log('\n— Nagłówki bezpieczeństwa (polityka z deploy/nginx.conf) —');

// 9. aplikacja musi działać pod docelową polityką CSP, a nie tylko „na goło"
{
  const conf = await readFile(resolve(fileURLToPath(import.meta.url), '../../deploy/nginx.conf'), 'utf8');
  const m = /add_header Content-Security-Policy "([^"]+)"/.exec(conf);
  const csp = m ? m[1] : '';
  check('polityka CSP wczytana z deploy/nginx.conf', !!csp, csp.slice(0, 60) + '…');

  const cspServer = createServer(async (req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    const path = join(root, normalize(url === '/' ? '/index.html' : url));
    try {
      const buf = await readFile(path);
      res.writeHead(200, {
        'Content-Type': MIME[extname(path)] || 'application/octet-stream',
        'Content-Security-Policy': csp,
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      });
      res.end(buf);
    } catch { res.writeHead(404).end('404'); }
  });
  await new Promise((r) => cspServer.listen(0, r));
  const cspBase = 'http://127.0.0.1:' + cspServer.address().port + '/';

  const ctx = await browser.newContext({ viewport: { width: 520, height: 900 } });
  const violations = [];
  const google = [];
  const posts = [];
  await ctx.route(/googletagmanager\.com|google-analytics\.com/, async (route) => {
    google.push(route.request().url());
    await route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
  });
  await ctx.route(/formspree\.io/, async (route) => {
    posts.push(route.request().url());
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  const page = await ctx.newPage();
  page.on('console', (msg) => {
    const t = msg.text();
    if (/Content Security Policy|Refused to/i.test(t)) violations.push(t);
  });
  await page.goto(cspBase, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Znajdźmy napęd idealny', { timeout: 20000 });

  // pełna ścieżka pod CSP: dobór, koszyk, zgoda na analitykę, wysyłka
  await page.getByRole('button', { name: 'Akceptuję analitykę' }).click();
  await addToCart(page);
  await fillContact(page);
  await page.getByRole('button', { name: /Zapoznałem się z/ }).click();
  await page.locator('[data-order-btn]').click();
  await page.waitForSelector('text=Numer zgłoszenia', { timeout: 15000 });

  const fontOk = await page.evaluate(() => document.fonts.check('600 25px "Barlow Condensed"'));
  const hoverOk = await page.evaluate(() => !!document.querySelector('style[data-dkm-hover]'));
  check('pod CSP: aplikacja działa bez naruszeń polityki', violations.length === 0,
    violations.slice(0, 2).join(' | '));
  check('pod CSP: czcionki firmowe się ładują', fontOk);
  check('pod CSP: style najechania kursorem działają', hoverOk);
  check('pod CSP: gtag.js dozwolony', google.some((u) => u.includes('gtag/js')));
  check('pod CSP: wysyłka na formspree.io dozwolona', posts.length === 1, posts.length + ' żądań');
  await ctx.close();
  cspServer.close();
}

// --- co widzi wyszukiwarka i komunikator ----------------------------------
{
  const html = await readFile(join(root, 'index.html'), 'utf8');
  const ma = (co) => html.includes(co);
  check('adres kanoniczny wskazuje domenę aplikacji',
    ma('<link rel="canonical" href="https://dobor.dkmpower.pl/">'));
  for (const t of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:width'])
    check('podgląd linku: ' + t, ma('property="' + t + '"'));
  check('podgląd linku: duży kafelek na Twitterze/X',
    ma('name="twitter:card" content="summary_large_image"'));

  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  check('dane strukturalne są poprawnym JSON-em', !!ld && (() => {
    try { return JSON.parse(ld[1])['@type'] === 'WebApplication'; } catch { return false; }
  })());

  const robots = await readFile(join(root, 'robots.txt'), 'utf8');
  check('robots.txt wskazuje mapę strony', robots.includes('Sitemap: https://dobor.dkmpower.pl/sitemap.xml'));
  const mapa = await readFile(join(root, 'sitemap.xml'), 'utf8');
  const cennik = await readFile(resolve(root, '../src/data/price-data.js'), 'utf8');
  const d = cennik.match(/updated:\s*'stan na (\d{2})\.(\d{2})\.(\d{4})'/);
  check('mapa strony podaje datę treści z cennika',
    !!d && mapa.includes('<lastmod>' + d[3] + '-' + d[2] + '-' + d[1] + '</lastmod>'));

  // obrazek podglądu musi istnieć i mieć wymiary deklarowane w og:image
  const png = await readFile(join(root, 'obrazek-linku.png'));
  const szer = png.readUInt32BE(16), wys = png.readUInt32BE(20);
  check('obrazek podglądu ma 1200 × 630 px', szer === 1200 && wys === 630, szer + '×' + wys);

  // JSON-LD to blok danych, nie skrypt — CSP nie może go blokować
  const ctx = await browser.newContext();
  const bledy = [];
  const pg = await ctx.newPage();
  pg.on('console', (m) => { if (m.type() === 'error') bledy.push(m.text()); });
  await pg.goto(base, { waitUntil: 'domcontentloaded' });
  const wDom = await pg.locator('script[type="application/ld+json"]').count();
  check('dane strukturalne trafiają do strony', wDom === 1, wDom + ' bloków');
  check('CSP nie zgłasza naruszenia przy danych strukturalnych',
    !bledy.some((b) => /Content Security Policy/i.test(b)),
    bledy.filter((b) => /Content Security Policy/i.test(b)).join(' | ').slice(0, 160));
  await ctx.close();
}

console.log('\n— Wejście z linku (?start=…) —');

// 10. sześć adresów dla bloga i sklepu; muszą otwierać właściwy ekran,
//     czyścić pasek adresu i nie psuć niczego, gdy ktoś je przekręci
{
  // otwarcie adresu bez czekania na ekran startowy — bo linki go właśnie pomijają
  async function wejdz(adres, { consent = null } = {}) {
    const ctx = await browser.newContext({ viewport: { width: 520, height: 900 } });
    await ctx.route(/googletagmanager\.com|google-analytics\.com/, (r) =>
      r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    if (consent !== null) {
      await page.addInitScript((c) => {
        try { localStorage.setItem('dkm-analytics-consent', c); } catch (e) {}
      }, consent);
    }
    await page.goto(base + adres, { waitUntil: 'networkidle' });
    return { ctx, page, errors };
  }

  const LINKI = [
    ['?start=p1', 'Moc silnika P', '/kryterium/moc-silnika'],
    ['?start=i', 'Przełożenie i', '/kryterium/przelozenie'],
    ['?start=n2', 'Prędkość obrotowa na wale', '/kryterium/predkosc'],
    ['?start=m2', 'Wymagania maszyny', '/kryterium/moment'],
    ['?start=bore', 'Średnica wału', '/kryterium/srednica-walu'],
    ['?start=swap', 'Masz już przekładnię innej marki?', '/zamiennik'],
  ];
  for (const [adres, naglowek, sciezka] of LINKI) {
    const { ctx, page, errors } = await wejdz(adres, { consent: 'yes' });
    const widac = await page.locator('h2', { hasText: naglowek }).first()
      .isVisible().catch(() => false);
    check(adres + ' otwiera właściwy ekran', widac, naglowek);
    check(adres + ' czyści pasek adresu', new URL(page.url()).search === '', page.url());
    // klient wchodzi prosto na kryterium, więc GA4 ma zobaczyć jedną odsłonę — tę właściwą
    const widoki = (await dl(page))
      .filter((a) => a[0] === 'event' && a[1] === 'page_view').map((a) => a[2] || {});
    check(adres + ' zgłasza jedną odsłonę, właściwego ekranu',
      widoki.length === 1 && widoki[0].page_path === sciezka,
      JSON.stringify(widoki.map((p) => p.page_path)));
    check(adres + ' bez błędu w konsoli', errors.length === 0, errors.join(' | ').slice(0, 160));
    await ctx.close();
  }

  // kod z linku w wyszukiwarce zamienników — po to powstał parametr q
  {
    const { ctx, page, errors } = await wejdz('?start=swap&q=NMRV063');
    const pole = page.locator('input[placeholder^="np. NMRV063"]');
    check('?start=swap&q=… wpisuje kod w pole wyszukiwarki',
      (await pole.inputValue()) === 'NMRV063', await pole.inputValue());
    const trafienia = await page.locator('button', { hasText: /DKM0\d\d/ }).count();
    check('?start=swap&q=… pokazuje od razu odpowiedniki DKM', trafienia > 0, trafienia + ' trafień');
    check('?start=swap&q=… czyści pasek adresu', new URL(page.url()).search === '', page.url());
    check('?start=swap&q=… bez błędu w konsoli', errors.length === 0, errors.join(' | ').slice(0, 160));
    await ctx.close();
  }

  // przekręcony link nie może niczego zepsuć — ma być zwykłym wejściem na stronę
  {
    const { ctx, page, errors } = await wejdz('?start=cokolwiek&q=NMRV063');
    const dom = await page.locator('text=Znajdźmy napęd idealny').isVisible().catch(() => false);
    check('nieznana wartość start= otwiera ekran startowy', dom);
    check('nieznana wartość start= bez błędu w konsoli', errors.length === 0,
      errors.join(' | ').slice(0, 160));
    await ctx.close();
  }

  // treść z adresu trafia na ekran — musi być tekstem, nigdy kodem
  {
    const { ctx, page, errors } = await wejdz(
      '?start=swap&q=' + encodeURIComponent('<img src=x onerror="window.__x=1">ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'));
    const st = await page.evaluate(() => ({
      x: window.__x, img: document.querySelectorAll('img[src="x"]').length,
    }));
    check('kod w parametrze q nie wykonuje się', st.x === undefined && st.img === 0,
      JSON.stringify(st));
    const val = await page.locator('input[placeholder^="np. NMRV063"]').inputValue();
    check('parametr q przycięty do 40 znaków', val.length === 40, val.length + ' znaków');
    check('długi/dziwny q bez błędu w konsoli', errors.length === 0, errors.join(' | ').slice(0, 160));
    await ctx.close();
  }

  // adres kanoniczny nie może się rozjeżdżać — inaczej Google zobaczy sześć kopii strony
  {
    const html = await readFile(join(root, 'index.html'), 'utf8');
    const kan = /<link rel="canonical" href="([^"]+)">/.exec(html);
    check('adres kanoniczny wskazuje jeden adres, bez parametrów',
      !!kan && kan[1] === 'https://dobor.dkmpower.pl/', kan ? kan[1] : 'brak');
  }
}

await browser.close();
server.close();

const bad = results.filter((r) => !r.ok).length;
console.log('\n' + (results.length - bad) + '/' + results.length + ' sprawdzeń przeszło');
console.log('\nUWAGA: test nie wysyła nic na zewnątrz — Google i Formspree są przechwytywane.');
console.log('Sprawdzenie „na żywo" opisuje README (sekcja „Sprawdzenie po wdrożeniu").');
process.exit(bad ? 1 : 0);
