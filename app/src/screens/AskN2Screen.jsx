// Kryterium wejściowe: prędkość obrotowa na wale wyjściowym n₂.
import React from 'react';
import { S, hv } from '../lib/style.js';

export default function AskN2Screen({ v }) {
  return (
    <div style={S('padding:22px 20px 26px')}>
      <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>Kryterium wejściowe</div>
      <h2 style={S("margin:5px 0 4px;font:600 30px/1.05 'Barlow Condensed',sans-serif")}>Prędkość obrotowa na wale wyjściowym n₂</h2>
      <p style={S('margin:0 0 18px;font:400 13.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-700)')}>Prędkości obrotowe wału wyjściowego dostępne w katalogu. Po wybraniu zobaczysz wszystkie moce i przełożenia, które je dają.</p>
      <div style={S("margin:0 0 16px;padding:8px 11px;background:var(--color-ok-bg);border-left:4px solid var(--color-ok);font:500 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--color-ok-ink)")}>Wszystkie prędkości z katalogu — prędkość silnika podana na kafelku</div>
      <div style={S(`display:grid;grid-template-columns:${v.tileCols};gap:9px`)}>
        {v.n2List.map((o, i) => (
          <button key={i} onClick={o.go} className={hv('background:var(--color-accent-100);border-color:var(--color-accent)')} style={S('min-height:64px;padding:9px 4px;background:transparent;border:1px solid var(--color-divider);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px')}>
            <span style={S("font:600 22px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums")}>{o.label} <span style={S('font:400 11px Barlow,sans-serif;color:var(--color-neutral-700)')}>obr/min</span></span>
            <span style={S('font:400 11.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>{o.count} poz. · {o.rpmNote}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
