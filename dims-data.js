// Tabela wymiarów per wielkość korpusu — uzupełniana danymi z katalogu DKM.
// Format: 'DKM050': [['⌀ wału wyjściowego','25 mm'], ['Rozstaw otworów','80 × 80 mm'], …]
window.DKM_DIMS = {};

// Mocowanie na podstawie — rozstaw otworów C × C1 [mm].
window.DKM_FOOT = {
  DKM025: '45 × 42 mm',
  DKM030: '54 × 44 mm',
  DKM040: '70 × 60 mm',
  DKM050: '80 × 70 mm',
  DKM063: '100 × 85 mm',
  DKM075: '120 × 90 mm',
  DKM090: '140 × 100 mm',
  DKM110: '170 × 115 mm',
  DKM130: '200 × 120 mm',
  DKM150: '240 × 145 mm'
};

// Mocowanie boczne — rozstaw montażowy (V+Q) × C1 [mm].
window.DKM_SIDE = {
  DKM030: '71 × 44 mm',
  DKM040: '90 × 60 mm',
  DKM050: '104 × 70 mm',
  DKM063: '130 × 85 mm',
  DKM075: '153 × 90 mm',
  DKM090: '172 × 100 mm',
  DKM110: '210 × 115 mm',
  DKM130: '240 × 120 mm',
  DKM150: '300 × 145 mm'
};

// Mocowanie czołowe — zamek centrujący ØE (h7), rozstaw ØH, otwory PE, kąt α.
window.DKM_FACE = {
  DKM025: { e: '⌀ 45 mm h8', h: '⌀ 55 mm', pe: 'wg rysunku wymiarowego', a: 'wg rysunku wymiarowego' },
  DKM030: { e: '⌀ 55 mm h7', h: '⌀ 65 mm', pe: '4 × M6, gł. 11 mm', a: '0°' },
  DKM040: { e: '⌀ 60 mm h7', h: '⌀ 75 mm', pe: '4 × M6, gł. 8 mm', a: '45°' },
  DKM050: { e: '⌀ 70 mm h7', h: '⌀ 85 mm', pe: '4 × M8, gł. 10 mm', a: '45°' },
  DKM063: { e: '⌀ 80 mm h7', h: '⌀ 95 mm', pe: '8 × M8, gł. 14 mm', a: '45°' },
  DKM075: { e: '⌀ 95 mm h7', h: '⌀ 115 mm', pe: '8 × M8, gł. 14 mm', a: '45°' },
  DKM090: { e: '⌀ 110 mm h7', h: '⌀ 130 mm', pe: '8 × M10, gł. 18 mm', a: '45°' },
  DKM110: { e: '⌀ 130 mm h7', h: '⌀ 165 mm', pe: '8 × M10, gł. 18 mm', a: '45°' },
  DKM130: { e: '⌀ 180 mm h7', h: '⌀ 215 mm', pe: '8 × M12, gł. 21 mm', a: '45°' },
  DKM150: { e: '⌀ 180 mm h7', h: '⌀ 215 mm', pe: '8 × M12, gł. 21 mm', a: '45°' }
};

// Montaż nasadzany z ramieniem reakcyjnym — wymiary K1, G, KG, KH, R, B [mm].
window.DKM_ARM = {
  DKM025: { K1: 70, G: 14, KG: 17.5, KH: 8, R: 15, B: 4 },
  DKM030: { K1: 85, G: 14, KG: 24, KH: 8, R: 15, B: 4 },
  DKM040: { K1: 100, G: 14, KG: 31.5, KH: 10, R: 18, B: 4 },
  DKM050: { K1: 100, G: 14, KG: 38.5, KH: 10, R: 18, B: 4 },
  DKM063: { K1: 150, G: 14, KG: 49, KH: 10, R: 18, B: 6 },
  DKM075: { K1: 200, G: 25, KG: 47.5, KH: 20, R: 30, B: 6 },
  DKM090: { K1: 200, G: 25, KG: 57.5, KH: 20, R: 30, B: 6 },
  DKM110: { K1: 250, G: 30, KG: 62, KH: 25, R: 35, B: 6 },
  DKM130: { K1: 250, G: 30, KG: 69, KH: 25, R: 35, B: 6 },
  DKM150: { K1: 250, G: 30, KG: 84, KH: 25, R: 35, B: 8 }
};

// Kołnierz boczny — warianty FA i FB. Kolejność: a1, KA, KB, KC, KM, KN(H8), KO, KP, KQ.
window.DKM_FLANGE = {
  FA: {
    DKM030: ['45°','54,5','6','4','68','⌀ 50 H8','⌀ 6,5 (n = 4)','80','70'],
    DKM040: ['45°','67','7','4','75','⌀ 60 H8','⌀ 9 (n = 4)','110','95'],
    DKM050: ['45°','90','9','5','85','⌀ 70 H8','⌀ 11 (n = 4)','125','110'],
    DKM063: ['45°','82','10','6','150','⌀ 115 H8','⌀ 11 (n = 4)','180','142'],
    DKM075: ['45°','111','13','6','165','⌀ 130 H8','⌀ 14 (n = 4)','200','170'],
    DKM090: ['45°','111','13','6','175','⌀ 152 H8','⌀ 14 (n = 4)','210','200'],
    DKM110: ['45°','139','15','6','230','⌀ 170 H8','⌀ 14 (n = 8)','280','260'],
    DKM130: ['45°','140','15','6','255','⌀ 180 H8','⌀ 16 (n = 8)','320','290'],
    DKM150: ['22,5°','155','15','6','255','⌀ 180 H8','⌀ 16 (n = 8)','320','290']
  },
  FB: {
    DKM040: ['45°','97','7','4','75','⌀ 60 H8','⌀ 9 (n = 4)','110','95'],
    DKM050: ['45°','120','9','5','85','⌀ 70 H8','⌀ 11 (n = 4)','125','110'],
    DKM063: ['45°','112','10','6','150','⌀ 115 H8','⌀ 11 (n = 4)','180','142'],
    DKM075: ['45°','90','13','6','130','⌀ 110 H8','⌀ 11 (n = 4)','160','—'],
    DKM090: ['45°','122','18','6','215','⌀ 180 H8','⌀ 14 (n = 4)','250','—']
  }
};
window.DKM_FLANGE_KEYS = ['a₁','KA','KB','KC','KM','KN','KO','KP','KQ'];

// Osłona PCV — wymiar M [mm].
window.DKM_PCV = { DKM030:42, DKM040:50, DKM050:58, DKM063:69, DKM075:74,
  DKM090:85, DKM110:94, DKM130:102, DKM150:117 };

// Wał wyjściowy / zdawczy SS i DS — wymiary [mm]; f = gwint czołowy.
window.DKM_SHAFT = {
  DKM025: { d: 11, B: 23, B1: 25.5, G1: 50,  L: 81,  f: '–',      b1: 4,  t1: 12.5 },
  DKM030: { d: 14, B: 30, B1: 32.5, G1: 63,  L: 102, f: 'M6×17',  b1: 5,  t1: 16 },
  DKM040: { d: 18, B: 40, B1: 43,   G1: 78,  L: 128, f: 'M6×17',  b1: 6,  t1: 20.5 },
  DKM050: { d: 25, B: 50, B1: 53.5, G1: 92,  L: 153, f: 'M10×27', b1: 8,  t1: 28 },
  DKM063: { d: 25, B: 50, B1: 53.5, G1: 112, L: 173, f: 'M10×27', b1: 8,  t1: 28 },
  DKM075: { d: 28, B: 60, B1: 63.5, G1: 120, L: 192, f: 'M10×27', b1: 8,  t1: 31 },
  DKM090: { d: 35, B: 80, B1: 84.5, G1: 140, L: 234, f: 'M12×34', b1: 10, t1: 38 },
  DKM110: { d: 42, B: 80, B1: 84.5, G1: 155, L: 249, f: 'M16×42', b1: 12, t1: 45 },
  DKM130: { d: 45, B: 80, B1: 85,   G1: 170, L: 265, f: 'M16×42', b1: 14, t1: 48.5 },
  DKM150: { d: 50, B: 82, B1: 87,   G1: 200, L: 297, f: 'M16×42', b1: 14, t1: 53.5 }
};

// Otwory montażowe ØR i typowa śruba — wspólne dla mocowania na podstawie i bocznego.
window.DKM_BOLT = {
  DKM025:{ r:'Ø6 mm', s:'M5' },
  DKM030:{ r:'Ø6,5 mm', s:'M6' }, DKM040:{ r:'Ø6,5 mm', s:'M6' },
  DKM050:{ r:'Ø8,5 mm', s:'M8' }, DKM063:{ r:'Ø8,5 mm', s:'M8' },
  DKM075:{ r:'Ø11 mm',  s:'M10' }, DKM090:{ r:'Ø13 mm', s:'M12' },
  DKM110:{ r:'Ø14 mm',  s:'M12' }, DKM130:{ r:'Ø16 mm', s:'M14' },
  DKM150:{ r:'Ø18 mm',  s:'M16' }
};

// Wał dwustronny DS — L1 [mm] zamiast L; pozostałe wymiary jak SS.
window.DKM_SHAFT_DS_L1 = { DKM025:101, DKM030:128, DKM040:164, DKM050:199, DKM063:219,
  DKM075:247, DKM090:309, DKM110:324, DKM130:340, DKM150:374 };

// Akcesoria. drawing:false → rysunek do uzupełnienia.
window.DKM_ACC = [
  { g: 'Wał wyjściowy / zdawczy', o: [
    { id: 'SS', l: 'SS — jednostronny', drawing: true },
    { id: 'DS', l: 'DS — dwustronny', drawing: true }
  ]},
  { g: 'Osłona', o: [
    { id: 'PCV', l: 'Osłona ochronna PCV', drawing: true }
  ]}
];

// Sposoby mocowania przekładni. drawing:false → rysunek wymiarowy do uzupełnienia.
window.DKM_MOUNT = [
  { g: 'Mocowanie przez korpus', o: [
    { id: '1a', l: 'Na podstawie', drawing: true },
    { id: '1b', l: 'Boczne', drawing: true },
    { id: '1c', l: 'Czołowe', drawing: true }
  ]},
  { g: 'Mocowanie przez kołnierz boczny', o: [
    { id: '2a', l: 'Kołnierz boczny FA', drawing: true },
    { id: '2b', l: 'Kołnierz boczny FB', drawing: true }
  ]},
  { g: 'Montaż nasadzany na wale', o: [
    { id: '3', l: 'Z ramieniem reakcyjnym', drawing: true }
  ]}
];

// Tuleja drążona wału wyjściowego — standard DKM, opcje na zapytanie, rowek wpustowy.
window.DKM_BORE = {
  DKM025: { std: 11, key: 4 },
  DKM030: { std: 14, key: 5 },
  DKM040: { std: 18, opt: [19], key: 6 },
  DKM050: { std: 25, opt: [24], key: 8 },
  DKM063: { std: 25, opt: [28], key: 8 },
  DKM075: { std: 28, opt: [35], key: 8, optKey: { 35: 10 } },
  DKM090: { std: 35, opt: [38], key: 10 },
  DKM110: { std: 42, key: 12 },
  DKM130: { std: 45, key: 14 },
  DKM150: { std: 50, key: 14 }
};
