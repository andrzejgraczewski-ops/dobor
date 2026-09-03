// Lista wyników: po lewej kryteria i filtry, po prawej podpowiedź zawężenia
// i pozycje. Zestawienia poza zalecanym zakresem (fs < 1,0 i bez danych)
// stoją w osobnej sekcji na dole.
import React from 'react';
import { S, hv } from '../lib/style.js';

function Row({ v, r, note, hover }) {
  return (
    <button onClick={r.go} className={hv(hover)} style={S(`width:100%;display:grid;grid-template-columns:${v.rowCols};gap:${v.rowGap};align-items:center;padding:13px 20px;background:transparent;border:0;border-bottom:1px solid var(--color-divider);cursor:pointer;text-align:left;min-height:64px`)}>
      <span>
        <span style={S('display:block;font:600 16.5px/1.15 Barlow,sans-serif')}>{r.box}</span>
        <span style={S('display:block;margin-top:3px;font:400 12.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>{r.rowSub}</span>
        <span style={S(`display:flex;align-items:center;gap:6px;margin-top:5px;font:600 11.5px Barlow,sans-serif;color:${r.noteColor}`)}><span style={S(`flex:none;width:15px;height:15px;background:${r.fsBg};color:${r.fsFg};font:600 10px/15px Barlow,sans-serif;text-align:center`)}>{r.fsIcon}</span>{note}</span>
      </span>
      <span style={S('text-align:right;font-variant-numeric:tabular-nums')}>
        <span style={S("display:block;font:600 20px/1.05 'Barlow Condensed',sans-serif")}>{r.n2}<span style={S('font:400 11px Barlow,sans-serif;color:var(--color-neutral-700)')}> obr/min</span></span>
        <span style={S('display:block;margin-top:2px;font:400 13.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>i {r.i}</span>
      </span>
      <span style={S('text-align:right;font-variant-numeric:tabular-nums')}>
        <span style={S("display:block;font:600 23px/1 'Barlow Condensed',sans-serif")}>{r.m2}<span style={S('font:400 11px Barlow,sans-serif;color:var(--color-neutral-700)')}> Nm</span></span>
        <span style={S(`display:inline-block;margin-top:3px;padding:2px 6px;background:${r.fsBg};color:${r.fsFg};font:600 11px Barlow,sans-serif`)}>{r.fsLabel}</span>
      </span>
      <span style={S('text-align:right;font-variant-numeric:tabular-nums')}>
        <span style={S(`display:block;font:600 ${r.priceFs} 'Barlow Condensed',sans-serif;color:${r.priceColor};text-transform:${r.priceTt};letter-spacing:${r.priceLs}`)}>{r.priceLabel}<span style={S('font:400 10px Barlow,sans-serif;text-transform:none;letter-spacing:0;color:var(--color-neutral-500)')}> przekł.</span></span>
        <span style={S(`display:block;margin-top:1px;font:600 ${r.motorFs} 'Barlow Condensed',sans-serif;color:${r.motorColor}`)}>{r.motorLabel}<span style={S('font:400 10px Barlow,sans-serif;color:var(--color-neutral-500)')}> silnik</span></span>
        <span style={S(`display:flex;align-items:center;justify-content:flex-end;gap:5px;margin-top:4px;font:600 11.5px Barlow,sans-serif;color:${r.availColor}`)}><span style={S(`width:7px;height:7px;background:${r.availDot};flex:none`)}></span>{r.availLabel}</span>
      </span>
    </button>
  );
}

export default function ResultsScreen({ v }) {
  return (
    <div style={S(`display:grid;grid-template-columns:${v.resCols};align-items:start`)}>
      <div style={S(`border-right:${v.leftBorder}`)}>
        <div style={S('padding:15px 20px 16px;background:var(--color-bg);border-top:3px solid var(--color-accent);border-bottom:1px solid var(--color-divider)')}>
          <div style={S('display:flex;align-items:center;justify-content:space-between;gap:12px')}>
            <span style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--color-neutral-700)")}>Proponowany dobór · Twoje kryteria</span>
            <span style={S('display:flex;align-items:baseline;gap:6px')}><span style={S("font:600 27px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:var(--color-accent)")}>{v.count}</span><span style={S('font:400 12.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>z {v.totalCount} pozycji</span></span>
          </div>
          <div style={S('margin-top:11px')}>
            <div style={S("font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:7px")}>Zasilanie silnika</div>
            <div style={S(`display:grid;grid-template-columns:${v.formCols};gap:9px`)}>
              {v.phFilter.map((o, i) => (
                <button key={i} onClick={o.pick} className={hv('border-color:var(--color-accent)')} style={S(`min-height:52px;padding:10px 12px;background:${o.bg};color:${o.fg};border:1px solid ${o.bd};cursor:pointer;text-align:left`)}>
                  <span style={S("display:block;font:600 14.5px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase")}>{o.label}</span>
                  <span style={S(`display:block;margin-top:2px;font:400 11.5px Barlow,sans-serif;color:${o.sub}`)}>{o.count}</span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={v.toggleLow} className={hv('border-color:var(--color-warn)')} style={S(`margin-top:9px;width:100%;min-height:50px;padding:11px 13px;background:${v.lowBg};border:1px solid ${v.lowBd};cursor:pointer;display:flex;align-items:center;gap:11px;text-align:left`)}>
            <span style={S(`flex:none;width:24px;height:24px;border:2px solid ${v.lowBd};background:${v.lowBg};color:#fff;font:600 15px/20px Barlow,sans-serif;text-align:center`)}>{v.lowMark}</span>
            <span style={S('flex:1;min-width:0')}>
              <span style={S(`display:block;font:600 14.5px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${v.lowFg}`)}>Ukryj współczynnik pracy fs poniżej 1,0</span>
              <span style={S(`display:block;margin-top:2px;font:400 12px Barlow,sans-serif;color:${v.lowFg};opacity:.85`)}>{v.lowCount} pozycji poza zalecanym zakresem</span>
            </span>
          </button>
          {v.hasPriceDate ? (
            <button onClick={v.toggleStock} className={hv('border-color:var(--color-ok)')} style={S(`margin-top:11px;width:100%;min-height:50px;padding:11px 13px;background:${v.stockBg};border:1px solid ${v.stockBd};cursor:pointer;display:flex;align-items:center;gap:11px;text-align:left`)}>
              <span style={S(`flex:none;width:24px;height:24px;border:2px solid ${v.stockBd};background:${v.stockBg};color:#fff;font:600 15px/20px Barlow,sans-serif;text-align:center`)}>{v.stockMark}</span>
              <span style={S('flex:1;min-width:0')}>
                <span style={S(`display:block;font:600 14.5px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${v.stockFg}`)}>Tylko dostępne od ręki</span>
                <span style={S(`display:block;margin-top:2px;font:400 12px Barlow,sans-serif;color:${v.stockFg};opacity:.85`)}>{v.stockCount} pozycji z magazynu — przekładnia i silnik gotowe do wysyłki</span>
              </span>
            </button>
          ) : null}
          <div style={S('margin-top:11px;display:flex;flex-wrap:wrap;gap:8px')}>
            {v.chips.map((c, i) => (
              <button key={i} onClick={c.clear} className={hv('background:var(--color-accent-200)')} style={S('min-height:42px;padding:8px 12px;background:var(--color-accent-100);color:var(--color-accent);border:1px solid var(--color-accent);border-left:4px solid var(--color-ok);cursor:pointer;font:600 14.5px Barlow,sans-serif;display:flex;align-items:center;gap:10px')}>{c.label}<span style={S('font-size:13px;color:var(--color-accent-700)')}>✕</span></button>
            ))}
            {v.noChips ? (
              <span style={S('min-height:42px;padding:11px 0;font:400 14px Barlow,sans-serif;color:var(--color-neutral-700)')}>Cały katalog — bez filtrów</span>
            ) : null}
          </div>
          {v.stdOn ? (
            <div style={S('margin-top:11px;padding:10px 12px;background:var(--color-ok-bg);border-left:4px solid var(--color-ok);display:flex;flex-wrap:wrap;align-items:center;gap:10px')}>
              <span style={S('flex:1 1 190px;font:400 12.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-900)')}>Dobieram na <strong style={S('font-weight:600')}>silniku 4-biegunowym 1400 obr/min</strong> — tak realizuje się większość napędów.</span>
              <button onClick={v.showAllRpm} className={hv('background:#fff')} style={S("min-height:38px;padding:8px 11px;background:transparent;border:1px solid var(--color-ok-ink);color:var(--color-ok-ink);cursor:pointer;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase")}>Pokaż też 900 i 2800</button>
            </div>
          ) : null}
          {v.stdOff ? (
            <div style={S('margin-top:11px;padding:10px 12px;background:var(--color-accent-100);border-left:4px solid var(--color-accent-700);display:flex;flex-wrap:wrap;align-items:center;gap:10px')}>
              <span style={S('flex:1 1 190px;font:400 12.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-900)')}>Widzisz wszystkie prędkości silnika: 900, 1400 i 2800 obr/min.</span>
              <button onClick={v.backToStd} className={hv('background:#fff')} style={S("min-height:38px;padding:8px 11px;background:transparent;border:1px solid var(--color-accent-700);color:var(--color-accent-700);cursor:pointer;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase")}>Tylko standard 1400</button>
            </div>
          ) : null}
          <button onClick={v.toggleRefine} className={hv('background:var(--color-accent-100)')} style={S("margin-top:12px;width:100%;min-height:46px;padding:11px;background:transparent;color:var(--color-accent-700);border:1px solid var(--color-accent-700);cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>{v.refineLabel}</button>
        </div>

        {v.refineOpen ? (
          <div style={S('padding:15px 20px 17px;background:var(--color-surface);border-bottom:1px solid var(--color-divider);display:grid;gap:14px')}>
            {v.refineGroups.map((g, gi) => (
              <div key={gi}>
                <div style={S("font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:6px")}>{g.label} {g.unit}</div>
                <div style={S(`display:grid;grid-template-columns:repeat(${g.cols},minmax(0,1fr));gap:6px`)}>
                  {g.opts.map((o, oi) => (
                    <button key={oi} onClick={o.go} className={hv('border-color:var(--color-accent)')} style={S(`min-height:46px;padding:6px 3px;background:${o.bg};color:${o.fg};border:1px solid var(--color-divider);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px`)}>
                      <span style={S("font:600 14px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums")}>{o.label}</span>
                      <span style={S(`font:400 9.5px Barlow,sans-serif;color:${o.cg}`)}>{o.count}</span>
                      {o.optOnly ? (
                        <span style={S(`font:600 8px 'Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${o.cg}`)}>na zapytanie</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <label style={S('display:block')}>
              <span style={S("display:block;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:5px")}>Moment obrotowy M₂ min (Nm)</span>
              <input value={v.m2In} onChange={v.setM2} inputMode="decimal" placeholder="—" style={S("width:100%;min-height:46px;padding:9px 11px;background:var(--color-bg);border:1px solid var(--color-divider);color:var(--color-text);font:600 19px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums")} />
            </label>
          </div>
        ) : null}
      </div>

      <div>
        {v.showStep ? (
          <div style={S('padding:14px 20px 16px;background:var(--color-accent-100);border-bottom:1px solid var(--color-divider)')}>
            <div style={S("font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent)")}>Zawęź dobór — wybierz kryterium, które znasz</div>
            <div style={S('margin:4px 0 10px;font:400 12.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-700)')}>{v.nextStep.hint}</div>
            <div style={S('display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px')}>
              {v.stepTabs.map((t, i) => (
                <button key={i} onClick={t.pick} className={hv('border-color:var(--color-accent)')} style={S(`min-height:40px;padding:7px 12px;background:${t.bg};color:${t.fg};border:1px solid ${t.bd};cursor:pointer;font:600 13px Barlow,sans-serif;display:flex;align-items:center;gap:7px`)}>
                  {t.label}
                  <span style={S('font:400 11.5px Barlow,sans-serif;opacity:.65')}>{t.count}</span>
                  {t.sug ? (
                    <span style={S("padding:2px 5px;background:var(--color-ok-bg);color:var(--color-ok-ink);font:600 9.5px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase")}>sugerowane</span>
                  ) : null}
                </button>
              ))}
            </div>
            <div style={S("font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700);margin-bottom:8px")}>{v.nextStep.title}</div>
            <div style={S('display:flex;flex-wrap:wrap;gap:7px')}>
              {v.nextStep.opts.map((o, i) => (
                <button key={i} onClick={o.go} className={hv('border-color:var(--color-accent);background:#fff')} style={S('min-height:44px;padding:7px 12px;background:var(--color-bg);border:1px solid var(--color-accent-300);cursor:pointer;display:flex;align-items:baseline;gap:7px')}>
                  <span style={S("font:600 16px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:var(--color-accent)")}>{o.label}</span>
                  <span style={S('font:400 11px Barlow,sans-serif;color:var(--color-neutral-500)')}>{o.count}</span>
                  {o.optOnly ? (
                    <span style={S("padding:2px 5px;background:var(--color-accent-200);color:var(--color-accent-700);font:600 9.5px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase")}>na zapytanie</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div style={S(`display:grid;grid-template-columns:${v.rowCols};gap:${v.rowGap};padding:11px 20px;border-bottom:1px solid var(--color-divider);font:600 17px/1.25 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:none;color:var(--color-neutral-700)`)}>
          <span style={S('text-transform:uppercase;letter-spacing:.1em;font-size:16px')}>Motoreduktor</span>
          <span style={S('text-align:right')}>n₂<br />i</span>
          <span style={S('text-align:right')}>M₂<br />fs</span>
          <span style={S('text-align:right;color:var(--color-accent-700);text-transform:uppercase;letter-spacing:.12em;font-size:13px')}>Cena netto<br />dostępność</span>
        </div>
        <div style={S("padding:8px 20px;background:var(--color-accent-100);border-bottom:1px solid var(--color-divider);font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-accent-700)")}>Wszystkie ceny w aplikacji są cenami netto — bez podatku VAT</div>
        {v.rows.map((r, i) => (
          <Row key={i} v={v} r={r} note={r.fsShort} hover="background:var(--color-accent-100)" />
        ))}
        {v.hasRowsOut ? (
          <div style={S('margin-top:8px;border-top:8px solid var(--color-surface)')}>
            <div style={S('padding:16px 20px 12px')}>
              <div style={S('display:flex;align-items:center;gap:9px')}>
                <span style={S('flex:none;width:22px;height:22px;background:var(--color-warn);color:#fff;font:600 13px/22px Barlow,sans-serif;text-align:center')}>▲</span>
                <span style={S("font:600 19px/1.05 'Barlow Condensed',sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--color-warn)")}>Dostępne zestawienia poza zalecanym zakresem</span>
              </div>
              <div style={S('margin-top:7px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Poniższe przekładnie można zamówić po świadomej akceptacji warunków zakupu bez dobrowolnej gwarancji handlowej DKM Power Transmission Sp. z o.o. <strong style={S('font-weight:600')}>{v.rowsOutCount}</strong>.</div>
            </div>
            {v.rowsOut.map((r, i) => (
              <Row key={i} v={v} r={r} note={r.fsStatus} hover="background:var(--color-warn-bg)" />
            ))}
          </div>
        ) : null}
        {v.empty ? (
          <div style={S('padding:24px 20px 26px')}>
            <div style={S('font:400 14.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-700)')}>Brak pozycji dla tych kryteriów. Usuń jedno z kryteriów powyżej albo zmniejsz wymagany moment.</div>
            <div style={S('margin-top:14px;padding:14px 15px;border:1px solid var(--color-divider);border-left:4px solid var(--color-accent)')}>
              <div style={S("font:600 16px/1.2 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--color-accent)")}>Nie ma tego w katalogu?</div>
              <div style={S('margin-top:5px;font:400 13.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-700)')}>DKM Power Transmission Sp. z o.o. wykonuje też przekładnie poza katalogiem. Wyślij swoje parametry — doradca zaproponuje rozwiązanie.</div>
              <button onClick={v.askAdvisor} className={hv('background:var(--color-accent-600);border-color:var(--color-accent-600)')} style={S("margin-top:12px;width:100%;min-height:50px;padding:13px;background:var(--color-accent);color:#fff;border:1px solid var(--color-accent);cursor:pointer;font:600 13.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Zapytaj DKM o dobór</button>
              <div style={S('margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px')}>
                <a href="tel:+48512082994" style={S("min-height:46px;padding:11px;border:1px solid var(--color-divider);color:var(--color-accent);text-decoration:none;display:flex;align-items:center;justify-content:center;font:600 16px 'Barlow Condensed',sans-serif")}>+48 512 082 994</a>
                <a href="tel:+48516645907" style={S("min-height:46px;padding:11px;border:1px solid var(--color-divider);color:var(--color-accent);text-decoration:none;display:flex;align-items:center;justify-content:center;font:600 16px 'Barlow Condensed',sans-serif")}>+48 516 645 907</a>
              </div>
            </div>
            {v.stdBlocks ? (
              <div style={S('margin-top:14px;padding:12px 13px;background:var(--color-ok-bg);border-left:4px solid var(--color-ok)')}>
                <div style={S('font:400 13px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}>Ogranicza Cię filtr standardowego silnika <strong style={S('font-weight:600')}>1400 obr/min</strong>. {v.otherRpmNote}</div>
                <button onClick={v.showAllRpm} style={S("margin-top:10px;min-height:44px;padding:10px 13px;background:var(--color-ok-ink);border:1px solid var(--color-ok-ink);color:#fff;cursor:pointer;font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase")}>Pokaż też 900 i 2800 obr/min</button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
