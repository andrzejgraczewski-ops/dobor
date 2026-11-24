#!/usr/bin/env python3
"""Sprawdza, że opublikowana strona naprawdę niesie dzisiejszy cennik.

Po co to jest: 24 listopada 2026 krok `deploy-pages` padł na usterce GitHuba
("No artifacts named github-pages were found"), a cennik był już zapisany
w repozytorium. Dwa ręczne ponowienia zakończyły się na zielono i nie
opublikowały niczego, bo warunek "plik się zmienił" pomijał wtedy całą
publikację. Wpis wdrożenia w API też pokazywał `success` — GitHub zakłada go
przy starcie zadania i zamyka razem z zadaniem, niezależnie od tego, czy krok
publikacji w ogóle się wykonał.

Jedynym wiarygodnym dowodem jest więc to, co naprawdę leży pod adresem strony.
`postbuild.mjs` wpisuje do mapy strony datę raportu magazynowego, nie dzień
budowania — czyli dokładnie tę liczbę, którą trzeba porównać.

Zmienne środowiskowe (obie wyłącznie na potrzeby testów):
  SPRAWDZ_ADRES  — adres mapy strony; domyślnie produkcyjny
  SPRAWDZ_PROBY  — ile razy pytać, domyślnie 6 (publikacja chwilę się rozchodzi)
"""
import os
import re
import sys
import time
import urllib.error
import urllib.request

ADRES = os.environ.get('SPRAWDZ_ADRES', 'https://dobor.dkmpower.pl/sitemap.xml')
PROBY = int(os.environ.get('SPRAWDZ_PROBY', '6'))
ODSTEP = float(os.environ.get('SPRAWDZ_ODSTEP', '10'))
CENNIK = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      '..', '..', 'app', 'src', 'data', 'price-data.js')


def data_z_cennika(sciezka):
    """DD.MM.RRRR z pliku cennika → RRRR-MM-DD, tak jak zapisuje je mapa strony."""
    with open(sciezka, encoding='utf-8') as f:
        tresc = f.read()
    m = re.search(r"updated:\s*'stan na (\d{2})\.(\d{2})\.(\d{4})'", tresc)
    if not m:
        sys.exit('BŁĄD: nie znalazłem daty w ' + sciezka +
                 ' — zmienił się format pliku cennika?')
    return '%s-%s-%s' % (m.group(3), m.group(2), m.group(1))


def data_ze_strony(adres):
    """<lastmod> z opublikowanej mapy strony albo None, gdy się nie udało."""
    zadanie = urllib.request.Request(adres, headers={
        'User-Agent': 'DKM-sprawdz-publikacje',
        # mapa strony leży pod stałym adresem, więc bez tego można dostać kopię
        # z pamięci pośredniej i orzec, że publikacja się nie udała, choć się udała
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    })
    with urllib.request.urlopen(zadanie, timeout=20) as odp:
        tresc = odp.read().decode('utf-8', errors='replace')
    m = re.search(r'<lastmod>\s*(\d{4}-\d{2}-\d{2})', tresc)
    return m.group(1) if m else None


def main():
    oczekiwana = data_z_cennika(CENNIK)
    ostatni_blad = None
    for proba in range(1, PROBY + 1):
        try:
            widoczna = data_ze_strony(ADRES)
        except (urllib.error.URLError, OSError, ValueError) as e:
            widoczna, ostatni_blad = None, e
        if widoczna == oczekiwana:
            print('Strona niesie cennik z %s — zgadza się.' % oczekiwana)
            return 0
        powod = ('brak <lastmod> w odpowiedzi' if widoczna is None and ostatni_blad is None
                 else ('nie udało się pobrać: %s' % ostatni_blad) if widoczna is None
                 else 'strona ma %s' % widoczna)
        print('próba %d/%d — %s, oczekuję %s' % (proba, PROBY, powod, oczekiwana))
        if proba < PROBY:
            time.sleep(ODSTEP)

    # Świadomie kończymy błędem: to jedyny moment, w którym nieudana publikacja
    # przestaje być cicha. GitHub wysyła wtedy maila o nieudanym przebiegu,
    # a następny przebieg tego samego dnia opublikuje jeszcze raz.
    print('')
    print('BŁĄD: strona NIE ma cennika z %s.' % oczekiwana)
    print('Cennik jest zapisany w repozytorium, ale klienci go nie widzą.')
    print('Adres sprawdzany: %s' % ADRES)
    return 1


if __name__ == '__main__':
    sys.exit(main())
