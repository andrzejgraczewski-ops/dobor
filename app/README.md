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
npm run build:offline  # dist/ + dist-offline/DKM Dobor przekladni v3.html
npm run smoke          # testy dymne w Chromium na zbudowanym dist/
npm run compare        # porównanie pikselowe z prototypem z ../project/
npm run fonts          # ponowne pobranie Barlow z Google Fonts do public/fonts/
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
