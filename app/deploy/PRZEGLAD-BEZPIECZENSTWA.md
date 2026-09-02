# Przegląd bezpieczeństwa — 02.09.2026

Zakres: kod aplikacji w `app/`, analityka GA4, wysyłka zamówień przez Formspree,
wdrożenie na dkm.pl, ochrona przed skopiowaniem. Wszystko, co poniżej opisane jako
sprawdzone, jest sprawdzane automatycznie — `npm run verify` (57 sprawdzeń)
i `npm run smoke` (29 testów).

## Co jest w porządku

| Obszar | Ustalenie |
| --- | --- |
| Wstrzyknięcie kodu (XSS) | Cały interfejs renderuje React, który sam escapuje treść. Jedyne miejsce z `innerHTML` to wydruk karty (`printWin`) i trafiają tam wyłącznie dane z katalogu — żadne pole wpisywane przez klienta. Brak `eval`, `new Function`, `dangerouslySetInnerHTML`. |
| Dane kontaktowe | **Nie są zapisywane** w pamięci przeglądarki. W `localStorage` leżą tylko koszyk (`dkm-rfq-v2`), historia doborów (`dkm-hist-v1`) i decyzja o analityce. Po wysłaniu zamówienia koszyk i dane są czyszczone. |
| Zgoda na analitykę | GA4 nie uruchamia się przed zgodą — sprawdzone: zero żądań do Google i brak `dataLayer`. Cofnięcie zgody realnie zatrzymuje pomiar (`ga-disable`, `consent update: denied`, wygaszenie ciasteczek `_ga*`). |
| Zakres analityki | Do GA idzie wyłącznie fakt zdarzenia. Sprawdzone, że w `dataLayer` nie ma imienia, nazwiska, e-maila ani telefonu. |
| Wysyłka zamówień | Poprawny adres, metoda i nagłówki; komplet pól; numer zgłoszenia na ekranie zgodny z wysłanym. Walidacja nie przepuszcza zamówienia bez danych kontaktowych ani bez akceptacji regulaminu. |
| Podwójne zamówienia | Blokada działa — trzy dotknięcia przycisku po sukcesie dają jedno zgłoszenie i jeden numer. |
| Awaria wysyłki | Klient dostaje treść do skopiowania i awaryjny `mailto:` — zamówienie nie przepada. |
| Zależności | `npm audit` → 0 podatności (po podniesieniu Vite; poprzednia wersja miała podatność dotyczącą wyłącznie serwera deweloperskiego, nie produkcji). |
| Mapy źródłowe | Nie są publikowane — w `dist/` nie ma żadnego pliku `.map`. |

## Co poprawiłem w trakcie przeglądu

1. **Podwójne liczenie w GA4.** Po cofnięciu i ponownym udzieleniu zgody aplikacja
   wstawiała do strony drugi znacznik `gtag.js`. Ten sam błąd jest w prototypie.
2. **Podatność `esbuild` w serwerze deweloperskim** — podniesione Vite, `npm audit` czysty.
3. **Pierwsze wejście na telefonie kosztowało 7,6 MB.** Service worker pobiera teraz
   przy instalacji 2,9 MB (aplikacja od razu działa offline w zakresie doboru), a skany
   kart katalogowych — 4,7 MB — dociągają się w tle po aktywacji.

## Co wymaga Twojej decyzji

### 1. Teksty prawne są niezgodne z tym, co aplikacja robi — **do pilnej poprawy**

Polityka prywatności w aplikacji mówi, że aplikacja „nie prowadzi analityki”, że dane
„nie są przesyłane do DKM ani do osób trzecich” i że zapytanie wysyła się „ze swojego
programu pocztowego”. Od czasu wdrożenia GA4 i Formspree wszystkie trzy zdania są
nieprawdziwe. Brakuje też informacji o odbiorcach danych i o przekazaniu ich poza EOG
(art. 13 RODO). Gotowa propozycja nowych tekstów: `PROPOZYCJA-tekstow-RODO.md`.
Nie zmieniałem ich sam — to treść prawna.

### 2. Formularz można zasypać spamem

Adres `https://formspree.io/f/mgaewanz` jest widoczny w kodzie (inaczej się nie da —
przeglądarka musi go znać). Każdy może wysyłać na niego zgłoszenia poza aplikacją.
W panelu Formspree warto włączyć **reCAPTCHA albo honeypot** i sprawdzić limit
zgłoszeń w planie — po jego wyczerpaniu zamówienia przestaną dochodzić.

### 3. Nagłówki bezpieczeństwa na serwerze

Aplikacja sama ich nie ustawi — to konfiguracja serwera. Gotowe pliki: `deploy/nginx.conf`
i `deploy/.htaccess` (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
HSTS). Polityka CSP jest testowana: `npm run verify` uruchamia aplikację dokładnie pod
nią i sprawdza, że dobór, czcionki, analityka i wysyłka działają bez naruszeń.

### 4. Publiczne repozytorium ujawnia cennik — **rozstrzygnąć przed wystawieniem**

Wybrane wdrożenie (GitHub Pages pod `andrzejgraczewski-ops.github.io/dobor/`) w darmowym
planie wymaga **publicznego** repozytorium. Wtedy `src/data/price-data.js` — 1693 warianty
handlowe z cenami i stanami — jest do sklonowania jednym poleceniem, w czytelnej postaci
i razem z historią zmian (czyli także starymi cennikami; późniejsze usunięcie pliku tego
nie cofa). Żadne zabezpieczenie w kodzie tego nie dotyczy, bo nikt nie musi uruchamiać
aplikacji, żeby wziąć same dane.

Możliwości: wystawić na dkm.pl i zostawić repozytorium prywatne (najlepsze — działają też
nagłówki bezpieczeństwa), prywatne repozytorium + GitHub Pro, rozdzielenie na prywatne
źródła i publiczny wynik budowania, albo świadoma zgoda na jawność cennika. Szczegóły
w `app/README.md` → „Zanim zrobisz repozytorium publiczne”.

### 5. Drobne, do rozważenia

- **Walidacja e-maila** sprawdza tylko obecność znaku `@`. Literówka w adresie oznacza
  zamówienie, na które nie da się odpowiedzieć. Warto dołożyć sprawdzenie wzorca
  i ostrzeżenie przy typowych literówkach (`gmail.co`, `wp.p`).
- **Koszyk zostaje na wspólnym komputerze** — na stanowisku u klienta następna osoba
  zobaczy poprzedni koszyk (bez danych kontaktowych). Można dodać „Wyczyść koszyk”.
- **Zdarzenie `view_cart`** liczy się tylko przy wejściu przez dolny pasek. Wejście
  z karty zestawu przyciskiem „Dodaj do koszyka” go nie wywołuje, więc statystyka
  zaniża liczbę wejść do koszyka. Tak jest w prototypie — poprawka to jedna linia,
  ale zmienia liczby w GA, więc zostawiam decyzję Tobie.
