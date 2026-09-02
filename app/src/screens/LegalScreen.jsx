// Informacje prawne, RODO, bezpieczeństwo danych i przełącznik zgody na analitykę.
import React from 'react';
import { S, hv } from '../lib/style.js';

export default function LegalScreen({ v }) {
  return (
    <div style={S('padding:22px 20px 30px')}>
      <button onClick={v.closeLegal} className={hv('background:var(--color-accent-100)')} style={S("min-height:46px;margin-bottom:16px;padding:11px 16px;background:transparent;border:1px solid var(--color-accent);color:var(--color-accent);cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>← Zamknij</button>
      <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>Informacje prawne</div>
      <h2 style={S("margin:5px 0 6px;font:600 30px/1.05 'Barlow Condensed',sans-serif")}>Prawa własności i poufność</h2>
      <div style={S('margin:0 0 18px;padding:14px 15px;border:1px solid var(--color-accent-300);background:var(--color-accent-100)')}>
        <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700)")}>Analityka · RODO</div>
        <div style={S('margin-top:6px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>{v.anaState}</div>
        <div style={S('margin-top:6px;font:400 12.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Do analityki trafia wyłącznie fakt zdarzenia — wejście, dodanie pozycji do koszyka, wysłanie zamówienia lub zapytania. Nie przekazujemy danych kontaktowych ani treści zamówienia.</div>
        <div style={S(`margin-top:11px;display:grid;grid-template-columns:${v.formCols};gap:9px`)}>
          <button onClick={v.anaNo} className={hv('background:#fff')} style={S("min-height:44px;padding:11px;background:transparent;border:1px solid var(--color-accent);color:var(--color-accent);cursor:pointer;font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Cofnij zgodę</button>
          <button onClick={v.anaYes} className={hv('background:var(--color-accent-600)')} style={S("min-height:44px;padding:11px;background:var(--color-accent);border:1px solid var(--color-accent);color:#fff;cursor:pointer;font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Wyraź zgodę</button>
        </div>
      </div>
      <p style={S('margin:0 0 14px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Aplikacja została opracowana dla DKM Power Transmission Sp. z o.o. i stanowi własność DKM Power Transmission Sp. z o.o.</p>
      <p style={S('margin:0 0 14px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Wszelkie prawa do aplikacji, w tym w szczególności prawa do jej struktury, funkcjonalności, interfejsu, baz danych, algorytmów, metod obliczeniowych, sposobu prezentacji danych, dokumentacji technicznej, grafik, zestawień oraz generowanych formularzy i raportów, są zastrzeżone w zakresie przysługującym DKM Power Transmission Sp. z o.o.</p>
      <p style={S('margin:0 0 8px;font:600 14px/1.6 Barlow,sans-serif')}>Bez uprzedniej pisemnej zgody DKM Power Transmission Sp. z o.o. zabronione jest w szczególności:</p>
      <ul style={S('margin:0 0 18px;padding-left:20px;font:400 14px/1.65 Barlow,sans-serif;color:var(--color-neutral-700)')}>
        <li>kopiowanie lub powielanie aplikacji albo jej elementów,</li>
        <li>modyfikowanie, adaptowanie lub tworzenie rozwiązań pochodnych,</li>
        <li>udostępnianie aplikacji osobom trzecim poza zakresem udzielonego uprawnienia,</li>
        <li>dekompilowanie, reverse engineering, odtwarzanie kodu źródłowego lub sposobu działania aplikacji,</li>
        <li>kopiowanie lub wykorzystywanie baz danych, algorytmów, metod doboru oraz dokumentacji,</li>
        <li>wykorzystywanie aplikacji lub jej elementów do stworzenia rozwiązania konkurencyjnego.</li>
      </ul>
      <div style={S('padding:14px 15px;border-left:4px solid var(--color-accent);background:var(--color-accent-100)')}>
        <div style={S("font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent)")}>Zastrzeżenie dotyczące wyników technicznych</div>
        <p style={S('margin:8px 0 12px;font:400 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Wyniki obliczeń, doboru urządzeń, parametrów technicznych i konfiguracji generowane przez aplikację mają charakter pomocniczy i informacyjny.</p>
        <p style={S('margin:0 0 12px;font:400 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Użytkownik jest zobowiązany do zweryfikowania poprawności doboru w odniesieniu do rzeczywistych warunków pracy, parametrów instalacji, dokumentacji technicznej urządzeń oraz obowiązujących norm i przepisów — w szczególności wymaganej mocy, momentu obrotowego, prędkości obrotowej, współczynnika pracy, obciążeń promieniowych i osiowych, warunków środowiskowych oraz sposobu montażu.</p>
        <p style={S('margin:0;font:400 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>DKM Power Transmission Sp. z o.o. nie ponosi odpowiedzialności za skutki zastosowania wyników wygenerowanych przez aplikację bez ich odpowiedniej weryfikacji technicznej, z zastrzeżeniem odpowiedzialności, której zgodnie z obowiązującym prawem nie można wyłączyć ani ograniczyć.</p>
      </div>
      <h2 style={S("margin:26px 0 6px;font:600 26px/1.1 'Barlow Condensed',sans-serif")}>Polityka prywatności (RODO)</h2>
      <p style={S('margin:0 0 12px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}><strong>Administrator danych:</strong> DKM Power Transmission Sp. z o.o., ul. 3 Maja 20, 87-640 Czernikowo, NIP 879-268-87-36. Kontakt w sprawach danych osobowych: <a href="mailto:sklep@d-k-m.eu">sklep@d-k-m.eu</a>.</p>
      <div style={S('display:grid;gap:1px;background:var(--color-divider);border:1px solid var(--color-divider);margin-bottom:14px')}>
        <div style={S('background:var(--color-bg);padding:12px 14px')}>
          <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700)")}>Jakie dane i po co</div>
          <div style={S('margin-top:4px;font:400 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-700)')}>Wyłącznie dane, które sam wpiszesz w zapytaniu ofertowym: firma, osoba kontaktowa, e-mail, telefon, uwagi oraz wybrane pozycje. Służą do przygotowania i przedstawienia oferty oraz kontaktu handlowego.</div>
        </div>
        <div style={S('background:var(--color-bg);padding:12px 14px')}>
          <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700)")}>Podstawa prawna</div>
          <div style={S('margin-top:4px;font:400 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-700)')}>Art. 6 ust. 1 lit. b RODO — czynności zmierzające do zawarcia umowy, oraz art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes w prowadzeniu korespondencji handlowej.</div>
        </div>
        <div style={S('background:var(--color-bg);padding:12px 14px')}>
          <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700)")}>Okres przechowywania</div>
          <div style={S('margin-top:4px;font:400 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-700)')}>Przez czas obsługi zapytania i współpracy handlowej, a następnie przez okres wymagany przepisami podatkowymi i terminami przedawnienia roszczeń.</div>
        </div>
        <div style={S('background:var(--color-bg);padding:12px 14px')}>
          <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700)")}>Twoje prawa</div>
          <div style={S('margin-top:4px;font:400 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-700)')}>Dostęp do danych, sprostowanie, usunięcie, ograniczenie przetwarzania, przenoszenie, sprzeciw oraz skarga do Prezesa Urzędu Ochrony Danych Osobowych. Podanie danych jest dobrowolne, ale niezbędne do przygotowania oferty.</div>
        </div>
      </div>
      <div style={S('padding:14px 15px;border:1px solid var(--color-divider);border-left:4px solid var(--color-ok);background:var(--color-ok-bg)')}>
        <div style={S("font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-ok-ink)")}>Bezpieczeństwo danych</div>
        <p style={S('margin:8px 0 10px;font:400 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Aplikacja działa <strong>w całości na Twoim urządzeniu</strong>. Nie ma serwera, nie ma konta, nie ma logowania. Katalog i obliczenia są wbudowane w plik aplikacji, więc dobór wykonuje się offline.</p>
        <ul style={S('margin:0 0 10px;padding-left:20px;font:400 13.5px/1.65 Barlow,sans-serif;color:var(--color-neutral-900)')}>
          <li>Żadne wpisane dane nie są przesyłane do DKM ani do osób trzecich bez Twojego działania.</li>
          <li>Koszyk zapytania i historia doborów są zapisywane wyłącznie w pamięci przeglądarki na Twoim urządzeniu — możesz je w każdej chwili usunąć, czyszcząc dane przeglądarki.</li>
          <li>Aplikacja nie stosuje plików cookie do śledzenia, nie profiluje użytkowników i nie prowadzi analityki.</li>
          <li>Zapytanie ofertowe wysyłasz sam, ze swojego programu pocztowego — treść widzisz przed wysłaniem, a dane trafiają do DKM dopiero po naciśnięciu „Wyślij”.</li>
          <li>Korespondencja przychodząca jest przetwarzana przez upoważnionych pracowników DKM Power Transmission Sp. z o.o., na kontach zabezpieczonych hasłem i uwierzytelnianiem dostawcy poczty.</li>
        </ul>
        <p style={S('margin:0;font:400 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-900)')}>Jeżeli otrzymałeś aplikację jako plik, odpowiadasz za jego przechowywanie na swoim urządzeniu zgodnie z własnymi zasadami bezpieczeństwa.</p>
      </div>
      <p style={S('margin:18px 0 0;font:400 12.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-500)')}>This application and its components are proprietary to DKM Power Transmission Sp. z o.o. Unauthorized copying, modification, distribution or use is prohibited.</p>
      <p style={S('margin:8px 0 0;font:600 12.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-700)')}>© 2026 DKM Power Transmission Sp. z o.o. All rights reserved.</p>
      <button onClick={v.closeLegal} className={hv('background:var(--color-accent-700)')} style={S("width:100%;min-height:52px;margin-top:20px;padding:14px;background:var(--color-accent);border:1px solid var(--color-accent);color:#fff;cursor:pointer;font:600 13.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>← Zamknij</button>
    </div>
  );
}
