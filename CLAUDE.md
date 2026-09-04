# Cennik i stany magazynowe — kontekst dla przyszłych sesji

## Stan na 4 września 2026

Cennik odświeża się sam — workflow `.github/workflows/cennik.yml`, w dni robocze.
Do czasu jego uruchomienia właściciel podmieniał plik ręcznie; automat miał
pierwotnie stać na VPS-ie (`/opt/dkm-stany`) i z tego zrezygnowano: wszystko,
czego potrzebuje, jest już w GitHub Actions, a serwer byłby drugim miejscem
do pilnowania.

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

### Cena przekładni bez wpisu w magazynie

Raport podaje cenę tylko tego, co leży na półce, więc kod chwilowo niedostępny
nie miałby ceny i wypadał z oferty jako „zapytaj o cenę". Cena przekładni jest
jednak **stała w obrębie korpusu** (DKM025 = 125 zł, DKM110 = 1100 zł i tak dalej),
więc generator uzupełnia brakujące pozycje ceną ich korpusu. Powstaje wtedy status
„dostawa 1–3 dni" — właściciel potwierdził, że ten termin utrzyma dla każdej
przekładni z katalogu.

Cena korpusu nie jest wpisana na sztywno: liczy się ją z pozycji, które cenę mają,
i tylko wtedy, gdy jest jednolita (co najmniej 80% wskazań). Gdyby producent kiedyś
zróżnicował ceny w obrębie korpusu, generator przestanie uzupełniać i wypisze UWAGĘ
— lepiej zostawić „zapytaj o cenę" niż podać klientowi złą kwotę.

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

## Rzeczy, które łatwo zepsuć

- `app/public/CNAME` z treścią `dobor.dkmpower.pl` musi trafiać do publikacji
  (Vite kopiuje `public/` do `dist/`, workflow publikuje `app/dist`).
  Bez tego pliku domena przestaje działać.
- **Jeśli zmieni się ścieżka albo nazwa pliku z cennikiem, trzeba to poprawić
  w `narzedzia/cennik/generuj.py` i powiedzieć właścicielowi.** Po cichej
  zmianie automat będzie codziennie nadpisywał plik, którego nikt już nie
  czyta, a strona zamrozi się na ostatnich danych bez żadnego błędu.
- Harmonogram w publicznym repozytorium GitHub wyłącza po 60 dniach bez
  aktywności i wysyła o tym maila do właściciela. Wtedy wystarczy włączyć
  workflow z powrotem jednym kliknięciem.
- Cennik jest danymi produkcyjnymi: ceny netto i dostępność, na podstawie
  których klienci wysyłają zapytania ofertowe.
