// Ograniczenie domen dla wersji wystawionej na serwerze.
//
// Uczciwie: to zapora na złodzieja okazjonalnego, nie zamek. Kod, który trafia do
// przeglądarki, da się odczytać i przerobić — kto potrafi, obejdzie to w kilka minut.
// Blokada ma sens jako sygnał („to nie jest kod do wzięcia”) i jako dowód złej woli,
// gdyby sprawa trafiła do prawnika: usunięcie zabezpieczenia jest świadomym działaniem.
//
// Włącza się wyłącznie wtedy, gdy przy budowaniu podasz listę domen:
//   VITE_DKM_HOSTS="dkm.pl,www.dkm.pl" npm run build
// Bez tej zmiennej aplikacja działa wszędzie. Nigdy nie dotyczy pliku offline
// (rozpoznajemy go po window.__resources) ani pracy lokalnej.

const LOCAL = ['localhost', '127.0.0.1', '[::1]', ''];

export function domainGuard() {
  const allowed = String(import.meta.env.VITE_DKM_HOSTS || '')
    .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!allowed.length) return true;
  if (typeof window === 'undefined') return true;
  if (window.__resources) return true;                       // plik offline
  if (!/^https?:$/.test(location.protocol)) return true;     // file://, podgląd z dysku
  const host = location.hostname.toLowerCase();
  if (LOCAL.includes(host) || allowed.includes(host)) return true;
  // dopuszczamy też poddomeny dozwolonych domen (np. test.dkm.pl przy dkm.pl)
  if (allowed.some((a) => host.endsWith('.' + a))) return true;

  const box = document.getElementById('app') || document.body;
  box.textContent = '';
  const wrap = document.createElement('div');
  wrap.setAttribute('style',
    'max-width:520px;margin:80px auto;padding:28px 24px;border:1px solid rgba(41,38,91,.18);' +
    'background:#fff;font:400 15px/1.6 Barlow,system-ui,sans-serif;color:#29265b');
  const h = document.createElement('div');
  h.setAttribute('style', "font:600 24px/1.1 'Barlow Condensed',sans-serif;letter-spacing:.04em;text-transform:uppercase");
  h.textContent = 'Kopia nieautoryzowana';
  const p1 = document.createElement('p');
  p1.textContent = 'Ta aplikacja jest własnością DKM Power Transmission Sp. z o.o. '
    + 'i może działać wyłącznie pod adresami wskazanymi przez właściciela. '
    + 'Adres, pod którym została uruchomiona (' + host + '), nie jest jednym z nich.';
  const p2 = document.createElement('p');
  p2.textContent = 'Oficjalna wersja: sklep@d-k-m.eu · +48 512 082 994';
  wrap.appendChild(h); wrap.appendChild(p1); wrap.appendChild(p2);
  box.appendChild(wrap);
  return false;
}
