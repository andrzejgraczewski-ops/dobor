# Projekt: DKM — Dobór przekładni ślimakowych (aplikacja mobilna + web)

Główny plik: `DKM Dobór - telefon v2.dc.html`
Dane katalogu: `catalog-data.js` (615 pozycji, strony 17–32, `window.DKM_CATALOG`)
Ceny i dostępność: `price-data.js` (`window.DKM_PRICE` — z `uploads/dkm-cennik-v3.xlsx`: warianty + nowe 5,5 kW 112B5, akcesoria, ramiona, nazwy silników, falowniki)
Eksport offline: `DKM Dobor przekladni.html` (przebudować po każdej zmianie)

## Wersja v3 — współczynnik pracy fs (25.08.2026)
Plik: `DKM Dobór - telefon v3.dc.html` (źródło robocze `dkm-v3-src.dc.html`, offline `DKM Dobor przekladni v3.html`).
Równoległa wersja do testów, v2 zostaje bez zmian. Zmiany wg specyfikacji klienta:
- Nazwa: „współczynnik pracy przekładni fs" (nigdy „bezpieczeństwa"). Cztery zakresy oceniane na wartości nieokrąglonej: `fs < 1,0` czerwony „Poza zalecanym zakresem", `1,0 ≤ fs < 1,3` pomarańczowy „Wymagana weryfikacja zastosowania", `fs ≥ 1,3` zielony „Dobór wstępnie odpowiedni", brak danych szary. Zawsze kolor + ikona + tekst.
- Token `--color-mid` (#c46a00) tylko dla statusu pomarańczowego.
- Wyniki sortowane ok → mid; low i brak danych w osobnej sekcji „Dostępne zestawienia poza zalecanym zakresem".
- Karta produktu: status, komunikat, rozwijane „Dlaczego mimo to można kupić tę przekładnię?", trzy przyciski (zamów bez gwarancji / większa przekładnia / skonsultuj dobór).
- Ekran `screen:'consent'`: dane zestawienia + SKU, dwa niezależne checkboxy (`CONSENT_A`, `CONSENT_B`), zapis `{a,b,at,iso,ver,textA,textB}` w pozycji koszyka. Bez zgody `order()` blokuje wysyłkę.
- Brak gwarancji przypisany do konkretnej pozycji (nie do całego zamówienia, nie do silników/falowników/akcesoriów).
- Mail: nagłówek „UWAGA: ZAMÓWIENIE PRZEKŁADNI Z fs PONIŻEJ 1,0" z SKU i datą akceptacji, sekcja „Warunki zakupu przekładni poza zalecanym zakresem", treść obu oświadczeń.
- Nowy tekst informacji technicznej (12 akapitów) w koszyku i w PDF.

## Zamówienie w trzech etapach — układ 5a (25.08.2026)
Ekran `screen:'rfq'` przebudowany z czterech sekcji na trzy etapy (`state.rfqStep` 1–3):
1. **Napęd** — pozycje, ilości, wyposażenie, sumy, ostrzeżenia fs.
2. **Dane** — sposób dostawy + dane kontaktowe (imię, nazwisko, e-mail, telefon wymagane; firma i NIP opcjonalne).
3. **Płatność** — forma płatności, informacja techniczna, akceptacja regulaminu, przyciski zamawiania i zapytania.

Elementy układu:
- **Pasek etapów** u góry (`data-rfq-top`), klikalny; etap zrobiony dostaje ✓, cofać można zawsze, w przód tylko po walidacji (`stepValid`).
- **Zwinięty etap 1** (`showFold`) — po przejściu dalej jedna linia na pozycję z nazwą handlową, ilością i kwotą + „Zmień ▾”; nigdy sam licznik.
- **Nazwa handlowa** (`tradeOf`): „Motoreduktor 3F/1F” gdy przekładnia i silnik > 0, „Silnik” albo „Przekładnia” gdy jedno z nich wyzerowane.
- **Stałe podsumowanie** (`aside`, `position:sticky`) na ekranach ≥ 900 px — siatka `rfqCols` = `minmax(0,1fr) 330px`, kontener `rfqDocW` = 1100 px. Zawiera pozycje, sumy netto/VAT/brutto, ostrzeżenie fs i telefon.
- **Dolny pasek** w zamówieniu pokazuje kwotę brutto i „Dalej →”; na etapie 3 „↓ Potwierdź” przewija do przycisku zamawiania (`data-order-btn`) — akcja nie jest dublowana.
- Kolory, dobór, ceny, warianty B5/B14, falowniki, klasyfikacja fs, zgody, mail i proforma bez zmian.

## Zasilanie silników (25.08.2026)
- Napięcie: najpierw opis handlowy z cennika (`voltOf` szuka „230/400v", „U-230V"), a gdy go brak — reguła DKM (26.08.2026): silniki 3-fazowe do 3 kW = 230/400 V, powyżej = 400/690 V; 1-fazowe zawsze 230 V. 22 z 54 SKU 3-fazowych ma napięcie w opisie — pozostałe 32 wymagają uzupełnienia opisów w cenniku.
- Pokazywane w: liście wyników (przy silniku), karcie produktu (plakietka pod nazwą silnika), wierszu silnika w zamówieniu, mailu i proformie, wydruku karty technicznej.
- **Silniki 1-fazowe** — tabela `m1f` w `price-data.js`: **19 kluczy, wyłącznie seria ML/OMEC** (26.08 dopisane ręcznie z ustaleń: `0,25 4 71B5` 267 zł/10 szt., `0,55 4 80B5` 360 zł/11 szt.; usunięty błędny wpis `3,0 4 100B5` — brak w magazynie, ML kończy się na 2,2 kW) z listy klienta (26.08.2026), klucz `kW|obr/min|IEC+kołnierz` → `[SKU, nazwa, cena, stan]`, wszystkie 230 V, 0,12–3,0 kW. Kołnierze z łapami znormalizowane przy generowaniu: B34 → B14, B35 → B5; wykonania B3 (same łapy, bez kołnierza) pominięte, bo nie spasują z przekładnią. Silniki SEMKh/BESEL świadomie pominięte. Dane techniczne (moc, obroty, przełożenie, moment) identyczne jak dla 3-fazowych — zmienia się tylko zasilanie i cena silnika.
- **Zasilanie jako filtr doboru (26.08.2026)** — `state.motPh` jest globalny, kafelki „3-fazowy 400 V / 1-fazowy 230 V” stoją w wynikach obok filtra dostępności (2. krok). Wybór 1-fazowego zawęża listę do pozycji, dla których cennik ma silnik 1-fazowy o zgodnym rozmiarze IEC (280 z 528 przy pełnym katalogu), zmienia cenę, nazwę, SKU i napięcie, i przenosi się na kartę produktu oraz do zamówienia. Karta ma te same kafelki. Do silników 1-fazowych falownik nie jest proponowany (`motorPhases` czyta wybrany silnik).
- **Filtr „Ukryj fs poniżej 1,0"** — `state.hideLow`, kafelek pod wyborem zasilania, licznik pokazuje liczbę pozycji poza zalecanym zakresem.
- **Nazwa handlowa** — „Motoreduktor 1F" albo „Motoreduktor 3F" wg wybranego zasilania; w karcie produktu, liście wyników, zamówieniu, mailu i proformie.

## Masy i wysyłka (26.08.2026)
- `wt` w `price-data.js`: `mot` (90 SKU silników), `gear` (10 korpusów), `opt` (39 pozycji wyposażenia, klucz `KOD|KORPUS`), `inv` (25 falowników po SKU; `E500-2S0040B` bez masy w źródle). Osłona PCV **pomijana w masie** (26.08.2026 — masa nieistotna dla podziału paczek). Masa pozycji = ilość przekładni × korpus + ilość silników × SKU + wyposażenie × ilość. Brak masy którejkolwiek sztuki → „masa do potwierdzenia" zamiast zaniżonej kwoty.
- Cennik wysyłki (netto): kurier **paczka do 31 kg 25 zł**, **31–40 kg 40 zł**; spedycja Raben **40–100 kg 130 zł**, **100–150 kg 180 zł**, powyżej — wycena indywidualna. Pobranie **+5 zł**. Od **3 000 zł netto** towaru wysyłka gratis (dopłata za pobranie zostaje). VAT 23% jak towar.
- **Podział na paczki** (26.08.2026): program pakuje pojedyncze sztuki (korpus, silnik, wyposażenie — nie da się ich dzielić). Próg **31–40 kg (40 zł) stosuje się wyłącznie do pojedynczej sztuki** o takiej masie — jedzie osobną paczką; wszystko pozostałe pakuje się metodą first-fit decreasing przy limicie **31 kg (25 zł/paczka)**. Wynik porównywany ze spedycją — wygrywa niższa kwota. Przykłady: silnik 28 kg + przekładnia 13 kg → 2 paczki 50 zł (nie 40 zł za jedną 41-kg); sztuka 33 kg + 29,3 kg drobnicy → 40 + 25 = 65 zł. Korpusy DKM110–150 zawsze spedycją (zamówienie do 9:00), podobnie każda sztuka powyżej 40 kg.
- Widoczne w koszyku: wartość towaru, „Wysyłka · X kg" z kwotą i progiem, informacja o gratisie albo ile brakuje do 3 000 zł; w pasku bocznym skrót. Wysyłka wchodzi w sumę netto/VAT/brutto oraz do maila i proformy.

## Do zrobienia (ustalone 25.08.2026)
1. **Analityka** — śledzenie ruchów klienta w aplikacji, żeby wiedzieć, gdzie odpada i co rozwijać.
3. **Automatyczna proforma** — wymaga serwera (skrypt na VPS obok Magento): numeracja, PDF, wysyłka maila do DKM i klienta, zapis zamówienia.

## Zasady projektu
- Kolory firmowe DKM (tylko te trzy + biel): granat #29265B, niebieski #17529E, mięta #38B184.
- Dobór domyślnie na silniku 1400 obr/min (standard, 4-biegunowym); 900 i 2800 na jeden przycisk.
- Cztery ścieżki wejścia: moc P₁, przełożenie i, obroty n₂, moment M₂ — każda równorzędna.
- Ekrany wejściowe P₁, i oraz n₂ pokazują CAŁY katalog (26.08: n₂ przestało zależeć od wybranej prędkości silnika — kafelek ma podpis „n₁ 900 / 1400 / 2800", a klik zeruje filtr prędkości).
- Nie wpisywać danych technicznych, których nie ma w katalogu klienta (żadnych wymyślonych wymiarów, smarowania itp.).
- Breakpoint 900 px: telefon = jedna kolumna 520 px, web = 1180 px i dwie kolumny w wynikach.

## Do zrobienia (ustalone 20.08.2026 — PRZYPOMNIEĆ NA STARCIE KOLEJNEJ ROZMOWY)
0. **Ceny, dostępność i warianty B5/B14 (24.08.2026)** — `price-data.js` wygenerowany z `uploads/DKM_katalog_warianty_ceny_stany_AKCESORIA.xlsx` (+ nazwy silników i ramiona reakcyjne ze starego `uploads/cennikkwwiecien.xlsx`). Struktura: `var` 1693 warianty handlowe, klucz `KORPUS|IEC+KOŁNIERZ|i|kW|obr/min` → `[cena przekł., stan przekł., cena silnika, stan silnika, cena zestawu, stan zestawu, status, SKU silnika]`, status 0=dostępny / 1=na zamówienie / 2=zapytaj o cenę; `nam` opisy silników wg SKU; `opt` 33 pozycje wyposażenia (`FA|`, `FB|`, `ARM|`, `SS|`, `DS|` + KORPUS → `[cena, stan]`), osłona PCV bez ceny → „na zapytanie”. Katalog techniczny (`catalog-data.js`) ma kołnierze łączone `71B5/B14`; aplikacja rozbija je na warianty i wybiera automatycznie (najpierw dostępny, potem tańszy), a klient może przełączyć na karcie produktu (plansza „Przyłącze silnika — wybierz wariant”). Wybór wędruje do koszyka, maila i specyfikacji. Lista wyników: cena przekładni + cena silnika + dostępność. Koszyk: przełącznik „z silnikiem”, wyposażenie w wartości pozycji, sumy netto / VAT 23% / brutto, dostawa (kurier / odbiór), płatność (proforma / limit kupiecki), przyciski „Wyślij zapytanie” i „Zamawiam — proszę o proformę”. Rabat ustala handlowiec — komunikat w koszyku i mailu.
0b. **Falowniki (24.08.2026)** — `inv` w `price-data.js`: 34 pozycje Simphoenix `[SKU, seria, kW, fazy, cena, stan, status]`. E500 0,37–4 kW przy 1 × 230 V i 0,75–7,5 kW przy 3 × 400 V; E280 1,1–22 kW tylko 3 × 400 V. Sekcja „Falownik · opcjonalnie” na karcie produktu: przełącznik zasilania 3 × 400 V / 1 × 230 V, potem kafelki wg reguły „moc silnika i jeden stopień wyżej” (E500 przed E280). Do silników 1-fazowych falownik nie jest proponowany. Przy zasilaniu 1 × 230 V czerwone ostrzeżenie: silniki 230/400 V (0,06–3,0 kW) są w standardzie w gwiazdę, trzeba przełączyć w trójkąt. Wybrany falownik wchodzi w wyposażenie pozycji (kod `INV`) — dolicza się do wartości pozycji, sum i maila.
1. **Zapytanie ofertowe** — przycisk „Wyślij do DKM” ma faktycznie wysyłać e-mail z gotową treścią (pozycje, ilości, dane techniczne). Dziś atrapa.
2. **Rysunki wymiarowe + tabela wymiarów per wielkość korpusu** — czeka na dane od użytkownika (strony wymiarowe katalogu, ⌀ wałów, kołnierze). Dziś placeholder na karcie produktu.
3. **Karta PDF · zapisz offline** — przycisk nieaktywny, do zrobienia eksport karty produktu do PDF.
4. Zapamiętywanie ostatniego doboru i krótka historia doborów (dziś zapisuje się tylko koszyk zapytania).
