# Teksty prawne — WPROWADZONE 02.09.2026

> **Stan: punkty 1–3 są już w aplikacji** (decyzja klienta z 02.09.2026 — „wprowadź
> zmiany do RODO bo zbieram dane"). Ten plik zostaje jako zapis tego, co i dlaczego
> zostało zmienione — przyda się przy rozmowie z prawnikiem i przy rejestrze czynności
> przetwarzania. Punkt 4 to zadania po stronie DKM, poza aplikacją.
>
> Jedyne odstępstwo od pierwotnej propozycji: w tekście o przekazaniu danych do USA
> została sama podstawa „standardowe klauzule umowne zatwierdzone przez Komisję
> Europejską", bez powoływania się na Data Privacy Framework — certyfikacji Formspree
> w DPF nie potwierdziłem, więc lepiej tego nie twierdzić. **Sprawdźcie to w umowie
> powierzenia z Formspree i dopiszcie, jeśli certyfikacja jest aktualna.**

Poniżej: co było napisane, dlaczego to była nieprawda i co jest teraz.

## Na czym polega problem

Teksty w aplikacji pochodzą z czasu, gdy aplikacja rzeczywiście nie wysyłała nic na
zewnątrz — zapytanie otwierało program pocztowy klienta. Od czasu wdrożenia **GA4**
i **Formspree** aplikacja:

- ustawia ciasteczka Google Analytics (`_ga`, `_ga_*`) i wysyła dane o ruchu do Google,
- wysyła treść zamówienia i dane kontaktowe klienta **bezpośrednio z jego przeglądarki**
  do Formspree (usługa amerykańska), a dopiero stamtąd trafiają one na skrzynkę DKM.

Trzy zdania w „Polityce prywatności → Bezpieczeństwo danych" są więc dziś nieprawdziwe.
To nie jest kosmetyka: informacja o odbiorcach danych i o przekazywaniu ich poza EOG
jest obowiązkiem z art. 13 RODO, a rozbieżność między tym, co aplikacja mówi, a tym,
co robi, jest łatwa do wykazania (wystarczy otworzyć narzędzia deweloperskie).

## 1. Blok „Bezpieczeństwo danych” — ekran „Informacje prawne · RODO”

**Jest (nieprawda):**

> Aplikacja działa **w całości na Twoim urządzeniu**. Nie ma serwera, nie ma konta, nie
> ma logowania. […]
> - Żadne wpisane dane nie są przesyłane do DKM ani do osób trzecich bez Twojego działania.
> - Aplikacja nie stosuje plików cookie do śledzenia, nie profiluje użytkowników i **nie prowadzi analityki**.
> - Zapytanie ofertowe wysyłasz sam, ze swojego programu pocztowego — treść widzisz przed
>   wysłaniem, a dane trafiają do DKM dopiero po naciśnięciu „Wyślij”.

**Propozycja:**

> Dobór i obliczenia wykonują się **w całości na Twoim urządzeniu** — katalog i cennik są
> wbudowane w aplikację, nie ma konta ani logowania.
>
> - Dane, które wpiszesz w zamówieniu lub zapytaniu, wysyłamy dopiero po naciśnięciu przycisku
>   wysyłki. Trafiają wtedy do DKM za pośrednictwem usługi **Formspree** (Formspree Inc., USA),
>   która przekazuje je na naszą skrzynkę pocztową. Formspree działa jako podmiot przetwarzający
>   na nasze zlecenie; przekazanie danych do USA odbywa się na podstawie standardowych klauzul
>   umownych oraz Data Privacy Framework.
> - Koszyk i historia doborów zapisują się wyłącznie w pamięci Twojej przeglądarki, na Twoim
>   urządzeniu — możesz je usunąć, czyszcząc dane przeglądarki.
> - **Analitykę prowadzimy wyłącznie za Twoją zgodą.** Po jej wyrażeniu korzystamy z Google
>   Analytics 4 (Google Ireland Limited), która zapisuje ciasteczka `_ga` i `_ga_*` i mierzy
>   anonimowo wejścia oraz korzystanie z koszyka. Do analityki nie trafiają dane kontaktowe
>   ani treść zamówienia. Bez zgody Google Analytics w ogóle się nie uruchamia, a zgodę możesz
>   cofnąć w każdej chwili na tym ekranie — pomiar zostaje wtedy realnie zatrzymany, a ciasteczka
>   usunięte.
> - Korespondencja przychodząca jest przetwarzana przez upoważnionych pracowników
>   DKM Power Transmission Sp. z o.o., na kontach zabezpieczonych hasłem i uwierzytelnianiem
>   dostawcy poczty.
>
> Jeżeli otrzymałeś aplikację jako plik, odpowiadasz za jego przechowywanie na swoim urządzeniu
> zgodnie z własnymi zasadami bezpieczeństwa.

## 2. Blok „Jakie dane i po co” — dopisek o odbiorcach

Do istniejącej tabelki RODO warto dołożyć jedną pozycję:

> **Odbiorcy danych**
> Formspree Inc. (USA) — pośredniczy w dostarczeniu zamówienia lub zapytania na skrzynkę DKM.
> Google Ireland Limited — wyłącznie dane analityczne i wyłącznie za Twoją zgodą. Poza tym
> dostawca poczty elektronicznej oraz, w zakresie realizacji zamówienia, firma kurierska
> lub spedycyjna. Dane mogą być przekazywane poza Europejski Obszar Gospodarczy na podstawie
> standardowych klauzul umownych.

## 3. Regulamin § 10 „Wymagania techniczne”

**Jest:** „W przypadku wersji internetowej wymagane może być również połączenie z Internetem.”

**Propozycja — dopisek:** „Złożenie zamówienia lub wysłanie zapytania wymaga połączenia
z Internetem także w wersji offline aplikacji.”

## 4. Rzecz do sprawdzenia po Twojej stronie

- **Umowa powierzenia z Formspree** (Data Processing Agreement) — Formspree udostępnia ją
  w panelu; bez niej przetwarzanie danych klientów przez tę usługę nie ma podstawy.
- **Rejestr czynności przetwarzania** — dopisać aplikację doboru jako czynność, z Formspree
  i Google jako odbiorcami.
- **Ustawienia Formspree**: adres odbiorczy, ochrona przed spamem (reCAPTCHA lub honeypot),
  limit zgłoszeń w planie — po jego przekroczeniu zamówienia przestaną dochodzić.
