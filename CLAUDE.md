# Cennik i stany magazynowe — kontekst dla przyszłych sesji

## Stan na 4 września 2026

Cennik odświeża się sam — workflow `.github/workflows/cennik.yml`, w dni robocze.
Do czasu jego uruchomienia właściciel podmieniał plik ręcznie; automat miał
pierwotnie stać na VPS-ie (`/opt/dkm-stany`) i z tego zrezygnowano: wszystko,
czego potrzebuje, jest już w GitHub Actions, a serwer byłby drugim miejscem
do pilnowania.

## Zakres zmian: tylko to, o co właściciel prosił

Ustalone 8 września 2026, po tym jak przy prośbie o czytelniejszy mail
ze zgłoszeniem dołożyłem adres zwrotny na klienta (`_replyto`) — drobiazg,
ale **zmiana zachowania, o którą nikt nie prosił**. Właściciel: „nie mieszaj
mi rzeczy, o które cię nie proszę, możesz sprawdzać, ale przed zmianami
informuj".

Sprawdzanie, czytanie kodu i szukanie przyczyn — bez pytania, zawsze.
**Zmiana wykraczająca poza prośbę — dopiero po zapytaniu**, choćby wydawała
się oczywista i bezpieczna. To jest sklep, który zarabia; właściciel musi
wiedzieć, co się w nim zmieniło i dlaczego.

Dotyczy zwłaszcza rzeczy niewidocznych na ekranie: treści maili, nagłówków,
zdarzeń analitycznych, integracji. Ich zmiany nikt nie zauważy od razu —
wyjdą dopiero wtedy, gdy zaczną przeszkadzać.

## Plik z cennikiem jest generowany, nie pisany

`app/src/data/price-data.js` powstaje automatycznie i **nie wolno go edytować
ręcznie ani poprawiać pojedynczych pozycji** — najbliższy przebieg automatu
i tak nadpisze plik w całości. Poprawki wprowadza się w źródle: albo w raporcie
magazynowym, albo w `narzedzia/cennik/katalog.json`.

## Skąd przychodzi

```
Comarch ERP Optima
  └─ wysyła mailem raport, temat "STANY MAGAZYNOWE"
     załącznik XLSX "7.02 Stan magazynów na dzień ilościowo DKM"
  └─ Optima potrafi wysyłać tylko na adres właściciela, więc filtr na jego
     skrzynce przekazuje wiadomość na raporty@d-k-m.eu
  └─ narzedzia/cennik/pobierz.py odbiera ją po IMAP (dane logowania
     w GitHub Secrets: POCZTA_SERWER, POCZTA_LOGIN, POCZTA_HASLO)
  └─ narzedzia/cennik/generuj.py przelicza i zapisuje price-data.js
  └─ ten sam workflow commituje, buduje i publikuje na dobor.dkmpower.pl
```

Publikacja siedzi w tym samym przebiegu celowo: commit zrobiony tokenem GitHuba
nie uruchamia innych workflow, więc `pages.yml` by nie wystartował i strona
zostałaby na starych danych bez żadnego błędu.

### Zegar jest na zewnątrz, bo harmonogram GitHuba nie działa

**Automat uruchamia cron-job.org**, nie `schedule:` z `cennik.yml`. Zadanie
„Cennik DKM" woła `POST .../actions/workflows/cennik.yml/dispatches` z ciałem
`{"ref":"main"}`, w dni robocze o 4:37 czasu polskiego, tokenem o zakresie
jednego repozytorium i jednego uprawnienia (`Actions: read and write`).

Powód: **harmonogram GitHuba spóźnia się o godziny.** 8 września oba terminy
wystartowały, ale termin 4:37 ruszył o 10:11 (5 h 34 min po czasie), a 5:23
o 9:23 (4 h). Zadania z zegara stoją w darmowym planie w kolejce i ruszają,
gdy jest wolna moc — GitHub sam zastrzega, że ich nie gwarantuje. Cennik
lądowałby więc koło południa, w losowej porze, zamiast przed pracą.

Uwaga metodyczna, bo kosztowała dzień: 7 września uznałem, że harmonogram
w ogóle nie działa. **To był błąd diagnozy — mój.** Zmieniałem tego dnia
godzinę trzy razy, za każdym razem wpisując porę, która już minęła, więc
nie było czego uruchamiać. Zmiana terminu jest testowalna dopiero następnego
dnia; wcześniejsze wnioski są bezwartościowe.

Wpisy `schedule:` zostają w pliku jako zapas — spóźniona aktualizacja jest
lepsza niż żadna, gdyby cron-job.org kiedyś przestał działać. Dodatkowe
przebiegi są nieszkodliwe: krok „zmiana" zastaje identyczny plik
i zatrzymuje się przed publikacją.

Uruchomienia z cron-job.org widać w Actions jako **`workflow_dispatch`**,
nie „scheduled". Sama usługa zapisuje historię wywołań i wysyła maila,
gdy zadanie zacznie się nie udawać — to jedyny alarm, jaki mamy.

Token wygasa po roku od 8 września 2026. **Po wygaśnięciu automat zamilknie
tak samo cicho jak harmonogram GitHuba** — warto o tym przypomnieć
właścicielowi latem 2027.

## Co skąd pochodzi

Raport magazynowy daje **ceny netto i ilości**. Nie wie natomiast, który silnik
pasuje do którego wariantu — to jest w `narzedzia/cennik/katalog.json`, razem
z listą falowników, osprzętu, silników jednofazowych, masami do przesyłki
i listą cenową przekładni (raport nie zawiera cen pozycji, których nie ma
na stanie). Plik powstał raz, skryptem `wyodrebnij-katalog.mjs`, z ówczesnego
cennika; zmienia się tylko wtedy, gdy dochodzi nowy produkt.

### Domyślne przyłącze silnika

DKM110, DKM130 i DKM150 mają jako standard kołnierz **B5**, mniejsze korpusy
do 1,5 kW — **B14**. Aplikacja odstępuje od standardu tylko wtedy, gdy ten
byłby gorzej dostępny: przy tej samej cenie proponuje wykonanie, które leży
na półce, zamiast takiego, które trzeba domówić. Klient może przełączyć
ręcznie w sekcji „Przyłącze silnika".

Właściciel to potwierdził — **to nie jest usterka**. Jeśli kiedyś zobaczysz,
że DKM110 proponuje B14, sprawdź najpierw stany: najpewniej właśnie dlatego.

#### DKM050 z silnikiem IEC 63 — dopuszczone oba kołnierze

Zmienione 10 września 2026 na prośbę właściciela, przy okazji zbierania danych
do DRV. Tabela doborowa producenta podawała dla DKM050 + IEC 63 **tylko `63B5`**
przy 0,12 i 0,18 kW. W ofercie DKM jest inaczej:

- silnika **0,12 kW w 63B5 nie ma w ogóle** — jest tylko `0,12 4 63B14 DKM`;
- przy 0,18 kW są oba, ale właściciel trzyma na stanie B14.

Skutek był taki, że wszystkie pięć wariantów DKM050 przy 0,12 kW pokazywało
**„zapytaj o cenę"** — przekładnia miała cenę i leżała na stanie, ale pole
silnika było puste, bo silnika w tym kołnierzu nie ma. Zestaw dawał się złożyć
(`DKM050 63B14` to realna część, jest w cenniku przy 0,25 kW), tylko aplikacja
nie miała jak go zaproponować.

Kołnierz w `catalog-data.js` zmieniony więc na `63B5/B14` w dwóch wierszach
(0,12 i 0,18 kW, 1400 obr/min) i `warianty.json` przeliczone — **12 nowych
wariantów**. Właściciel: „to w takim razie tu zróbmy 63B14 / 63B5, tak jest
bezpieczniej" — czyli oba dopuszczone, wybiera dostępność.

**Wiersza 0,18 kW / 2800 obr/min celowo nie ruszono**: silnika `0,18|2800|63B14`
nie ma w `katalog.json`, więc dopisanie kołnierza dałoby pięć wariantów bez
ceny — na zawsze „zapytaj o cenę" i śmieci na liście DO SPRAWDZENIA.
Do ustalenia z właścicielem, czy taki silnik istnieje.

Dlaczego to bezpieczne: dopisanie kołnierza tylko **dodaje** opcję. `variants()`
odfiltrowuje kołnierze bez klucza w cenniku, a `pickVar()` sięga po B14
wyłącznie wtedy, gdy `status` nie jest gorszy i cena istnieje. Żaden wariant nie
może przez to stracić ceny ani zamienić obietnicy terminu na prośbę o kontakt.

### Ceny przekładni nie uzupełniamy ceną korpusu

Cena przekładni jest w obrębie korpusu stała (DKM025 = 125 zł, DKM110 = 1100 zł),
więc uzupełnianie nią kodów bez własnej ceny wygląda na oczywiste ulepszenie.
**Zostało zrobione i cofnięte.** Powód: tabela doborowa producenta wymienia
kombinacje kołnierza i przełożenia, których DKM nie ma w ofercie — właściciel
wskazał `DKM063 71B14 i20`. Takie pozycje przechodziły z „zapytaj o cenę"
na „dostawa 1–3 dni", czyli z prośby o kontakt na obietnicę terminu dla czegoś,
czego nie da się zamówić. Dotyczyło to 93 kombinacji i 227 wariantów.

Obowiązuje zasada: **cenę ma tylko to, co widzieliśmy jako realny produkt** —
pozycja z raportu magazynowego albo wpis z listy cenowej w `katalog.json`.
Reszta zostaje przy „zapytaj o cenę", bo obecność w tabeli doborowej nie
dowodzi, że produkt istnieje.

### Mocowanie silnika: B34 i B35

`B34` to łapy plus kołnierz `B14`, `B35` to łapy plus kołnierz `B5`. Silnik pod
takim kodem pasuje wszędzie tam, gdzie tabela doborowa chce `B14` albo `B5` —
łapy są naddatkiem. Część silników leży w magazynie wyłącznie w tych wykonaniach,
więc szukanie po samym `B14` je gubi.

Przypisań silnika do wariantu **generator nie zgaduje**: pod tą samą mocą
i kołnierzem bywa kilka wykonań o różnych cenach (np. zwykłe i `HPS`, 319 zł
kontra 760 zł), a pomyłka oznaczałaby złą cenę u klienta. Zamiast tego, gdy
w magazynie znajdzie się silnik DKM pasujący do wariantu bez mapowania,
generator wypisuje go jako **DO SPRAWDZENIA** — wpis do `katalog.json` dopisuje
człowiek. Zamienniki innych marek (GAMAK, OMEC, AEMOT) są celowo pomijane:
konfigurator nie ma sam z siebie proponować silnika innego producenta.

Lista wariantów pochodzi z **tabeli doborowej aplikacji** (`catalog-data.js`),
a nie z magazynu. To celowe: czego aplikacja nie ma w cenniku, tego w ogóle
nie pokaże w wynikach — więc każda pozycja, którą potrafi zaproponować,
musi mieć swój wiersz, choćby ze statusem „zapytaj o cenę".

## Format danych

```js
window.DKM_PRICE = { updated, var, nam, opt, inv, m1f, wt }
```

- **var** — klucz `KORPUS|IEC+KOŁNIERZ|PRZEŁOŻENIE|kW|obr/min`, wartość
  `[cena przekładni, stan przekładni, cena silnika, stan silnika,
    cena zestawu, stan zestawu, status, SKU silnika]`
- **stany to flagi 0/1** (nie ma / jest), a nie liczba sztuk. To decyzja
  biznesowa, nie uproszczenie: klient, który zobaczy „2 szt.", a potrzebuje
  dziesięciu, rezygnuje — a firma i tak domówi towar i wyśle tyle, ile trzeba.
  Plik nie może wynosić stanu magazynowego na zewnątrz.
- **status** — `0` = „w magazynie", `1` = „dostawa 1–3 dni",
  `2` = „zapytaj o cenę". Liczony z danych, nie podawany ręcznie.
- **updated** — `"stan na DD.MM.RRRR"`, data raportu magazynowego.
  Pokazywana klientowi, więc musi odpowiadać prawdzie.

## Co widzi wyszukiwarka i komunikator

`scripts/postbuild.mjs` dokłada przy każdej publikacji: `robots.txt`, `sitemap.xml`,
adres kanoniczny, znaczniki Open Graph i dane strukturalne JSON-LD. Data w mapie
strony to **data raportu magazynowego**, nie dzień budowania — mówi wyszukiwarce,
kiedy naprawdę zmieniła się treść, a ta zmienia się codziennie razem z cennikiem.

Obrazek pokazywany przy linku (`public/obrazek-linku.png`, 1200 × 630 px) składa
`scripts/obrazek-linku.mjs` — renderuje stronę w przeglądarce i robi zrzut.
Uruchamia się go ręcznie, tylko gdy zmienia się logo albo hasło.

Aplikacja to **jeden adres**, bez osobnych URL-i dla wyników. To celowe: katalog
produktowy dla wyszukiwarki jest w sklepie `dkmpower.pl`, a 1802 wygenerowane
strony różniące się liczbami konkurowałyby z nim o te same zapytania i wyglądały
jak zapychacz. Konfigurator ma wygrywać zapytania narzędziowe („dobór przekładni
ślimakowej"), nie produktowe.

## Podział odpowiedzialności: Claude Design a kod

Ustalone z właścicielem 4 września 2026.

**Design odpowiada za wygląd i za sposób doboru.** Za dane i integracje
odpowiada kod w tym repozytorium.

`logic.js` jest przez to plikiem mieszanym i przy przenoszeniu eksportu
trzeba go dzielić:

| Z eksportu bierzemy (Design) | Zostawiamy nietknięte (kod) |
|---|---|
| `matches()`, `varOf()`, `flangeList()` | `pageView()`, `EKRANY`, `loadGA()`, `track()` |
| `pickVar()`, `prefFlange()` | `send()`, `mailBody()`, `refNo()` |
| `fsReqNum()`, `fsBand()` | `hydrate()` i zapis w pamięci przeglądarki |
| `invPick()`, `optOf()` | zgoda na analitykę (`anaConsent`) |
| szablon wszystkich ekranów | `START` i `zLinku()` — wejście z linku |
| | dane w `app/src/data/` |

Powód takiego podziału: eksport nie wie o niczym, co powstało w kodzie po jego
wygenerowaniu. Wgrany hurtem skasowałby śledzenie ekranów w GA4, wartość
zamówienia w zdarzeniu wysyłki i datę cennika nad wynikami — **a aplikacja
działałaby dalej normalnie**, więc nikt by tego nie zauważył, dopóki nie
przestałyby napływać dane.

Plik `project/DKM Dobór - telefon v3.dc.html` to zrzut eksportu i **wzorzec
do porównań**, a nie źródło prawdy o wdrożonej wersji.

Sposób pracy przy eksporcie: porównać z wzorcem linijka po linijce i oddzielić
realne zmiany od szumu narzędzia (przy eksporcie z 3 września było to 17 zmian
na 84 różnice), przenieść wygląd i dobór, zostawić integracje, uruchomić testy,
a potem zaraportować właścicielowi, co doszło i co pominięto.

**Siatka bezpieczeństwa to testy.** `verify.mjs` sprawdza między innymi odsłony
ekranów w GA4, wartość zamówienia w zdarzeniu wysyłki, zgodę na analitykę,
wysyłkę na Formspree i znaczniki dla wyszukiwarek. Jeśli eksport skasuje coś
z prawej kolumny, testy powinny to złapać, zanim zmiana trafi na stronę.

## Wersja testowa: dobor-test.pages.dev

Postawiona 10 września 2026 na prośbę właściciela — żeby oglądał zmiany przed
wypuszczeniem ich na sklep, a nie na żywym sklepie.

```
produkcja        gałąź main → GitHub Pages → dobor.dkmpower.pl
wersja testowa   gałąź test → Cloudflare Pages → dobor-test.pages.dev
```

Ten sam kod i ten sam cennik. Buduje się przez `npm run build:test`, ustawienia
projektu w Cloudflare: production branch `test`, root directory `app`, output
`dist`, zmienne `NODE_VERSION=22` i `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`
(bez tej drugiej każde budowanie ciągnęłoby 150 MB przeglądarki testowej).

**Sposób pracy:** zmiana idzie najpierw na `test`, właściciel ją oglądа
na telefonie, dopiero potem przenosimy ją na `main`.

### Hasło zgody na przeniesienie: „tak do DKM API"

Ustalone z właścicielem 10 września 2026. Przeniesienie z `test` na `main`
— czyli na żywy sklep — wolno zrobić **wyłącznie po odpowiedzi o dokładnym
brzmieniu „tak do DKM API"**.

„ok", „dobre", „zgadza się", „działa" i podobne **nie są zgodą.** W takim
wypadku trzeba dopytać. Zdanie jest umowne właśnie po to, żeby nie dało się
go pomylić ze zwykłym potwierdzeniem, że zmianę widać albo że się podoba.

### Cztery rzeczy, które w wersji testowej są wyłączone

Bez nich wersja testowa jest groźniejsza niż pożyteczna:

1. **Zgłoszenia nie wychodzą na Formspree** — inaczej ktoś w biurze zacząłby
   realizować testowe zamówienia. Zamiast wysyłki pokazuje się panel z treścią,
   która poleciałaby na produkcji (ten sam co przy awarii wysyłki).
2. **GA4 i Tag Manager nie startują** — testy fałszowałyby lejek, a co gorsza
   **generowałyby fałszywe konwersje w Google Ads**.
3. **Zakaz indeksowania** — `robots.txt` z `Disallow: /`, `meta noindex`, bez mapy
   strony i bez adresu kanonicznego. Kopia w wynikach Google konkurowałaby
   z prawdziwym konfiguratorem.
4. **Czerwony pasek na każdym ekranie** — żeby nikt nie pomylił wersji, ani
   właściciel, ani ktokolwiek, komu wyśle link.

Przełącznikiem jest `VITE_DKM_TEST=1` (kod) i `DKM_TEST=1` (postbuild).
W wersji produkcyjnej zmiennych nie ma, więc ten kod jest tam martwy.

`VITE_DKM_HOSTS="pages.dev"` — `guard.js` nadal ogranicza domeny, tylko dopuszcza
adresy Cloudflare.

**Testy pilnują odwrotnego kierunku:** że `noindex`, zakaz w `robots.txt` ani pasek
nie trafią na produkcję. To wycięłoby konfigurator z Google i **nikt by tego nie
zauważył przez tygodnie** — data cennika by się zmieniała, strona by działała,
tylko ruch z wyszukiwarki by wysechł.

Kreator Cloudflare ma pułapkę: domyślnie prowadzi w **Workers** („Deploy command:
npx wrangler deploy"), który wymaga `wrangler.toml` i tu nie zadziała. Właściwa
ścieżka to link **„Przejdź do Pages"** na dole kreatora.

## Tag Manager i Google Ads

Wdrożone 10 września 2026 na prośbę właściciela. Kontener **`GTM-NN2RKMW`**
ładuje `loadGTM()` w `logic.js`, **z tej samej bramki zgody co GA4** — bez
„Akceptuję analitykę" nie leci ani jedno, ani drugie. Aplikacja obiecuje to
w „Informacjach prawnych", więc wyjątku tu być nie może.

**Konfiguracji GA4 w GTM dodawać nie wolno.** Znacznik `G-79013G7BXL` jest już
ładowany przez `loadGA()`; drugi liczyłby każdą odsłonę i każde zamówienie dwa
razy. Test pilnuje, że na stronie jest dokładnie jeden `gtag/js`.

### Wyzwalacze w GTM czytają wpisy z przedrostkiem `dkm_`

`track()` wysyła każde zdarzenie **dwa razy**: przez `gtag()` do GA4 i jako zwykły
wpis do kolejki `dataLayer` pod nazwą **`dkm_<nazwa>`** — bo wyzwalacze w Tag
Managerze czytają zwykłe wpisy, a zdarzenia z `gtag()` trafiają do kolejki w innej
postaci i GTM nie zawsze potrafi je złapać. Bez tego tag konwersji Google Ads
bywa martwy, choć w GA4 wszystko widać.

Przedrostek nie jest ozdobnikiem: **chroni przed policzeniem konwersji dwa razy.**
Gdyby obie postacie miały tę samą nazwę, jeden wyzwalacz mógłby złapać obie.

W GTM używa się więc `dkm_submit_order`, `dkm_submit_rfq`, `dkm_add_to_cart`,
`dkm_view_cart`, `dkm_select_criterion`, `dkm_refine_step`. Wartość konwersji
bierze się ze zmiennych `value` i `currency`, dołączonych do wpisu.

Poza `track()` idą jeszcze `page_view`, `analytics_consent` i `link_entry` —
te wysyłamy wprost przez `gtag()` i **nie mają odpowiednika `dkm_`**, bo nie
służą do konwersji.

### Polityka bezpieczeństwa została świadomie rozluźniona

Do `script-src`, `img-src` i `connect-src` doszły `googleadservices.com`,
`*.doubleclick.net` i `www.google.com`, plus nowa reguła `frame-src`. Bez nich
GTM ładuje się poprawnie, ale **tagi Google Ads, które przez niego przechodzą,
są po cichu blokowane** — w GTM widać „tag uruchomiony", a konwersja nie dociera.

Czego **nie** dopuszczono: `'unsafe-inline'` w `script-src`. Wystarcza to dla
gotowych szablonów Ads. Jeśli właściciel doda w GTM własny tag typu Custom HTML,
przestanie działać i trzeba będzie tę decyzję podjąć osobno — świadomie, bo to
otwiera stronę na dowolny kod osadzony w treści.

Polityka żyje w **dwóch plikach**: `app/index.html` (działa na GitHub Pages)
i `app/deploy/nginx.conf` (na własnym serwerze). Test porównuje je regułа po
regule — rozjechanie się tych dwóch dawałoby inne zachowanie w każdym miejscu.

### Wartość zamówienia w GA4

`submit_order` i `submit_rfq` niosą `value`, `currency` i `items` od 5 września.
GA4 **nie pokazuje kwot zdarzeń własnych w raportach standardowych** — trafiają
do metryki „Wartość zdarzenia", widocznej dopiero w eksploracji. To nie jest
usterka aplikacji.

Gdyby właściciel chciał widzieć przychód w raportach i przekazywać wartość
konwersji do Ads, trzeba wysyłać standardowe `purchase` (zamówienia)
i `generate_lead` (zapytania). **Zaproponowane, nie wdrożone** — bo pokazywałoby
jako przychód coś, co nie jest jeszcze opłacone, a przy przekładniach składanych
bywa niewykonalne.

## Ścieżki ekranów w GA4 mają przedrostek `/dobor`

Sklep `dkmpower.pl` i konfigurator raportują do **tej samej usługi GA4**, a raport
„Strony i ekrany" grupuje po samej ścieżce, bez nazwy hosta. Bez przedrostka
ekran startowy konfiguratora i strona główna sklepu wpadają do jednego wiersza `/`
— właściciel potwierdził, że taki wiersz w raporcie widać.

Przedrostek jest w `pageView()`, na sztywno (`SCIEZKA_BAZA='/dobor'`). Wcześniej
brał się z adresu — działało na GitHub Pages, gdzie aplikacja stała w katalogu
`/dobor`, i **po cichu przestało działać po przeniesieniu na `dobor.dkmpower.pl`**,
bo tam aplikacja stoi w korzeniu i przedrostek wychodził pusty. Testy pilnują teraz,
że każda odsłona zaczyna się od `/dobor/`.

W GA4 widać więc `/dobor/`, `/dobor/wyniki`, `/dobor/zamowienie/krok-2`. Adresy
w `page_location` są przez to wirtualne — nie prowadzą do istniejących stron.
To świadomy koszt czytelności raportu.

## Wejście z linku: `?start=…`

Wdrożone 5 września 2026, na potrzeby bloga i kart produktów w `dkmpower.pl`.
Link może otworzyć aplikację od razu na wybranym kryterium, z pominięciem
ekranu startowego:

| Adres | Otwiera |
|---|---|
| `?start=p1` | moc silnika |
| `?start=i` | przełożenie |
| `?start=n2` | prędkość na wale |
| `?start=m2` | moment na wale (wymagania maszyny) |
| `?start=bore` | średnica wału |
| `?start=swap` | wyszukiwarka zamienników |
| `?start=swap&q=NMRV063` | wyszukiwarka z wpisanym kodem i gotowymi trafieniami |

Kod siedzi w `logic.js`: stała `START`, funkcja `zLinku()` i jedna linijka
w `componentDidMount()`. To **strona kodu, nie Design** — eksport o tym nie wie.

Trzy rozstrzygnięcia, które trzeba zachować przy przenoszeniu eksportu:

- **Ekran ustawiamy w stanie początkowym**, przed pierwszym rysowaniem. Gdyby
  ustawiać go po zamontowaniu, klient zobaczyłby mignięcie ekranu startowego,
  a GA4 policzyłby dwie odsłony zamiast jednej.
- **Adres jest jednorazowy** — po wejściu pasek wraca do `/`. Inaczej klient
  zapisałby w zakładkach albo przesłał dalej adres pomijający ekran startowy.
- **Nieznana wartość to zwykłe wejście na stronę** — ekran startowy, bez błędu.
  Literówka w linku na blogu nie może wywrócić aplikacji.

`q` jest przycinane do 40 znaków i trafia wyłącznie do pola tekstowego
wyszukiwarki. Adres kanoniczny pozostaje jeden (`https://dobor.dkmpower.pl/`),
więc te linki nie tworzą Google'owi sześciu kopii strony.

**Czyszcząc adres wycinamy wyłącznie `start` i `q`** (`adresBezStart()`).
Parametry `utm_…` muszą zostać: GA4 odczytuje je z paska adresu dopiero przy
uruchomieniu znacznika, czyli po udzieleniu zgody — a to bywa kilkanaście sekund
po wejściu. Wycięcie ich razem z `start` kasowałoby informację o źródle ruchu.

W odsłonach wejście z linku wygląda identycznie jak przejście z ekranu startowego,
więc dochodzi osobne zdarzenie **`link_entry`** z parametrem `criterion`
(`p1`, `i`, `n2`, `m2`, `bore`, `swap`). Klucz zapamiętujemy przy montowaniu
(`this._zLinku`), bo zgoda może paść później, gdy w adresie nie ma już `start`.

`verify.mjs` sprawdza każdy z sześciu adresów osobno: właściwy ekran,
wyczyszczony pasek adresu, jedna odsłona w GA4 pod właściwą ścieżką i brak
błędu w konsoli — plus wpisanie kodu z linku, przycięcie `q`, to, że treść
z adresu nie wykonuje się jako kod, i zachowanie przy przekręconej wartości.

## Do zrobienia i do ustalenia

### Termin dostawy w koszyku — propozycja czeka na decyzję

Klient ma widzieć, kiedy dostanie towar: „wysyłka jeszcze dziś — dostawa w środę
9 września". **Nic nie jest wdrożone.** Propozycja z sześcioma przykładami:
`https://claude.ai/code/artifact/2b180300-9c6b-4a44-8149-0b4030b9fef6`

Co już policzone i sprawdzone (prototyp uruchomiony, nie tylko napisany):
dni robocze, 13 świąt państwowych łącznie z ruchomymi (Wielkanoc 2026 — 5 kwietnia,
Boże Ciało — 4 czerwca), przypadki brzegowe typu 24 grudnia → dostawa 28 grudnia.

Reguły zaproponowane, do zatwierdzenia:

- **dwie godziny graniczne, bo dwóch przewoźników** — kurier DPD do 13:00,
  spedycja Raben do 9:00. Godzina 9:00 jest już w kodzie, w treści maila
  z zamówieniem; klient dowiaduje się o niej dopiero po złożeniu zamówienia.
- **przewoźnika wyznacza `shipPlan()`** — i robi to inaczej, niż opisywałem
  tu wcześniej. **Nie ma progu na masie koszyka.** Działa tak:
  `SPED=['DKM110','DKM130','DKM150']` — jeśli w koszyku jest którykolwiek z tych
  korpusów, spedycja jest wymuszona **bez patrzenia na masę**. Poza tym liczy się
  masa **pojedynczej paczki**, nie koszyka: `PACK_CHEAP=31` kg (25 zł),
  a `PACK_MAX=40` kg (40 zł) tylko dla sztuki, której nie da się rozbić.
  Koszyk 3 × 20 kg jedzie więc **kurierem w trzech paczkach**, choć waży 60 kg.
  Na koniec `courierPlan()` porównuje się kosztem ze `spedCost()` (130 zł
  do 100 kg, 180 zł do 150 kg, wyżej wycena indywidualna) i wygrywa tańsze.
- **termin tylko wtedy, gdy cały koszyk jest od ręki**; przy „dostawa 1–3 dni"
  widełki, przy „zapytaj o cenę" nic.
- **przy proformie bez konkretnej daty** — aplikacja nie wie, kiedy wpłyną pieniądze.

Czego brakuje: **jak szybko dowozi Raben** (D+1 czy D+2) — to jedyna rzecz
blokująca. Poza tym: czy godziny graniczne obowiązują też w piątek, czy DPD
wszędzie dowozi następnego dnia i czy firma ma własne dni wolne poza świętami.

Zastrzeżenie, o którym trzeba pamiętać przy wdrażaniu: aplikacja nie ma serwera,
więc czyta **zegar urządzenia klienta**. Przy źle ustawionym telefonie wyliczy
datę z błędnej godziny — dlatego komunikat ma być warunkowy („jeśli zamówisz
do 13:00"), a nie twardą gwarancją.

### DRV, przystawka i UDL — kierunek ustalony, dane czekają

Rozmowa z 9 września 2026. **Nic nie jest zaczęte.**

**Jedna aplikacja, nie cztery.** Powód nie jest techniczny: klient nie przychodzi
z myślą „potrzebuję DRV", tylko „mam 0,25 kW i chcę 12 obr/min na wyjściu".
Rodzina produktu to **odpowiedź, nie pytanie**. Przy osobnych aplikacjach klient
szukający i = 300 dostałby „brak wyników" i wyszedł, nie dowiedziawszy się,
że DRV istnieje.

**DRV i przystawka wchodzą w istniejący przepływ** — odpowiadają na to samo
pytanie co dziś (przełożenie, obroty, moment), różnią się tylko zakresem.
Nowych ekranów nie potrzebują, tylko wierszy w tabeli doborowej.

**UDL to inne pytanie** („chcę regulować obroty") i zasługuje na własny kafelek
na ekranie startowym — ale w tej samej aplikacji, bo klient, który nie wie,
że wariator istnieje, dowie się tylko z listy kryteriów.

#### Jak to dziś wygląda u DKM

Człony leżą w magazynie **osobno**. W Magento ceny są ustawione, a stan wpisywany
**ręcznie jako „na stanie"** — bez pewności, czy da się złożyć. Prawdę firma
poznaje **po zamówieniu**, sprawdzając części. Montaż nie zawsze wychodzi tego
samego dnia. **Cena natomiast jest ustalona oficjalnie i pewna.**

Czyli: **cena pewna, dostępność zgadywana.**

#### Propozycja (zaakceptowana kierunkowo, nie wdrożona)

Znacznik **„do złożenia"** na pozycji — nie nowy status, tylko cecha zmieniająca
komunikat:

| Sytuacja | Co widzi klient |
|---|---|
| części są na stanie | cena · składamy na zamówienie — zwykle 1–3 dni robocze |
| części brakuje | cena · składamy na zamówienie — termin potwierdzimy po zamówieniu |

**Cena podana w obu przypadkach.** Uczciwsze niż dzisiejsze „na stanie"
w Magento i mocniejsze sprzedażowo niż „zapytaj o cenę".

Dostępność **liczy się z członów** — raport z Optimy codziennie podaje ich stany.
Dwa ograniczenia: plik trzyma „jest / nie ma", więc dwóch sztuk tego samego członu
nie sprawdzi; i nikt nie wie, czy jest czas na montaż. Dlatego wszędzie „zwykle",
nigdy „na pewno".

Mail z zamówieniem ma podawać **listę członów do sprawdzenia** z kodami
magazynowymi — skoro firma i tak to robi po zamówieniu.

#### Co blokuje i czego brakuje

Potrzebna jest **lista członów dla każdej przekładni łączonej**. Właściciel
uprzedził, że to nie jest prosta trójka:

```
DRV 040/090 i300  →  DKM040 71B14 I30 · 1 szt.
                     DKM090 ... I10   · 1 szt.
                     przyłącze między członami: 80B5 / 80B14 / 90B5 / 90B14
                     + łącznik odpowiedni do tej pary
```

Czyli **kilka dopuszczalnych wykonań na jedną nazwę handlową** — ten sam kształt
problemu, co kołnierz silnika (`flangeList()`, `prefFlange()`), tylko o poziom
głębiej. Dane muszą więc opisywać **warianty**, nie jeden sztywny skład.

Trzy pytania bez odpowiedzi:

1. **Czy cena DRV zależy od wybranego wykonania?** Jeśli nie — aplikacja może
   wybierać po dostępności, dokładnie jak dziś przy silnikach.
2. **Czy przyłącze między członami ma standard**, a reszta to zamienniki na brak?
3. **Czy łącznik ma własny kod magazynowy** i czy wynika jednoznacznie z pary?

Obowiązuje zasada z pojedynczych przekładni: **do aplikacji trafia tylko to,
co właściciel potwierdzi jako realny produkt** — pamiętając `DKM063 71B14 i20`.
Tu kombinacji będzie wielokrotnie więcej, więc pierwsza wersja obejmie
**same najczęściej sprzedawane układy**.

### Pozostałe otwarte wątki

- **Eksport z Claude Design** — właściciel wprowadza w Design zmniejszenie
  czcionki na ekranie warunków pracy oraz poprawioną podpowiedź przy firmie
  i NIP-ie. Po eksporcie: porównać z wzorcem, przenieść wygląd i dobór,
  zostawić integracje.
- **Linkowanie sklep ↔ konfigurator** — strona konfiguratora gotowa
  (adresy `?start=…` wyżej). Zostaje wstawienie linków w Magento:
  na kartach produktów i w artykułach na blogu.
- **Po stronie właściciela**: ochrona antyspamowa w Formspree, umowa powierzenia
  i wpis do rejestru czynności przetwarzania.

### Co jest ustawione w samym GA4 (5 września 2026)

Właściciel skonfigurował po swojej stronie — kodu to nie dotyczy, ale bez tego
raporty nie działają:

- wymiar niestandardowy na parametrze **`criterion`** (obejmuje `select_criterion`
  i `link_entry` — wymiar rejestruje się po nazwie parametru, nie per zdarzenie);
- **`submit_order`** i **`submit_rfq`** oznaczone jako zdarzenia kluczowe
  (gwiazdka w Administracja → Zdarzenia → „Ostatnie zdarzenia");
- eksploracja **lejka** z filtrem `Nazwa hosta = dobor.dkmpower.pl` i sześcioma
  krokami: wejście → kryterium (`/kryterium/` **lub** `/zamiennik`) → wyniki →
  karta → koszyk → `submit_order`.

Uwaga na przyszłość: wyszukiwarka zamienników leży pod `/zamiennik`, a nie pod
`/kryterium/…`, choć na ekranie startowym jest szóstym kryterium. Filtr po samym
`/kryterium/` ją gubi.

Stan na 5 września: 5 użytkowników w 28 dni. Narzędzie pomiarowe działa,
brakuje ruchu — stąd linki `?start=…` i linkowanie ze sklepu.

## Rzeczy, które łatwo zepsuć

- `app/public/CNAME` z treścią `dobor.dkmpower.pl` musi trafiać do publikacji
  (Vite kopiuje `public/` do `dist/`, workflow publikuje `app/dist`).
  Bez tego pliku domena przestaje działać.
- **Jeśli zmieni się ścieżka albo nazwa pliku z cennikiem, trzeba to poprawić
  w `narzedzia/cennik/generuj.py` i powiedzieć właścicielowi.** Po cichej
  zmianie automat będzie codziennie nadpisywał plik, którego nikt już nie
  czyta, a strona zamrozi się na ostatnich danych bez żadnego błędu.
- **`wyodrebnij-katalog.mjs` nie jest bezpieczny do uruchamiania hurtem.**
  Odtwarza `katalog.json` z **dzisiejszego** `price-data.js`, a ten zmienia się
  codziennie — więc przebieg po miesiącu daje inny plik, choć tabela doborowa
  stoi w miejscu. 10 września jedno uruchomienie **usunęło dwie ceny przekładni**
  (`DKM075|90B14|100` i `DKM110|100B5|7.5`), bo tego dnia nie miały ceny
  w cenniku. Usunięcie ceny to zamiana terminu dostawy na „zapytaj o cenę"
  u klienta — cicho, bez błędu. **Po uruchomieniu porównaj `katalog.json`
  znaczeniowo (klucz po kluczu, nie `diff` — kolejność też się zmienia)
  i cofnij plik, jeśli zmiany nie dotyczą tego, co zmieniałeś.** `warianty.json`
  jest bezpieczny: powstaje wyłącznie z `catalog-data.js`.
- Harmonogram w publicznym repozytorium GitHub wyłącza po 60 dniach bez
  aktywności i wysyła o tym maila do właściciela. Wtedy wystarczy włączyć
  workflow z powrotem jednym kliknięciem.
- Cennik jest danymi produkcyjnymi: ceny netto i dostępność, na podstawie
  których klienci wysyłają zapytania ofertowe.
