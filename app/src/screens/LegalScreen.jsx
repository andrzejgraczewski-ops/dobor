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
      <h2 style={S("margin:26px 0 6px;font:600 26px/1.1 'Barlow Condensed',sans-serif")}>Polityka prywatności i plików cookies</h2>
        <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700);margin:16px 0 6px")}>1 · Administrator danych</div>
        <p style={S('margin:0 0 8px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Administratorem danych osobowych jest <strong>DKM Power Transmission Sp. z o.o.</strong>, ul. 3 Maja 20, 87-640 Czernikowo, NIP 879-268-87-36.</p>
        <p style={S('margin:0 0 12px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>W sprawach dotyczących danych osobowych można skontaktować się z Administratorem pod adresem <a href="mailto:sklep@d-k-m.eu">sklep@d-k-m.eu</a>.</p>
        <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700);margin:18px 0 6px")}>2 · Jakie dane przetwarzamy</div>
        <p style={S('margin:0 0 8px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700)')}>W zależności od sposobu korzystania z aplikacji możemy przetwarzać:</p>
        <ul style={S('margin:0 0 10px;padding-left:20px;font:400 14px/1.65 Barlow,sans-serif;color:var(--color-neutral-700)')}>
          <li>dane techniczne związane z korzystaniem z aplikacji, w tym informacje o urządzeniu, przeglądarce, przybliżonej lokalizacji, adresie IP wykorzystywanym do obsługi połączenia oraz aktywności w aplikacji;</li>
          <li>dane analityczne zbierane za pomocą Google Analytics 4, w szczególności informacje o sposobie korzystania z aplikacji, odwiedzanych widokach, źródle wejścia oraz zdarzeniach wykonywanych w aplikacji;</li>
          <li>dane podane przy składaniu zamówienia lub wysyłaniu zapytania, w szczególności: imię i nazwisko, nazwa firmy, NIP, adres e-mail, numer telefonu, adres dostawy, dane do faktury, wybrane produkty, konfigurację, sposób płatności, sposób dostawy oraz treść uwag.</li>
        </ul>
        <p style={S('margin:0 0 12px;font:600 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-900)')}>Nie należy wpisywać w formularzu danych, które nie są potrzebne do realizacji zamówienia lub przygotowania oferty.</p>
        <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700);margin:18px 0 8px")}>3 · Cele i podstawy przetwarzania danych</div>
        <div style={S('display:grid;gap:1px;background:var(--color-divider);border:1px solid var(--color-divider);margin-bottom:12px')}>
          {v.wide ? (
            <div style={S(`background:var(--color-surface);padding:9px 13px;display:grid;grid-template-columns:${v.formCols};gap:6px 18px`)}>
              <span style={S("font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700)")}>Cel</span>
              <span style={S("font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700)")}>Podstawa prawna</span>
            </div>
          ) : null}
          {v.gdprRows.map((g, i) => (
            <div key={i} style={S(`background:var(--color-bg);padding:11px 13px;display:grid;grid-template-columns:${v.formCols};gap:4px 18px`)}>
              <span style={S('font:500 13.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-900)')}>{g.cel}</span>
              <span style={S('font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-700)')}>{g.basis}</span>
            </div>
          ))}
        </div>
        <p style={S('margin:0 0 12px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Podanie danych wymaganych do złożenia zamówienia jest dobrowolne, lecz niezbędne do jego obsługi i realizacji.</p>
        <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700);margin:18px 0 6px")}>4 · Google Analytics 4 i pliki cookies</div>
        <p style={S('margin:0 0 8px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Aplikacja korzysta z <strong>Google Analytics 4</strong>, aby sprawdzać, w jaki sposób użytkownicy korzystają z aplikacji oraz poprawiać jej funkcjonalność i czytelność.</p>
        <p style={S('margin:0 0 8px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Google Analytics 4 wykorzystuje pliki cookies lub podobne technologie i może przetwarzać m.in. pseudonimowy identyfikator przeglądarki, informacje o urządzeniu, aktywności w aplikacji oraz przybliżone dane o lokalizacji. Administrator nie przekazuje do Google Analytics danych wpisywanych w formularzu zamówienia, takich jak imię i nazwisko, e-mail, telefon, adres, NIP ani treść zamówienia.</p>
        <p style={S('margin:0 0 8px;font:600 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Analityczne pliki cookies są uruchamiane wyłącznie po wyrażeniu zgody. Zgodę można w każdej chwili wycofać poprzez zmianę ustawień cookies w aplikacji (blok „Analityka · RODO” powyżej) lub w przeglądarce. Wycofanie zgody nie wpływa na zgodność z prawem przetwarzania dokonanego przed jej wycofaniem.</p>
        <p style={S('margin:0 0 12px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Google działa w odniesieniu do usługi Google Analytics jako podmiot przetwarzający dane na rzecz Administratora. Szczegółowe informacje o sposobie przetwarzania danych przez Google znajdują się w <a href="https://policies.google.com/privacy?hl=pl" target="_blank" rel="noopener">Polityce prywatności Google</a>.</p>
        <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700);margin:18px 0 6px")}>5 · Odbiorcy danych</div>
        <p style={S('margin:0 0 8px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700)')}>Dane mogą być przekazywane wyłącznie podmiotom wspierającym Administratora w obsłudze aplikacji i zamówień, w szczególności:</p>
        <ul style={S('margin:0 0 10px;padding-left:20px;font:400 14px/1.65 Barlow,sans-serif;color:var(--color-neutral-700)')}>
          <li>dostawcy usługi Google Analytics 4 — Google;</li>
          <li>dostawcy formularza wysyłki zamówień i zapytań — Formspree;</li>
          <li>dostawcy hostingu, poczty elektronicznej oraz usług informatycznych;</li>
          <li>podmiotom realizującym dostawę, płatność lub obsługę księgową, jeżeli będzie to konieczne do realizacji zamówienia;</li>
          <li>organom publicznym, gdy obowiązek przekazania danych wynika z przepisów prawa.</li>
        </ul>
        <p style={S('margin:0 0 12px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700)')}>Podmioty te otrzymują dane wyłącznie w zakresie niezbędnym do wykonania swoich usług.</p>
        <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700);margin:18px 0 6px")}>6 · Przekazywanie danych poza EOG</div>
        <p style={S('margin:0 0 12px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Niektórzy dostawcy usług, w tym Google i Formspree, mogą przetwarzać dane poza Europejskim Obszarem Gospodarczym, w szczególności w Stanach Zjednoczonych. W takim przypadku przekazanie danych odbywa się zgodnie z mechanizmami dopuszczonymi przez RODO, w tym na podstawie decyzji stwierdzającej odpowiedni stopień ochrony danych lub standardowych klauzul umownych Komisji Europejskiej.</p>
        <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700);margin:18px 0 6px")}>7 · Okres przechowywania danych</div>
        <p style={S('margin:0 0 8px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Dane z zamówień i zapytań przechowujemy przez czas niezbędny do ich obsługi, realizacji umowy oraz później przez okres wymagany przepisami podatkowymi i terminami przedawnienia roszczeń.</p>
        <p style={S('margin:0 0 12px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Dane analityczne w Google Analytics 4 są przechowywane przez okres ustawiony w konfiguracji usługi, nie dłużej niż jest to potrzebne do celów analitycznych.</p>
        <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700);margin:18px 0 6px")}>8 · Twoje prawa</div>
        <p style={S('margin:0 0 8px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700)')}>Masz prawo do:</p>
        <ul style={S('margin:0 0 12px;padding-left:20px;font:400 14px/1.65 Barlow,sans-serif;color:var(--color-neutral-700)')}>
          <li>dostępu do swoich danych;</li>
          <li>ich sprostowania;</li>
          <li>usunięcia danych, gdy pozwalają na to przepisy;</li>
          <li>ograniczenia przetwarzania;</li>
          <li>przenoszenia danych;</li>
          <li>wniesienia sprzeciwu wobec przetwarzania opartego na uzasadnionym interesie Administratora;</li>
          <li>wycofania zgody na analityczne pliki cookies w dowolnym momencie;</li>
          <li>wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.</li>
        </ul>
        <div style={S('padding:14px 15px;border:1px solid var(--color-divider);border-left:4px solid var(--color-ok);background:var(--color-ok-bg)')}>
          <div style={S("font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-ok-ink)")}>9 · Bezpieczeństwo i działanie aplikacji</div>
          <p style={S('margin:8px 0 10px;font:400 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Dobór urządzeń i obliczenia wykonywane są w aplikacji uruchomionej w przeglądarce użytkownika. Koszyk i historia doborów mogą być zapisywane w pamięci przeglądarki na urządzeniu użytkownika; można je usunąć przez wyczyszczenie danych przeglądarki.</p>
          <p style={S('margin:0 0 10px;font:400 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Dane z formularza są przesyłane do DKM wyłącznie po naciśnięciu przycisku wysyłki zamówienia lub zapytania. Są wykorzystywane wyłącznie do obsługi złożonego zamówienia, przygotowania oferty, kontaktu z klientem oraz realizacji dalszych obowiązków związanych z transakcją.</p>
          <p style={S('margin:0;font:400 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Administrator stosuje odpowiednie środki techniczne i organizacyjne chroniące dane przed dostępem osób nieuprawnionych, utratą, zmianą lub nieuprawnionym ujawnieniem.</p>
        </div>
        <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700);margin:18px 0 6px")}>10 · Zmiany polityki</div>
        <p style={S('margin:0 0 12px;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Polityka może być aktualizowana w razie zmiany sposobu działania aplikacji, wykorzystywanych usług lub obowiązujących przepisów. Aktualna wersja jest dostępna w aplikacji.</p>
        
      <p style={S('margin:18px 0 0;font:400 12.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-500)')}>This application and its components are proprietary to DKM Power Transmission Sp. z o.o. Unauthorized copying, modification, distribution or use is prohibited.</p>
      <p style={S('margin:8px 0 0;font:600 12.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-700)')}>© 2026 DKM Power Transmission Sp. z o.o. All rights reserved.</p>
      <button onClick={v.closeLegal} className={hv('background:var(--color-accent-700)')} style={S("width:100%;min-height:52px;margin-top:20px;padding:14px;background:var(--color-accent);border:1px solid var(--color-accent);color:#fff;cursor:pointer;font:600 13.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>← Zamknij</button>
    </div>
  );
}
