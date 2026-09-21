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
  // Tag Manager wchodzi tą samą bramką zgody co GA4 — przez niego idą tagi Google Ads
  check('zgoda: pobranie Tag Managera GTM-NN2RKMW',
    google.some((u) => u.includes('gtm.js') && u.includes('GTM-NN2RKMW')), google.join(', '));
  // dwa znaczniki GA4 na jednej stronie liczyłyby każde zamówienie dwa razy
  check('tylko jeden znacznik GA4 na stronie',
    google.filter((u) => u.includes('gtag/js')).length === 1,
    google.filter((u) => u.includes('gtag/js')).join(', '));
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
    widoki().some((p) => p.page_title === 'Ekran startowy' && p.page_path === '/dobor/'),
    JSON.stringify(widoki().map((p) => p.page_title)));
  // bez przedrostka ekran startowy konfiguratora wpada w GA4 do tego samego
  // wiersza „/" co strona główna sklepu — obie zbiera ta sama usługa
  check('ścieżki odsłon oddzielone od stron sklepu przedrostkiem /dobor',
    widoki().every((p) => typeof p.page_path === 'string' && p.page_path.startsWith('/dobor/')),
    JSON.stringify(widoki().map((p) => p.page_path)));

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

  // Wyzwalacz konwersji Google Ads siedzi w Tag Managerze i czyta zwykłe wpisy
  // w kolejce, a nie te wysłane przez gtag(). Bez nich tag konwersji jest martwy.
  {
    const wpisy = await page.evaluate(() => (window.dataLayer || [])
      .filter((x) => x && !x.length && typeof x.event === 'string' && x.event.startsWith('dkm_'))
      .map((x) => ({ event: x.event, value: x.value, currency: x.currency, items: x.items })));
    const zam = wpisy.filter((x) => x.event === 'dkm_submit_order');
    check('wpis dla Tag Managera: dkm_submit_order', zam.length === 1,
      JSON.stringify(wpisy.map((x) => x.event)));
    check('wpis dla Tag Managera niesie wartość i walutę',
      !!zam[0] && zam[0].value > 0 && zam[0].currency === 'PLN' && zam[0].items >= 1,
      JSON.stringify(zam[0] || {}));
    // ten sam przedrostek dla koszyka — przyda się do list odbiorców w Ads
    check('wpis dla Tag Managera: dkm_add_to_cart',
      wpisy.some((x) => x.event === 'dkm_add_to_cart'), JSON.stringify(wpisy.map((x) => x.event)));
    // nazwa z przedrostkiem chroni przed policzeniem konwersji dwa razy
    check('wpisy dla Tag Managera nie dublują nazw z GA4',
      !wpisy.some((x) => x.event === 'submit_order' || x.event === 'add_to_cart'),
      JSON.stringify(wpisy.map((x) => x.event)));
  }

  const p = posts[0] || { headers: {}, body: {} };
  check('adres: https://formspree.io/f/mgaewanz', p.url === 'https://formspree.io/f/mgaewanz', p.url);
  check('metoda POST', p.method === 'POST', p.method);
  check('nagłówki JSON', /application\/json/.test(p.headers['content-type'] || '') && /application\/json/.test(p.headers['accept'] || ''),
    (p.headers['content-type'] || '') + ' / ' + (p.headers['accept'] || ''));

  const b = p.body || {};
  const wanted = ['_subject', 'Numer', 'Klient', 'Telefon', 'E-mail',
    'Wartość netto', 'Płatność', 'Dostawa', 'Pozycje', 'Adres dostawy', 'Szczegóły'];
  const missing = wanted.filter((k) => !(k in b));
  check('komplet pól w zgłoszeniu', missing.length === 0, missing.join(', '));
  check('numer zgłoszenia w formacie DKM-RRRRMMDD-GGMMSS-XXX',
    /^DKM-\d{8}-\d{6}-\d{3}$/.test(b.Numer || ''), b.Numer);
  check('klient jednym wierszem: osoba i firma', b.Klient === 'Jan Testowy', b.Klient);
  check('dane kontaktowe w zgłoszeniu',
    b['E-mail'] === 'jan.testowy@example.com' && b.Telefon === '500600700');
  // zgłoszenie idzie wyłącznie na skrzynkę firmy — nic nie wraca do klienta
  check('zgłoszenie nie ustawia adresu zwrotnego na klienta', !('_replyto' in b));
  check('adres dostawy w zgłoszeniu', b['Adres dostawy'] === '3 Maja 20, 87-640 Czernikowo', b['Adres dostawy']);
  check('adres dostawy w treści maila', (b['Szczegóły'] || '').includes('Adres dostawy: 3 Maja 20, 87-640 Czernikowo'));
  // domyślną płatnością jest pobranie (właściciel, 21.09.2026) — pole musi nieść
  // płatność SKUTECZNĄ, bo po przekroczeniu limitu przewoźnika wraca proforma
  check('dostawa i płatność', b.Dostawa === 'Kurier / spedycja' && /Za pobraniem/.test(b['Płatność'] || ''),
    b.Dostawa + ' / ' + b['Płatność']);
  check('wartość netto podana kwotą', /\d.*zł/.test(b['Wartość netto'] || ''), b['Wartość netto']);
  check('pełna treść maila dołączona', (b['Szczegóły'] || '').includes('ZAMÓWIENIE') && (b['Szczegóły'] || '').includes('Razem brutto'),
    String((b['Szczegóły'] || '').length) + ' znaków');
  // temat ma wystarczyć do decyzji bez otwierania maila
  check('temat zawiera numer, kwotę i klienta',
    (b._subject || '').includes(b.Numer || 'x') && /zł netto/.test(b._subject || '')
    && (b._subject || '').includes('Jan Testowy'), b._subject);
  // skrót do skompletowania towaru — bez niego magazyn czyta całą specyfikację
  const poz = b['Pozycje'] || '';
  check('pozycje z SKU przekładni i ceną',
    /SKU przekładni: DKM\d{3}[^\n]*\d+ szt\. × [^\n]*zł netto/.test(poz), poz.split('\n')[1]);
  check('pozycje z SKU silnika i ceną',
    /SKU silnika: [^\n]*\d+ szt\. × [^\n]*zł netto/.test(poz), poz.split('\n')[2]);
  check('pozycje ze współczynnikiem pracy', /współczynnik pracy przekładni: fs = /.test(poz),
    poz.split('\n')[3]);
  // rozbite dane kontaktowe wracały w mailu drugi raz — te pola mają nie wrócić
  check('bez pól powtarzających dane kontaktowe',
    !('imie' in b) && !('nazwisko' in b) && !('firma' in b), Object.keys(b).join(', '));

  // numer na ekranie musi być tym samym, co w wysłanym zgłoszeniu
  const shown = (await page.locator('text=Numer zgłoszenia').textContent()).replace('Numer zgłoszenia: ', '').trim();
  check('numer na ekranie zgodny z wysłanym', shown === b.Numer, shown + ' / ' + b.Numer);

  // blokada dubli — trzy dotknięcia po sukcesie
  await page.locator('[data-order-btn]').click({ force: true }).catch(() => {});
  await page.locator('[data-order-btn]').click({ force: true }).catch(() => {});
  await page.waitForTimeout(500);
  check('blokada dubli: kolejne kliknięcia nie tworzą nowych zamówień', posts.length === 1, posts.length + ' żądań');

  // zdarzenie analityczne o wysłanym zamówieniu
  const layer = await dl(page);
  check('zdarzenie submit_order z formą płatności',
    layer.some((a) => a[0] === 'event' && a[1] === 'submit_order' && a[2] && a[2].payment === 'pobranie'));

  // po 5 s powrót na start i wyczyszczony koszyk
  await page.waitForTimeout(6000);
  const home = await page.locator('text=Znajdźmy napęd idealny').isVisible();
  const cart = await page.evaluate(() => localStorage.getItem('dkm-rfq-v2'));
  check('po wysłaniu zamówienia powrót na ekran startowy', home);
  check('koszyk wyczyszczony po zamówieniu', !cart || cart === '[]', String(cart).slice(0, 40));
  await ctx.close();
}

// 7b. Skrót „Pozycje" to lista do skompletowania towaru — musi zawierać
//     wyposażenie. Bez niego magazyn widział samą przekładnię i silnik,
//     a falownik, ramię i wał zdawczy zostawały tylko w „Szczegółach"
//     na końcu maila. Właściciel wyłapał to 20.09.2026: skrót pokazywał
//     830 zł przy pozycji wartej 1 580 zł.
{
  const { ctx, page, posts } = await open({ consent: 'no' });
  await addToCart(page);
  // dobieramy w koszyku to, co magazyn musi zdjąć z półki razem z przekładnią
  const dobrane = [];
  for (const wzor of ['\\+ Ramię reakcyjne', '\\+ Wał zdawczy jednostronny', '\\+ Falownik 400 V']) {
    const ok = await page.evaluate((rx) => {
      const re = new RegExp(rx);
      const b = [...document.querySelectorAll('button')].find((x) => re.test(x.innerText));
      if (b) { b.click(); return true; } return false;
    }, wzor);
    if (ok) dobrane.push(wzor.replace('\\+ ', ''));
    await page.waitForTimeout(250);
  }
  check('w koszyku da się dobrać wyposażenie', dobrane.length === 3, dobrane.join(' · '));
  await fillContact(page);
  await page.getByRole('button', { name: /Zapoznałem się z/ }).click();
  await page.locator('[data-order-btn]').click();
  await page.waitForSelector('text=Numer zgłoszenia', { timeout: 15000 });
  const poz = String(((posts[0] || {}).body || {}).Pozycje || '');
  check('skrót pozycji wymienia dobrane wyposażenie',
    /wyposażenie:/.test(poz) && /Ramię reakcyjne/.test(poz)
    && /Wał zdawczy jednostronny/.test(poz) && /Falownik/.test(poz),
    poz.replace(/\n/g, ' | ').slice(0, 200));
  // suma w skrócie musi zgadzać się z tym, co klient widział w koszyku
  const zlicz = (t) => { const m = /(\d[\d\s]*)zł/.exec(t || ''); return m ? parseInt(m[1].replace(/\D/g, ''), 10) : null; };
  const suma = zlicz(poz.slice(poz.indexOf('wartość pozycji netto')));
  const skladniki = (poz.match(/=\s*(\d[\d\s]*)zł/g) || []).map((x) => zlicz(x));
  const sku = (poz.match(/·\s*\d+ szt\. × (\d[\d\s]*)zł netto/g) || []).map((x) => zlicz(x));
  check('wartość pozycji w skrócie = przekładnia + silnik + wyposażenie',
    suma === [...skladniki, ...sku].reduce((a, b) => a + b, 0),
    suma + ' vs ' + [...skladniki, ...sku].join(' + '));
  await ctx.close();
}

// 7c. Biuro kompletuje towar po kodach z Optimy, nie po nazwie handlowej.
//     Kod osprzętu trzeci rok nie istniał w cenniku — generator go gubił,
//     zostawała cena i stan. Podstawiamy tu sekcję opt z kodem i sprawdzamy,
//     że mail go pokazuje; starszy cennik bez kodu ma po prostu go pominąć.
{
  const ctx = await browser.newContext({ viewport: { width: 520, height: 900 } });
  const posts = [];
  await ctx.route(/googletagmanager\.com|google-analytics\.com/, (r) =>
    r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await ctx.route(/formspree\.io/, async (r) => {
    posts.push({ body: JSON.parse(r.request().postData() || '{}') });
    await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await ctx.addInitScript(() => {
    try { localStorage.setItem('dkm-analytics-consent', 'no'); } catch (e) {}
    let v;
    Object.defineProperty(window, 'DKM_PRICE', {
      configurable: true,
      get: () => v,
      set: (x) => { v = x; if (x && x.opt) for (const k in x.opt) {
        // cennik sprzed 20.09.2026 nosi tylko [cena, stan] — dokładamy kod,
        // żeby test sprawdzał mechanizm, a nie datę pliku z cenami
        if (x.opt[k].length < 3) x.opt[k][2] = 'KOD ' + k.replace('|', ' ');
      } },
    });
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Znajdźmy napęd idealny', { timeout: 20000 });
  await addToCart(page);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /\+ Ramię reakcyjne/.test(x.innerText));
    if (b) b.click();
  });
  await page.waitForTimeout(300);
  await fillContact(page);
  await page.getByRole('button', { name: /Zapoznałem się z/ }).click();
  await page.locator('[data-order-btn]').click();
  await page.waitForSelector('text=Numer zgłoszenia', { timeout: 15000 });
  const poz = String(((posts[0] || {}).body || {}).Pozycje || '');
  // Kod może być prawdziwy (cennik od 21.09.2026 niesie go z raportu) albo
  // podstawiony wyżej dla starszego pliku — sprawdzamy mechanizm, nie datę
  // cennika, więc wystarczy, że w nawiasie stoi jakikolwiek kod magazynowy.
  check('skrót podaje kod magazynowy osprzętu',
    /Ramię reakcyjne \[[^\]\n]+\]/.test(poz),
    (poz.match(/· Ramię reakcyjne[^\n]*/) || ['brak'])[0]);
  // falownik ma kod w samej nazwie — nie powielamy go w nawiasie
  check('kod nie dubluje się tam, gdzie jest już w nazwie',
    !/E500-[^\s]+[^\n]*\[/.test(poz), (poz.match(/· Falownik[^\n]*/) || ['brak falownika w tym koszyku'])[0]);
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

  // Na GitHub Pages działa polityka ze znacznika meta, na własnym serwerze ta z nginx.
  // Gdy się rozjadą, aplikacja zachowa się inaczej w obu miejscach — a testy sprawdzają
  // tylko jedną z nich. Stąd porównanie reguła po regule.
  {
    const html = await readFile(join(root, 'index.html'), 'utf8');
    const meta = (/content="(default-src[^"]+)"/.exec(html) || [, ''])[1];
    const nginxOnly = ['frame-ancestors', 'upgrade-insecure-requests'];
    const rozbij = (s) => s.split(';').map((x) => x.trim()).filter(Boolean)
      .filter((x) => !nginxOnly.some((k) => x.startsWith(k)));
    const a = rozbij(meta).sort(), b = rozbij(csp).sort();
    const roznice = a.filter((x) => !b.includes(x)).concat(b.filter((x) => !a.includes(x)));
    check('polityka w index.html zgodna z tą w nginx.conf', roznice.length === 0,
      roznice.join(' | ').slice(0, 200));
    // bez tych adresów tagi Google Ads wstawione przez Tag Managera byłyby blokowane
    for (const host of ['https://www.googleadservices.com', 'https://*.doubleclick.net']) {
      check('CSP dopuszcza ' + host, meta.includes(host));
    }
    check('CSP nie otwiera skryptów osadzonych w treści', !/script-src[^;]*'unsafe-inline'/.test(meta),
      (/script-src[^;]*/.exec(meta) || [''])[0].slice(0, 120));
  }

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
  // Wersja testowa (build:test) ma noindex, zakaz w robots.txt i czerwony pasek.
  // Gdyby którakolwiek z tych rzeczy trafiła na produkcję, Google przestałby
  // indeksować konfigurator — i nikt by tego nie zauważył przez tygodnie.
  {
    const html = await readFile(join(root, 'index.html'), 'utf8');
    check('produkcja bez zakazu indeksowania', !/name="robots"[^>]*noindex/.test(html));
    check('produkcja bez zakazu w robots.txt', !/Disallow:\s*\/\s*$/m.test(robots), robots.trim());
    check('produkcja bez paska wersji testowej', !html.includes('dkm-test'));
  }
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
    ['?start=p1', 'Moc silnika P', '/dobor/kryterium/moc-silnika'],
    ['?start=i', 'Przełożenie i', '/dobor/kryterium/przelozenie'],
    ['?start=n2', 'Prędkość obrotowa na wale', '/dobor/kryterium/predkosc'],
    ['?start=m2', 'Wymagania maszyny', '/dobor/kryterium/moment'],
    ['?start=bore', 'Średnica wału', '/dobor/kryterium/srednica-walu'],
    ['?start=swap', 'Masz już przekładnię innej marki?', '/dobor/zamiennik'],
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

  // GA4 musi umieć odróżnić wejście z linku od przejścia z ekranu startowego
  {
    const { ctx, page } = await wejdz('?start=swap&q=NMRV063', { consent: 'yes' });
    const layer = await dl(page);
    const zdarz = layer.filter((a) => a[0] === 'event' && a[1] === 'link_entry').map((a) => a[2] || {});
    check('wejście z linku zgłasza zdarzenie link_entry z kryterium',
      zdarz.length === 1 && zdarz[0].criterion === 'swap', JSON.stringify(zdarz));
    await ctx.close();
  }
  {
    const { ctx, page } = await open({ consent: 'yes' });   // zwykłe wejście na stronę
    const layer = await dl(page);
    check('zwykłe wejście na stronę nie zgłasza link_entry',
      !layer.some((a) => a[0] === 'event' && a[1] === 'link_entry'));
    await ctx.close();
  }

  // czyszcząc adres nie wolno wyciąć utm_… — po nich GA4 poznaje źródło wejścia
  {
    const { ctx, page } = await wejdz(
      '?utm_source=blog&utm_medium=link&start=p1&utm_campaign=nmrv&q=x', { consent: 'yes' });
    const par = new URL(page.url()).searchParams;
    check('parametry utm_… zostają w adresie po wyczyszczeniu start=',
      par.get('utm_source') === 'blog' && par.get('utm_medium') === 'link'
      && par.get('utm_campaign') === 'nmrv' && !par.has('start') && !par.has('q'),
      new URL(page.url()).search);
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

console.log('\n— Przekładnie łączone DRV (cena ze składników) —');

// 11. Cena zespołu DRV nie stoi w cenniku — składa ją logic.js z czterech
//     pozycji magazynowych (człon 1 + łącznik + człon 2 + silnik). Gdyby to
//     przestało działać, DRV wróciłoby po cichu do „zapytaj o cenę": aplikacja
//     działałaby dalej, tylko przestałaby sprzedawać przekładnie łączone.
{
  const ctx = await browser.newContext({ viewport: { width: 520, height: 1200 } });
  await ctx.route(/googletagmanager\.com|google-analytics\.com/, (r) =>
    r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  // decyzja o analityce podjęta z góry — inaczej baner zasłania przyciski
  await ctx.addInitScript(() => {
    try { localStorage.setItem('dkm-analytics-consent', 'no'); } catch (e) {}
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '?start=i', { waitUntil: 'networkidle' });

  // i = 1500 mają wyłącznie zespoły łączone — pojedyncza przekładnia kończy się na i100
  const kafelek = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')]
      .find((x) => /^\s*1500\b/.test(x.innerText.replace(/\n/g, ' ')));
    if (b) { b.click(); return true; } return false;
  });
  check('kryterium przełożenia ma kafelek i = 1500 (tylko DRV)', kafelek);
  await page.getByRole('button', { name: /Dalej · warunki pracy/ }).click();
  await page.getByRole('button', { name: /Pokaż wyniki/ }).click();
  await page.waitForTimeout(400);

  // kwoty na ekranie mają spację jako separator tysięcy („1 480 zł") — i to nie
  // zwykłą, więc grupę cyfr czytamy razem ze wszystkimi odmianami odstępu
  const zl = (t) => {
    const m = /(\d[\d\s]*)zł/.exec(t || '');
    return m ? parseInt(m[1].replace(/\D/g, ''), 10) : null;
  };
  const wiersze = await page.evaluate(() => [...document.querySelectorAll('button')]
    .filter((x) => /^DRV\d/.test(x.innerText)).map((x) => x.innerText.replace(/\n/g, ' ')));
  check('wyniki dla i = 1500 to zespoły DRV', wiersze.length > 0, wiersze.length + ' pozycji');
  const zCena = wiersze.filter((t) => zl(t) > 0);
  check('zespoły DRV mają policzoną cenę przekładni, nie „na zapytanie"',
    zCena.length > 0, zCena.length + '/' + wiersze.length + ' z ceną');
  // termin dostawy wolno obiecać tylko wtedy, gdy cena jest policzona do końca
  check('DRV bez pełnej ceny nie obiecuje terminu',
    !wiersze.some((t) => /zapytaj o cenę/.test(t) && /składamy/.test(t)),
    wiersze.join(' || ').slice(0, 200));

  // karta: cena zestawu to suma przekładni i silnika — bierzemy pozycję
  // wycenioną do końca, bo tylko taka ma obie liczby
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')]
      .find((x) => /^DRV\d/.test(x.innerText) && !/zapytaj o cenę/.test(x.innerText));
    if (b) b.click();
  });
  await page.waitForTimeout(500);
  const karta = await page.evaluate(() => document.body.innerText);
  const sekcja = (n) => { const i = karta.indexOf(n); return i < 0 ? '' : karta.slice(i, i + 90); };
  const przekl = zl(sekcja('PRZEKŁADNIA — CENA NETTO'));
  const silnik = zl(sekcja('SILNIK — CENA NETTO'));
  const zestaw = zl(sekcja('ZESTAW NETTO'));
  const mont = zl(sekcja('Montaż zestawu'));
  check('karta DRV podaje cenę przekładni i silnika osobno',
    przekl > 0 && silnik > 0, przekl + ' + ' + silnik);
  check('cena zestawu DRV = przekładnia + silnik + wyposażenie',
    zestaw === przekl + silnik + (mont || 0),
    zestaw + ' vs ' + (przekl + silnik + (mont || 0)));

  // koszyk: dopłata za montaż to usługa bez masy — nie może kasować ceny wysyłki
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Dodaj do koszyka/i.test(x.innerText));
    if (b) b.click();
  });
  await page.locator('h2', { hasText: 'Zamówienie' }).waitFor();
  const koszyk = await page.evaluate(() => document.body.innerText);
  // DRV jedzie luzem do samodzielnego montażu — złożenie jest wyborem klienta,
  // więc dopłaty nie wolno doliczyć domyślnie, tylko zaproponować do dobrania
  check('montaż nie jest doliczany domyślnie, tylko do dobrania',
    !/Montaż zestawu[\s\S]{0,40}\d+\s*zł/.test(koszyk.split('CZY TWÓJ NAPĘD')[0])
    && /\+ Montaż zestawu/.test(koszyk),
    (koszyk.match(/\+ Montaż zestawu[^\n]*/) || ['brak propozycji'])[0]);
  const przedMont = zl(koszyk.slice(koszyk.indexOf('WARTOŚĆ POZYCJI')));
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /\+ Montaż zestawu/.test(x.innerText));
    if (b) b.click();
  });
  await page.waitForTimeout(400);
  const zMont = await page.evaluate(() => document.body.innerText);
  check('dobrany montaż dokłada 60 zł do pozycji',
    zl(zMont.slice(zMont.indexOf('WARTOŚĆ POZYCJI'))) === przedMont + 60,
    przedMont + ' → ' + zl(zMont.slice(zMont.indexOf('WARTOŚĆ POZYCJI'))));
  // montaż to usługa bez masy — nie może skasować ceny wysyłki
  check('koszyk z DRV wycenia wysyłkę (montaż nie gubi masy)',
    !/masa do potwierdzenia/.test(zMont), zMont.slice(zMont.indexOf('Wysyłka'), zMont.indexOf('Wysyłka') + 120).replace(/\n/g, ' '));
  check('droga DRV bez błędu w konsoli', errors.length === 0, errors.join(' | ').slice(0, 160));
  await ctx.close();

  // 12. Cena i stan łącznika MUSZĄ pochodzić z cennika, nie ze zrzutu
  //     w drv-katalog.json. Zrzut nikogo nie pilnuje — 11.09.2026 ŁĄCZNIK
  //     063/110 podrożał w Optimie ze 120 na 150 zł i wszystkie 17 zespołów
  //     DRV063/130 pokazywało cenę o 30 zł za niską. Cicho, bez błędu.
  //     Dlatego podstawiamy tu sekcję lac i sprawdzamy, że aplikacja liczy
  //     z niej, a nie ze zrzutu — po kodzie łącznika, dokładnie tak jak
  //     silnik bierze się po SKU.
  async function kartaDrv(lac) {
    const c = await browser.newContext({ viewport: { width: 520, height: 1200 } });
    await c.route(/googletagmanager\.com|google-analytics\.com/, (r) =>
      r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
    await c.addInitScript((stub) => {
      try { localStorage.setItem('dkm-analytics-consent', 'no'); } catch (e) {}
      if (!stub) return;
      // cennik ustawia window.DKM_PRICE raz, przy wczytaniu price-data.js —
      // podstawiamy sekcję w momencie tego przypisania, przed startem aplikacji
      let v;
      Object.defineProperty(window, 'DKM_PRICE', {
        configurable: true,
        get: () => v,
        set: (x) => { v = x; if (x) x.lac = stub; },
      });
    }, lac);
    const p = await c.newPage();
    await p.goto(base + '?start=i', { waitUntil: 'networkidle' });
    await p.evaluate(() => {
      const b = [...document.querySelectorAll('button')]
        .find((x) => /^\s*1500\b/.test(x.innerText.replace(/\n/g, ' ')));
      if (b) b.click();
    });
    await p.getByRole('button', { name: /Dalej · warunki pracy/ }).click();
    await p.getByRole('button', { name: /Pokaż wyniki/ }).click();
    await p.waitForTimeout(300);
    await p.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /^DRV063\/130/.test(x.innerText));
      if (b) b.click();
    });
    await p.waitForTimeout(400);
    const t = await p.evaluate(() => document.body.innerText);
    const wytnij = (n) => { const i = t.indexOf(n); return i < 0 ? '' : t.slice(i, i + 120); };
    await c.close();
    return { gear: zl(wytnij('PRZEKŁADNIA — CENA NETTO')), dost: wytnij('PRZEKŁADNIA — CENA NETTO') };
  }

  const bez = await kartaDrv(null);
  // DRV063/130 i1500 składa się na łączniku 063/110 — DKM130 z przełożeniem 30
  // ma cenę wyłącznie w IEC 100/112, więc „wyjątek" jest tu jedynym wykonaniem
  const drozej = await kartaDrv({ 'ŁĄCZNIK 063/110': [1150, 1] });
  check('cena łącznika z cennika (lac) wygrywa ze zrzutem w drv-katalog.json',
    bez.gear > 0 && drozej.gear === bez.gear + 1000,
    bez.gear + ' → ' + drozej.gear + ' (oczekiwane ' + (bez.gear + 1000) + ')');

  // inny kod nie może ruszyć ceny — dowód, że kluczujemy po właściwym łączniku
  const obcy = await kartaDrv({ 'ŁĄCZNIK 030/040': [9999, 1] });
  check('podmiana ceny innego łącznika nie rusza tego zespołu',
    obcy.gear === bez.gear, bez.gear + ' → ' + obcy.gear);

  // brak łącznika na stanie to brak terminu dostawy — zestawu nie ma z czego złożyć
  const bezStanu = await kartaDrv({ 'ŁĄCZNIK 063/110': [150, 0] });
  check('stan łącznika z cennika zabiera zespołowi termin dostawy',
    /termin potwierdzimy/.test(bezStanu.dost), bezStanu.dost.replace(/\n/g, ' ').slice(0, 90));

  // 13. Nazwa i oznaczenie zespołu — ustalone z właścicielem 10.09.2026:
  //     „dla klienta nie podajemy z czego się składa tylko zapis Motoreduktor
  //      łączony DRV050/110 z silnikiem jednofazowym lub trójfazowym, 0,12 kW,
  //      i = 3000, 0,47 obr/min … a SKU w aplikacji będzie DRV050/110 +
  //      0,12KW I3000, a dla jednofazowych 1F".
  //     Kod w formacie pojedynczej przekładni („DRV063/130 71B14 I1500")
  //     nie istnieje w magazynie, a wygląda jak prawdziwy — nie wolno mu się
  //     pokazać ani klientowi, ani w zamówieniu.
  {
    const { ctx: c2, page: p2, posts: wyslane } = await open({ consent: 'no' });
    await p2.getByRole('button', { name: /Przełożenie/ }).first().click();
    await p2.evaluate(() => {
      const b = [...document.querySelectorAll('button')]
        .find((x) => /^\s*1500\b/.test(x.innerText.replace(/\n/g, ' ')));
      if (b) b.click();
    });
    await p2.getByRole('button', { name: /Dalej · warunki pracy/ }).click();
    await p2.getByRole('button', { name: /Pokaż wyniki/ }).click();
    await p2.waitForTimeout(300);
    await p2.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /^DRV063\/130/.test(x.innerText));
      if (b) b.click();
    });
    await p2.waitForTimeout(400);
    await p2.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /Dodaj do koszyka/i.test(x.innerText));
      if (b) b.click();
    });
    await p2.locator('h2', { hasText: 'Zamówienie' }).waitFor();
    const koszyk2 = (await p2.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
    check('koszyk nie pokazuje kodu pojedynczej przekładni przy DRV',
      !/DRV063\/130 71B\d+ I1500/.test(koszyk2),
      (koszyk2.match(/DRV063\/130 71B\d+ I1500/g) || ['brak takiego kodu']).join(' | '));

    // zamówienie: biuro musi dostać oznaczenie zespołu i skład do sprawdzenia
    await fillContact(p2);
    await p2.getByRole('button', { name: /Zapoznałem się z/ }).click();
    await p2.locator('[data-order-btn]').click();
    await p2.waitForSelector('text=Numer zgłoszenia', { timeout: 15000 });
    const tresc = JSON.stringify((wyslane[0] || {}).body || {});
    check('zamówienie nosi nazwę „Motoreduktor łączony … z silnikiem …, i = …"',
      tresc.includes('Motoreduktor łączony DRV063/130 z silnikiem trójfazowym, 0,37 kW, i = 1500, 0,93 obr/min'),
      (tresc.match(/Motoreduktor łączony[^"\\]*/) || ['brak'])[0].slice(0, 130));
    check('zamówienie niesie SKU zespołu DRV, nie kod pojedynczej przekładni',
      tresc.includes('DRV063/130 + 0,37KW I1500') && !/DRV063\/130 71B\d+ I1500/.test(tresc),
      (tresc.match(/DRV063\/130[^"\\]*I1500[^"\\]*/g) || ['brak']).join(' | ').slice(0, 140));
    check('zamówienie niesie skład zespołu do sprawdzenia przez biuro',
      /DO ZŁOŻENIA/.test(tresc) && /ŁĄCZNIK 063\/110/.test(tresc),
      (tresc.match(/ŁĄCZNIK[^"\\]*/g) || ['brak']).join(' | ').slice(0, 140));
    await c2.close();
  }

  // 14. Mocowanie i wyposażenie DRV dziedziczy po członie 2 — właściciel,
  //     10.09.2026: „człon 2 to daje, a to ta sama przekładnia", powtórzone
  //     21.09.2026: „w DRV to wszystkie wymiary wyposażenie powinny być
  //     z 2 członu DRV".
  //
  //     Generator kopiuje tabele z dims-data.js pod nazwę zespołu, bo cały kod
  //     kluczuje po nazwie korpusu. Przez pierwsze dni kopiował tylko trzy
  //     z dziesięciu, więc ekran „Sposób mocowania" pisał przy DRV „brak dla
  //     tej wielkości" przy mocowaniu bocznym, czołowym i ramieniu reakcyjnym
  //     — czyli aplikacja odmawiała sprzedaży czegoś, co DKM ma na półce,
  //     bez żadnego błędu. Test porównuje zespół z jego członem 2 wartość po
  //     wartości, więc pominięcie kolejnej tabeli wyjdzie od razu.
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const w = await page.evaluate(() => {
      const T = ['DKM_BORE', 'DKM_FOOT', 'DKM_SIDE', 'DKM_FACE', 'DKM_ARM', 'DKM_PCV',
                 'DKM_SHAFT', 'DKM_SHAFT_DS_L1', 'DKM_BOLT'];
      const jr = (x) => JSON.stringify(x === undefined ? null : x);
      const P = window.DKM_PRICE || {};
      const optOf = (c, b) => (P.opt || {})[c + '|' + b] || null;
      // dokładnie warunek mountBrak() z logic.js
      const brak = (b) => ({
        '1a': !(window.DKM_FOOT || {})[b], '1b': !(window.DKM_SIDE || {})[b],
        '1c': !(window.DKM_FACE || {})[b], '3': !(window.DKM_ARM || {})[b],
        '2a': !optOf('FA', b) && !((window.DKM_FLANGE || {}).FA || {})[b],
        '2b': !optOf('FB', b) && !((window.DKM_FLANGE || {}).FB || {})[b],
      });
      const rozjazdy = [], mocowania = [];
      const Z = (window.DKM_DRV || {}).zespoly || {};
      for (const [z, o] of Object.entries(Z)) {
        for (const t of T)
          if (jr((window[t] || {})[z]) !== jr((window[t] || {})[o.czlon2]))
            rozjazdy.push(z + ' · ' + t);
        for (const typ of ['FA', 'FB']) {
          const tab = (window.DKM_FLANGE || {})[typ] || {};
          if (jr(tab[z]) !== jr(tab[o.czlon2])) rozjazdy.push(z + ' · DKM_FLANGE.' + typ);
        }
        const a = brak(z), b = brak(o.czlon2);
        for (const id of Object.keys(a))
          if (a[id] !== b[id]) mocowania.push(z + ' · ' + id);
      }
      return { ile: Object.keys(Z).length, tabel: T.length + 2, rozjazdy, mocowania };
    });
    check('DRV dziedziczy po członie 2 wszystkie tabele wymiarów i osprzętu',
      w.ile === 8 && w.rozjazdy.length === 0,
      w.ile + ' zespołów × ' + w.tabel + ' tabel' + (w.rozjazdy.length ? ' — ROZJAZD: ' + w.rozjazdy.join(', ') : ''));
    check('ekran mocowania oferuje przy DRV to samo co przy samym członie 2',
      w.mocowania.length === 0,
      w.mocowania.length ? 'różni się: ' + w.mocowania.join(', ') : 'zgodne we wszystkich zespołach');
    await ctx.close();
  }

  // 15. Kołnierz silnika przy DRV pochodzi z tabeli pojedynczych przekładni dla
  //     CZŁONU 1 — właściciel, 21.09.2026: „ten sam silnik, te same przekładnie,
  //     tylko że to człon 1 do DRV".
  //
  //     Generator składał go wcześniej z samej wielkości silnika (`iec+'B14/B5'`)
  //     i przy DKM040 z 0,09 kW wychodziło `56B14`, którego dla przekładni nie ma
  //     w ofercie. Pięć wierszy oferowało wykonanie niemożliwe do zamówienia —
  //     ceny i tak nie miały, więc na ekranie nic nie było widać.
  //
  //     Porównujemy W OBRĘBIE TEJ SAMEJ WIELKOŚCI silnika: tabela pojedyncza ma
  //     na każdą wielkość osobny wiersz z własnym momentem i własnym fs
  //     (DKM040 i10 0,25 kW: IEC 63 → m2 15 Nm fs 2,7; IEC 71 → 14 Nm fs 2,8),
  //     a wielkość wiersza DRV ustala tabela wydajności producenta.
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const w = await page.evaluate(() => {
      const C = window.DKM_CATALOG || [];
      const poj = C.filter((r) => !r.drv), drv = C.filter((r) => r.drv);
      const rozbij = (f) => {
        const m = String(f).match(/^(\d+)(.*)$/);
        return m ? m[2].split('/').map((x) => m[1] + (x.startsWith('B') ? x : 'B' + x)) : [String(f)];
      };
      const Z = (window.DKM_DRV || {}).zespoly || {};
      const zle = [];
      for (const r of drv) {
        const c1 = (Z[r.box] || {}).czlon1;
        // napis kołnierza ma być PRZEPISANY z wiersza pojedynczej przekładni dla
        // członu 1, znak w znak — wtedy zespół dopuszcza dokładnie to samo
        // co ta przekładnia sprzedawana osobno, i nic nie jest zgadywane
        const pasuje = poj.filter((x) => x.box === c1 && x.p1 === r.p1
          && Number(x.rpm) === Number(r.rpm) && Number(x.i) === Number(r.i1));
        if (!pasuje.length) { zle.push(r.box + ' i' + r.i + ' — brak wiersza ' + c1); continue; }
        if (!pasuje.some((x) => String(x.flange) === String(r.flange)))
          zle.push(r.box + ' i' + r.i + ' ma „' + r.flange + '", a ' + c1 + ' i' + r.i1
            + ' ma ' + [...new Set(pasuje.map((x) => '„' + x.flange + '"'))].join(' / '));
        // dodatkowo: każdy pojedynczy kołnierz musi dać się rozłożyć
        if (!rozbij(r.flange).length) zle.push(r.box + ' i' + r.i + ' — nieczytelny kołnierz');
      }
      return { ile: drv.length, zle };
    });
    check('kołnierz silnika przy DRV jest taki jak przy samym członie 1',
      w.ile === 107 && w.zle.length === 0,
      w.ile + ' wierszy' + (w.zle.length ? ' — ROZJAZD: ' + w.zle.join(', ') : ''));
    // żaden kołnierz nie może być zmyślony: każdy musi mieć wiersz w tabeli
    // pojedynczej, inaczej aplikacja proponuje wykonanie, którego nie ma
    check('żaden kołnierz DRV nie jest zmyślony',
      !w.zle.some((x) => /brak wiersza/.test(x)),
      w.zle.filter((x) => /brak wiersza/.test(x)).join(', ') || 'każdy ma wiersz w tabeli pojedynczej');
    await ctx.close();
  }

  // 16. Opakowanie wchodzi do masy, którą waży przewoźnik — właściciel,
  //     21.09.2026: „paczka będzie skasowana za 40 zł, a DPD policzy nas 50,
  //     bo paczka była cięższa". Karton 2 kg na każdą paczkę, paleta 25 kg raz
  //     na przesyłkę. Bez tego wycena była zaniżona i różnicę dopłacała firma.
  //
  //     DKM075 z silnikiem 2,2 kW to towar 9 + 22 = 31 kg. Bez kartonu mieścił
  //     się w jednej taniej paczce (limit 31 kg, 25 zł); z kartonem już nie,
  //     więc jadą dwie paczki po 25 zł. Świadomie NIE łączymy ich w jedną
  //     cięższą za 40 zł: klient zapłaciłby 40, a kurier skasowałby firmę
  //     wyżej — próg 31–40 kg zostaje tylko dla sztuki nierozbijalnej.
  {
    const { ctx, page } = await open({ consent: 'no' });
    await page.getByRole('button', { name: /Moc silnika/ }).first().click();
    await page.locator('button').filter({ hasText: /^\s*2,2\s*kW/ }).first().click();
    await page.getByRole('button', { name: /Dalej · warunki pracy/ }).click();
    await page.getByRole('button', { name: /Pokaż wyniki/ }).click();
    await page.waitForTimeout(400);
    const otwarte = await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /^DKM075/.test(x.innerText));
      if (b) { b.click(); return b.innerText.split('\n')[0]; } return null;
    });
    check('karta DKM075 przy 2,2 kW otwarta', !!otwarte, otwarte || 'nie znalazłem wiersza');
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Dodaj do koszyka/ }).click();
    await page.locator('h2', { hasText: 'Zamówienie' }).waitFor();
    const linia = await page.evaluate(() => {
      const e = [...document.querySelectorAll('*')].filter((x) => x.children.length === 0
        && /Wysyłka/.test(x.textContent || ''));
      const p = e.length ? e[0].closest('div').parentElement : null;
      return (p ? p.innerText : document.body.innerText).replace(/\n/g, ' ');
    });
    // towar 31 kg → dwie paczki brutto 24 i 11 kg, po 25 zł
    // 2 × 25 zł + 5 zł pobrania = 55 zł; jedna paczka dałaby 30 zł, więc liczba
    // nadal rozróżnia podział na paczki, tylko niesie domyślną dopłatę
    check('karton dzieli paczkę 31 kg na dwie — 2 × 25 zł, nie 1 × 25 zł',
      /2 paczki/.test(linia) && /55 zł netto/.test(linia),
      (linia.match(/Wysyłka[^|]{0,120}/) || ['brak'])[0]);
    // Masa przy „Wysyłce" jest BRUTTO — towar plus karton na każdą paczkę.
    // Nie przypinamy kilogramów na sztywno: aplikacja dobiera silnik po
    // dostępności i cenie, więc masa zależy od cennika. Sprawdzamy regułę —
    // pokazana masa minus kartony musi być masą któregoś silnika 2,2 kW
    // z cennika powiększoną o masę DKM075.
    const razem = parseFloat(((linia.match(/Wysyłka\D*([\d,]+) kg/) || [])[1] || '0').replace(',', '.'));
    const masy = await page.evaluate(() => {
      const wt = (window.DKM_PRICE || {}).wt || {};
      const gear = (wt.gear || {}).DKM075 || 0;
      const mot = Object.entries(wt.mot || {}).filter(([k]) => /^2,2 /.test(k)).map(([, v]) => v);
      return { gear, mot };
    });
    check('masa przy „Wysyłce" jest brutto (towar + 2 kartony)',
      masy.gear > 0 && masy.mot.some((m) => Math.abs(masy.gear + m + 2 * 2 - razem) < 0.05),
      razem + ' kg = ' + masy.gear + ' + silnik 2,2 kW + 2 × 2 kg');
    // Masy poszczególnych paczek w opisie NIE pokazujemy — właściciel,
    // 21.09.2026: „masy poszczególnych paczek bym usunął". Zostaje liczba
    // paczek i masa całej przesyłki; cena 2 × 25 zł i tak dowodzi, że obie
    // paczki zmieściły się w tanim progu.
    //
    // W treści nie piszemy też „z kartonami" ani „z paletą" — właściciel,
    // 21.09.2026: „nie pisz z kartonami czy z paletą, bo to logiczne".
    check('opis kuriera nie wypisuje mas poszczególnych paczek',
      !/paczk\w*\s*\([^)]*kg/.test(linia),
      (linia.match(/kurier[^—]{0,60}/) || ['brak'])[0]);
    check('opis przesyłki nie dopisuje „z kartonami" ani „z paletą"',
      !/z kartonami|z palet/.test(linia),
      (linia.match(/kurier[^—]{0,60}/) || ['brak'])[0]);
    await ctx.close();
  }

  // 17. Paleta liczy się RAZ na przesyłkę i wchodzi do progu SPED_PROGI.
  //     Sprawdzamy na danych, żeby nie zależeć od jednego koszyka: dla każdego
  //     korpusu z listy SPED masa brutto musi być masą towaru powiększoną
  //     o paletę, a próg musi być liczony od brutto.
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const w = await page.evaluate(() => {
      const P = window.DKM_PRICE || {};
      const PROGI = [[100, 130], [150, 180], [200, 230], [300, 260], [Infinity, 340]];
      const prog = (kg) => (kg <= 40 ? null : (PROGI.find((p) => kg <= p[0]) || null));
      const zle = [];
      for (const box of ['DKM110', 'DKM130', 'DKM150']) {
        const g = (P.wt || {}).gear ? P.wt.gear[box] : null;
        if (!(g > 0)) { zle.push(box + ' — brak masy'); continue; }
        const bez = prog(g), z = prog(g + 25);
        if (!z) zle.push(box + ' — brutto ' + (g + 25) + ' kg bez progu');
        // sam korpus DKM130 (59 kg) jest w progu 40–100, z paletą 84 kg też;
        // chodzi o to, by próg BYŁ liczony od brutto, nie o konkretną kwotę
        if (bez && z && g + 25 > 100 && bez[1] === z[1])
          zle.push(box + ' — paleta nie przesunęła progu przy ' + (g + 25) + ' kg');
      }
      return { zle };
    });
    check('paleta 25 kg wchodzi do progu spedycji, nie jest pomijana',
      w.zle.length === 0, w.zle.join(', ') || 'DKM110, DKM130 i DKM150 liczone od brutto');
    await ctx.close();
  }

  // 18. Próg darmowej wysyłki — właściciel, 21.09.2026: „od 5000 netto".
  //     Kwota stoi wyłącznie w SHIP_FREE, a treść na ekranie i w mailu bierze ją
  //     stamtąd. Wpisana drugi raz na sztywno rozjechałaby się przy następnej
  //     zmianie progu i klient czytałby inną kwotę, niż liczy koszyk — dokładnie
  //     ten sam błąd, który SPED_PROGI już raz naprawiły.
  //
  //     Nie przypinamy liczby do treści, tylko liczymy: „brakuje" plus wartość
  //     towaru musi dać próg, a po przekroczeniu progu wysyłka ma być gratis.
  {
    const { ctx, page } = await open({ consent: 'no' });
    await page.getByRole('button', { name: /Moc silnika/ }).first().click();
    await page.locator('button').filter({ hasText: /^\s*2,2\s*kW/ }).first().click();
    await page.getByRole('button', { name: /Dalej · warunki pracy/ }).click();
    await page.getByRole('button', { name: /Pokaż wyniki/ }).click();
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /^DKM075/.test(x.innerText));
      if (b) b.click();
    });
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Dodaj do koszyka/ }).click();
    await page.locator('h2', { hasText: 'Zamówienie' }).waitFor();
    const kwota = (txt, re) => {
      const m = txt.match(re);
      return m ? parseFloat(m[1].replace(/[\s  ]/g, '').replace(',', '.')) : null;
    };
    const przed = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
    const towar = kwota(przed, /Wartość towaru ([\d\s  ,]+) zł netto/);
    const brakuje = kwota(przed, /do darmowej wysyłki brakuje ([\d\s  ,]+) zł netto/);
    check('próg darmowej wysyłki wychodzi z jednej liczby (towar + brakuje = próg)',
      towar > 0 && brakuje > 0 && Math.abs(towar + brakuje - 5000) < 0.5,
      towar + ' + ' + brakuje + ' = ' + (towar + brakuje) + ' zł');
    // po przekroczeniu progu: gratis, a treść podaje ten sam próg
    await page.evaluate(() => {
      const plus = [...document.querySelectorAll('button')].filter((x) => x.innerText.trim() === '+');
      for (let i = 0; i < 6; i++) plus.forEach((b) => b.click());
    });
    await page.waitForTimeout(400);
    const po = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
    const prog = kwota(po, /Wysyłka gratis — zamówienie od ([\d\s  ,]+) zł netto/);
    check('po przekroczeniu progu wysyłka jest gratis i podaje ten sam próg',
      prog === 5000 && !/brakuje/.test(po),
      (po.match(/Wysyłka gratis[^R]{0,40}/) || ['brak napisu o darmowej wysyłce'])[0]);
    // stara kwota nie może zostać nigdzie w treści — to jest ten cichy rozjazd
    check('nigdzie nie została stara kwota 3 000 zł',
      !/3[\s  ]000 zł/.test(przed + ' ' + po),
      'ani przed progiem, ani po nim');
    await ctx.close();
  }

  // 19. Termin dostawy w koszyku — reguły od właściciela, 21.09.2026:
  //     kurier do 13:00 (DPD „dostarcza 95% przesyłek na drugi dzień" → piszemy
  //     „zwykle"), spedycja do 9:00 (Raben 1–3 dni robocze), godziny graniczne
  //     także w piątek, brak własnych dni wolnych poza kalendarzem świąt.
  //
  //     Zegar jest ZAMROŻONY, bo inaczej test sprawdzałby dzień, w którym akurat
  //     się uruchomił, a nie regułę. Dwie daty wybrane celowo: jedna zasłonięta
  //     świętem stałym (11 listopada), druga ruchomym (Boże Ciało 4 czerwca
  //     2026, liczone z Wielkanocy). Pomyłka w którymkolwiek to zła data
  //     u klienta — obietnica dnia, w którym kurier nie jeździ.
  async function zZegarem(kiedy) {
    const ctx = await browser.newContext({ viewport: { width: 520, height: 900 } });
    await ctx.route(/googletagmanager\.com|google-analytics\.com/,
      (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
    await ctx.addInitScript((ms) => {
      try { localStorage.setItem('dkm-analytics-consent', 'no'); } catch (e) {}
      const R = Date;
      const F = class extends R {
        constructor(...a) { if (a.length === 0) super(ms); else super(...a); }
        static now() { return ms; }
      };
      window.Date = F;
    }, kiedy.getTime());
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    // lekki koszyk → kurier; 0,25 kW mieści się w jednej paczce
    await page.getByRole('button', { name: /Moc silnika/ }).first().click();
    await page.locator('button').filter({ hasText: /^\s*0,25\s*kW/ }).first().click();
    await page.getByRole('button', { name: /Dalej · warunki pracy/ }).click();
    await page.getByRole('button', { name: /Pokaż wyniki/ }).click();
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /^DKM0/.test(x.innerText));
      if (b) b.click();
    });
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Dodaj do koszyka/ }).click();
    await page.locator('h2', { hasText: 'Zamówienie' }).waitFor();
    const panel = async () => {
      const t = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
      const m = t.match(/TERMIN (.{0,240})/);
      return m ? m[1] : '(brak panelu z terminem)';
    };
    const naPobranie = async () => {
      await fillContact(page);
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((x) => /pobraniem/i.test(x.innerText));
        if (b) b.click();
      });
      await page.waitForTimeout(200);
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((x) => /napęd/i.test(x.innerText));
        if (b) b.click();
      });
      await page.waitForTimeout(400);
      return panel();
    };
    const naProforme = async () => {
      await fillContact(page);
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((x) => /proforma/i.test(x.innerText));
        if (b) b.click();
      });
      await page.waitForTimeout(200);
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((x) => /nap\u0119d/i.test(x.innerText));
        if (b) b.click();
      });
      await page.waitForTimeout(400);
      return panel();
    };
    return { ctx, page, panel, naPobranie, naProforme };
  }

  // święto STAŁE: 11 listopada 2026 to środa, więc dostawa przeskakuje na czwartek
  {
    const { ctx, naPobranie } = await zZegarem(new Date(2026, 10, 10, 12, 0));
    const t = await naPobranie();
    check('termin omija święto stałe (11 listopada)',
      /Wysyłka jeszcze dziś/.test(t) && /w czwartek 12 listopada/.test(t),
      t.slice(0, 90));
    await ctx.close();
  }
  // święto RUCHOME: Boże Ciało 2026 wypada 4 czerwca (czwartek), liczone z Wielkanocy
  {
    const { ctx, naPobranie } = await zZegarem(new Date(2026, 5, 3, 12, 0));
    const t = await naPobranie();
    check('termin omija święto ruchome (Boże Ciało, liczone z Wielkanocy)',
      /Wysyłka jeszcze dziś/.test(t) && /w piątek 5 czerwca/.test(t),
      t.slice(0, 90));
    await ctx.close();
  }
  // godzina graniczna działa także w piątek — wysyłka w poniedziałek, nie w sobotę
  {
    const { ctx, naPobranie } = await zZegarem(new Date(2026, 8, 25, 15, 0));
    const t = await naPobranie();
    check('po 13:00 w piątek wysyłka idzie w poniedziałek, nie w weekend',
      /Wysyłka w poniedziałek/.test(t) && /we wtorek 29 września/.test(t),
      t.slice(0, 90));
    await ctx.close();
  }
  // proforma: daty NIE podajemy — aplikacja nie wie, kiedy wpłyną pieniądze
  {
    // proforma NIE jest już domyślna (od 21.09.2026 domyślne jest pobranie),
    // więc test musi ją wybrać — inaczej sprawdzałby domyślną ścieżkę
    const { ctx, naProforme } = await zZegarem(new Date(2026, 8, 22, 10, 0));
    const t = await naProforme();
    const MIES = /stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia/;
    check('przy proformie termin nie podaje konkretnej daty',
      /liczymy od zaksięgowania wpłaty/.test(t) && !MIES.test(t), t.slice(0, 100));
    // obietnica jest warunkowa, bo aplikacja czyta zegar telefonu klienta
    await ctx.close();
  }
  {
    const { ctx, naPobranie } = await zZegarem(new Date(2026, 8, 22, 10, 0));
    const t = await naPobranie();
    check('termin jest warunkowy, a nie twardą gwarancją',
      /do 13:00 wysyłamy tego samego dnia/.test(t) && /zwykle/.test(t),
      (t.match(/Zamówienia[^.]{0,70}\./) || ['brak zastrzeżenia'])[0]);
    await ctx.close();
  }

  // 20. Termin trafia do maila z zamówieniem — właściciel, 21.09.2026:
  //     „musimy wiedzieć, co obiecaliśmy". Biuro ma zobaczyć DOKŁADNIE ten sam
  //     tekst co klient, plus godzinę z jego zegara — bo aplikacja nie ma
  //     serwera i to jedyna godzina, jaką zna.
  {
    const { ctx, page, naPobranie } = await zZegarem(new Date(2026, 10, 10, 12, 0));
    const naEkranie = await naPobranie();
    const posty = [];
    await page.context().route(/formspree\.io/, async (r) => {
      posty.push(JSON.parse(r.request().postData() || '{}'));
      await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /Płatność/i.test(x.innerText));
      if (b) b.click();
    });
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Zapoznałem się z/ }).click();
    await page.locator('[data-order-btn]').click();
    await page.waitForSelector('text=Numer zgłoszenia', { timeout: 15000 });
    const mail = JSON.stringify(posty[0] || {});
    check('mail z zamówieniem niesie termin pokazany klientowi',
      /Termin pokazany klientowi/.test(mail) && mail.indexOf('w czwartek 12 listopada') >= 0,
      (mail.match(/Termin pokazany klientowi(\\n|.){0,90}/) || ['brak sekcji z terminem'])[0]);
    // ten sam tekst co na ekranie — inaczej biuro i klient wiedzą co innego
    const zEkranu = (naEkranie.match(/Wysyłka[^Z]{0,70}/) || [''])[0].trim();
    check('mail podaje ten sam termin, który zobaczył klient',
      !!zEkranu && mail.indexOf(zEkranu) >= 0, zEkranu || 'nie odczytałem terminu z ekranu');
    check('mail mówi, że godzina jest z zegara klienta',
      /policzone z zegara klienta: 10\.11\.2026, 12:00/.test(mail),
      (mail.match(/policzone z zegara klienta[^"\\]{0,30}/) || ['brak'])[0]);
    await ctx.close();
  }

  // 21. Pobranie — dopłata i limit ZALEŻĄ OD PRZEWOŹNIKA (właściciel, 21.09.2026):
  //     DPD 5 zł netto do 15 000 zł brutto, Raben 20 zł netto do 10 000 zł brutto.
  //     Do 21.09 aplikacja brała 5 zł zawsze, także przy palecie — różnicę 15 zł
  //     dopłacała firma, po cichu. Domyślną płatnością jest teraz pobranie, żeby
  //     klient widział datę dostawy, a nie prośbę o przelew.
  async function koszykPob(kW, box) {
    const { ctx, page } = await open({ consent: 'no' });
    await page.getByRole('button', { name: /Moc silnika/ }).first().click();
    await page.locator('button').filter({ hasText: new RegExp('^\\s*' + kW + '\\s*kW') }).first().click();
    await page.getByRole('button', { name: /Dalej · warunki pracy/ }).click();
    await page.getByRole('button', { name: /Pokaż wyniki/ }).click();
    await page.waitForTimeout(400);
    const jest = await page.evaluate((b) => {
      const x = [...document.querySelectorAll('button')].find((e) => e.innerText.startsWith(b));
      if (x) { x.click(); return true; } return false;
    }, box);
    if (!jest) { await ctx.close(); return null; }
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Dodaj do koszyka/ }).click();
    await page.locator('h2', { hasText: 'Zamówienie' }).waitFor();
    const tekst = async () => (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
    return { ctx, page, tekst };
  }
  {
    const k = await koszykPob('0,25', 'DKM040');
    const t = await k.tekst();
    check('domyślna płatność to pobranie — klient widzi datę, nie prośbę o przelew',
      /TERMIN Wysyłka/.test(t) && !/liczymy od zaksięgowania wpłaty/.test(t),
      (t.match(/TERMIN [^Z]{0,60}/) || ['brak panelu'])[0]);
    check('kurier: dopłata za pobranie to 5 zł',
      /w tym pobranie 5 zł/.test(t),
      (t.match(/w tym pobranie[^W]{0,20}/) || ['brak dopłaty'])[0]);
    await k.ctx.close();
  }
  {
    // DKM110 wymusza paletę niezależnie od masy — tu obowiązuje stawka Rabena
    const k = await koszykPob('1,5', 'DKM110');
    const t = await k.tekst();
    check('spedycja: dopłata za pobranie to 20 zł, nie 5 zł',
      /w tym pobranie 20 zł/.test(t),
      (t.match(/w tym pobranie[^W]{0,20}/) || ['brak dopłaty'])[0]);
    // przekraczamy limit Rabena (10 000 zł brutto) ilością
    await k.page.evaluate(() => {
      const plus = [...document.querySelectorAll('button')].filter((x) => x.innerText.trim() === '+');
      for (let i = 0; i < 12; i++) plus.forEach((b) => b.click());
    });
    await k.page.waitForTimeout(500);
    const po = await k.tekst();
    check('ponad limit przewoźnika pobranie znika, a termin wraca na proformę',
      /liczymy od zaksięgowania wpłaty/.test(po) && !/w tym pobranie/.test(po),
      (po.match(/TERMIN [^T]{0,70}/) || ['brak panelu'])[0]);
    // krok 3: przycisk pobrania ma być wyłączony i ma być napisane dlaczego
    await fillContact(k.page);
    const stan = await k.page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /pobraniem/i.test(x.innerText));
      return { off: !!(b && b.disabled), nota: document.body.innerText.replace(/\s+/g, ' ') };
    });
    check('przycisk pobrania jest wyłączony, z podaniem limitu przewoźnika',
      stan.off && /Za pobraniem do 10[\s  ]000 zł brutto/.test(stan.nota),
      (stan.nota.match(/Za pobraniem do[^.]{0,80}/) || ['brak noty'])[0]);
    // i to samo musi dojść do biura — inaczej ktoś wyśle paczkę za pobraniem
    const posty = [];
    await k.page.context().route(/formspree\.io/, async (r) => {
      posty.push(JSON.parse(r.request().postData() || '{}'));
      await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await k.page.getByRole('button', { name: /Zapoznałem się z/ }).click();
    await k.page.locator('[data-order-btn]').click();
    await k.page.waitForSelector('text=Numer zgłoszenia', { timeout: 15000 });
    const mail = JSON.stringify(posty[0] || {});
    check('zamówienie ponad limit idzie do biura jako proforma, nie pobranie',
      /Proforma/.test(mail) && !/[Zz]a pobraniem/.test(mail),
      (mail.match(/"Płatność":"[^"]*"/) || ['brak pola Płatność'])[0]);
    await k.ctx.close();
  }

  // 22. Prędkość dostępna WYŁĄCZNIE poza zalecanym zakresem — właściciel,
  //     21.09.2026: „0,28 obr/min popraw, żeby było widać, że są dostępne
  //     w momencie zwężania wyboru".
  //
  //     DRV dokłada prędkości, przy których wszystkie zestawienia mają fs < 1.
  //     Filtr „ukryj fs poniżej 1,0" jest domyślnie włączony, więc taka wartość
  //     znikała z listy zwężania zupełnie, a kafelek na ekranie startowym
  //     prowadził do „Brak pozycji dla tych kryteriów. Usuń jedno z kryteriów" —
  //     rady fałszywej, bo pozycje istnieją, tylko są schowane.
  {
    const { ctx, page } = await open({ consent: 'no' });
    await page.getByRole('button', { name: /Prędkość obrotowa na wale/ }).first().click();
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /^0,28\b/.test(x.innerText));
      if (b) b.click();
    });
    await page.waitForTimeout(400);
    for (const n of [/Dalej · warunki pracy/, /Pokaż wyniki/]) {
      if (await page.getByRole('button', { name: n }).count()) {
        await page.getByRole('button', { name: n }).first().click();
        await page.waitForTimeout(400);
      }
    }
    const t = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
    check('kafelek 0,28 obr/min prowadzi do pozycji, a nie do pustego ekranu',
      /POZA ZALECANYM ZAKRESEM/.test(t) && !/Brak pozycji dla tych kryteri/.test(t),
      /Brak pozycji dla tych kryteri/.test(t) ? 'nadal „Brak pozycji"' : 'sekcja poza zakresem jest');
    // filtr odznacza się JAWNIE — klient widzi, dlaczego to zobaczył, i może wrócić
    check('filtr fs zostaje odznaczony na widoku, a nie obchodzony po cichu',
      !/✓ UKRYJ WSPÓŁCZYNNIK PRACY FS/.test(t) && /UKRYJ WSPÓŁCZYNNIK PRACY FS/.test(t),
      (t.match(/.{2}UKRYJ WSPÓŁCZYNNIK PRACY FS[^0-9]{0,22}/) || ['brak przełącznika'])[0]);
    // licznik ma liczyć to, co ekran wypisuje — inaczej mówi „0" nad trzema pozycjami
    check('licznik zgadza się z liczbą wypisanych zestawień',
      /\b3 z \d+ pozycji/.test(t),
      (t.match(/\d+ z \d+ pozycji/) || ['brak licznika'])[0]);
    await ctx.close();
  }
  {
    // lista zwężania musi pokazać taką prędkość — inaczej klient nie ma skąd
    // wiedzieć, że DRV przy tej prędkości w ogóle istnieje
    const { ctx, page } = await open({ consent: 'no' });
    await page.getByRole('button', { name: /PRZEGLĄDAJ CAŁY KATALOG/i }).first().click();
    await page.waitForTimeout(400);
    for (const n of [/Dalej · warunki pracy/, /Pokaż wyniki/]) {
      if (await page.getByRole('button', { name: n }).count()) {
        await page.getByRole('button', { name: n }).first().click();
        await page.waitForTimeout(400);
      }
    }
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /ZMIEŃ KRYTERIA/i.test(x.innerText));
      if (b) b.click();
    });
    await page.waitForTimeout(500);
    const t = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
    check('zwężanie pokazuje prędkość dostępną tylko poza zakresem, z liczbą pozycji',
      /0,28 3 poza zakresem/.test(t),
      (t.match(/0,28[^0-9]{0,4}\d+[^A-ZŁ]{0,16}/) || ['0,28 nie ma na liście'])[0]);
    await ctx.close();
  }

}

await browser.close();
server.close();

const bad = results.filter((r) => !r.ok).length;
console.log('\n' + (results.length - bad) + '/' + results.length + ' sprawdzeń przeszło');
console.log('\nUWAGA: test nie wysyła nic na zewnątrz — Google i Formspree są przechwytywane.');
console.log('Sprawdzenie „na żywo" opisuje README (sekcja „Sprawdzenie po wdrożeniu").');
process.exit(bad ? 1 : 0);
