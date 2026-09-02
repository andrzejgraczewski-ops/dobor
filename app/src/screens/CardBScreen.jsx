// Karta B — „Krok 3 · Warunki pracy”. Najważniejszy krok doboru: z odpowiedzi
// klienta wychodzi wymagany współczynnik pracy fs.
import React from 'react';
import { S, hv } from '../lib/style.js';

export default function CardBScreen({ v }) {
  return (
    <div style={S(`width:100%;max-width:${v.stepW};margin:0 auto;padding:22px 20px 28px`)}>
      <div style={S('display:flex;flex-wrap:wrap;align-items:center;gap:9px')}>
        <span style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>Krok 3 · Warunki pracy</span>
        <span style={S("padding:3px 8px;background:var(--color-accent);color:#fff;font:600 10.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Decyduje o doborze</span>
      </div>
      <h2 style={S("margin:5px 0 4px;font:600 30px/1.05 'Barlow Condensed',sans-serif")}>Jak będzie pracowała maszyna?</h2>
      <p style={S('margin:0 0 18px;font:400 13.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>To najważniejszy krok całego doboru — tylko Ty wiesz, jak naprawdę pracuje Twoja maszyna. Im dokładniej odpowiesz, tym pewniej dobierzemy przekładnię, która się sprawdzi i posłuży długo, bez awarii i przestojów. Nie musisz znać dokładnych liczb — wystarczy, że wybierzesz opis najbliższy rzeczywistości.</p>
      <div style={S('display:grid;gap:16px')}>
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
          <div style={S("font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:8px")}>Czas pracy na dobę</div>
          <div style={S('display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px')}>
            {v.hourOpts.map((d, i) => (
              <button key={i} onClick={d.go} className={hv('border-color:var(--color-accent)')} style={S(`min-height:56px;padding:10px 4px;background:${d.bg};color:${d.fg};border:1px solid var(--color-divider);cursor:pointer;font:600 21px 'Barlow Condensed',sans-serif`)}>{d.label}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={S("font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:8px")}>Ile razy na godzinę napęd rusza</div>
          <div style={S('display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px')}>
            {v.zOpts.map((d, i) => (
              <button key={i} onClick={d.go} className={hv('border-color:var(--color-accent)')} style={S(`min-height:56px;padding:10px 4px;background:${d.bg};color:${d.fg};border:1px solid var(--color-divider);cursor:pointer;font:600 21px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums`)}>{d.label}</button>
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
            <span style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-ok-ink)")}>Wymagany współczynnik pracy fs</span>
            <span style={S("font:600 30px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:var(--color-accent)")}>{v.fsHeadline}</span>
          </div>
          <div style={S('margin-top:6px;font:400 12px/1.5 Barlow,sans-serif;color:var(--color-neutral-700)')}>{v.fsFormula}</div>
          <div style={S('margin-top:6px;font:600 12px/1.5 Barlow,sans-serif;color:var(--color-ok-ink)')}>To Twoje odpowiedzi wyżej ustaliły ten wynik — im dokładniejsze, tym trafniejszy dobór.</div>
        </div>
        {v.serviceCall ? (
          <div style={S('padding:12px 14px;background:var(--color-accent-100);border-left:4px solid var(--color-accent)')}>
            <div style={S('font:600 13px/1.45 Barlow,sans-serif;color:var(--color-accent)')}>Powyżej 60 °C katalog nie podaje współczynnika korekcyjnego — wymagane fs ustala serwis techniczny DKM Power Transmission Sp. z o.o.</div>
          </div>
        ) : null}
      </div>
      <button onClick={v.goResults} className={hv('background:var(--color-accent-600)')} style={S("margin-top:16px;width:100%;min-height:56px;padding:15px;background:var(--color-accent);color:#fff;border:1px solid var(--color-accent);cursor:pointer;font:600 15px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase")}>Pokaż wyniki →</button>
    </div>
  );
}
