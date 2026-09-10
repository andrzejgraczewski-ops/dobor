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
import { readFileSync, writeFileSync } from 'node:fs';

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

const wiersze = K.wiersze.map(w => ({
  p1: w.p1, box: w.zespol, flange: w.iec + 'B14/B5', motor: w.silnik, rpm: K.obroty,
  n2: w.n2, i: w.i, m2: w.m2, fr2: w.fr2, fs: w.fs,
  drv: w.zespol, i1: w.i1, i2: w.i2,
}));

// Średnica wału wyjściowego DRV to średnica członu 2 — bez tego kryterium
// „średnica wału" gubiłoby wszystkie DRV, bo boxFitsBore() czyta DKM_BORE
// po nazwie korpusu. Wymiarów i mocowania celowo NIE kopiujemy: tabela wymiarów
// opisuje też wejście, a to jest człon 1, więc przepisana w całości kłamałaby.
const boreZ = Object.fromEntries(Object.entries(K.zespoly).map(([z, o]) => [z, o.czlon2]));

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
  montazNetto:${j(K.montazNetto)},
  obroty:${j(K.obroty)}
};
// wiersze DRV dołączają do tabeli doborowej — dobór działa na nich bez zmian
window.DKM_CATALOG=(window.DKM_CATALOG||[]).concat(W);
// średnica wału wyjściowego DRV = średnica członu 2
var B=window.DKM_BORE=window.DKM_BORE||{}, Z=${j(boreZ)};
for(var z in Z) if(B[Z[z]]) B[z]=B[Z[z]];
})();
`;
writeFileSync(KORZEN + 'app/src/data/drv-data.js', plik);

console.log(`drv-data.js — wierszy ${wiersze.length} · zespołów ${Object.keys(K.zespoly).length}`
  + ` · paletą ${sped.length} (${sped.join(', ')})`
  + ` · masy ${Object.entries(wt).map(([z, m]) => z.replace('DRV', '') + ' ' + m.razem + 'kg').join(' · ')}`);
