// Kryterium wejściowe: średnica wału Ød (tuleja drążona standardowa vs na zapytanie).
import React from 'react';
import { S, hv } from '../lib/style.js';

export default function AskBoreScreen({ v }) {
  return (
    <div style={S('padding:22px 20px 26px')}>
      <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>Kryterium wejściowe</div>
      <h2 style={S("margin:5px 0 4px;font:600 30px/1.05 'Barlow Condensed',sans-serif")}>Średnica wału Ød</h2>
      <p style={S('margin:0 0 12px;font:400 13.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-700)')}>Wybierz średnicę wałka, na który przekładnia ma być nasadzona.</p>
      <div style={S('display:flex;flex-wrap:wrap;gap:8px 18px;margin:0 0 15px;padding:10px 12px;border:1px solid var(--color-divider);background:var(--color-surface)')}>
        <span style={S('display:flex;align-items:center;gap:7px;font:500 12px/1.3 Barlow,sans-serif;color:var(--color-neutral-900)')}><span style={S('width:12px;height:12px;background:var(--color-ok);flex:none')}></span>Średnica dostępna z magazynu</span>
        <span style={S('display:flex;align-items:center;gap:7px;font:500 12px/1.3 Barlow,sans-serif;color:var(--color-neutral-900)')}><span style={S('width:12px;height:12px;background:var(--color-mid);flex:none')}></span>Średnica tylko na zapytanie — inne SKU, brak w magazynie</span>
      </div>
      <div style={S(`display:grid;grid-template-columns:${v.tileCols};gap:9px`)}>
        {v.boreList.map((o, i) => (
          <button key={i} onClick={o.go} className={hv('border-color:var(--color-accent)')} style={S(`min-height:96px;padding:11px 8px 12px;background:${o.tileBg};border:1px solid ${o.tileBd};border-top:4px solid ${o.tagBg};cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:5px`)}>
            <span style={S(`font:600 26px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:${o.numColor}`)}>{o.label}</span>
            <span style={S(`padding:2px 8px;background:${o.tagBg};color:#fff;font:600 11px/1.35 'Barlow Condensed',sans-serif;letter-spacing:.09em;text-transform:uppercase;text-align:center`)}>{o.tag}</span>
            {o.hasStd ? (
              <span style={S('font:600 12.5px/1.3 Barlow,sans-serif;color:var(--color-neutral-900);text-align:center')}>{o.stdLine}</span>
            ) : null}
            {o.hasOpt ? (
              <span style={S(`font:${o.optFont};color:${o.optColor};text-align:center`)}>{o.optLine}</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
