// Kryterium wejściowe: przełożenie i.
import React from 'react';
import { S, hv } from '../lib/style.js';

export default function AskIScreen({ v }) {
  return (
    <div style={S('padding:22px 20px 26px')}>
      <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>Krok 1 z 3 · Kryterium wejściowe</div>
      <h2 style={S("margin:5px 0 4px;font:600 30px/1.05 'Barlow Condensed',sans-serif")}>Przełożenie i</h2>
      <p style={S('margin:0 0 18px;font:400 13.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-700)')}>Prędkość obrotowa na wale wyjściowym n₂ = n₁ / i. Przy i ≥ 60 sprawdź samohamowność w karcie.</p>
      <div style={S("margin:0 0 16px;padding:8px 11px;background:var(--color-ok-bg);border-left:4px solid var(--color-ok);font:500 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--color-ok-ink)")}>{v.poolNoteAll}</div>
      <div style={S(`display:grid;grid-template-columns:${v.numTileCols};gap:10px`)}>
        {v.iList.map((it, i) => (
          <button key={i} onClick={it.go} className={hv('background:var(--color-accent-100);border-color:var(--color-accent)')} style={S('min-height:66px;padding:10px 5px;background:transparent;border:1px solid var(--color-divider);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px')}>
            <span style={S("font:600 26px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums")}>{it.label}</span>
            <span style={S('font:400 12px Barlow,sans-serif;color:var(--color-neutral-700)')}>{it.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
