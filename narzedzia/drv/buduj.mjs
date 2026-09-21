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

// Masa zestawu = oba człony + łącznik.
//
// Do 21.09.2026 stały w drv-katalog.json masy szacowane i łączniki jednego
// zespołu miały tę samą liczbę, więc na zespół wystarczała jedna. Prawdziwe masy
// z Optimy się różnią — najmocniej w DRV063/130, gdzie wykonanie wyjątkowe
// (ŁĄCZNIK 063/110) waży 2,47 kg przy 1,33 kg zwykłego.
//
// Dwie reguły, obie w jedną stronę — na korzyść bezpieczeństwa wyceny:
//
//   1. NAJCIĘŻSZY łącznik zespołu. Dlaczego nie ten faktycznie wybrany: kgGear()
//      w logic.js kluczuje po nazwie korpusu i nie wie, którą parę „łącznik +
//      człon 2" wybrał drvVar(). Liczenie masy per łącznik oznaczałoby
//      przebudowę drogi liczącej cenę przesyłki.
//   2. ZAOKRĄGLENIE W GÓRĘ do 0,5 kg (właściciel, 21.09.2026: „zaokrąglaj
//      w górę dla bezpieczeństwa"). Zapas na karton i wypełnienie, których
//      w masach katalogowych nie ma wcale. Zaokrąglanie do najbliższej połówki
//      byłoby gorsze niż nic: trzy z jedenastu łączników poszłyby w DÓŁ,
//      a zaniżona masa to zaniżona cena wysyłki, czyli strata firmy.
//
// Masy zostają w drv-katalog.json DOKŁADNIE tak, jak podaje je Optima —
// zaokrągla dopiero to miejsce. Inaczej przy następnej zmianie oferty nie byłoby
// z czym porównać nowego zrzutu, a raport magazynowy mas nie odświeża.
//
// Ani jedna, ani druga reguła nie zmienia dziś żadnego progu: sprawdzone na
// wszystkich 107 wierszach, zero zmian ceny i sposobu wysyłki. Najmniej zapasu
// ma DRV040/090 z silnikiem 0,37 kW — 24 kg przy PACK_CHEAP 31 kg.
const masyKorpusow = JSON.parse(readFileSync(KORZEN + 'narzedzia/cennik/katalog.json', 'utf8')).wt.gear;

// w górę do pełnej połówki kilograma; zaokrąglenie na szóstym miejscu po
// przecinku broni przed tym, żeby błąd binarny wypchnął równe 1,0 kg na 1,5
const doPolowki = (m) => Math.ceil(Number((m * 2).toFixed(6))) / 2;

const wt = {};
for (const [zespol, z] of Object.entries(K.zespoly)) {
  const masy = z.laczniki.map(l => l.masa);
  if (masy.some(m => !(m > 0)))
    throw new Error(`${zespol}: łącznik bez masy w drv-katalog.json`);
  const lacznik = doPolowki(Math.max(...masy));
  const g1 = masyKorpusow[z.czlon1], g2 = masyKorpusow[z.czlon2];
  if (!(g1 > 0) || !(g2 > 0))
    throw new Error(`${zespol}: brak masy korpusu ${!g1 ? z.czlon1 : z.czlon2} w katalog.json`);
  wt[zespol] = { czlon1: g1, czlon2: g2, lacznik, razem: Math.round((g1 + g2 + lacznik) * 10) / 10 };
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

// Kołnierz silnika bierzemy z tabeli pojedynczych przekładni dla CZŁONU 1 —
// właściciel, 21.09.2026: „mapowanie masz zrobić z członu 1, czyli tak jak to
// jest w pojedynczych przekładniach z silnikiem, tu się nie zmienia: ten sam
// silnik, te same przekładnie, tylko że to człon 1 do DRV".
//
// Wcześniej stało tu `w.iec + 'B14/B5'`, czyli generator brał z tabeli DRV samą
// WIELKOŚĆ silnika i dopisywał oba kołnierze z automatu. Przy DKM040 i 0,09 kW
// dawało to `56B14`, którego dla przekładni **nie ma w ofercie** (potwierdzone
// przez właściciela 21.09.2026) — więc pięć wierszy oferowało wykonanie, którego
// nie da się zamówić. Ceny i tak nie miały, ale dane kłamały.
//
// Szukamy po tej samej WIELKOŚCI silnika, nie po samej mocy: tabela pojedyncza
// ma dla jednej kombinacji osobny wiersz na każdą wielkość i każdy ma własny
// moment i własne fs (DKM040 i10 0,25 kW: 63 → m2 15 Nm fs 2,7; 71 → 14 Nm 2,8).
// Wiersz DRV ma wielkość ustaloną przez tabelę wydajności producenta, więc wolno
// porównywać tylko B5/B14 w jej obrębie.
const katalogPoj = await (async () => {
  globalThis.window = globalThis.window || {};
  await import(new URL('../../app/src/data/catalog-data.js', import.meta.url).href);
  return globalThis.window.DKM_CATALOG || [];
})();

// Indeksujemy pod KAŻDĄ wielkością, jaka występuje w napisie, bo jeden wiersz
// może dopuszczać więcej niż jedną: DKM030 przy 0,12 kW ma „56B14/63B5/B14",
// odkąd właściciel potwierdził (21.09.2026), że przy tej mocy moment i fs są
// w wielkości 56 takie same jak w 63. Wiersz DRV pyta o wielkość z tabeli
// wydajności (tu 63) i ma dostać cały napis, żeby zespół dopuszczał to samo
// co pojedyncza przekładnia.
// Wielkości wyciągamy DOKŁADNIE tak, jak robi to flangeList() w logic.js —
// segment po segmencie, z przenoszeniem wielkości na kolejne. Zwykły `\d+`
// łapałby też liczby z „B14", a napis „100/112B5" (DKM150) aplikacja czyta
// jako samo 112, więc generator musi go czytać tak samo.
const wielkosciZNapisu = (flange) => {
  const out = []; let iec = null;
  for (const seg of String(flange || '').split('/')) {
    const m = /^(\d+)?(B\d+)$/.exec(seg.trim());
    if (!m) continue;
    if (m[1]) iec = m[1];
    if (iec) out.push(iec);
  }
  return [...new Set(out)];
};

const kluczPoj = (box, p1, rpm, i, iec) => [box, p1, rpm, i, iec].join('|');
const kolnierzePoj = {};
for (const x of katalogPoj)
  for (const iec of wielkosciZNapisu(x.flange))
    kolnierzePoj[kluczPoj(x.box, x.p1, Number(x.rpm), Number(x.i), iec)] = x.flange;

const wiersze = K.wiersze.map(w => {
  const c1 = K.zespoly[w.zespol].czlon1;
  const flange = kolnierzePoj[kluczPoj(c1, w.p1, K.obroty, w.i1, w.iec)];
  if (!flange)
    throw new Error(`${w.zespol} i${w.i}: tabela pojedyncza nie ma ${c1} `
      + `${w.p1} kW ${K.obroty} obr i${w.i1} w wielkości IEC ${w.iec} — `
      + `kołnierza nie wolno zgadywać`);
  return {
    p1: w.p1, box: w.zespol, flange, motor: w.silnik, rpm: K.obroty,
    n2: w.n2, i: w.i, m2: w.m2, fr2: w.fr2, fs: w.fs,
    drv: w.zespol, i1: w.i1, i2: w.i2,
  };
});

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
//
// 21.09.2026: kopiowane były tylko trzy tabele z dziesięciu, więc ekran
// „Sposób mocowania" pisał przy DRV „brak dla tej wielkości" przy mocowaniu
// bocznym, czołowym i ramieniu reakcyjnym — a to są mocowania członu 2, czyli
// zwykłej przekładni, która je ma. Właściciel: „w DRV to wszystkie wymiary
// wyposażenie powinny być z 2 członu DRV". Lista jest teraz zupełna i musi
// obejmować KAŻDĄ tabelę z dims-data.js kluczowaną po korpusie.
//
// Jedyny wyjątek to DKM_PAM: ta tabela opisuje przyłącze WEJŚCIOWE, a w zespole
// wejście należy do członu 1, nie 2 — kopiowanie jej z członu 2 byłoby
// nieprawdą. Aplikacja jej nie czyta (jest tylko na kartach wymiarowych),
// więc zostaje nietknięta.
var Z=${j(czlon2)};
var przenies=function(tab){ if(!tab) return;
  for(var z in Z) if(tab[Z[z]]!==undefined) tab[z]=tab[Z[z]]; };
przenies(window.DKM_BORE=window.DKM_BORE||{});          // średnica tulei
przenies(window.DKM_FOOT=window.DKM_FOOT||{});          // mocowanie na podstawie
przenies(window.DKM_SIDE=window.DKM_SIDE||{});          // mocowanie boczne
przenies(window.DKM_FACE=window.DKM_FACE||{});          // mocowanie czołowe
przenies(window.DKM_ARM=window.DKM_ARM||{});            // ramię reakcyjne
przenies(window.DKM_PCV=window.DKM_PCV||{});            // osłona PCV
przenies(window.DKM_SHAFT=window.DKM_SHAFT||{});        // wał zdawczy
przenies(window.DKM_SHAFT_DS_L1=window.DKM_SHAFT_DS_L1||{}); // wał dwustronny
przenies(window.DKM_BOLT=window.DKM_BOLT||{});          // śruby montażowe
// DKM_FLANGE ma o jeden poziom więcej: typ kołnierza → korpus
var przeniesKolnierze=function(tab){ if(!tab) return;
  for(var t in tab) for(var z in Z) if(tab[t][Z[z]]!==undefined) tab[t][z]=tab[t][Z[z]]; };
przeniesKolnierze(window.DKM_FLANGE=window.DKM_FLANGE||{});
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

// Widać, ile dokłada zaokrąglenie — gdyby kiedyś doszedł łącznik, którego
// prawdziwa masa jest tuż nad połówką, narzut na zespół zrobi się spory.
console.log('łączniki (najcięższy w zespole, dokładnie → w górę do 0,5): '
  + Object.entries(K.zespoly).map(([z, o]) => {
      const d = Math.max(...o.laczniki.map(l => l.masa));
      return z.replace('DRV', '') + ' ' + d + '→' + doPolowki(d);
    }).join(' · '));
