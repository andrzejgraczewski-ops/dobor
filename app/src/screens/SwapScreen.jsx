// Ścieżka zamiennika — rozpoznajemy sześć potwierdzonych serii:
// NMRV, CMI, PMRV, SMI, VMR, WMI (decyzja klienta 02.09.2026).
import React from 'react';
import { S, hv } from '../lib/style.js';

export default function SwapScreen({ v }) {
  return (
    <div style={S(`width:100%;max-width:${v.stepW};margin:0 auto;padding:22px 20px 28px`)}>
      <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>Wyszukiwarka zamienników</div>
      <h2 style={S("margin:5px 0 4px;font:600 30px/1.05 'Barlow Condensed',sans-serif")}>Masz już przekładnię innej marki?</h2>
      <p style={S('margin:0 0 16px;font:400 13.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Wpisz oznaczenie przekładni, którą wymieniasz. Rozpoznaję serie NMRV, CMI, PMRV, SMI, VMR i WMI — wystarczą dwie pierwsze litery marki.</p>
      <input value={v.q} onChange={v.setQ} placeholder="np. NMRV063, PMRV 40, wmi6" style={S("width:100%;min-height:56px;padding:13px 15px;background:#fff;border:1px solid var(--color-divider);color:var(--color-text);font:600 20px 'Barlow Condensed',sans-serif;letter-spacing:.04em")} />
      {v.hasQNote ? (
        <div style={S('margin-top:10px;padding:10px 13px;background:var(--color-mid-bg);border-left:4px solid var(--color-mid);font:400 12.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>{v.qNote}</div>
      ) : null}
      {v.hasQHits ? (
        <div style={S('margin-top:11px;display:grid;gap:7px')}>
          {v.qHits.map((h, i) => (
            <button key={i} onClick={h.go} className={hv('background:var(--color-accent-100)')} style={S('min-height:62px;padding:11px 14px;background:#fff;border:1px solid var(--color-accent-300);border-left:4px solid var(--color-accent);cursor:pointer;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;text-align:left')}>
              <span style={S('min-width:0')}>
                <span style={S("display:block;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-ok-ink)")}>{h.tag}</span>
                <span style={S("display:block;margin-top:2px;font:600 19px 'Barlow Condensed',sans-serif;letter-spacing:.04em;color:var(--color-accent)")}>{h.label}</span>
                <span style={S('display:block;margin-top:2px;font:400 12.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-700)')}>{h.sub}</span>
              </span>
              <span style={S('flex:none;font:400 14px Barlow,sans-serif;color:var(--color-neutral-700)')}>→</span>
            </button>
          ))}
        </div>
      ) : null}
      {v.qEmpty ? (
        <div style={S('margin-top:11px;padding:12px 14px;background:var(--color-mid-bg);border-left:4px solid var(--color-mid);font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Nie mam tego oznaczenia w katalogu. Spróbuj samego numeru wielkości (np. 063) albo napisz do nas — dobierzemy odpowiednik ręcznie.</div>
      ) : null}
    </div>
  );
}
