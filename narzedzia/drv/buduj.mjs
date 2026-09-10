// Robi z drv-katalog.json plik danych dla aplikacji: app/src/data/drv-data.js
//
// Dwie rzeczy naraz, celowo w jednym miejscu:
//   window.DKM_CATALOG — wiersze DRV dopisane do tabeli doborowej. Mają ten sam
//     kształt co wiersze pojedynczych przekładni (p1, i, n2, m2, fr2, fs), więc
//     matches() w logic.js filtruje je bez żadnej zmiany.
//   window.DKM_DRV — wszystko, czego o DRV nie da się wyczytać z samego wiersza:
//     skład (człon 1, człon 2, łączniki), masy i dopłata za montaż.
//
// Jeśli tego pliku nie ma, aplikacja zachowuje się dokładnie jak przed DRV.
// Dlatego DRV nie dopisuje się do catalog-data.js ani do price-data.js.
//
//   node narzedzia/drv/buduj.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const KORZEN = new URL('../../', import.meta.url).pathname;
const K = JSON.parse(readFileSync(KORZEN + 'narzedzia/drv/drv-katalog.json', 'utf8'));

// Masa zestawu = oba człony + łącznik. Łączniki jednego zespołu mają tę samą
// masę (050/110 PRO i SEM po 0,9 kg, 063/150 i 25/38 po 1,2 kg), więc na zespół
// wystarczy jedna liczba — sprawdzane niżej.
const masyKorpusow = JSON.parse(readFileSync(KORZEN + 'narzedzia/cennik/katalog.json', 'utf8')).wt.gear;

const wt = {};
for (const [zespol, z] of Object.entries(K.zespoly)) {
  const masy = [...new Set(z.laczniki.map(l => l.masa))];
  if (masy.length !== 1)
    throw new Error(`${zespol}: łączniki mają różne masy (${masy.join(', ')}) — trzeba liczyć masę per łącznik`);
  const g1 = masyKorpusow[z.czlon1], g2 = masyKorpusow[z.czlon2];
  if (!(g1 > 0) || !(g2 > 0))
    throw new Error(`${zespol}: brak masy korpusu ${!g1 ? z.czlon1 : z.czlon2} w katalog.json`);
  wt[zespol] = { czlon1: g1, czlon2: g2, lacznik: masy[0], razem: Math.round((g1 + g2 + masy[0]) * 10) / 10 };
}

// Spedycja: zespół jedzie paletą, gdy jego człon 2 jest z listy SPED w logic.js.
// Sam korpus DKM110 waży 42,5 kg, czyli więcej niż PACK_MAX — kurier go nie weźmie.
const SPED_KORPUSY = ['DKM110', 'DKM130', 'DKM150'];
const sped = Object.entries(K.zespoly)
  .filter(([, z]) => SPED_KORPUSY.includes(z.czlon2))
  .map(([zespol]) => zespol);

// Karty wymiarowe zespołów DRV. Nazwa pliku wynika z nazwy zespołu:
//   DRV050/110 → app/public/assets/karta-drv-050-110.jpg
// Do listy trafiają tylko te, których plik naprawdę leży na dysku — inaczej
// karta pokazywałaby zepsuty obrazek. Po wrzuceniu plików wystarczy przeliczyć
// ten generator i karty zapalają się same.
const nazwaKarty = z => 'karta-' + z.toLowerCase().replace('/', '-').replace('drv', 'drv-') + '.jpg';
const karty = {};
for (const z of Object.keys(K.zespoly)) {
  const plik = nazwaKarty(z);
  if (existsSync(KORZEN + 'app/public/assets/' + plik)) karty[z] = plik;
}

const wiersze = K.wiersze.map(w => ({
  p1: w.p1, box: w.zespol, flange: w.iec + 'B14/B5', motor: w.silnik, rpm: K.obroty,
  n2: w.n2, i: w.i, m2: w.m2, fr2: w.fr2, fs: w.fs,
  drv: w.zespol, i1: w.i1, i2: w.i2,
}));

// Mocowanie DRV dziedziczy po członie 2, bo człon 2 TO JEST ta sama przekładnia
// (właściciel, 10.09.2026). Dotyczy średnicy wału, rozstawu otworów, rozstawu
// śrub i całego osprzętu — kołnierzy FA/FB, ramienia reakcyjnego, osłony,
// tulei. Wszystko to siedzi na korpusie członu wyjściowego.
//
// Czego NIE dziedziczymy: wymiarów gabarytowych. Długość całkowitą zespołu
// daje dopiero karta DRV, bo to dwa korpusy plus łącznik.
const czlon2 = Object.fromEntries(Object.entries(K.zespoly).map(([z, o]) => [z, o.czlon2]));

const j = o => JSON.stringify(o);
const plik = `// Przekładnie łączone DRV — plik generowany, nie edytuj ręcznie.
// Poprawki wprowadza się w narzedzia/drv/drv-katalog.json i przelicza:
//   node narzedzia/drv/buduj.mjs
// Wierszy: ${wiersze.length} · zespołów: ${Object.keys(K.zespoly).length} · silnik ${K.obroty} obr/min
(function(){
var W=${j(wiersze)};
window.DKM_DRV={
  zespoly:${j(K.zespoly)},
  wt:${j(wt)},
  sped:${j(sped)},
  karty:${j(karty)},
  montazNetto:${j(K.montazNetto)},
  obroty:${j(K.obroty)}
};
// wiersze DRV dołączają do tabeli doborowej — dobór działa na nich bez zmian
window.DKM_CATALOG=(window.DKM_CATALOG||[]).concat(W);

// Mocowanie i wyposażenie DRV bierze się z członu 2 — to jest ta sama
// przekładnia, więc wał, rozstaw otworów, śruby, kołnierze FA/FB, ramię
// reakcyjne, osłona i tuleja są dokładnie jej. Kopiujemy pod nazwę zespołu,
// bo cały kod kluczuje po niej (boxFitsBore, mountDim, optOf, kgOpt).
// Ceny i stany osprzętu czytamy z dzisiejszego cennika, więc nie dublują się
// w danych i odświeżają się razem z nim.
var Z=${j(czlon2)};
var przenies=function(tab){ if(!tab) return;
  for(var z in Z) if(tab[Z[z]]!==undefined) tab[z]=tab[Z[z]]; };
przenies(window.DKM_BORE=window.DKM_BORE||{});
przenies(window.DKM_FOOT=window.DKM_FOOT||{});
przenies(window.DKM_BOLT=window.DKM_BOLT||{});
var przeniesOsprzet=function(tab){ if(!tab) return;
  for(var k in tab){ var p=k.split('|');
    if(p.length!==2) continue;
    for(var z in Z) if(p[1]===Z[z]) tab[p[0]+'|'+z]=tab[k]; } };
var P=window.DKM_PRICE||{};
przeniesOsprzet(P.opt);
przeniesOsprzet(P.wt&&P.wt.opt);
})();
`;
writeFileSync(KORZEN + 'app/src/data/drv-data.js', plik);

console.log(`drv-data.js — wierszy ${wiersze.length} · zespołów ${Object.keys(K.zespoly).length}`
  + ` · paletą ${sped.length} (${sped.join(', ')})`
  + ` · kart wymiarowych ${Object.keys(karty).length}/${Object.keys(K.zespoly).length}`
  + ` · masy ${Object.entries(wt).map(([z, m]) => z.replace('DRV', '') + ' ' + m.razem + 'kg').join(' · ')}`);
