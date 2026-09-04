# Automat cennika

Codziennie w dni robocze workflow `Cennik z magazynu` odbiera ze skrzynki
raport magazynowy z Comarch ERP Optima, przelicza go na
`app/src/data/price-data.js`, commituje i publikuje stronę.

## Ręczne uruchomienie

GitHub → Actions → **Cennik z magazynu** → *Run workflow*. Ten sam przebieg,
tylko od razu, bez czekania na harmonogram.

## Ręczna podmiana, gdy trzeba obejść pocztę

```bash
pip install openpyxl
python3 narzedzia/cennik/generuj.py raport.xlsx --sprawdz   # samo podsumowanie
python3 narzedzia/cennik/generuj.py raport.xlsx             # zapisuje cennik
```

## Kiedy automat nic nie robi — i to jest w porządku

- w skrzynce nie ma nowej wiadomości z „STANY MAGAZYNOWE" w temacie,
- raport jest starszy niż cennik, który już leży w repozytorium,
- po przeliczeniu nic się nie zmieniło.

## Kiedy przerywa i dlaczego

- raport ma mniej niż 400 pozycji albo wychodzi mniej niż 1600 wariantów —
  to znaczy, że plik jest okrojony albo zmienił się jego układ. Lepiej zostawić
  wczorajszy cennik niż opublikować połowę.

Data raportu trafia na stronę jako „stan na…", więc starszy raport nigdy
nie nadpisze nowszego.

## Pliki

| Plik | Rola |
|---|---|
| `pobierz.py` | odbiera najnowszy raport po IMAP |
| `generuj.py` | raport + katalog → `price-data.js` |
| `katalog.json` | część stała: przypisanie silników, falowniki, osprzęt, masy, lista cenowa |
| `warianty.json` | lista wariantów z tabeli doborowej aplikacji |
| `wyodrebnij-katalog.mjs` | odtwarza dwa powyższe z `price-data.js` i `catalog-data.js` |

`katalog.json` i `warianty.json` przelicza się tylko wtedy, gdy zmieni się
tabela doborowa albo dojdzie nowy produkt:

```bash
node narzedzia/cennik/wyodrebnij-katalog.mjs
```
