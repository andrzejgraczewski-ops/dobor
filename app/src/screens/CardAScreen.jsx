// Karta A — „Krok 2 z 3 · Zawężenie doboru”: zasilanie silnika, pasek standardu
// 1400 obr/min, bramka „czy znasz dodatkowe parametry”, kafelki kryteriów
// i panele wartości tylko dla zaznaczonych kryteriów. Bez listy pozycji.
import React from 'react';
import { S, hv } from '../lib/style.js';

export default function CardAScreen({ v }) {
  return (
    <div style={S(`width:100%;max-width:${v.stepW};margin:0 auto;padding:22px 20px 28px`)}>
      <div style={S('display:flex;align-items:flex-start;gap:14px')}>
        <span style={S("flex:none;width:52px;height:52px;background:var(--color-accent);color:#fff;display:flex;align-items:center;justify-content:center;font:600 26px/1 'Barlow Condensed',sans-serif")}>2</span>
        <span style={S('min-width:0')}>
          <span style={S("display:block;font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>Krok 2 z 3 · Zawężenie doboru</span>
          <span style={S("display:block;margin-top:2px;font:600 30px/1.05 'Barlow Condensed',sans-serif;color:var(--color-accent)")}>W jaki sposób chcesz dobrać przekładnię?</span>
        </span>
      </div>
      <p style={S('margin:12px 0 20px;font:400 13.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Wybierz kryteria, które znasz — jedno lub więcej. Możesz też przejść dalej bez zawężania i przejrzeć wszystkie zestawienia.</p>

      <div style={S('border:1px solid var(--color-divider);background:#fff')}>
        <div style={S("padding:9px 14px;background:var(--color-surface);border-bottom:1px solid var(--color-divider);font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>Zasilanie silnika</div>
        <div style={S(`padding:14px 15px 15px;display:grid;grid-template-columns:${v.formCols};gap:9px`)}>
          {v.phFilter.map((o, i) => (
            <button key={i} onClick={o.pick} className={hv('border-color:var(--color-accent)')} style={S(`min-height:52px;padding:10px 12px;background:${o.bg};color:${o.fg};border:1px solid ${o.bd};cursor:pointer;text-align:left`)}>
              <span style={S("display:block;font:600 14.5px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase")}>{o.label}</span>
              <span style={S(`display:block;margin-top:2px;font:400 11.5px Barlow,sans-serif;color:${o.sub}`)}>{o.count}</span>
            </button>
          ))}
        </div>
      </div>

      {v.stdOn ? (
        <div style={S('margin-top:10px;padding:10px 12px;background:var(--color-ok-bg);border-left:4px solid var(--color-ok);display:flex;flex-wrap:wrap;align-items:center;gap:10px')}>
          <span style={S('flex:1 1 190px;font:400 12.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-900)')}>Dobieram na <strong style={S('font-weight:600')}>silniku 4-biegunowym 1400 obr/min</strong> — tak realizuje się większość napędów.</span>
          <button onClick={v.showAllRpm} className={hv('background:#fff')} style={S("min-height:38px;padding:8px 11px;background:transparent;border:1px solid var(--color-ok-ink);color:var(--color-ok-ink);cursor:pointer;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase")}>Pokaż też 900 i 2800</button>
        </div>
      ) : null}
      {v.stdOff ? (
        <div style={S('margin-top:10px;padding:10px 12px;background:var(--color-accent-100);border-left:4px solid var(--color-accent-700);display:flex;flex-wrap:wrap;align-items:center;gap:10px')}>
          <span style={S('flex:1 1 190px;font:400 12.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-900)')}>Widzisz wszystkie prędkości silnika: 900, 1400 i 2800 obr/min.</span>
          <button onClick={v.backToStd} className={hv('background:#fff')} style={S("min-height:38px;padding:8px 11px;background:transparent;border:1px solid var(--color-accent-700);color:var(--color-accent-700);cursor:pointer;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase")}>Tylko standard 1400</button>
        </div>
      ) : null}

      <div style={S('margin-top:20px;padding:16px 16px 17px;border:1px solid var(--color-accent-300);background:var(--color-accent-100)')}>
        <div style={S("font:600 19px/1.2 'Barlow Condensed',sans-serif;letter-spacing:.02em;color:var(--color-accent)")}>Zbliżamy się do wyboru napędu. Im więcej nam powiesz, tym trafniej dobierzemy przekładnię.</div>
        <div style={S('margin-top:5px;font:400 12.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-700)')}>Ten krok jest opcjonalny — możesz go pominąć.</div>
        <div style={S(`margin-top:12px;display:grid;grid-template-columns:${v.formCols};gap:9px`)}>
          <button onClick={v.pickAnswerNo} className={hv('opacity:.88')} style={S(`min-height:58px;padding:12px 14px;background:${v.answerNoBg};color:${v.answerNoFg};border:1px solid var(--color-accent);cursor:pointer;text-align:left;font:600 14.5px/1.3 Barlow,sans-serif`)}>Pomiń — pokaż wszystkie pasujące zestawienia</button>
          <button onClick={v.pickAnswerYes} className={hv('opacity:.88')} style={S(`min-height:58px;padding:12px 14px;background:${v.answerYesBg};color:${v.answerYesFg};border:1px solid var(--color-accent);cursor:pointer;text-align:left;font:600 14.5px/1.3 Barlow,sans-serif`)}>Tak, zawężmy wybór</button>
        </div>
      </div>

      {v.refineAsk ? (
        <>
          <div style={S('margin-top:18px')}>
            <div style={S("font:600 19px/1.2 'Barlow Condensed',sans-serif;letter-spacing:.02em;color:var(--color-accent);margin-bottom:11px")}>Który z nich znasz?</div>
            <div style={S(`display:grid;grid-template-columns:${v.tileGrid};gap:11px`)}>
              {v.refineTiles.map((t, i) => (
                <button key={i} onClick={t.toggle} className={hv('border-color:var(--color-accent)')} style={S(`position:relative;padding:15px 12px 16px;background:${t.bg};border:1px solid ${t.bd};cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:9px`)}>
                  <span style={S(`position:absolute;top:8px;right:8px;width:20px;height:20px;background:${t.markBg};color:${t.markFg};border:1px solid ${t.bd};display:flex;align-items:center;justify-content:center;font:600 12px Barlow,sans-serif`)}>{t.mark}</span>
                  <span role="img" aria-label={t.label} style={S(`width:100%;height:76px;background-image:${t.tile};background-size:contain;background-position:center;background-repeat:no-repeat`)}></span>
                  <span style={S('font:600 14px/1.25 Barlow,sans-serif;color:var(--color-accent);text-align:center;text-wrap:pretty')}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {v.hasRefinePick ? (
            <div style={S('margin-top:18px;display:grid;gap:14px')}>
              {v.cardGroups.map((g, gi) => (
                <div key={gi} style={S(`border:1px solid ${g.bd};background:#fff`)}>
                  <div style={S('display:flex;align-items:center;gap:11px;padding:10px 14px;border-bottom:1px solid var(--color-divider)')}>
                    <span style={S("flex:1;min-width:0;font:600 18px/1.15 'Barlow Condensed',sans-serif;letter-spacing:.03em;color:var(--color-accent)")}>{g.headline}</span>
                    <span style={S(`flex:none;font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${g.stateFg}`)}>{g.state}</span>
                    {g.on ? (
                      <button onClick={g.clear} className={hv('border-color:var(--color-accent);color:var(--color-accent)')} style={S("flex:none;min-height:26px;padding:4px 8px;background:transparent;border:1px solid var(--color-divider);cursor:pointer;font:600 10px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--color-neutral-700)")}>Wyczyść</button>
                    ) : null}
                  </div>
                  <div style={S(`padding:12px 14px 14px;display:grid;grid-template-columns:repeat(${g.cols},minmax(0,1fr));gap:7px`)}>
                    {g.opts.map((o, oi) => (
                      <button key={oi} onClick={o.go} className={hv('border-color:var(--color-accent);background:var(--color-accent-100)')} style={S(`min-height:58px;padding:8px 3px;background:${o.bg};color:${o.fg};border:1px solid ${o.bd};cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px`)}>
                        <span style={S("font:600 20px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums")}>{o.label}</span>
                        <span style={S(`font:400 12px/1 Barlow,sans-serif;color:${o.cg}`)}>{o.count}</span>
                        {o.optOnly ? (
                          <span style={S(`font:600 9px 'Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${o.cg}`)}>na zapytanie</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : null}

      <div style={S('margin-top:20px;border:1px solid var(--color-accent)')}>
        <div style={S('display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;background:var(--color-accent-100)')}>
          <span style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-accent-700)")}>Pasujące zestawienia</span>
          <span style={S("font:600 24px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:var(--color-accent)")}>{v.cardACount}</span>
        </div>
        <button onClick={v.goCardB} className={hv('background:var(--color-accent-600)')} style={S("width:100%;min-height:58px;padding:16px;background:var(--color-accent);color:#fff;border:0;cursor:pointer;font:600 15px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase")}>Dalej · warunki pracy →</button>
      </div>
    </div>
  );
}
