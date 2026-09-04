// Wyodrębnia z obecnego price-data.js część stałą — tę, której nie ma w raporcie
// magazynowym: przypisanie silnika do wariantu, listę falowników, osprzętu
// i silników jednofazowych oraz masy do przesyłki.
//
// Uruchamiane raz, przy zakładaniu automatu. Wynik (katalog.json) jest
// trzymany w repozytorium i zmienia się tylko wtedy, gdy dojdzie nowy produkt.
//
//   node narzedzia/cennik/wyodrebnij-katalog.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const wczytaj = (sciezka) => {
  const okno = {};
  new Function('window', readFileSync(sciezka, 'utf8'))(okno);
  return okno;
};
const P = wczytaj('app/src/data/price-data.js').DKM_PRICE;
const KAT = wczytaj('app/src/data/catalog-data.js').DKM_CATALOG;

// „56B5/B14" to jedna pozycja katalogowa pasująca do dwóch kołnierzy
export const rozwinKolnierz = (f) => {
  const czesci = f.split('/');
  if (czesci.length === 1) return czesci;
  const ramka = czesci[0].match(/^(\d+)(B\d+)$/)[1];
  return czesci.map((c) => (/^\d/.test(c) ? c : ramka + c));
};

// silnik przypisany do wariantu — z raportu nie da się tego odtworzyć,
// bo raport nie wie, który silnik pasuje do której przekładni
const silniki = {};
for (const [klucz, w] of Object.entries(P.var)) {
  if (!w[7]) continue;
  const [, iec, , kw, rpm] = klucz.split('|');
  silniki[`${kw}|${rpm}|${iec}`] = w[7];
}

// kody osprzętu w magazynie: kołnierze to „40 FA", ramiona „RAMIE REAKCYJNE DO 040",
// wały „WAŁ JEDNOSTRONNY DO 40" — numer korpusu raz z zerem wiodącym, raz bez
const kodOsprzetu = (rodzaj, box) => {
  const n = box.slice(3);            // DKM040 -> 040
  const bezZera = String(Number(n));  // 040 -> 40
  return { ARM: `RAMIE REAKCYJNE DO ${n}`, DS: `WAŁ DWUSTRONNY DO ${bezZera}`,
           SS: `WAŁ JEDNOSTRONNY DO ${bezZera}`, FA: `${bezZera} FA`, FB: `${bezZera} FB` }[rodzaj];
};
const osprzet = {};
for (const [klucz, w] of Object.entries(P.opt)) {
  const [rodzaj, box] = klucz.split('|');
  osprzet[klucz] = [kodOsprzetu(rodzaj, box), w[0]];
}

// ceny przekładni nie pochodzą z raportu magazynowego — to osobna lista cenowa,
// której raport nie zawiera. Bierzemy ją z obecnego cennika i od tej pory
// raport ją tylko odświeża tam, gdzie dany kod w nim występuje.
const przekladnie = {};
for (const [klucz, w] of Object.entries(P.var)) {
  const [box, iec, i] = klucz.split('|');
  if (w[0] !== null) przekladnie[`${box}|${iec}|${i}`] = w[0];
}

// to samo dotyczy silników: część katalogowych pozycji nie leży w magazynie,
// ale ma cenę i da się je zamówić
const silnikiCeny = {};
for (const w of Object.values(P.var)) if (w[7] && w[2] !== null) silnikiCeny[w[7]] = w[2];

const falowniki = P.inv.map((f) => [f[0], f[1], f[2], f[3], f[4]]);
const m1f = {};
for (const [klucz, w] of Object.entries(P.m1f)) m1f[klucz] = [w[0], w[1], w[2]];

// nazwy handlowe silników nieobecnych w raporcie — inaczej zniknęłyby z karty produktu
const nazwyZapas = {};
for (const [kod, nazwa] of Object.entries(P.nam)) nazwyZapas[kod] = nazwa;

writeFileSync('narzedzia/cennik/katalog.json', JSON.stringify(
  { silniki, silnikiCeny, przekladnie, falowniki, osprzet, m1f, nazwyZapas, wt: P.wt }, null, 1) + '\n');

// warianty bierzemy z tabeli doborowej aplikacji: co aplikacja potrafi zaproponować,
// musi mieć cenę i stan — inaczej znika z wyników bez śladu
const warianty = [];
for (const r of KAT)
  for (const f of rozwinKolnierz(r.flange))
    warianty.push([r.box, f, String(r.i), String(r.p1), String(r.rpm), r.motor]);
writeFileSync('narzedzia/cennik/warianty.json', JSON.stringify(warianty) + '\n');

console.log(`silniki ${Object.keys(silniki).length} · ceny silników ${Object.keys(silnikiCeny).length} · przekładnie ${Object.keys(przekladnie).length} · falowniki ${falowniki.length} · `
  + `osprzęt ${Object.keys(osprzet).length} · 1-fazowe ${Object.keys(m1f).length} · `
  + `warianty ${warianty.length}`);
