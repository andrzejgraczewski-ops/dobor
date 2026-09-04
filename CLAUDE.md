# Cennik i stany magazynowe — kontekst dla przyszłych sesji

## Stan na 4 września 2026

Automat **jeszcze nie działa**. Cennik jest na razie podmieniany ręcznie:
właściciel dostaje wygenerowany plik i wrzuca go do czatu z prośbą o podmianę.

Docelowo ma to robić skrypt na VPS-ie — opis niżej. Kiedy automat ruszy,
ten akapit trzeba poprawić.

## Plik z cennikiem jest generowany, nie pisany

`app/src/data/price-data.js` powstaje automatycznie i **nie wolno go edytować
ręcznie ani poprawiać pojedynczych pozycji** — najbliższy przebieg automatu
i tak nadpisze plik w całości. Podmienia się go zawsze całym plikiem.

## Skąd przychodzi (docelowo)

```
Comarch ERP Optima
  └─ wysyła mailem raport, temat "STANY MAGAZYNOWE"
     załącznik XLSX "7.02 Stan magazynów na dzień ilościowo DKM"
  └─ Optima potrafi wysyłać tylko na adres właściciela, więc filtr na jego
     skrzynce przekazuje wiadomość na raporty@d-k-m.eu
  └─ skrypt na VPS (/opt/dkm-stany) odbiera go po IMAP, przelicza
     i commituje price-data.js do tego repozytorium
  └─ GitHub Actions przebudowuje i publikuje na dobor.dkmpower.pl
```

Skrypty automatu (`pobierz_raport.py`, `generuj_price_data.py`, `katalog.json`,
`uruchom.sh`) mają leżeć na VPS-ie, nie w tym repozytorium. Są już napisane
i przetestowane, ale nie zostały jeszcze wgrane na serwer — dopóki tak jest,
każdy nowy cennik przychodzi do czatu ręcznie.

Do czasu uruchomienia automatu obowiązuje jedna zasada: **plik zawsze
przychodzi z zewnątrz gotowy.** Nie ma sensu generować go ani poprawiać
w tym repozytorium.

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
- **Jeśli zmieni się ścieżka albo nazwa pliku z cennikiem, trzeba o tym
  powiedzieć właścicielowi** — na VPS-ie jest skrypt, który wpisuje dane
  pod konkretną ścieżkę. Po cichej zmianie automat będzie codziennie
  nadpisywał plik, którego nikt już nie czyta, a strona zamrozi się na
  ostatnich danych bez żadnego błędu.
- Cennik jest danymi produkcyjnymi: ceny netto i dostępność, na podstawie
  których klienci wysyłają zapytania ofertowe.
