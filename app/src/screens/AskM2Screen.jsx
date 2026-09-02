// Kryterium wejściowe: wymagania maszyny (M₂, opcjonalne n₂) + warunki pracy
// z wykresu katalogowego, z których wychodzi orientacyjne fs.
import React from 'react';
import { S, hv } from '../lib/style.js';

export default function AskM2Screen({ v }) {
  return (
    <div style={S('padding:22px 20px 26px')}>
      <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>Kryterium wejściowe</div>
      <h2 style={S("margin:5px 0 4px;font:600 30px/1.05 'Barlow Condensed',sans-serif")}>Wymagania maszyny</h2>
      <p style={S('margin:0 0 18px;font:400 13.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-700)')}>Podaj moment obrotowy na wale wyjściowym. Prędkość obrotowa jest opcjonalna — bez niej pokażę wszystkie przełożenia.</p>
      <div style={S('display:grid;grid-template-columns:1fr 1fr;gap:12px')}>
        <label style={S('display:block')}>
          <span style={S("display:block;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:5px")}>Moment obrotowy M₂ (Nm)</span>
          <input value={v.m2In} onChange={v.setM2} inputMode="decimal" placeholder="np. 45" style={S("width:100%;min-height:52px;padding:10px 12px;background:transparent;border:1px solid var(--color-divider);color:var(--color-text);font:600 22px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums")} />
          <span style={S('display:block;margin-top:6px;font:400 12px/1.45 Barlow,sans-serif;color:var(--color-neutral-700)')}>Wpisz moment, jaki musi mieć wał wyjściowy przekładni.</span>
        </label>
        <label style={S('display:block')}>
          <span style={S("display:block;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:5px")}>Prędkość obrotowa n₂ (obr/min)</span>
          <input value={v.n2In} onChange={v.setN2} inputMode="decimal" placeholder="np. 28" style={S("width:100%;min-height:52px;padding:10px 12px;background:transparent;border:1px solid var(--color-divider);color:var(--color-text);font:600 22px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums")} />
          <span style={S('display:block;margin-top:6px;font:400 12px/1.45 Barlow,sans-serif;color:var(--color-neutral-700)')}>Wpisz prędkość obrotową wału wyjściowego. Pole możesz zostawić puste — pokażę wszystkie przełożenia.</span>
        </label>
      </div>
      <div style={S('margin-top:20px;display:grid;gap:16px')}>
        <div>
          <div style={S("font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:7px")}>Typ obciążenia</div>
          <div style={S('display:grid;gap:7px')}>
            {v.loadOpts.map((d, i) => (
              <button key={i} onClick={d.go} className={hv('border-color:var(--color-accent)')} style={S(`min-height:52px;padding:9px 12px;background:${d.bg};color:${d.fg};border:1px solid var(--color-divider);cursor:pointer;text-align:left`)}>
                <span style={S('display:block;font:600 14px Barlow,sans-serif')}>{d.label}</span>
                <span style={S(`display:block;margin-top:2px;font:400 11.5px Barlow,sans-serif;color:${d.dg}`)}>{d.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={S("font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:7px")}>Czas pracy na dobę</div>
          <div style={S('display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px')}>
            {v.hourOpts.map((d, i) => (
              <button key={i} onClick={d.go} className={hv('border-color:var(--color-accent)')} style={S(`min-height:46px;padding:8px 4px;background:${d.bg};color:${d.fg};border:1px solid var(--color-divider);cursor:pointer;font:600 15px 'Barlow Condensed',sans-serif`)}>{d.label}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={S("font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:7px")}>Częstotliwość rozruchów Z (1/h)</div>
          <div style={S('display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px')}>
            {v.zOpts.map((d, i) => (
              <button key={i} onClick={d.go} className={hv('border-color:var(--color-accent)')} style={S(`min-height:46px;padding:8px 4px;background:${d.bg};color:${d.fg};border:1px solid var(--color-divider);cursor:pointer;font:600 15px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums`)}>{d.label}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={S("font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:7px")}>Temperatura otoczenia</div>
          <div style={S('display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px')}>
            {v.tempOpts.map((d, i) => (
              <button key={i} onClick={d.go} className={hv('border-color:var(--color-accent)')} style={S(`min-height:46px;padding:8px 3px;background:${d.bg};color:${d.fg};border:1px solid var(--color-divider);cursor:pointer;font:600 12px 'Barlow Condensed',sans-serif`)}>{d.label}</button>
            ))}
          </div>
          {v.tempHasNote ? (
            <div style={S('margin-top:7px;font:400 11.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-700)')}>{v.tempNote}</div>
          ) : null}
        </div>
        <div style={S('padding:13px 14px;background:var(--color-ok-bg);border-left:4px solid var(--color-ok)')}>
          <div style={S('display:flex;align-items:baseline;justify-content:space-between;gap:12px')}>
            <span style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-ok-ink)")}>Orientacyjne fs</span>
            <span style={S("font:600 30px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:var(--color-accent)")}>{v.fsHeadline}</span>
          </div>
          <div style={S('margin-top:6px;font:400 12px/1.5 Barlow,sans-serif;color:var(--color-neutral-700)')}>{v.fsFormula}</div>
        </div>
        {v.serviceCall ? (
          <div style={S('padding:12px 14px;background:var(--color-accent-100);border-left:4px solid var(--color-accent)')}>
            <div style={S('font:600 13px/1.45 Barlow,sans-serif;color:var(--color-accent)')}>Powyżej 60 °C katalog nie podaje współczynnika korekcyjnego — wymagane fs ustala serwis techniczny DKM Power Transmission Sp. z o.o. Lista poniżej jest filtrowana wykresem bez korekty temperaturowej i jest doborem wstępnym.</div>
          </div>
        ) : null}
      </div>
      <button className={'blueprint ' + hv('background:var(--color-accent-600);border-color:var(--color-accent-600)')} onClick={v.runM2} style={S("position:relative;margin-top:20px;width:100%;min-height:56px;padding:15px;background:var(--color-accent);color:var(--color-bg);border:1px solid var(--color-accent);cursor:pointer;font:600 15px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase")}>
        <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
        Szukaj przekładni
      </button>
    </div>
  );
}
