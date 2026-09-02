# DKM · Dobór przekładni ślimakowych

Aplikacja doboru przekładni ślimakowych DKM Power Transmission Sp. z o.o. —
jedno źródło kodu, trzy sposoby wystawienia:

1. **Podstrona na dkm.pl** — zawartość `dist/` wrzucona do katalogu (np. `/dobor/`)
   albo osadzona w `<iframe>`. Wszystkie ścieżki są względne, więc katalog może
   nazywać się dowolnie; nie ma routingu po adresach, więc serwer nie potrzebuje
   żadnych przekierowań.
2. **PWA na telefon** — ten sam `dist/` z manifestem i service workerem. Po
   pierwszym wejściu aplikacja działa bez internetu, a „Dodaj do ekranu głównego”
   daje ikonę i pełny ekran.
3. **Plik offline** — `dist-offline/DKM Dobor przekladni v3.html`, jeden plik
   ~10 MB z katalogiem, cennikiem, rysunkami i czcionkami w środku. Do wysłania
   handlowcom mailem; otwarty z dysku działa bez sieci.

## Uruchamianie

```bash
npm install
npm run dev            # serwer deweloperski
npm run build          # dist/ (podstrona + PWA, generuje też sw.js)
npm run build:dkm      # to samo, ale z blokadą domen dkm.pl — wersja na produkcję
npm run build:offline  # dist/ + dist-offline/DKM Dobor przekladni v3.html
npm run smoke          # testy dymne w Chromium na zbudowanym dist/
npm run verify         # analityka GA4, wysyłka zamówień, nagłówki bezpieczeństwa
npm run compare        # porównanie pikselowe z prototypem z ../project/
npm run fonts          # ponowne pobranie Barlow z Google Fonts do public/fonts/
```

Egzemplarz pliku offline oznaczony odbiorcą (patrz „Ochrona przed kopiowaniem”):

```bash
node scripts/build-offline.mjs --dla "Jan Kowalski, Firma XYZ"
```

## Skąd się to wzięło

Aplikacja jest przeniesieniem prototypu `../project/DKM Dobór - telefon v3.dc.html`
z Claude Design. Prototyp działał na własnym runtime tego narzędzia (`support.js`,
znaczniki `<x-dc>`, `sc-if`, `sc-for`, `{{ }}`); tutaj ten runtime zniknął, a jego
miejsce zajął zwykły React. Odwzorowanie jest sprawdzane maszynowo — `npm run compare`
otwiera oba warianty obok siebie i liczy różniące się piksele. Na dwunastu ekranach
w dwóch szerokościach (520 px i 1280 px) różnica wynosi **0%**.

Zmiany wobec prototypu ograniczone są do trzech rzeczy:

- runtime Claude Design zastąpiony Reactem (`src/logic.js` + `src/screens/`),
- czcionki Barlow hostowane lokalnie zamiast z Google Fonts (wymóg pracy offline),
- poprawka w `searchHits()`: zmienna z cyframi zapytania nazywa się `digits`, bo
  jako `num` przesłaniała funkcję formatującą liczby i wpisanie SKU falownika
  (np. `E500`) kończyło się wyjątkiem i pustym ekranem.

## Układ katalogów

```
src/
  logic.js            logika doboru 1:1 z prototypu (klasa DkmLogic)
  App.jsx             spina logikę z widokiem (renderVals → ekrany)
  screens/            ekrany w JSX — jeden plik na ekran
  lib/consts.js       stałe: regulamin, wykres fs, formatowanie liczb
  lib/style.js        style inline z tekstu CSS + klasy :hover (jak w prototypie)
  data/               catalog-data.js, price-data.js, dims-data.js — bez zmian
  styles/             arkusz systemu Industry + tokeny i style bazowe
public/
  assets/             rysunki, karty katalogowe, ikony, logo
  fonts/              Barlow i Barlow Condensed (latin + latin-ext)
  manifest.webmanifest
scripts/
  postbuild.mjs       generuje service workera z listą plików do cache'u
  build-offline.mjs   skleja wszystko w jeden plik HTML
  smoke.mjs           testy dymne (przypadki kontrolne z CLAUDE.md)
  compare.mjs         porównanie pikselowe z prototypem
  fetch-fonts.mjs     pobranie czcionek
```

## Aktualizacja danych

Katalog, cennik i wymiary to nadal osobne pliki ustawiające `window.DKM_*` —
odświeżenie polega na podmianie pliku w `src/data/` i przebudowaniu:

| plik | co zawiera |
| --- | --- |
| `src/data/catalog-data.js` | katalog doboru (`window.DKM_CATALOG`) |
| `src/data/price-data.js` | ceny, stany, warianty B5/B14, falowniki, masy (`window.DKM_PRICE`) |
| `src/data/dims-data.js` | wymiary, tuleje, mocowania, kołnierze PAM-IEC |

## Wdrożenie na serwer

`dist/` wystarczy skopiować w całości. Dwie rzeczy warto sprawdzić po stronie serwera:

- katalog powinien odpowiadać na adres z ukośnikiem na końcu (`/dobor/`), bo ścieżki
  do zasobów są względne — typowe przekierowanie z `/dobor` na `/dobor/` załatwia sprawę;
- `sw.js` musi być serwowany bez agresywnego cache'owania (`Cache-Control: no-cache`),
  inaczej przeglądarka nie zauważy nowej wersji aplikacji po wdrożeniu.

Service worker sam sprząta stary cache przy każdej nowej wersji i nigdy nie
przechwytuje wysyłki formularza — zamówienia idą prosto do sieci.

Gotowe konfiguracje z nagłówkami bezpieczeństwa leżą w `deploy/`:
`nginx.conf` (fragment do wklejenia) i `.htaccess` (Apache). Polityka CSP z tych
plików jest sprawdzana testem — `npm run verify` uruchamia aplikację pod dokładnie
tą polityką i sprawdza, że nic się nie blokuje.

## Sprawdzenie po wdrożeniu

`npm run verify` sprawdza całą logikę analityki i wysyłki, ale **nie wysyła nic na
zewnątrz** — żądania do Google i Formspree są przechwytywane. Poniższe trzy rzeczy
trzeba potwierdzić na żywo, już na dkm.pl:

1. **Wysyłka zamówienia.** Złóż zamówienie testowe na własne dane. Powinno: pokazać
   zielony panel z numerem `DKM-RRRRMMDD-GGMMSS-XXX`, wrócić po 5 sekundach na ekran
   startowy z pustym koszykiem, a na skrzynce `sklep@d-k-m.eu` pojawić się mail z tym
   samym numerem w temacie. Jeśli mail nie dochodzi, sprawdź w panelu Formspree adres
   odbiorczy i limit zgłoszeń w planie — po jego wyczerpaniu wysyłka zacznie zwracać
   błąd (klient zobaczy wtedy panel awaryjny z treścią do skopiowania, więc zamówienie
   nie przepada, ale trafia do Was ręcznie).
2. **Analityka.** W GA4 (usługa `G-79013G7BXL`) otwórz *Raporty → Czas rzeczywisty*.
   Wejdź na aplikację, zaakceptuj analitykę i przejdź dobór do koszyka — w ciągu minuty
   powinny pojawić się zdarzenia `add_to_cart`, `view_cart`, `refine_step` i `submit_order`.
   Potem cofnij zgodę na ekranie „Informacje prawne · RODO” i sprawdź, że nowe zdarzenia
   przestają dochodzić.
3. **Nagłówki.** Po wgraniu konfiguracji z `deploy/` sprawdź stronę w
   [securityheaders.com](https://securityheaders.com) — powinna wyjść ocena A.

## Ochrona przed kopiowaniem

Uczciwie na wstępie: **kodu działającego w przeglądarce nie da się zabezpieczyć przed
skopiowaniem.** Wszystko, co dociera do klienta — katalog, cennik, reguły doboru — musi
być czytelne dla przeglądarki, więc jest czytelne też dla człowieka, który wie, gdzie
patrzeć. Obfuskacja podnosi próg o godzinę pracy, nie więcej. To, co ma realną wartość,
to **utrudnienie kopiowania na skalę** i **możliwość udowodnienia, że kopia jest kopią.**
Aplikacja ma dziś trzy takie zabezpieczenia:

**Nota o prawach autorskich w kodzie.** Każdy zbudowany plik `.js` i `.css` zaczyna się
od noty własnościowej z datą wydania. Nie zatrzyma nikogo technicznie, ale usuwa obronę
„nie wiedziałem, że to cudze” — a w sporze to ma znaczenie.

**Blokada domen** (`npm run build:dkm`). Wersja produkcyjna uruchomi się tylko pod
`dkm.pl`, jej poddomenami i lokalnie; pod obcym adresem pokazuje komunikat
„Kopia nieautoryzowana”. Nie dotyczy pliku offline ani pracy z dysku. Da się to obejść
w kilka minut — ale obejście jest świadomym działaniem, a nie przypadkiem, i to również
łatwiej wykazać przed sądem. Domeny zmienia się w `package.json` (`VITE_DKM_HOSTS`).

**Znak wodny egzemplarza pliku offline.** `node scripts/build-offline.mjs --dla "…"`
wpisuje nazwę odbiorcy i numer wydania w trzy miejsca pliku (komentarz HTML, `<meta>`,
`window.__dkmWydanie`) i dokleja ją do nazwy pliku. Jeśli plik wypłynie, widać, z czyjego
egzemplarza. Warto prowadzić prostą listę: komu, kiedy, jakie wydanie.

Czego **nie** zrobiłem, a co daje więcej niż wszystkie powyższe razem wzięte:

- **Cennik po stronie serwera.** Najcenniejsze w tej aplikacji nie jest ułożenie ekranów,
  tylko baza 1693 wariantów handlowych z cenami i stanami. Dopóki jedzie w pliku do
  przeglądarki, jest do wzięcia w całości jednym poleceniem. Gdyby ceny szły z API na
  Waszym VPS-ie (tym samym, który ma liczyć proformy), konkurent musiałby odpytać serwer
  tysiące razy, a Wy zobaczylibyście to w logach i moglibyście ograniczyć tempo. Kosztem
  jest praca offline — trzeba zdecydować, co jest ważniejsze. Rozwiązanie pośrednie:
  wersja webowa z cenami z serwera, plik offline z cenami w środku, tylko dla handlowców.
- **Prawo autorskie i prawo do bazy danych.** W Unii bazie danych, w którą włożono istotny
  nakład, przysługuje osobna ochrona (*sui generis*) — niezależnie od praw do kodu.
  Katalog doboru i cennik są dokładnie takim przypadkiem. Warto, żeby prawnik to opisał
  i żebyście mieli udokumentowaną datę powstania bazy — to zwykle skuteczniejsze niż
  cokolwiek, co da się zrobić w kodzie.
- **Znak wodny w danych.** Kilka nieszkodliwych, unikalnych wpisów w katalogu (np. pozycja,
  która nigdy nie pojawi się w wynikach) to klasyczny dowód kopiowania — jeśli konkurent
  ma je u siebie, nie da się wytłumaczyć zbiegiem okoliczności. Mogę takie wpisy dodać,
  ale to decyzja, którą trzeba podjąć świadomie, bo ingeruje w dane katalogowe.
