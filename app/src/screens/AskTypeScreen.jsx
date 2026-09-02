// Kryterium wejściowe: typ przekładni wpisywany z klawiatury (np. 090 albo DKM090).
import React from 'react';
import { S, hv } from '../lib/style.js';

export default function AskTypeScreen({ v }) {
  return (
    <div style={S('padding:22px 20px 26px')}>
      <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>Kryterium wejściowe</div>
      <h2 style={S("margin:5px 0 4px;font:600 30px/1.05 'Barlow Condensed',sans-serif")}>Typ przekładni</h2>
      <p style={S('margin:0 0 16px;font:400 13.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-700)')}>Wpisz oznaczenie wielkości — wystarczy sam numer, np. 090. Pokażę wszystkie warianty tej przekładni.</p>
      <input value={v.typeQ} onChange={v.setTypeQ} placeholder="np. DKM090 lub 090" style={S("width:100%;min-height:56px;padding:13px 15px;background:var(--color-surface);border:1px solid var(--color-divider);color:var(--color-text);font:600 20px 'Barlow Condensed',sans-serif;letter-spacing:.04em")} />
      {v.hasTypeHits ? (
        <div style={S('margin-top:12px;display:grid;gap:7px')}>
          {v.typeHits.map((t, i) => (
            <button key={i} onClick={t.go} className={hv('background:var(--color-accent-100);border-color:var(--color-accent)')} style={S('min-height:56px;padding:12px 15px;background:var(--color-bg);border:1px solid var(--color-accent-300);border-left:4px solid var(--color-accent);cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left')}>
              <span style={S("font:600 22px 'Barlow Condensed',sans-serif;letter-spacing:.04em;color:var(--color-accent)")}>{t.label}</span>
              <span style={S('font:400 13.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>{t.count} →</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
