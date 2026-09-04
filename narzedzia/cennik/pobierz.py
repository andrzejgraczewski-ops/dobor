#!/usr/bin/env python3
"""Pobiera ze skrzynki najnowszy raport magazynowy z Comarch ERP Optima.

    python3 narzedzia/cennik/pobierz.py raport.xlsx

Dane logowania z zmiennych środowiskowych (w GitHub Actions — z Secrets):
    POCZTA_SERWER   np. graczanpa.nazwa.pl
    POCZTA_LOGIN    raporty@d-k-m.eu
    POCZTA_HASLO    hasło do tej skrzynki
    POCZTA_TEMAT    fragment tematu, domyślnie „STANY MAGAZYNOWE"
    POCZTA_FOLDER   opcjonalnie: konkretny folder zamiast przeszukania wszystkich

Optima wysyła raport na adres właściciela, a filtr przekazuje go dalej — przy
przekazaniu temat bywa poprzedzony „Fwd:", więc szukamy fragmentu, nie całości.
Filtr potrafi też odłożyć wiadomość poza skrzynkę odbiorczą, dlatego domyślnie
przeglądamy wszystkie foldery. Bierzemy najnowszą wiadomość z ostatnich dni;
starsze zostawiamy w spokoju, żeby powrót do archiwum nie cofnął cennika.

Log przebiegu w publicznym repozytorium jest jawny, więc nie wypisujemy tu
tematów ani adresów — tylko liczby i nazwę znalezionego załącznika.
"""
import email, imaplib, os, socket, ssl, sys
from email.header import decode_header, make_header
from datetime import datetime, timedelta, timezone
from pathlib import Path

DNI_WSTECZ = 14
# Po ilu dniach brak nowego raportu przestaje być normalny. Raport przychodzi
# w dni powszechne, więc czterodniowe okno przechodzi przez weekend i jeden
# dzień świąteczny. Bez tego progu zatrzymanie się raportu wyglądałoby przez
# dwa tygodnie jak sukces: automat brałby ostatni stary plik, nie zmieniał nic
# i kończył się na zielono, a strona stałaby na nieaktualnych cenach.
MAX_WIEK_DNI = 4
imaplib._MAXLINE = 1_000_000  # niektóre serwery zwracają bardzo długie linie


WYMAGANE = ('POCZTA_SERWER', 'POCZTA_LOGIN', 'POCZTA_HASLO')


def sprawdz_ustawienia():
    """Bez tego skrypt kończy się w zerowy czas i log nie mówi, czego zabrakło."""
    stan = {n: bool(os.environ.get(n, '').strip()) for n in WYMAGANE}
    print('Sekrety widziane przez ten przebieg:')
    for nazwa, jest in stan.items():
        print(f'    {nazwa}: ' + ('ustawiony' if jest else 'BRAK'))
    if all(stan.values()):
        return
    sys.exit(
        'Do skrzynki nie mam kompletu danych — przebieg przerwany przed połączeniem.\n'
        'Sekret musi być dodany dokładnie tu: Settings → Secrets and variables →\n'
        '  **Actions** → zakładka „Secrets" → „New repository secret".\n'
        'Najczęstsze pomyłki:\n'
        '  · dodanie w zakładce Dependabot albo Codespaces zamiast Actions —\n'
        '    tamte sekrety nie trafiają do przebiegów Actions,\n'
        '  · dodanie jako „Variable" zamiast „Secret",\n'
        '  · polska litera w nazwie: ma być POCZTA_HASLO, nie POCZTA_HASŁO,\n'
        '  · nazwa małymi literami albo ze spacją na końcu.')


def zmienna(nazwa, domyslna=None):
    w = os.environ.get(nazwa, domyslna)
    if not w:
        sys.exit(f'Brak zmiennej środowiskowej {nazwa} albo jest pusta.')
    return w


def polacz(serwer, login, haslo):
    try:
        M = imaplib.IMAP4_SSL(serwer)
    except (socket.gaierror, socket.timeout, OSError, ssl.SSLError) as e:
        sys.exit(f'Nie udało się połączyć z serwerem IMAP „{serwer}" po SSL (port 993).\n'
                 f'Szczegóły: {e}\n'
                 f'Sprawdź, czy adres serwera jest poprawny i czy hosting wystawia IMAP na 993.')
    try:
        M.login(login, haslo)
    except imaplib.IMAP4.error as e:
        M.logout()
        sys.exit(f'Serwer odrzucił logowanie użytkownika „{login}".\n'
                 f'Odpowiedź serwera: {e}\n'
                 f'Najczęstsze przyczyny: login musi być pełnym adresem e-mail; '
                 f'hosting wymaga osobnego hasła do IMAP; hasło wklejone ze spacją na końcu.')
    return M


def foldery(M):
    wybrany = os.environ.get('POCZTA_FOLDER')
    if wybrany:
        return [wybrany]
    ok, dane = M.list()
    if ok != 'OK':
        return ['INBOX']
    lista = []
    for w in dane:
        if not w:
            continue
        tekst = w.decode('utf-8', 'replace')
        if '\\Noselect' in tekst:
            continue
        nazwa = tekst.split(' "." ')[-1] if ' "." ' in tekst else tekst.split(' ')[-1]
        lista.append(nazwa.strip().strip('"'))
    # skrzynka odbiorcza najpierw — najczęściej to tam leży raport
    lista.sort(key=lambda n: (n.upper() != 'INBOX', n))
    return lista or ['INBOX']


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    cel = Path(sys.argv[1])
    sprawdz_ustawienia()
    szukany = zmienna('POCZTA_TEMAT', 'STANY MAGAZYNOWE').upper()
    serwer, login = zmienna('POCZTA_SERWER'), zmienna('POCZTA_LOGIN')

    M = polacz(serwer, login, zmienna('POCZTA_HASLO'))
    try:
        od = (datetime.now(timezone.utc) - timedelta(days=DNI_WSTECZ)).strftime('%d-%b-%Y')
        najlepsza, przejrzanych, z_zalacznikiem, sprawdzone = None, 0, 0, []

        for folder in foldery(M):
            ok, _ = M.select(f'"{folder}"', readonly=True)
            if ok != 'OK':
                continue
            ok, dane = M.search(None, 'SINCE', od)
            if ok != 'OK' or not dane or not dane[0]:
                sprawdzone.append((folder, 0))
                continue
            numery = dane[0].split()
            sprawdzone.append((folder, len(numery)))
            for numer in numery:
                ok, tresc = M.fetch(numer, '(RFC822)')
                if ok != 'OK' or not tresc or not isinstance(tresc[0], tuple):
                    continue
                przejrzanych += 1
                wiad = email.message_from_bytes(tresc[0][1])
                temat = str(make_header(decode_header(wiad.get('Subject', ''))))
                zalaczniki = [c for c in wiad.walk()
                              if (c.get_filename() or '').lower().endswith(('.xlsx', '.xls'))]
                if zalaczniki:
                    z_zalacznikiem += 1
                if szukany not in temat.upper() or not zalaczniki:
                    continue
                data = email.utils.parsedate_to_datetime(wiad.get('Date'))
                # nagłówek Date bywa bez strefy; bez tego porównanie dat wywala krok
                if data.tzinfo is None:
                    data = data.replace(tzinfo=timezone.utc)
                if najlepsza is None or data > najlepsza[0]:
                    najlepsza = (data, zalaczniki[0], folder)

        if not najlepsza:
            print(f'Przejrzane foldery (nazwa · wiadomości z ostatnich {DNI_WSTECZ} dni):')
            for nazwa, ile in sprawdzone:
                print(f'    {nazwa} · {ile}')
            sys.exit(
                f'Nie znalazłem wiadomości z „{szukany}" w temacie i załącznikiem XLSX.\n'
                f'Przejrzano {przejrzanych} wiadomości, z tego {z_zalacznikiem} z załącznikiem '
                f'XLSX.\nJeśli raport na pewno przyszedł: sprawdź, jak dokładnie brzmi temat '
                f'i ustaw sekret POCZTA_TEMAT na jego fragment (wielkość liter bez znaczenia).')

        data, czesc, folder = najlepsza
        wiek = (datetime.now(timezone.utc) - data).days
        if wiek > MAX_WIEK_DNI:
            sys.exit(f'Najnowszy raport ma {wiek} dni ({data:%Y-%m-%d}), a powinien przychodzić '
                     f'w każdy dzień powszechny.\nCennik zostaje bez zmian — ale coś się zacięło. '
                     f'Sprawdź kolejno:\n'
                     f'  1. czy Optima nadal wysyła raport,\n'
                     f'  2. czy filtr przekazuje go na skrzynkę {os.environ.get("POCZTA_LOGIN", "")},\n'
                     f'  3. czy temat wiadomości się nie zmienił.')
        nazwa = str(make_header(decode_header(czesc.get_filename())))
        cel.write_bytes(czesc.get_payload(decode=True))
        print(f'wiadomość z {data:%Y-%m-%d %H:%M} · folder {folder}')
        print(f'załącznik {nazwa} → {cel} ({cel.stat().st_size} B)')
    finally:
        try:
            M.logout()
        except Exception:
            pass


if __name__ == '__main__':
    main()
