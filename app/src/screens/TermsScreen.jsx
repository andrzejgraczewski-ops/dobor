// Regulamin korzystania z aplikacji — 13 paragrafów z lib/consts.js.
import React from 'react';
import { S, hv } from '../lib/style.js';

export default function TermsScreen({ v }) {
  return (
    <div style={S(`width:100%;max-width:${v.docW};margin:0 auto;padding:22px 20px 30px`)}>
      <button onClick={v.closeLegal} className={hv('background:var(--color-accent-100)')} style={S("min-height:46px;margin-bottom:16px;padding:11px 16px;background:transparent;border:1px solid var(--color-accent);color:var(--color-accent);cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>← Zamknij</button>
      <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>{v.termsVer}</div>
      <h2 style={S("margin:5px 0 4px;font:600 30px/1.05 'Barlow Condensed',sans-serif")}>Regulamin korzystania z aplikacji doboru produktów DKM Power Transmission Sp. z o.o.</h2>
      <div style={S('height:4px;margin:14px 0 20px;background:linear-gradient(90deg,var(--color-accent) 0 34%,var(--color-accent-700) 34% 67%,var(--color-ok) 67%)')}></div>
      <div style={S('display:grid;gap:22px')}>
        {v.terms.map((s, i) => (
          <div key={i}>
            <h3 style={S("margin:0 0 8px;font:600 20px/1.15 'Barlow Condensed',sans-serif;letter-spacing:.03em;text-transform:uppercase;color:var(--color-accent)")}>{s.head}</h3>
            <div style={S('display:grid;gap:9px')}>
              {s.p.map((t, j) => (
                <p key={j} style={S('margin:0;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>{t}</p>
              ))}
            </div>
            <ul style={S('margin:9px 0 0;padding-left:20px;font:400 14px/1.65 Barlow,sans-serif;color:var(--color-neutral-700)')}>
              {s.b.map((x, j) => (<li key={j}>{x}</li>))}
            </ul>
            <div style={S('display:grid;gap:9px;margin-top:9px')}>
              {s.p2.map((t, j) => (
                <p key={j} style={S('margin:0;font:400 14px/1.6 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>{t}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p style={S('margin:24px 0 0;font:600 12.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-700)')}>© 2026 DKM Power Transmission Sp. z o.o. Wszelkie prawa zastrzeżone.</p>
      <button onClick={v.closeLegal} className={hv('background:var(--color-accent-700)')} style={S("width:100%;min-height:52px;margin-top:20px;padding:14px;background:var(--color-accent);border:1px solid var(--color-accent);color:#fff;cursor:pointer;font:600 13.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>← Zamknij</button>
    </div>
  );
}
