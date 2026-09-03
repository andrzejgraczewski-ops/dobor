// Kryterium wejściowe: moc silnika P₁ₙ — cały katalog, liczniki dla standardu 1400 obr/min.
import React from 'react';
import { S, hv } from '../lib/style.js';

export default function AskP1Screen({ v }) {
  return (
    <div style={S('padding:22px 20px 26px')}>
      <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>Krok 1 z 3 · Kryterium wejściowe</div>
      <h2 style={S("margin:5px 0 4px;font:600 30px/1.05 'Barlow Condensed',sans-serif")}>Moc silnika P<sub style={S('font-size:.5em')}>1n</sub></h2>
      <p style={S('margin:0 0 18px;font:400 13.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-700)')}>Moc znamionowa silnika przyłączanego do przekładni.</p>
      <div style={S("margin:0 0 16px;padding:8px 11px;background:var(--color-ok-bg);border-left:4px solid var(--color-ok);font:500 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--color-ok-ink)")}>{v.poolNoteAll}</div>
      <div style={S(`display:grid;grid-template-columns:${v.powerCols};gap:11px`)}>
        {v.p1List.map((p, i) => (
          <button key={i} onClick={p.go} className={hv('background:var(--color-accent-100);border-color:var(--color-accent)')} style={S(`min-height:76px;padding:14px 15px;background:transparent;border:1px solid var(--color-divider);cursor:pointer;display:flex;flex-direction:${v.powDir};align-items:${v.powAlign};justify-content:space-between;gap:${v.powGap};text-align:left`)}>
            <span style={S("font:600 32px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;white-space:nowrap")}>{p.label}<span style={S('font-size:15px;color:var(--color-neutral-700)')}> kW</span></span>
            <span style={S(`text-align:${v.powSubAlign};font:400 12.5px/1.4 Barlow,sans-serif;color:var(--color-neutral-700)`)}>{p.countLabel} · M₂ {p.m2Label} Nm</span>
          </button>
        ))}
      </div>
    </div>
  );
}
