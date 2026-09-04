#!/usr/bin/env python3
"""Pobiera ze skrzynki najnowszy raport magazynowy z Comarch ERP Optima.

    python3 narzedzia/cennik/pobierz.py raport.xlsx

Dane logowania z zmiennych środowiskowych (w GitHub Actions — z Secrets):
    POCZTA_SERWER   np. graczanpa.nazwa.pl
    POCZTA_LOGIN    raporty@d-k-m.eu
    POCZTA_HASLO    hasło aplikacji do tej skrzynki
    POCZTA_TEMAT    fragment tematu, domyślnie „STANY MAGAZYNOWE"

Optima wysyła raport na adres właściciela, a filtr przekazuje go dalej — przy
przekazaniu temat bywa poprzedzony „Fwd:", więc szukamy fragmentu, nie całości.
Bierzemy najnowszą wiadomość z ostatnich dni; starsze zostawiamy w spokoju,
żeby powrót do archiwum nie cofnął cennika do starego stanu.
"""
import email, imaplib, os, sys
from email.header import decode_header, make_header
from datetime import datetime, timedelta, timezone
from pathlib import Path

DNI_WSTECZ = 14


def zmienna(nazwa, domyslna=None):
    w = os.environ.get(nazwa, domyslna)
    if w is None:
        sys.exit(f'Brak zmiennej środowiskowej {nazwa}.')
    return w


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    cel = Path(sys.argv[1])
    szukany = zmienna('POCZTA_TEMAT', 'STANY MAGAZYNOWE').upper()

    M = imaplib.IMAP4_SSL(zmienna('POCZTA_SERWER'))
    try:
        M.login(zmienna('POCZTA_LOGIN'), zmienna('POCZTA_HASLO'))
        M.select('INBOX', readonly=True)
        od = (datetime.now(timezone.utc) - timedelta(days=DNI_WSTECZ)).strftime('%d-%b-%Y')
        ok, dane = M.search(None, 'SINCE', od)
        if ok != 'OK':
            sys.exit('Nie udało się przeszukać skrzynki.')

        najlepsza = None
        for numer in dane[0].split():
            ok, tresc = M.fetch(numer, '(RFC822)')
            if ok != 'OK' or not tresc or not isinstance(tresc[0], tuple):
                continue
            wiad = email.message_from_bytes(tresc[0][1])
            temat = str(make_header(decode_header(wiad.get('Subject', ''))))
            if szukany not in temat.upper():
                continue
            data = email.utils.parsedate_to_datetime(wiad.get('Date'))
            if najlepsza is None or data > najlepsza[0]:
                najlepsza = (data, wiad, temat)

        if not najlepsza:
            sys.exit(f'W ostatnich {DNI_WSTECZ} dniach nie ma wiadomości z „{szukany}" w temacie.')

        data, wiad, temat = najlepsza
        for czesc in wiad.walk():
            nazwa = str(make_header(decode_header(czesc.get_filename() or '')))
            if not nazwa.lower().endswith(('.xlsx', '.xls')):
                continue
            cel.write_bytes(czesc.get_payload(decode=True))
            print(f'{data:%Y-%m-%d %H:%M} · {temat}')
            print(f'załącznik {nazwa} → {cel} ({cel.stat().st_size} B)')
            return
        sys.exit(f'Wiadomość z {data:%Y-%m-%d} nie ma załącznika XLSX.')
    finally:
        try:
            M.logout()
        except Exception:
            pass


if __name__ == '__main__':
    main()
