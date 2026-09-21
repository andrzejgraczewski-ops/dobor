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

**Wiersz 0,18 kW / 2800 obr/min dostał `63B5/B14` 21.09.2026.** Przez dziesięć
dni stała tu notatka, że go celowo nie ruszamy, bo silnika `0,18|2800|63B14`
nie ma w `katalog.json` i dopisanie kołnierza dałoby pięć wariantów bez ceny.
Właściciel rozstrzygnął inaczej: **„silnik istnieje, tylko ja nie mam go
w sprzedaży, mogę kupić lokalnie"**, i na pytanie, czy dopisać — „tak zrobić".

To ten sam przypadek co `0,09 4 56B5`: wyrób da się domówić, więc **„zapytaj
o cenę" jest prawdą**, a klient szukający DKM050 przy 0,18 kW i 2800 obr może
wybrać `B14` — czyli wykonanie, które DKM realnie trzyma w tej rodzinie —
i wysłać zapytanie, zamiast nie widzieć pozycji wcale.

Dopisany **sam kołnierz, bez wymyślonego kodu silnika.** Mapowania
`0.18|2800|63B14` nie dodałem świadomie: nie znam nazwy, pod jaką Optima ten
silnik zapisze, a zgadnięta („`0,18 2 63B14 DKM`") wyglądałaby na prawdziwą
i **przy zakupie nie trafiłaby w raport**, więc cena i tak by się nie pojawiła,
tylko trudniej byłoby to zauważyć. Bez mapowania generator zachowa się właściwie:
gdy silnik pojawi się w magazynie, wypisze go jako `DO SPRAWDZENIA` z **realnym
kodem**, a człowiek dopisze mapowanie. To jest dokładnie ta reguła, po której
generator nie zgaduje przypisań silnika.

Skutek, policzony na cenniku wygenerowanym ze sztucznego raportu: `warianty.json`
**+5 wpisów**, wszystkie pięć ze statusem `2` („zapytaj o cenę"), zero nowych
pozycji na liście `DO SPRAWDZENIA`. Przekładnia `DKM050 63B14` ma cenę przy
`i60`, `i80` i `i100` (260 zł), a przy `i40` i `i50` nie ma jej w żadnym
kołnierzu — to nie zmiana, tak było i przy `63B5`.

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
window.DKM_PRICE = { updated, var, nam, opt, inv, m1f, lac, wt }
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
- **lac** — łączniki przekładni łączonych DRV: `kod → [cena, stan]`. Kody bierze
  generator z `narzedzia/drv/drv-katalog.json`; bez tego pliku sekcja jest pusta
  i cennik zachowuje się jak przedtem.
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
wysyłkę na Formspree, znaczniki dla wyszukiwarek oraz cenę zespołów DRV
liczoną ze składników. Jeśli eksport skasuje coś
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

### Termin dostawy w koszyku — wdrożone 21.09.2026 na `test`

Klient widzi w koszyku, kiedy dostanie towar. Propozycja z sześcioma przykładami
(`https://claude.ai/code/artifact/2b180300-9c6b-4a44-8149-0b4030b9fef6`) czekała
od 8 września; właściciel odpowiedział na wszystkie pytania 21.09 i to jest
wdrożone dokładnie w tym brzmieniu.

**Reguły, wszystkie od właściciela:**

- **kurier DPD — zamówienie do 13:00**, dostawa następnego dnia roboczego.
  Właściciel: „DPD dostarcza 95% przesyłek na drugi dzień", więc w treści jest
  **„zwykle"** i tak ma zostać — tego terminu firma nie gwarantuje;
- **spedycja Raben — zamówienie do 9:00**, dostawa **w 1–3 dni robocze**,
  czyli widełki, nie jedna data;
- **godziny graniczne obowiązują także w piątek** — potwierdzone wprost;
- **firma nie ma własnych dni wolnych**: „dni wolne zgodne z kalendarzem",
  więc liczy się soboty, niedziele i 13 świąt państwowych, nic ponadto;
- **termin tylko wtedy, gdy cały koszyk jest od ręki.** Przy „dostawa 1–3 dni"
  nie ma daty, tylko „część pozycji domawiamy"; przy „zapytaj o cenę" i przy
  braku ceny w koszyku panelu nie ma wcale;
- **przy proformie bez daty** — aplikacja nie wie, kiedy wpłyną pieniądze.

**Sprostowanie: Raben NIE dowozi D+2.** Stało tu, że właściciel potwierdził D+2
10 września, i na tej podstawie napisałbym „dwa dni robocze od wyjazdu palety".
21.09 na wprost zadane pytanie odpowiedział: **„nie, Raben — spedycja dowozi
1–3 dni"**. Jedna data zamieniłaby się więc w obietnicę, której spedycja nie
dotrzymuje w części przypadków. Stary zapis zostawiam tu wykreślony celowo —
żeby nikt nie wrócił do niego, czytając starszą wersję pliku.

**Gdzie to siedzi.** Cały rachunek jest w `logic.js`: `wielkanoc()` (algorytm
gregoriański), `swieta()`, `wolny()`, `nastRoboczy()`, `plusRobocze()`,
`dataSlownie()`, `zakresDat()` i `terminPlan()`, która składa komunikat.
Na ekranie to **nowy element w `RfqScreen.jsx`**, pod blokiem „Wysyłka" —
czyli w pliku, który przy następnym eksporcie z Design zniknie, jeśli ktoś
wgra go hurtem. Cała treść przychodzi z `logic.js`, więc przeniesienie to
skopiowanie jednego bloku; pilnują tego testy.

**Zegar jest zegarem telefonu klienta.** Aplikacja nie ma serwera, więc przy
źle ustawionym urządzeniu wyliczy datę z błędnej godziny. Dlatego komunikat
jest **warunkowy** — „Zamówienia złożone do 13:00 wysyłamy tego samego dnia" —
a nie obietnicą bez zastrzeżeń. Osobny test pilnuje, że to zdanie tam jest.

Co widzi klient (prawdziwe wyjścia z uruchomionej aplikacji):

```
TERMIN
Wysyłka jeszcze dziś — dostawa zwykle w środę 23 września
Zamówienia złożone do 13:00 wysyłamy tego samego dnia.
DPD dostarcza 95% przesyłek następnego dnia roboczego.

TERMIN
Wysyłka jutro — dostawa 24–28 września
Przesyłki paletowe nadajemy do 9:00. Spedycja Raben dostarcza w 1–3 dni robocze.

TERMIN
Termin wysyłki liczymy od zaksięgowania wpłaty
Towar jest w magazynie. Przy przedpłacie nie wiemy, kiedy wpłata dojdzie —
zaksięgowana do 13:00 oznacza wysyłkę tego samego dnia roboczego.

TERMIN
Część pozycji domawiamy — wysyłka w 1–3 dni robocze
Dokładny termin potwierdzimy po przyjęciu zamówienia.
```

Godzina w komunikacie proformy **idzie za przewoźnikiem** — przy palecie jest
tam 9:00, nie 13:00.

**Pięć testów, wszystkie z zamrożonym zegarem.** Bez zamrożenia test
sprawdzałby dzień, w którym akurat się uruchomił, a nie regułę. Daty dobrane
celowo: 10 listopada 2026 (nazajutrz święto stałe), 3 czerwca 2026 (nazajutrz
Boże Ciało, czyli święto **ruchome**, liczone z Wielkanocy) i piątek
25 września po 13:00 (weekend po drodze). Do tego proforma bez daty i obecność
zdania warunkowego.

Uwaga metodyczna, bo najpierw napisałem test bezwartościowy: pierwsza wersja
**liczyła święta sama**, w kodzie testu, zamiast sprawdzać te z aplikacji.
Sprawdzała więc mój algorytm przeciwko mojemu algorytmowi. Przeżyła celowe
przesunięcie Bożego Ciała o dzień w `logic.js` i nadal pisała „OK". Wersja
z zamrożonym zegarem to samo przesunięcie wykrywa od razu — sprawdzone.

**Termin idzie też do maila z zamówieniem** — właściciel, 21.09.2026: „musimy
wiedzieć, co obiecaliśmy". Sekcja `— Termin pokazany klientowi —` w `mailBody()`,
zaraz pod „Wysyłką", powtarza **dosłownie** oba zdania z ekranu i dokłada
**godzinę z zegara klienta**:

```
— Termin pokazany klientowi —
Wysyłka jeszcze dziś — dostawa zwykle w czwartek 12 listopada
Zamówienia złożone do 13:00 wysyłamy tego samego dnia. DPD dostarcza 95% …
policzone z zegara klienta: 10.11.2026, 12:00
```

Godzina jest tam nie dla ozdoby: aplikacja nie ma serwera, więc to **jedyna
godzina, jaką zna**. Biuro odróżni po niej zamówienie złożone przed godziną
graniczną od takiego, w którym klient miał źle ustawiony telefon.

Trzy testy: że sekcja jest, że niesie **ten sam napis co ekran** (inaczej biuro
i klient wiedzą co innego) i że godzina z zegara klienta się zgadza. Sprawdzone
przez wyłączenie sekcji — padają wszystkie trzy.

Zostaje jedna szczelina, której nie da się zamknąć bez serwera: **mail liczy
termin w chwili wysłania, a ekran w chwili narysowania.** Klient, który zostawi
otwarty koszyk na 13:00 i dopiero potem zamówi, zobaczy „jeszcze dziś", a biuro
dostanie „jutro". Wersja z maila jest tą prawdziwą — i dlatego właśnie idzie
tam godzina.

### Stawki spedycji powyżej 150 kg — dodane 10 września 2026

Wcześniej `spedCost()` zwracał `null` powyżej 150 kg i klient widział „powyżej
150 kg — wycena indywidualna", czyli **brak ceny przesyłki**. Właściciel podał
brakujące progi, więc każda masa ma teraz cenę:

| Masa | Netto |
|---|---|
| 40–100 kg | 130 zł |
| 100–150 kg | 180 zł |
| **150–200 kg** | **230 zł** |
| **200–300 kg** | **260 zł** |
| **powyżej 300 kg** | **340 zł** |

Progi siedzą w `SPED_PROGI` w `logic.js` — tabela `[granica, cena, etykieta]`,
z której `spedProg()` bierze też opis progu do koszyka. Wcześniej granice były
wpisane dwa razy: w `spedCost()` i w tekście `tier`, co przy zmianie stawek
groziło rozjechaniem się ceny z opisem.

**Ostatni próg nie ma górnej granicy** — 340 zł obowiązuje i przy 300 kg,
i przy tonie. Gałąź „wycena indywidualna" stała się przez to nieosiągalna.
Jeśli kiedyś ma wrócić limit, trzeba go dopisać jawnie.

Zastrzeżenie, o którym trzeba pamiętać przy wdrażaniu: aplikacja nie ma serwera,
więc czyta **zegar urządzenia klienta**. Przy źle ustawionym telefonie wyliczy
datę z błędnej godziny — dlatego komunikat ma być warunkowy („jeśli zamówisz
do 13:00"), a nie twardą gwarancją.

### Darmowa wysyłka od 5 000 zł netto — 21.09.2026

Było 3 000 zł, właściciel podniósł próg: „na pewno trzeba zmienić cenę darmowej
wysyłki na od 5000 netto". Zmiana dotyczy **wyłącznie progu**, nie sposobu
liczenia — `cartGoods() >= SHIP_FREE`, czyli liczy się wartość towaru netto,
bez wysyłki i bez VAT-u.

Kwota stoi **w jednym miejscu**, w `SHIP_FREE` w `logic.js`. Przedtem była
wpisana jeszcze dwa razy w treści — na ekranie koszyka („powyżej 3 000 zł
netto") i w mailu z zamówieniem — czyli w miejscach, których nikt by nie
poprawił razem z progiem. Klient czytałby wtedy inną kwotę, niż liczy koszyk,
i **dowiedziałby się o tym dopiero przy płaceniu za wysyłkę**. Obie treści
biorą ją teraz z `shipFreeText()`. To ten sam błąd, który naprawiły już
`SPED_PROGI`, i ta sama poprawka.

Zmieniło się przy okazji brzmienie: **„od 5 000 zł netto"**, nie „powyżej".
Warunek w kodzie jest nieostry (`>=`), więc przy okrągłych 5 000 zł wysyłka
jest gratis — „powyżej" było nieprawdą, tylko akurat nikt w to nie trafił.

Trzy testy, na uruchomionej aplikacji: że **wartość towaru plus „brakuje"
daje próg** (czyli liczba wychodzi z jednego miejsca, a nie jest wpisana
w treść), że po przekroczeniu progu wysyłka jest gratis i podaje ten sam próg,
i że stara kwota `3 000 zł` nie została nigdzie w treści.

### Pobranie: domyślne, ze stawką i limitem przewoźnika — 21.09.2026

Właściciel zauważył, że koszyk **zakładał z góry przedpłatę**: `pay` startowało
na `proforma`, a wybór płatności jest dopiero na kroku 3. Pierwsze, co klient
czytał o dostawie, było więc odpowiedzią na pytanie, którego jeszcze nie
zadaliśmy — i akurat tą, która **zabiera datę**. Cały rachunek dni roboczych
i świąt nie pokazywał się nikomu, kto nie doszedł do kroku 3 i nie przestawił
płatności ręcznie.

**Domyślną płatnością jest teraz pobranie.** Rozważane było wyjście pośrednie
— pokazywać datę na kroku 1, a komunikat o proformie dopiero po jej wybraniu —
i **odrzucone**: skoro nieruszone zamówienie i tak poszłoby jako proforma, data
byłaby obietnicą niezgodną z tym, co klient zamawia.

#### Stawka i limit zależą od przewoźnika

Przy okazji wyszedł błąd, którego nikt wcześniej nie zauważył — właściciel:
„pobranie jest 5 zł netto dla DPD to się zgadza, jednak dla spedycji-Rabena
to kwota 20 zł netto". Aplikacja brała **5 zł zawsze**, także przy palecie,
więc **różnicę 15 zł dopłacała firma** przy każdym paletowym zamówieniu
za pobraniem. Cicho, bez błędu — ten sam rodzaj szkody co cena łącznika.

```
COD_KURIER = 5      COD_MAX_KURIER = 15000   // DPD
COD_SPED   = 20     COD_MAX_SPED   = 10000   // Raben
```

**Limity są w BRUTTO, a nie w netto** — to kwota, którą kurier fizycznie
inkasuje: towar plus wysyłka plus dopłata, razem z VAT-em. Porównywanie ich
z wartością netto towaru przepuszczałoby zamówienia ponad limit przewoźnika.
W przeliczeniu na wartość towaru granica wypada przy **12 190 zł netto**
(kurier) i **8 110 zł netto** (spedycja), przy darmowej wysyłce.

#### Ponad limit pobranie jest WYŁĄCZONE, nie tylko przestawione

`payEff()` zwraca płatność **skuteczną**, a nie tę z przycisku: klient mógł
wybrać pobranie przy małym koszyku i dołożyć pozycje ponad limit. Wszystko, co
pokazuje płatność klientowi albo wypisuje ją do maila i do GA4, czyta stąd —
inaczej biuro dostałoby „za pobraniem" dla kwoty, której kurier nie zainkasuje.

Przycisk pobrania na kroku 3 jest wtedy **nieaktywny**, z podaniem powodu
(`codNote()`), bo samo przestawienie w tle byłoby niezrozumiałe: klient
kliknąłby i nic by się nie stało.

**Siedem testów**, wszystkie na uruchomionej aplikacji: domyślne pobranie
pokazuje datę zamiast prośby o przelew, dopłata to 5 zł przy kurierze i 20 zł
przy palecie, ponad limitem pobranie znika z koszyka, przycisk jest wyłączony
z podaniem limitu, a **zamówienie dochodzi do biura jako proforma**. Sprawdzone
przez cofnięcie obu zmian osobno: przy stawce 5 zł dla spedycji pada test
dopłaty, przy podniesionym limicie padają trzy testy limitu.

Cztery starsze testy zakładały proformę jako domyślną i trzeba je było
poprawić — w tym ten od paczek, bo cena wysyłki niesie teraz domyślną dopłatę
(2 × 25 + 5 = 55 zł zamiast 50 zł; jedna paczka dałaby 30 zł, więc liczba nadal
rozróżnia podział na paczki).

### Opakowanie wchodzi do masy — 21.09.2026

Do 21 września wycena liczyła **samą masę towaru z kart katalogowych**, a próg
przewoźnika dotyczy tego, co on faktycznie zważy. Właściciel podał brakujące
liczby: **karton z wypełnieniem 2 kg, paleta 25 kg**.

```
KG_KARTON = 2    // na KAŻDĄ paczkę kurierską
KG_PALETA = 25   // RAZ na przesyłkę spedycyjną
```

- **kurier** — progi 31 i 40 kg liczą się od brutto, więc `courierPlan()`
  pakuje towar do **29 kg** na tanią paczkę i **38 kg** dla sztuki
  nierozbijalnej, a cenę bierze z masy brutto;
- **paleta** — próg ze `SPED_PROGI` liczy się od `towar + 25 kg`.

Skutek na 317 koszykach jednopozycyjnych (każda przekładnia z silnikiem, każdy
wiersz DRV luzem i złożony): **drożeje od 26 do 48 koszyków** — widełki, bo masa
zależy od tego, który silnik danej mocy klient weźmie. Z tego 24–42 to przeskok
palety z progu 40–100 na 100–150 kg (**+50 zł**), 1–2 przeskok na 150–200 kg
(+50 zł), a 1–4 to rozbicie jednej paczki kurierskiej na dwie (**+25 zł**).
**Żaden koszyk nie staniał i żaden nie stracił ceny wysyłki.**

**`courierPlan()` celowo NIE łączy lekkich sztuk w jedną cięższą paczkę.**
Zaproponowałem to jako „poprawę" — próg 31–40 kg dałby 40 zł zamiast dwóch
paczek po 25 zł — i **właściciel to odrzucił**: „paczka będzie skasowana za
40 zł, a DPD policzy nas 50, bo paczka była cięższa". Czyli klient zapłaciłby
40, a firma dopłaciłaby różnicę. Reguła stała w kodzie od początku, w komentarzu
(„próg 31–40 kg stosujemy TYLKO do pojedynczej sztuki, której nie da się
rozbić") — przeczytałem ją jako ograniczenie, a nie jako decyzję. Nie ruszać.

Pokazana masa to od tej pory **brutto**, bo tylko taka zgadza się z ceną
i z opisem progu. Dopisałem był do treści „z kartonami" i „z paletą", żeby nikt
nie pomyślał, że przekładnia przybrała na wadze — **właściciel to odrzucił**:
„nie pisz z kartonami czy z paletą, bo to logiczne". Treść wróciła do krótszej
i pilnuje tego osobny test:

```
Wysyłka · 33,5 kg  ·  50 zł netto
kurier · 2 paczki — taniej niż spedycja

Wysyłka · 79,6 kg  ·  130 zł netto
spedycja (Raben) · 40–100 kg — zamówienie do 9:00
```

**Mas poszczególnych paczek nie pokazujemy** — właściciel, 21.09.2026: „masy
poszczególnych paczek bym usunął". Zostaje liczba paczek i masa brutto całej
przesyłki. `courierPlan()` nadal je liczy i zwraca w polu `bins`, bo z nich
bierze się cena; po prostu nie trafiają na ekran.

**Trzy testy, wszystkie na uruchomionej aplikacji.** Pierwszy przechodzi ścieżkę
do `DKM075` z silnikiem 2,2 kW (towar 31 kg — bez kartonu jedna tania paczka,
z kartonem dwie) i sprawdza **regułę, nie kilogramy**: dwie paczki i 50 zł,
czyli 2 × 25 zł — a to dowodzi, że obie zmieściły się w tanim progu, bez
wypisywania ich mas. Drugi liczy, że masa przy „Wysyłce" to masa `DKM075`
plus któryś silnik 2,2 kW z cennika plus dwa kartony, czyli że jest brutto;
konkretnych kilogramów nie przypinamy, bo aplikacja dobiera silnik po
dostępności i cenie. Trzeci sprawdza na danych, że przy `DKM110`, `DKM130`
i `DKM150` próg liczy się od brutto, a nie od towaru.

### Przekładnie łączone DRV — dane i wysyłka wdrożone na `test`

Stan na 10 września 2026, gałąź `test`. **107 wierszy, 8 zespołów, silnik
1400 obr/min.** Wszystkie ustalenia z właścicielem są w komentarzach
`narzedzia/drv/drv-katalog.json`.

```
narzedzia/drv/drv-katalog.json   źródło do czytania i poprawiania przez człowieka
narzedzia/drv/buduj.mjs          → app/src/data/drv-data.js
```

**Dlaczego osobne pliki, a nie dopisanie do `catalog-data.js` i cennika:**
gdyby `drv-data.js` zniknął albo się zepsuł, aplikacja zachowuje się dokładnie
jak przed DRV. To gwarancja „nie popsuć pozostałych rzeczy" zrobiona
konstrukcją, nie nadzieją. Wszystkie funkcje DRV w `logic.js` (`DRV()`,
`drvWt()`, `drvCzesci()`, `drvN2()`, `drvSku()`, `drvSklad()`, `drvVar()`,
`drvLac()`) zwracają `null`/`[]` bez tego pliku.

**Wiersz DRV ma ten sam kształt co wiersz tabeli doborowej** (`p1 · i · n2 · m2
· fr2 · fs`), więc `matches()` filtruje go bez żadnej zmiany — dobór działa sam.
Wiersze dołączają do `DKM_CATALOG` w `drv-data.js`, po `dims-data.js`, bo
kopiują średnicę wału z członu 2 z `DKM_BORE`.

Cztery miejsca, które kluczują po nazwie korpusu i trzeba było obsłużyć:

| Miejsce | Co zrobiono |
|---|---|
| `kgGear(box)` | zwraca masę zestawu z `DKM_DRV.wt` — bez tego koszyk pokazywał „masa do potwierdzenia" |
| `SPED` | `drvCzesci()` stawia flagę palety na **członie 2** — sam DKM110 waży 42,5 kg, czyli więcej niż `PACK_MAX` |
| `shipItems()` | rozbija DRV na cztery sztuki: dwie przekładnie, łącznik i silnik — bo DRV jedzie luzem |
| `varOf()` | gdy klucza nie ma, a korpus jest zespołem DRV, cenę liczy `drvVar()` ze składników — patrz niżej |

### Cena DRV liczy się w locie ze składników

Wdrożone 10 września 2026, na gałęzi `test`. Właściciel: „tak naprawdę masz
wszystko, przecież wyliczałeś cenę".

**Cena zespołu = człon 1 + łącznik + człon 2 + silnik.** Wszystkie cztery są
zwykłymi pozycjami magazynowymi i wszystkie cztery przychodzą z rannego raportu,
więc `drvVar()` sumuje je przy każdym rysowaniu. Własnego klucza w cenniku DRV
nie dostanie i dostać nie może: cennik kluczuje po **korpusie**, a `DRV050/110`
korpusem nie jest.

Wynik ma **dokładnie kształt wpisu z `DKM_PRICE.var`**, więc `variants()`,
`pickVar()`, karta, wyniki, koszyk i mail czytają go istniejącą drogą — i status
wychodzi tą samą regułą co wszędzie: brak którejkolwiek ceny to „zapytaj
o cenę", pełny stan wszystkich składników to 0, inaczej 1.

Dwie reguły doboru składników, obie od właściciela:

- **silnik i człon 1 muszą być w tym samym kołnierzu** — silnik przykręca się
  wprost do członu wejściowego, więc kołnierza nie da się dobrać osobno.
  Dlatego `drvMot()` bierze silnik z kołnierza **wybranego wariantu**, a nie
  z pierwszego, jaki znajdzie: inaczej ekran pokazywał przekładnię w `56B5`
  z silnikiem w `56B14`, czyli dwie części, których nie da się złożyć;
- **kołnierz członu 2 wynika z łącznika** (druga liczba w jego nazwie to
  średnica przyłącza PAM-IEC), więc łącznik i człon 2 dobierane są parą.

Gdy pasuje więcej niż jedno wykonanie, wygrywa to leżące na stanie — tak samo
jak przy kołnierzu silnika w pojedynczych przekładniach.

Stan na 10 września: **101 wierszy ze 107 z pełną ceną, 75 w całości na stanie.**
Sześć bez ceny i to nie jest luka w kodzie:

- pięć wierszy **0,09 kW** — `DKM040` jest w wielkości IEC 56 **tylko w `56B5`**,
  a silnik 0,09 kW istnieje **tylko w `56B14`**. Obie strony potwierdzone przez
  właściciela 21.09.2026: „0,09 kW w 56B5 nie mam go, ale jest w 56B14"
  i „kołnierz 56B14 dla przekładni nie istnieje". Czyli tej pary nie da się
  skręcić i „zapytaj o cenę" jest tam **prawdą, nie usterką**. Pojedyncze
  przekładnie zachowują się identycznie: `DKM040 56B5 i50` ma cenę przekładni
  180 zł, puste pole silnika i status 2;
- `DRV040/075 0,25 kW i500` — `DKM075 I50` ma cenę w `71B5`, `80B5` i `80B14`
  (nie tylko w IEC 80, jak pisałem wcześniej), a łącznik 040/075 wymaga IEC 90.
  **Właściciel, 21.09.2026: „tak ma zostać na zapytanie".** Sprawa zamknięta —
  nie naprawiać.

#### Kołnierz silnika przy DRV pochodzi z tabeli pojedynczej dla członu 1

Zmienione 21.09.2026. Właściciel: „mapowanie masz zrobić z członu 1, czyli tak
jak to jest w pojedynczych przekładniach z silnikiem, tu się nie zmienia: ten
sam silnik, te same przekładnie, tylko że to człon 1 do DRV".

Generator składał wcześniej kołnierz jako **`w.iec + 'B14/B5'`** — brał z tabeli
wydajności DRV samą *wielkość* silnika i dopisywał oba kołnierze z automatu.
Przy `DKM040` z 0,09 kW wychodziło z tego `56B14`, którego dla przekładni nie ma
w ofercie: pięć wierszy oferowało wykonanie niemożliwe do zamówienia. Ceny i tak
nie miały, więc **na ekranie nie było tego widać** — kłamały same dane.

Teraz `buduj.mjs` czyta `catalog-data.js` i bierze napis kołnierza **dosłownie
z wiersza pojedynczej przekładni** dla członu 1, przy tej samej mocy, obrotach
i przełożeniu `i₁`. Gdy takiego wiersza nie ma, **rzuca błędem** — kołnierza nie
wolno zgadywać.

**Porównywać wolno tylko w obrębie tej samej wielkości silnika.** Tabela
pojedyncza ma dla jednej kombinacji osobny wiersz na każdą wielkość, z własnym
momentem i własnym `fs`: `DKM040 i10 0,25 kW` to `63B5/B14` z `m2 = 15 Nm`,
`fs = 2,7` **albo** `71B5/B14` z `m2 = 14 Nm`, `fs = 2,8`. To nie są zamienniki.
Wielkość wiersza DRV ustala tabela wydajności producenta (pole `silnik`, np.
`7114`), więc wolno porównywać wyłącznie `B5` kontra `B14` w jej obrębie.

**Tu się pomyliłem i warto o tym pamiętać:** najpierw porównałem wszystkie
wielkości razem i wyszło mi 33 rozjazdy oraz 21 wierszy, które „stanieją
o 7–19 zł". Po zawężeniu do jednej wielkości rozjazdów jest **pięć**, a cen nie
zmienia się **żadna**. Gdybym poszedł za pierwszym wyliczeniem, aplikacja
proponowałaby silniki o innej wielkości niż ta, dla której producent podał
moment i współczynnik pracy.

Skutek zmiany: **101 wierszy ze 107 z ceną — dokładnie tyle samo co przed nią.**
Żaden wiersz nie zyskał ani nie stracił ceny; zniknął tylko zmyślony kołnierz.
Kolejność w napisie (`56B5/B14` kontra `56B14/B5`) nie ma znaczenia, bo
`prefFlange()` zwraca dla DRV `null` (nie zna nazwy zespołu) i wybór robi
sortowanie po statusie, a potem po cenie.

**Dwa testy** pilnują tego dalej: że dla każdego ze 107 wierszy zbiór kołnierzy
jest identyczny z tabelą pojedynczą dla członu 1 w tej samej wielkości, i że
żaden kołnierz nie jest zmyślony. Sprawdzone przez przywrócenie starego wzoru —
test pada i wypisuje wszystkie pięć wierszy.

**Mapowanie `0.09|1400|56B5 → 0,09 4 56B5 DKM` zostaje — nie usuwać.**
`katalog.json` wskazuje tu silnik, którego w magazynie nie ma i nigdy nie było,
więc wyglądało to na martwy wpis do sprzątnięcia. Właściciel rozstrzygnął
inaczej (21.09.2026): „zostaw `0,09 4 56B5` jako komplet na zapytanie, bo
możemy kupić taki silnik, jeśli klient będzie potrzebował takiego DRV".

Czyli to **nie jest** ten sam przypadek co `DKM040 56B14`, którego dla
przekładni nie ma w ofercie wcale. Silnik da się domówić u dostawcy — brakuje
tylko ceny i stanu, a `status = 2` („zapytaj o cenę") jest wtedy dokładnie
prawdą: klient dostaje prośbę o kontakt, a firma może to złożyć.

Dotyczy pięciu wierszy DRV przy 0,09 kW (`DRV040/075` i `DRV040/090`)
i siedmiu wariantów pojedynczego `DKM040` w `56B5`. Wszystkie zostają przy
„zapytaj o cenę" i **tak ma być** — usunięcie mapowania nic by nie zmieniło
klientowi, ale skasowałoby informację, że taki komplet jest w ogóle możliwy.

#### DKM030 przy 0,12 kW dopuszcza też IEC 56 — 21.09.2026

Właściciel: „przy 0,12 kW moment i fs jest w 56 a 63 jest to samo", po
wskazaniu przykładu: „DRV030/050 z silnikiem 0,12, przełożenie i10, czyli
człon 1 to DKM030 i10 — i tu może być w 56B14 oraz 63B14".

Tabela doborowa producenta podawała przy 0,12 kW **samą wielkość 63** dla
wszystkich korpusów. W ofercie DKM jest inaczej: `DKM030 i10` ma cenę we
wszystkich czterech wykonaniach (`56B14`, `56B5`, `63B14`, `63B5` — po 165 zł),
a silnik **`0,12 4 56B14 DKM` leży w magazynie** (210 zł), podczas gdy
trzyfazowy `0,12 4 63B14 DKM` (235 zł) jest na stanie 0 i wraca dopiero
z dostawą.

**Dotyczy wyłącznie DKM030 i to rozstrzyga się danymi, nie decyzją:** IEC 56
ma w cenniku tylko `DKM025` (`56B14`) i `DKM030` (`56B14`, `56B5`); `DKM040`
ma sam `56B5`, a `DKM050` nie ma wielkości 56 wcale. `DKM025` przy 0,12 kW
i 1400 obr nie ma wierszy. Pytanie „czy także DKM040 i DKM050" odpowiada więc
samo — nie ma gdzie.

Zmienione trzy pliki, wszystkie w źródłach:

- `catalog-data.js` — kołnierz wiersza `0,12 kW · DKM030` z `63B5/B14`
  na **`56B14/63B5/B14`**. `flangeList()` czyta zapis trzyczłonowy poprawnie
  (segment bez cyfr przenosi poprzednią wielkość), więc **wystarczy jeden
  wiersz** i wyniki się nie dublują. `56B5` **nie** dopisano: silnika 0,12 kW
  w tym kołnierzu nie ma;
- `warianty.json` — przeliczone, **+9 wpisów** (dziewięć przełożeń), zero
  usuniętych;
- `katalog.json` — mapowanie `0.12|1400|56B14 → 0,12 4 56B14 DKM` oraz cena
  zapasowa 210 zł. Masę (4,2 kg) `wt.mot` znał już wcześniej.

Co z tego wyjdzie, policzone na cenniku wygenerowanym ze sztucznego raportu
z datą 22.09 — czyli „co pokaże aplikacja po przebiegu automatu":

| | `63B14` (dziś) | `56B14` (nowe) |
|---|---|---|
| pojedynczy DKM030 0,12 kW | 165 + 235 = **400 zł** | 165 + 210 = **375 zł** |
| stan silnika | 0 → „dostawa 1–3 dni" | 1 → przy i20…i60 **„w magazynie"** |

Zespoły DRV: **sześć wierszy taniej o 25 zł** — `DRV030/050` 745 → **720 zł**,
`DRV030/063` 825 → **800 zł**. Termin zostaje „dostawa 1–3 dni", bo sama
przekładnia `DKM030 56B14` przy `i10` i `i15` jest na stanie 0. Wiersze
z członem 1 = `DKM040`/`DKM050` zostają na 63 i nie zmieniają się wcale.

**Dziś na `test` nie widać z tego nic** — i tak ma być. `price-data.js` jest
kopią z produkcji i nie ma jeszcze kluczy `DKM030|56B14|…|0.12|1400`, więc
`variants()` odfiltrowuje nowy kołnierz. Zadziała po przebiegu automatu,
czyli **po przeniesieniu `warianty.json` i `katalog.json` na `main`** — ten sam
warunek co przy sekcji `lac`. Jedyne, co widać od razu, to dłuższy podpis
`56B14/63B5/B14` w wierszu wyników na szerokim ekranie (`rowSub`).

Uwaga metodyczna: `warianty.json` przeliczyłem `wyodrebnij-katalog.mjs`, który
**przy okazji znowu zepsuł `katalog.json`** — usunął `DKM075|90B14|100`
i `DKM110|100B5|7.5`, dokładnie te same dwie ceny co 10 września, i dopisał
cztery inne. `katalog.json` przywróciłem z gita i porównałem klucz po kluczu
(identyczny), a z przebiegu zostawiłem tylko `warianty.json`. Ostrzeżenie
z sekcji „Rzeczy, które łatwo zepsuć" sprawdziło się drugi raz — trzeba je
traktować dosłownie.

Osobna obserwacja, niezmieniana: `prefFlange()` nie zna nazw DRV, więc zespoły
nie dostają preferencji `B14`, którą mają małe korpusy pojedyncze. Dziś wybór
„najtańsze z dostępnych" jest sensowny, ale gdyby kiedyś iść konsekwentnie za
zasadą „jak przy członie 1", to jest drugie miejsce do poprawienia.

**Łącznik jest czwartym składnikiem i ma teraz swoją sekcję w cenniku.**
`generuj.py` dopisuje `lac: {kod: [cena, stan]}` — kody czyta
z `narzedzia/drv/drv-katalog.json` (bez tego pliku sekcja wychodzi pusta,
a cennik jest taki jak przedtem), a cenę i stan z raportu. W raporcie łączniki
wyglądają na **`ACZNIK 030/040`**: `norm()` rozkłada znaki i wyrzuca to, czego
nie ma w ASCII, a `Ł` odpowiednika bez ogonka nie ma. Obie strony normalizujemy
tak samo, więc szukanie po kodzie działa — ale szukanie po nazwie z `Ł` nie.

Do pierwszego przebiegu automatu z tą sekcją obowiązuje **cena łącznika ze
zrzutu w `drv-katalog.json`**, a jego stan zostaje nieznany. Nieznanego nie
liczymy jako braku (`drvLac()` zwraca wtedy `q = 1`): łączniki leżą na półce
w kilkunastu sztukach, a przeciwna decyzja odebrałaby wszystkim zespołom termin
dostawy na jeden dzień bez żadnego powodu w danych.

#### Cena łącznika ze zrzutu zdążyła się zepsuć następnego dnia

11 września 2026, jeden dzień po wdrożeniu. **`ŁĄCZNIK 063/110` podrożał
w Optimie ze 120 na 150 zł** i wszystkie **17 zespołów DRV063/130** pokazywało
cenę o 30 zł za niską. Cicho, bez błędu — dokładnie ten rodzaj szkody, przed
którym broni się reszta tego pliku.

Właściciel znalazł to sam, po tym jak zameldowałem „DRV zgadza się co do
grosza". **Mój błąd był podwójny:**

- porównywałem `price-data.js` dzień do dnia, a **łączników w tym pliku nie
  ma** — sekcja `lac` była wtedy tylko na `test`, a automat uruchamia generator
  z `main`. Metoda z definicji nie mogła tego zobaczyć, a ja wyciągnąłem z niej
  wniosek. Trzeba było napisać „tego nie sprawdzam";
- podstawiłem zrzut jako źródło ceny, żeby cena pojawiła się od razu — zamiast
  zostawić „zapytaj o cenę" do przebiegu automatu, jak było tu wcześniej
  zapisane. Zrzut nikogo nie pilnuje i nic go nie odświeża.

Wnioski, wszystkie już wdrożone:

- **generator porównuje cenę z raportu z ceną ze zrzutu** i rozjazd wypisuje
  jako `DO SPRAWDZENIA — cena łącznika rozjechała się ze zrzutem`. Osobno mówi
  o łączniku, którego w raporcie nie ma wcale, bo wtedy zrzut jest jedynym
  źródłem i nikt by o tym nie wiedział;
- **trzy testy w `verify.mjs`** podstawiają sekcję `lac` i sprawdzają, że
  aplikacja liczy z cennika, a nie ze zrzutu: cena z `lac` wygrywa, podmiana
  innego kodu nie rusza zespołu, a stan `0` zabiera zespołowi termin dostawy.
  To jest odpowiedź na pytanie „skąd mam mieć pewność, że później będzie
  dobrze" — z testu, nie z obietnicy;
- **zrzut w `drv-katalog.json` ma datę** (pole `cenyLacznikow`) i jest opisany
  jako zapas, nie źródło.

Zostaje jedno, czego testem nie da się zastąpić: **dopóki sekcja `lac` nie jest
na `main`, automat jej nie liczy**, więc cena łącznika nie odświeża się sama.
To jedyna realna naprawa u źródła.

#### Dziesięć dni na zrzucie dało rozjazd do 40 zł — 21.09.2026

Właściciel przysłał nowy cennik Comarcha (obowiązuje od 22.09) i **sześć
z jedenastu cen łączników się zmieniło**: `030/050` 95 → 85, `030/063`
60,2 → 85, `040/075` 81 → 95, `050/110 PRO` i `SEM` 120 → 130, `063/130`
120 → 160. Zrzut poprawiony, ale to **potwierdzenie problemu, nie jego
rozwiązanie** — przez dziesięć dni aplikacja liczyła ceny ze zrzutu, który
się rozjechał, i nikt by tego nie zauważył.

Skutek na cenach zespołów: **63 wiersze ze 107** mają inną cenę.
`DRV030/063` +24,80 zł, `DRV040/075` +14 zł, `DRV050/110` +10 zł,
`DRV063/130` +30 zł, `DRV030/050` **−10 zł**. Trzy zespoły bez zmian.

**Że ceny idą po SKU, jest sprawdzone przebiegiem, nie czytaniem kodu.**
`generuj.py` woła `z_raportu(l['kod'])`, czyli szuka po kodzie magazynowym,
a zrzut podstawia dopiero wtedy, gdy raport milczy. Puszczone na dwóch
sztucznych raportach z datą 22.09:

- raport z **nowymi** cenami → sekcja `lac` ma wszystkie jedenaście kodów
  z cenami z raportu (`ŁĄCZNIK 063/130: [160,1]`), zero ostrzeżeń;
- raport ze **starymi** cenami → `DO SPRAWDZENIA — cena łącznika rozjechała
  się ze zrzutem: 7`, z podaniem kodu i obu kwot.

Uwaga praktyczna: generator odrzuca raport **starszy niż cennik** („zostawiam
bez zmian"), więc do próby trzeba podmienić datę w komórce A1.

**Czego to wszystko nie naprawia, i trzeba to powiedzieć wprost:** sekcja `lac`
jest tylko na `test`, a automat uruchamia `generuj.py` **z `main`**. Jutrzejszy
raport przyniesie nowe ceny, ale `price-data.js` ich nie dostanie, bo generator
z `main` sekcji `lac` w ogóle nie tworzy — aplikacja dalej będzie czytać zrzut.
**Ceny łączników zaczną się odświeżać same dopiero po przeniesieniu DRV
na `main`**, czyli po „tak do DKM API". Do tego czasu każdy nowy cennik Comarcha
trzeba wpisać do `drv-katalog.json` ręcznie.

Dwie rzeczy z tego samego zrzutu, **których nie dopisałem**:

- **`ŁĄCZNIK 063/150 WUMA`** — to był ucięty wiersz z poprzedniego zrzutu.
  Pełna nazwa mówi „Wuma — pasują tylko do przekładni WUMA", więc do zespołów
  DKM nie wchodzi, choć ma te same średnice `(25-38)` co `063/150 25/38`;
- **`ŁĄCZNIK 040/063` i `040/063 SEM`** (90 zł, po 16–26 szt. na stanie) —
  zespołu `DRV040/063` w aplikacji nie ma i **tak ma zostać**. Właściciel
  zamknął temat 21.09.2026: „rozmawialiśmy i temat zamknąłem, tak ma być".
  Nie dopisywać tych łączników i nie szukać tu brakującego układu.

**Para „łącznik + człon 2" dobiera się po dostępności, potem po cenie.**
Do 11 września oba łączniki DRV063/130 kosztowały 120 zł i wybór nie zmieniał
kwoty; teraz zmienia. Bez porównania ceny zespół dostawałby droższe wykonanie
zależnie od kolejności wpisów w pliku, czyli przez przypadek. Dziś nie zmienia
to niczego — `DKM130` z przełożeniem 30 ma cenę wyłącznie w IEC 100/112, więc
„wyjątek" jest tam jedynym wykonaniem, jakie da się złożyć.

#### Masy łączników — prawdziwe od 21.09.2026, zespół liczy się po najcięższym

Do 21 września w `drv-katalog.json` stały masy **szacowane** (0,2 … 1,2 kg).
Właściciel podał kolumnę „Waga" z Optimy i okazało się, że część była zaniżona
nawet trzykrotnie: `ŁĄCZNIK 063/150` waży 3,175 kg, nie 1,2; `050/110 PRO`
2,394 kg, nie 0,9. Masy zespołów wzrosły o 0 … 2,4 kg.

Nazwy w Optimie zawierają średnice w nawiasie — `ŁĄCZNIK 030/063 (14-19)`,
`050/110 SEM (25-24)` — i **zgadzają się z polem `srednice` we wszystkich
jedenastu wpisach.** To niezależne potwierdzenie reguły doboru łącznika.

Masa, w przeciwieństwie do ceny, **nie odświeża się z raportu magazynowego** —
raport podaje ceny i ilości, nie wagi. `drv-katalog.json` jest jej jedynym
źródłem i nikt go nie pilnuje, więc przy każdej zmianie oferty trzeba go poprawić
ręcznie. Ceny łączników mają pierwszeństwo z cennika, masy nie mają skąd.

**`buduj.mjs` liczy masę zespołu dwiema regułami, obie w jedną stronę** — na
korzyść bezpieczeństwa wyceny:

1. **Najcięższy łącznik zespołu.** Wcześniej generator rzucał błędem, gdy
   łączniki jednego zespołu miały różne masy — przy szacunkach były równe, przy
   prawdziwych już nie (`DRV063/130`: wykonanie wyjątkowe 2,47 kg kontra
   1,33 kg). Masy per łącznik nie liczymy, bo `kgGear()` kluczuje po nazwie
   korpusu i nie wie, którą parę wybrał `drvVar()`; przeliczenie oznaczałoby
   przebudowę drogi liczącej cenę przesyłki.
2. **Zaokrąglenie w górę do 0,5 kg** — właściciel, 21.09.2026: „zaokrąglaj
   w górę dla bezpieczeństwa". To zapas na karton i wypełnienie, których
   w masach katalogowych nie ma wcale. Zaokrąglanie do **najbliższej** połówki
   byłoby gorsze niż nic: trzy z jedenastu łączników poszłyby w dół
   (`030/063` 0,51 → 0,5, `063/150` 3,175 → 3,0, `25/38` 3,58 → 3,5),
   a zaniżona masa to zaniżona cena wysyłki, czyli strata firmy.

**Dokładne masy zostają w `drv-katalog.json`, zaokrągla dopiero generator.**
Inaczej przy następnej zmianie oferty nie byłoby z czym porównać nowego zrzutu
z Optimy — a masy, w przeciwieństwie do cen, nie odświeżają się z raportu
magazynowego, bo raport podaje ceny i ilości, nie wagi.

Żadna z reguł **nie zmienia dziś progu przesyłki** — sprawdzone na wszystkich
107 wierszach, zero zmian ceny i sposobu wysyłki. Zapas jest spory, ale nie
nieskończony: `DRV040/090` z silnikiem 0,37 kW waży 24 kg przy `PACK_CHEAP`
31 kg. Gdyby doszedł cięższy silnik, przeskok na 40 zł zrobi się realny.

Masy palety i kartonu **przez dziesięć dni nie było w wycenie wcale** — dopisana
21.09.2026, patrz „Opakowanie wchodzi do masy" wyżej. `DRV063/150` z silnikiem
1,5 kW ma dziś 139,5 kg brutto, wciąż w progu 100–150 kg, ale osiem zespołów
`DRV063/130` przeskoczyło z 130 na 180 zł.

W Optimie są też **`ŁĄCZNIK 040/063` i `040/063 SEM`**, a zespołu `DRV040/063`
w aplikacji nie ma — **sprawa zamknięta przez właściciela 21.09.2026**, patrz
wyżej. To nie jest brakujący układ; obecność łącznika w magazynie nie znaczy,
że zespół jest w ofercie.

**Montaż nie może gubić masy przesyłki.** Dopłata `MONT` jest usługą i waży 0,
a `shipPlan()` wymagał masy od każdego wyposażenia — więc zaznaczenie montażu
kasowało cenę wysyłki i koszyk pisał „masa do potwierdzenia". Kody bez masy
siedzą teraz w jednej liście `BEZ_MASY = ['PCV','MONT']`, czytanej i przez
`kgExtra()`, i przez sprawdzenie „czy znamy masy".

~~Otwarte: przy dopłacie za montaż zestaw jedzie jako bryła, a `shipItems()`
nadal rozbija go na cztery sztuki.~~ **Nieaktualne — to jest zrobione**, patrz
„Złożony zestaw jedzie jako jedna bryła" niżej. Zapis stał tu jeszcze po
poprawce i przy przeglądzie 21.09.2026 wyglądał na otwartą sprawę, choć
`shipItems()` sprawdza `MONT` i wtedy nie rozbija zestawu.

**Mocowanie i wyposażenie DRV dziedziczy po członie 2** — właściciel, 10.09.2026:
„człon 2 to daje, a to ta sama przekładnia". Kopiowane pod nazwę zespołu
w `drv-data.js`, bo cały kod kluczuje po nazwie korpusu. Ceny i stany osprzętu
czytamy z **dzisiejszego** cennika (`DKM_PRICE.opt`, `wt.opt`), więc nie dublują
się w danych i odświeżają razem z nim — 35 wpisów na osiem zespołów.

**Lista tabel musi być zupełna — 21.09.2026 nie była.** Kopiowane były tylko
`DKM_BORE`, `DKM_FOOT` i `DKM_BOLT`, czyli trzy z dziesięciu. Skutek: ekran
„Sposób mocowania" pisał przy każdym zespole DRV **„brak dla tej wielkości"**
przy mocowaniu bocznym, czołowym i ramieniu reakcyjnym — aplikacja odmawiała
sprzedaży czegoś, co DKM ma na półce, i robiła to cicho, bez błędu. Właściciel
wyłapał to na wersji testowej: „w DRV to wszystkie wymiary wyposażenie powinny
być z 2 członu DRV".

Kopiowane są teraz wszystkie tabele z `dims-data.js` kluczowane po korpusie:
`DKM_BORE`, `DKM_FOOT`, `DKM_SIDE`, `DKM_FACE`, `DKM_ARM`, `DKM_PCV`,
`DKM_SHAFT`, `DKM_SHAFT_DS_L1`, `DKM_BOLT` oraz `DKM_FLANGE` (ta ma o poziom
więcej: typ kołnierza → korpus, więc osobną funkcją).

**Jedyny wyjątek to `DKM_PAM`** — opisuje przyłącze **wejściowe**, a w zespole
wejście należy do członu 1, nie 2. Kopiowanie jej z członu 2 byłoby nieprawdą.
Aplikacja jej nie czyta (jest tylko na kartach wymiarowych), więc zostaje
nietknięta.

**Dwa testy pilnują tego od strony skutku, nie listy:** pierwszy porównuje każdy
zespół z jego członem 2 wartość po wartości we wszystkich jedenastu tabelach,
drugi liczy warunkiem z `mountBrak()`, czy ekran mocowania oferuje przy zespole
to samo co przy samej przekładni. Sprawdzone przez wyłączenie jednej tabeli:
oba padają i wskazują, której brakuje. Pominięcie kolejnej tabeli wyjdzie więc
od razu, a nie po zgłoszeniu właściciela.

Czego **nie** dziedziczymy: **wymiarów gabarytowych**. Długość całkowitą daje
dopiero karta zespołu, bo to dwa korpusy plus łącznik.

Czego brak jest prawdziwy: **kołnierz FB przy `DRV050/110`, `DRV063/130`
i `DRV063/150`** — `DKM110`, `DKM130` i `DKM150` nie mają go i jako pojedyncze
przekładnie też nie. To nie jest ta sama usterka.

**Karta wymiarowa: `cardSrc()` pokazywał rysunek członu wejściowego.** Regexp
brał z nazwy pierwszą trójkę cyfr, więc `DRV050/110` dostawał `karta-050.jpg` —
DKM050 zamiast DKM110. Wał ⌀25 zamiast ⌀42, inny rozstaw otworów, inne śruby;
klient wymierzyłby złe gniazdo.

Ważne, żeby nie przesadzić w drugą stronę (raz już przesadziłem): **karta członu
2 jest dla DRV prawie w całości prawdziwa.** Sekcja „wymiary gabarytowe
i montażowe" opisuje korpus wyjściowy, a sekcja „przyłącze PAM-IEC" podaje
`100B5 → D 28` i `132B5 → D 38` — czyli **dokładnie te liczby, które siedzą
w nazwie łącznika** `(25-28)` i `(25-38)`. Reguła doboru łącznika jest więc
potwierdzona wprost w katalogu producenta. Fałszywa jest tylko długość całkowita
i to, że na wejściu jest łącznik, nie silnik.

Generator szuka kart pod nazwą `karta-drv-050-110.jpg` (z nazwy zespołu: małe
litery, `/` na `-`) w `app/public/assets/` i wpisuje do `DKM_DRV.karty` **tylko
te, których plik naprawdę leży na dysku** — inaczej karta pokazywałaby zepsuty
obrazek. Po wrzuceniu plików wystarczy `node narzedzia/drv/buduj.mjs`.

#### Komplet ośmiu kart DRV — 21.09.2026, gałąź `test`

Właściciel przysłał je z Claude Design jako PNG 1588 × 2246 px z kanałem alfa.
Kod czyta `.jpg`, więc konwersja przez **kanwę w Chromium** (Pillow ani
ImageMagick w środowisku nie ma, ale Playwright jest — ten sam, którym powstaje
obrazek podglądu linku); alfa spłaszczona na biel, jakość 0,9, po ~420 kB.
Rozdzielczości nie zmniejszałem do 1240 × 1752 kart pojedynczych — na karcie
wymiarowej liczy się czytelność małych cyfr, a mieszane rozmiary nic nie psują,
bo `cardSrc()` tylko podstawia adres.

Układ jest inny i lepszy niż w kartach pojedynczych: sekcja **1 „Budowa
zespołu"** (człon 1 + człon 2 = zespół, z zakresami `i₁`, `i₂` i liczbą
kombinacji), **2** wymiary gabarytowe z jedną tabelą liter, **3** wał wyjściowy
wg członu 2, **4** przyłącze PAM-IEC **wg członu 1** — czyli dokładnie to, czego
brakowało, gdy karta członu 2 kłamała o wejściu.

Sprawdzone przed wgraniem, klucz po kluczu, przeciwko `dims-data.js`
i `DKM_DRV.wt`: masy wszystkich ośmiu zespołów, wały (`DKM_BORE`), rozstawy
`C × C1` (`DKM_FOOT`), `H` (`DKM_FACE.h`) i tabele PAM-IEC członu 1 (`DKM_PAM`)
— zgadza się wszystko. Litery opisujące człon 1 (`A1`, `I`, `M1`, `N1`, `O1`,
`H2`, `J`, `K`, `L`) też są spójne: `A1` to wymiar `A` członu wejściowego.

Dwie rozbieżności zgłoszone właścicielowi, **kart nie poprawiałem**:

- **`E` ma tolerancję `h8` na wszystkich ośmiu kartach DRV**, a `h7` na kartach
  pojedynczych i w `DKM_FACE`. Jedno z dwóch źródeł kłamie — to pasowanie
  gniazda, więc nie jest to kosmetyka;
- **`PE` na karcie DRV030/040 to `M6x10`**, a karta DKM040 i aplikacja mówią
  `M6×8`. Pozostałe siedem kart ma `PE` zgodne co do gwintu i głębokości.

Osobna rzecz, nie błąd: karty podają **liczbę kombinacji z katalogu
producenta**, a aplikacja ma ich mniej przy pięciu mniejszych zespołach
(`DRV030/040` — 1 z 14, `DRV030/050` — 6 z 13, `DRV030/063` — 7 z 13,
`DRV040/075` — 10 z 13, `DRV040/090` — 12 z 13). Trzy duże zgadzają się co do
sztuki.

**Właściciel to sprawdził i potwierdził (21.09.2026): „DRV030/040 niestety ale
tak jest, to jest zgodnie z katalogiem".** Powód jest w tym, że karta i aplikacja
liczą dwie różne rzeczy: karta podaje **możliwe połączenia** (katalog, strony
45–46), a aplikacja bierze wiersze z **tabeli wydajności** (strony 47–51), gdzie
każdy wiersz ma moc, moment i `fs`. Tego jest znacznie mniej. Sprawa zamknięta —
nie szukać tu braków.

Przy `DRV030/050` właściciel sprawdzał przełożenia 400, 500 i 600 — **wszystkie
trzy są**: `400` i `500` przy 0,09 i 0,12 kW, `600` przy 0,09 kW. Pełna lista
zespołu: `300, 400, 500, 600, 750, 900` w ośmiu wierszach.

**Montaż 60 zł netto od sztuki** idzie jako zwykłe wyposażenie (`code: 'MONT'`),
więc pokazuje się, liczy i trafia do maila istniejącą drogą — bez nowego
elementu na ekranie, czyli bez kolizji z Design.

**Dopłaty nie doliczamy domyślnie.** Przez pierwsze dziesięć dni `extrasFor()`
dokładało `MONT` do każdej pozycji DRV, więc klient musiał ją *zdejmować* —
odwrotnie niż ustalone (właściciel: „wysyłamy luzem do samodzielnego montażu,
jeśli klient chce aby mu złożyć robimy dopłatę… to można dodać jako pytanie
do klienta i jego decyzji"). Poprawione 20.09.2026: montaż proponuje
`addableFor()` w koszyku, a dokłada `addExtra()` — jedno kliknięcie, wciąż bez
nowego elementu na ekranie. Test pilnuje obu stron: że nie jest domyślny
i że dobrany dokłada 60 zł.

**Złożony zestaw jedzie jako jedna bryła.** `shipItems()` rozbijało DRV na
człony, łącznik i silnik także wtedy, gdy klient dopłacił za montaż — a wtedy
nie ma czego rozbijać. Przy dzisiejszych masach nie zmienia to żadnej ceny:
lekkie zespoły i tak mieszczą się w jednej paczce (najcięższy kurierski to
DRV040/090 z silnikiem, 23,5 kg), a `DKM110`, `DKM130` i `DKM150` i tak
wymuszają paletę. Znaczenie pojawi się dopiero wtedy, gdy pojedyncza bryła
przekroczy `PACK_CHEAP` (31 kg) — wtedy luzem byłyby dwie paczki, a złożona
jedna droższa albo paleta.

### Nazwa i oznaczenie zespołu — dosłownie z ustaleń

Właściciel, 10 września 2026: „dla klienta nie podajemy z czego się składa tylko
zapis **Motoreduktor łączony DRV050/110 z silnikiem jednofazowym lub trójfazowym,
0,12 kW, i = 3000, 0,47 obr/min** … a **SKU w aplikacji będzie DRV050/110 +
0,12KW I3000** dla silników 3-fazowych, a dla jednofazowych **… 1F**".

Nazwę składa `tradeOf()`, oznaczenie `drvSku()`. **Oznaczenie obowiązuje w całej
aplikacji** — `gearSkuOf()` zwraca je dla każdego zespołu DRV, więc ten sam kod
widać w koszyku, w wydruku i w każdym miejscu maila.

11 września wyszło, że przez dobę było inaczej: `drvSku()` wchodziło **tylko
do skrótu pozycji w mailu**, a pozostałe siedem miejsc pokazywało
`DRV063/130 71B14 I1500` — kod w formacie pojedynczej przekładni, którego
w magazynie nie ma, a wygląda jak prawdziwy. Właściciel wyłapał to pytaniem
„o jaką nazwę i SKU kazałem ci zrobić w DRV?". Poprawione, z testem na to,
że taki kod nie pokazuje się ani klientowi, ani w zamówieniu.

Czego ekran nie pokazuje: **szablon koszyka nie używa `tradeName`** — Design
wyświetla tam `box` („DRV063/130") i wiersz parametrów. Nazwa w brzmieniu
ustalonym z właścicielem idzie do zamówienia i do wydruku. Gdyby miała być
też na ekranie, to zmiana po stronie Design.

**Skrót „Pozycje" to lista do skompletowania towaru, więc musi mieć
wyposażenie.** Przez pierwsze tygodnie `pozycjeSkrot()` wypisywał tylko SKU
przekładni i silnika, a falownik, ramię reakcyjne, wały zdawcze i osłona
zostawały wyłącznie w „Szczegółach" na końcu maila. Właściciel wyłapał to
20.09.2026 na prawdziwym zamówieniu: skrót pokazywał **830 zł** przy pozycji
wartej **1 580 zł** — bo brakowało falownika za 657 zł, ramienia za 48 zł
i wału zdawczego za 45 zł. Skrót wymienia teraz całe wyposażenie z ilością
i ceną oraz **wartość pozycji netto**, żeby suma się zgadzała i żeby magazyn
nie musiał składać towaru z dwóch miejsc w mailu. Test pilnuje obu rzeczy:
że wyposażenie jest wymienione i że suma równa się składnikom.

**Kod magazynowy osprzętu dopisany 20.09.2026.** Biuro kompletuje towar
po kodach z Optimy, nie po nazwie handlowej, a sekcja `opt` w cenniku **od
pierwszej wersji generatora** nosiła tylko `[cena, stan]` — kod nigdy tam nie
trafiał. Teraz `opt` to `[cena, stan, kod]`, a skrót wypisuje go w nawiasie:
`Ramię reakcyjne [RAMIE REAKCYJNE DO 040]`, `Wał zdawczy jednostronny
[WAŁ JEDNOSTRONNY DO 40]`, `Kołnierz boczny FA [40 FA]`. Falowniki mają kod
już w nazwie, więc tam się nie dubluje. Osłona PCV kodu nie ma — nie ma jej
w `osprzet`.

**Kody pojawią się dopiero po przebiegu automatu** z nowym generatorem:
`price-data.js` jest generowany, a starszy plik ma wpisy dwuelementowe.
`optOf()` czyta wtedy pusty kod i mail po prostu go nie pokazuje, bez błędu.

**Skład DRV trafia do maila z zamówieniem**, nie na ekran klienta: `pozycjeSkrot()`
przy pozycji DRV podaje SKU zespołu, oba człony z przełożeniami, łącznik i —
gdy klient dopłacił — wyraźne „⚑ KLIENT DOPŁACIŁ ZA MONTAŻ". Bez tego biuro
wysłałoby części luzem komuś, kto zapłacił za złożenie.

**Łącznik wskazujemy ten wybrany, nie listę dopuszczalnych** (od 20.09.2026).
`drvVar()` zwraca `lacKod` i `fl2` — kod łącznika i kołnierz członu 2, z których
policzył cenę — a `priceForItem()` i `hydrate()` niosą je do pozycji w koszyku.
Powód: cena zestawu jest policzona z konkretnej pary, więc to te części mają
zejść z półki. Pozostałe dopuszczalne pary zostają w linii „zamiennie", żeby
biuro wiedziało, czym zastąpić brakujący egzemplarz bez dzwonienia do klienta.

**Termin przy pełnym stanie ma dwa brzmienia** (`drvTermin()`), bo dwie drogi:
kurier — „składamy dziś — dostawa następnego dnia roboczego"; paleta —
„składamy — dostawa zwykle w 1–3 dni robocze", bo Raben dowozi w 1–3 dni robocze
(patrz sprostowanie przy „Termin dostawy w koszyku" — wcześniej stało tu D+2)
i montaż do 12:00 nie zdąży na odbiór tego samego dnia. Konkretnej daty nie
podajemy: aplikacja czyta zegar urządzenia klienta.

**Otwarte, odkąd koszyk zna datę:** `drvTermin()` pisze „składamy **dziś**"
bez patrzenia na godzinę, a panel terminu w koszyku po 13:00 pisze „Wysyłka
jutro". Na jednym ekranie się to nie spotyka — pierwsze jest na karcie produktu,
drugie w koszyku — ale klient, który zajrzy w oba po 13:00, zobaczy dwie różne
rzeczy. Do decyzji z właścicielem, bo to zmiana obietnicy terminu.

**Silnik trójfazowy przy DRV — asymetria naprawiona 10.09.2026.** Właściciel:
„brakuje mi silnika 0,25 kW… a dlaczego przy 3-fazowym nie?". Powód: cennik
kluczuje warianty po **korpusie**, a korpusu `DRV050/110` tam nie ma, więc
`varOf()` nie znajdował nic. Jednofazowy wychodził normalnie, bo jego tabela
`m1f` kluczuje po **mocy, obrotach i kołnierzu** — nie po korpusie. Na jednej
karcie jeden silnik miał cenę, a drugi „na zapytanie", co wyglądało jak usterka.

**Silnik nie zależy od przekładni** — ten sam `0,25 4 71B14 DKM` pasuje
do DKM040 i do DRV040/075. `drvMot()` bierze więc jego cenę, stan i SKU
z dowolnego wariantu o tej samej mocy, obrotach i kołnierzu, czyli **z realnej
pozycji cennika, nie z domysłu**. Rozwiązuje się dla **wszystkich 107 wierszy**.
Tabela składana raz i trzymana przy dacie cennika — inaczej 1800 kluczy
przelatywałoby się przy każdym rysowaniu. Podłączone w `priceOf()`,
`motorOf()` i `priceForItem()`, więc karta i koszyk mówią to samo.

Tą samą tabelą (`drvTab()`, składaną raz na datę cennika) liczy się dziś cena
całego zespołu — patrz „Cena DRV liczy się w locie ze składników" wyżej.

**Jeden kafelek prowadzi do pustych wyników.** DRV dokłada 16 nowych prędkości
na wale (9,33 … 0,28 obr/min). Przy `0,28 obr/min` wszystkie trzy wiersze mają
`fs < 1`, a aplikacja domyślnie takie ukrywa (`hideLow: true`), więc kafelek
pokazuje „3 poz." i prowadzi do zera. Powód jest starszy niż DRV: lista
prędkości powstaje z `N2POOL = CAT()`, czyli z całego katalogu, a nie z
`matches()`. Przed DRV żaden kafelek tego nie ujawniał. Do decyzji z Design,
bo lista kryteriów to ich działka.

#### Współczynnik pracy przy DRV — SPRAWA ZAMKNIĘTA, nie liczyć inaczej

Rozstrzygnięte 21.09.2026. Właściciel zauważył, że przy DRV `fs` wypada
w okolicach 1 lub niżej, bo „tam są małe prędkości jak również duże straty",
a klient ma domyślnie ustawione `B / 8 h / Z=10`. Policzone na danych — miał
rację co do skali:

| | pojedyncze | DRV |
|---|---|---|
| wierszy | 1034 | 107 |
| mediana `fs` | 1,6 | **1,0** |
| `fs` < 1,0 | 19% | **43%** |
| `fs` < 1,3 | 36% | **78%** |

Domyślne warunki dają wymagane `fs = 1,3`, więc dziś **24 zespoły ze 107**
wychodzą jako „wstępnie odpowiedni", a **46 jest ukrytych** przez `hideLow`.

**Co ustaliłem o samym `fs`:** dla tej samej przekładni i przełożenia, przy
różnych silnikach, **`m2 × fs` jest stałe** — sprawdzone na 194 grupach,
zgadza się w 189. Czyli `m2 × fs` to nośność przekładni, a `fs` to ta nośność
podzielona przez moment, jaki da silnik przy pełnej mocy znamionowej.

**Zaproponowałem** liczyć zapas od momentu podanego przez klienta
(`(m2 × fs) / M₂ wymagany`) zamiast od momentu silnika — przy 60% obciążenia
dałoby to 97 wierszy ze 107 jako odpowiednie.

**Właściciel to odrzucił i ma rację:** „moment na wale jest wyliczony za pomocą
sprawności przekładni, więc lepiej to zostawmy". `m2` z tabeli producenta jest
już po stratach, czyli **straty siedzą w `fs`**. Moje przeliczanie podstawiałoby
drugą stronę tego samego rachunku i wychodziłoby optymistyczniej, niż pozwala
katalog. Przy ślimakach z dużym przełożeniem ograniczeniem bywa **temperatura**,
a nie moment — tego z danych nie wyczytam i nie wolno tego zgadywać.

**Czego więc NIE robić:** nie zmieniać `fsBand()`, `fsReqNum()` ani `matches()`,
nie wprowadzać osobnego progu `fs` dla DRV i nie przeliczać zapasu od `M₂`
podanego przez klienta. To nie jest luka — to decyzja.

Skutki, które przez to zostają i **są prawidłowe**:
78% wierszy DRV z etykietą „wymaga weryfikacji", 46 ukrytych przy domyślnym
`hideLow`, i kafelek `0,28 obr/min` prowadzący do zera wyników (akapit wyżej).
Ostatnie jest osobną sprawą — dotyczy listy kryteriów, nie `fs`.

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

## Karty wymiarowe pojedynczych przekładni

Dziesięć plików `app/public/assets/karta-<wielkość>.jpg`, 1240 × 1752 px (A4
przy 150 dpi). Właściciel robi je w Claude Design i przysyła gotowe; kod tylko
je podmienia. Pokazuje je `cardSrc()` na karcie produktu i `printCard()`
w wydruku, a service worker trzyma je w pamięci przeglądarki — wersja cache'u
liczy się z zawartości plików, więc podmiana sama ją unieważnia.

**20 września 2026 weszła ujednolicona dziesiątka** — wszystkie karty
pochodzą z jednego eksportu i mają ten sam układ: nagłówek z logo na białym,
rysunek z literami, tabela wymiarów, sekcja przyłącza PAM-IEC i pole z masą.

Przed wgraniem warto sprawdzić liczby z kart z danymi aplikacji — te same
wielkości stoją w `dims-data.js` i w `DKM_PRICE.wt.gear`, więc rozjazd oznacza,
że któreś z dwóch źródeł kłamie:

| Na karcie | W aplikacji |
|---|---|
| rozstaw otworów `C × C1` | `DKM_FOOT` |
| ⌀ tulei `D (H7)` | `DKM_BORE.std` |
| `E (h7)`, otwory `PE`, kąt `α` | `DKM_FACE` |
| tabele PAM-IEC (`N M P S b₁ t₁ s₁ D`) | `DKM_PAM` |
| masa przekładni | `DKM_PRICE.wt.gear` |

Przy dziesiątce z 20 września wszystko się zgadzało, z niuansami włącznie:
DKM075 nie ma `71B14`, DKM110 i DKM130 są wyłącznie w B5, a DKM150 ma sklejony
wpis `100/112B5`.

**Karta DKM025 ma być inna niż pozostałe — potwierdzone przez właściciela,
nie poprawiać.** Wymiary są wprost na rysunku, bez tabeli z literami, i nie ma
sekcji przyłącza PAM-IEC. To nie jest niedoróbka: tej wielkości aplikacja też
nie ma w `DKM_PAM`, bo DKM025 tego przyłącza nie ma.

Znane, zgłoszone właścicielowi i wgrane na jego polecenie:

- **DKM063, DKM075 i DKM150 mają w tabeli dwa wiersze `Q` i żadnego `O`**,
  choć na rysunku strzałka `O` jest. Pozostałe siedem kart ma to dobrze
  (`O 30 | P 75`, `O 40 | P 87` i tak dalej);
- **DKM110** czeka na poprawkę właściciela: brak pola z masą (w aplikacji
  42,5 kg) i tytuł łamany na dwie linie;
- **DKM150** z podpisem „Gearbox weight" zamiast „Gearbox Mass" — tak ma być.

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
- **Cena wpisana na sztywno w pliku danych psuje się bez ostrzeżenia.** Ceny
  łączników w `drv-katalog.json` to zapas na czas, gdy raport milczy — nie
  źródło. Pierwszeństwo ma zawsze `DKM_PRICE.lac` z dzisiejszego cennika,
  a rozjazd generator wypisuje jako `DO SPRAWDZENIA`. Ta sama uwaga dotyczy
  `katalog.json`: `przekladnie`, `silnikiCeny`, `osprzet`, `falowniki`, `m1f`
  też trzymają ceny zapasowe i też nikt ich nie odświeża.
- **Porównanie „dzień do dnia" widzi tylko to, co jest w porównywanym pliku.**
  11 września wyszło mi, że zmieniła się jedna cena silnika — bo łączników
  w `price-data.js` na `main` nie ma wcale. Zanim ogłosisz, że wszystko się
  zgadza, sprawdź najpierw, czy badany plik w ogóle zawiera to, o co pytasz.
- Cennik jest danymi produkcyjnymi: ceny netto i dostępność, na podstawie
  których klienci wysyłają zapytania ofertowe.
