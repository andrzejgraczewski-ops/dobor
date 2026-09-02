// Style inline i stany :hover — dokładnie te same reguły, co runtime prototypu.
//
// Prototyp trzymał style jako tekst CSS w atrybucie `style`, a `style-hover`
// zamieniał na klasę z regułą `:hover` (z `!important`, żeby wygrała ze stylem
// inline). Odtwarzamy oba mechanizmy, dzięki czemu treść CSS w komponentach
// zostaje znak w znak taka jak w projekcie — bez ręcznego przepisywania setek
// deklaracji na obiekty, gdzie łatwo o literówkę.

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

// podział po `;` z pominięciem średników w nawiasach i w cudzysłowach
function splitDecls(css) {
  const out = [];
  let start = 0, depth = 0, quote = '';
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
    } else if (c === "'" || c === '"') quote = c;
    else if (c === '(') depth++;
    else if (c === ')') depth = Math.max(0, depth - 1);
    else if (c === ';' && depth === 0) { out.push(css.slice(start, i)); start = i + 1; }
  }
  out.push(css.slice(start));
  return out.map((d) => d.trim()).filter(Boolean);
}

const objCache = new Map();

/** Tekst CSS → obiekt stylu Reacta (memoizowany po treści). */
export function S(css) {
  if (!css) return undefined;
  const hit = objCache.get(css);
  if (hit) return hit;
  const o = {};
  for (const decl of splitDecls(css)) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    o[prop.startsWith('--') ? prop : camel(prop)] = decl.slice(i + 1).trim();
  }
  objCache.set(css, o);
  return o;
}

// arkusz z regułami :hover — jedna klasa na unikalną treść
let sheetEl = null;
let seq = 0;
const hoverCache = new Map();

/** Tekst CSS → nazwa klasy z regułą `:hover` (deklaracje dostają `!important`). */
export function hv(css) {
  if (!css) return undefined;
  const hit = hoverCache.get(css);
  if (hit) return hit;
  const cls = 'hv' + (seq++).toString(36);
  hoverCache.set(css, cls);
  if (typeof document !== 'undefined') {
    if (!sheetEl) {
      sheetEl = document.createElement('style');
      sheetEl.setAttribute('data-dkm-hover', '');
      document.head.appendChild(sheetEl);
    }
    const body = splitDecls(css)
      .map((d) => (/!\s*important$/i.test(d) ? d : d + ' !important'))
      .join(';');
    try {
      sheetEl.sheet.insertRule('.' + cls + ':hover{' + body + '}', sheetEl.sheet.cssRules.length);
    } catch (e) {
      // przeglądarka odrzuciła regułę — element zostaje bez podświetlenia,
      // ale nie wywracamy renderu
    }
  }
  return cls;
}
