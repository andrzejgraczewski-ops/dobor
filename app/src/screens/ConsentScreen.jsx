// Świadoma zgoda przy fs < 1,0 — dwa niezależne oświadczenia zapisywane
// razem z pozycją koszyka (treść, data, wersja warunków).
import React from 'react';
import { S, hv } from '../lib/style.js';

export default function ConsentScreen({ v }) {
  return (
    <div style={S(`width:100%;max-width:${v.stepW};margin:0 auto`)}>
      <div style={S('padding:17px 20px 14px;border-bottom:1px solid var(--color-divider);display:flex;align-items:flex-end;justify-content:space-between;gap:12px')}>
        <h2 style={S("margin:0;font:600 27px/1.03 'Barlow Condensed',sans-serif;color:var(--color-warn)")}>Potwierdź świadomy wybór przekładni</h2>
        <button onClick={v.closeConsent} className={hv('border-color:var(--color-accent);background:var(--color-accent-100)')} style={S("flex:none;min-height:40px;padding:9px 12px;background:transparent;border:1px solid var(--color-accent-300);cursor:pointer;font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-accent-700)")}>Wróć do wyników</button>
      </div>
      <div style={S('padding:16px 20px 26px')}>
        <div style={S('border:1px solid var(--color-warn);border-top:5px solid var(--color-warn)')}>
          <div style={S('padding:14px 15px;background:var(--color-warn-bg)')}>
            <div style={S('display:grid;gap:1px;background:var(--color-divider);border:1px solid var(--color-divider)')}>
              {v.consentRows.map((d, i) => (
                <div key={i} style={S('background:#fff;padding:9px 12px;display:flex;align-items:baseline;justify-content:space-between;gap:12px')}>
                  <span style={S('font:400 12.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>{d.k}</span>
                  <span style={S(`flex:none;font:600 14px 'Barlow Condensed',sans-serif;letter-spacing:.04em;color:${d.color};text-align:right`)}>{d.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={S('padding:14px 15px;font:400 13.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>
            <p style={S('margin:0 0 9px')}>Wybrana przekładnia ma współczynnik pracy <strong>fs poniżej 1,0</strong> dla zestawienia z wybranym silnikiem.</p>
            <p style={S('margin:0 0 9px')}>Przy pełnym wykorzystaniu znamionowej mocy silnika przekładnia może zostać przeciążona.</p>
            <p style={S('margin:0 0 9px')}>Rzeczywiste obciążenie Twojej maszyny może być niższe, jednak DKM Power Transmission Sp. z o.o. nie posiada informacji niezbędnych do potwierdzenia przydatności tego zestawienia.</p>
            <p style={S('margin:0 0 9px')}>Możesz zamówić tę przekładnię, ale DKM Power Transmission Sp. z o.o. nie udziela na nią dobrowolnej gwarancji handlowej w ramach tego zamówienia.</p>
            <p style={S('margin:0;color:var(--color-neutral-700)')}>Brak dobrowolnej gwarancji handlowej nie ogranicza uprawnień, których zgodnie z obowiązującymi przepisami nie można wyłączyć.</p>
          </div>
          <div style={S('padding:0 15px 15px;display:grid;gap:9px')}>
            <button onClick={v.toggleC1} className={hv('border-color:var(--color-warn)')} style={S(`min-height:52px;padding:11px 13px;background:${v.c1Bg};border:1px solid ${v.c1Bd};cursor:pointer;display:flex;align-items:flex-start;gap:11px;text-align:left`)}>
              <span style={S(`flex:none;width:22px;height:22px;border:2px solid ${v.c1Bd};background:${v.c1Fill};color:#fff;font:600 14px/18px Barlow,sans-serif;text-align:center`)}>{v.c1Mark}</span>
              <span style={S('font:400 13px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}>{v.consentA}</span>
            </button>
            <button onClick={v.toggleC2} className={hv('border-color:var(--color-warn)')} style={S(`min-height:52px;padding:11px 13px;background:${v.c2Bg};border:1px solid ${v.c2Bd};cursor:pointer;display:flex;align-items:flex-start;gap:11px;text-align:left`)}>
              <span style={S(`flex:none;width:22px;height:22px;border:2px solid ${v.c2Bd};background:${v.c2Fill};color:#fff;font:600 14px/18px Barlow,sans-serif;text-align:center`)}>{v.c2Mark}</span>
              <span style={S('font:400 13px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}>{v.consentB}</span>
            </button>
            {v.consentErr ? (
              <div style={S('padding:10px 12px;background:var(--color-warn);color:#fff;font:600 12.5px/1.45 Barlow,sans-serif')}>Aby kontynuować, potwierdź zapoznanie się z ograniczeniami technicznymi i warunkami zakupu.</div>
            ) : null}
            <button onClick={v.confirmConsent} className={hv('background:#a80d26;border-color:#a80d26')} style={S("min-height:54px;padding:14px;background:var(--color-warn);color:#fff;border:1px solid var(--color-warn);cursor:pointer;font:600 14px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Potwierdzam i zamawiam</button>
            <button onClick={v.closeConsent} className={hv('border-color:var(--color-accent);background:var(--color-accent-100)')} style={S("min-height:46px;padding:11px;background:transparent;border:1px solid var(--color-accent-300);cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-accent-700)")}>Wróć do wyników</button>
          </div>
        </div>
      </div>
    </div>
  );
}
