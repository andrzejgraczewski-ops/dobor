// Karta zestawu: status fs, karta techniczna, dane katalogowe, tuleja drążona,
// sposób mocowania, wyposażenie, falownik, wymiary korpusu, ceny i koszyk.
//
// Uwaga: od bloku „Sposób mocowania” (margin:18px 20px 0) aż po przyciski na
// dole wszystko leży wewnątrz tej samej ramki — tak jak w prototypie, więc
// układ zostaje bez zmian.
import React from 'react';
import { S, hv } from '../lib/style.js';

// blok szczegółów wybranego elementu mocowania / wyposażenia — identyczny
// w obu sekcjach karty
function PickedDetail({ v, o }) {
  return (
    <div style={S('padding:12px 14px;background:var(--color-accent-100);border:1px solid var(--color-accent-300)')}>
      <div style={S('display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap')}>
        <span style={S("font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-accent)")}>✓ {o.l} — {o.stripNote}</span>
        <span style={S('display:flex;align-items:center;gap:10px')}>
          <span style={S('font:400 12.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>{o.priceLine}</span>
          {o.dimBtn ? (
            <button onClick={o.dimToggle} className={hv('background:var(--color-accent);color:#fff')} style={S("flex:none;min-height:38px;padding:8px 12px;background:transparent;border:1px solid var(--color-accent);cursor:pointer;font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-accent)")}>{o.dimBtnLabel}</button>
          ) : null}
        </span>
      </div>
      {o.showImg ? (
        <div role="img" aria-label="Rysunek wymiarowy" style={S(`margin:10px auto 0;width:100%;max-width:${v.drawMax};aspect-ratio:${o.ratio};background-color:#fff;background-image:${o.img};background-size:contain;background-position:center;background-repeat:no-repeat;border:1px solid var(--color-divider)`)}></div>
      ) : null}
      {o.showRows ? (
        <div style={S(`margin-top:10px;display:grid;grid-template-columns:${o.cols};gap:1px;background:var(--color-divider);border:1px solid var(--color-divider)`)}>
          {o.rows.map((d, i) => (
            <div key={i} style={S('background:#fff;padding:10px 12px')}>
              <div style={S("font:600 14px 'Barlow Condensed',sans-serif;letter-spacing:.06em;color:var(--color-accent)")}>{d.k}</div>
              <div style={S("margin-top:2px;font:600 21px/1.05 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums")}>{d.v}</div>
            </div>
          ))}
        </div>
      ) : null}
      {o.note ? (
        <div style={S('margin-top:9px;padding-left:10px;border-left:3px solid var(--color-accent-300);font:400 13px/1.5 Barlow,sans-serif;color:var(--color-neutral-700)')}>{o.note}</div>
      ) : null}
    </div>
  );
}

export default function DetailScreen({ v }) {
  return (
    <div style={S(`width:100%;max-width:${v.stepW};margin:0 auto`)}>
      <div style={S('padding:17px 20px 15px;border-bottom:1px solid var(--color-divider)')}>
        <button onClick={v.back} style={S("display:block;position:relative;z-index:2;min-height:44px;padding:0;background:transparent;border:0;cursor:pointer;font:600 16px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700)")}>{v.backLabel}</button>
        <div style={S('margin-top:6px;display:flex;flex-wrap:wrap;align-items:center;gap:8px')}>
          <span style={S("padding:6px 11px;background:var(--color-accent);color:#fff;font:600 17px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Proponowany dobór</span>
        </div>
        <h2 style={S("margin:6px 0 4px;font:600 27px/1.1 'Barlow Condensed',sans-serif;text-wrap:pretty")}>{v.selHeadLine}</h2>
        <div style={S('margin-top:10px;padding:11px 13px;border:1px solid var(--color-divider);border-left:4px solid var(--color-accent-700);background:var(--color-accent-100);font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900)')}>Poniższe dane są <strong>propozycją doboru</strong> na podstawie wpisanych parametrów — przed zamówieniem zweryfikuj je względem rzeczywistych warunków pracy maszyny.</div>
      </div>

      <div style={S(`margin:16px 20px 0;border:1px solid ${v.sel.fsBorder};border-left:5px solid ${v.sel.fsBorder};background:${v.sel.fsSoft}`)}>
        <div style={S('padding:13px 15px')}>
          <div style={S('display:flex;align-items:center;gap:9px')}>
            <span style={S(`flex:none;width:22px;height:22px;background:${v.sel.fsBg};color:${v.sel.fsFg};font:600 13px/22px Barlow,sans-serif;text-align:center`)}>{v.sel.fsIcon}</span>
            <span style={S(`font:600 14px 'Barlow Condensed',sans-serif;letter-spacing:.11em;text-transform:uppercase;color:${v.sel.noteColor}`)}>{v.sel.fsStatus}</span>
          </div>
          <div style={S('margin-top:8px;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap')}>
            <span style={S(`font:600 22px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:${v.sel.noteColor}`)}>{v.sel.fsLabel}</span>
            <span style={S("font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-700)")}>współczynnik pracy przekładni</span>
          </div>
          <div style={S('margin-top:7px;font:400 13.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>{v.sel.fsMsg}</div>
          {v.sel.fsIsLow ? (
            <div style={S('margin-top:9px;padding:9px 11px;background:#fff;border:1px solid var(--color-warn);font:600 12.5px/1.45 Barlow,sans-serif;color:var(--color-warn)')}>Zakup możliwy. Przekładnia bez dobrowolnej gwarancji handlowej DKM Power Transmission Sp. z o.o.</div>
          ) : null}
          {v.sel.fsIsMid ? (
            <div style={S('margin-top:7px;font:400 13px/1.5 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Jeżeli nie znasz rzeczywistych warunków pracy, wybierz przekładnię z wyższym współczynnikiem fs lub skonsultuj dobór z DKM Power Transmission Sp. z o.o.</div>
          ) : null}
          <button onClick={v.toggleFsInfo} className={hv('background:#fff')} style={S(`margin-top:10px;min-height:40px;padding:9px 12px;background:transparent;border:1px solid ${v.sel.fsBorder};cursor:pointer;font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${v.sel.noteColor}`)}>{v.fsInfoLabel}</button>
          {v.fsInfoOpen ? (
            <div style={S('margin-top:10px;padding:12px 13px;background:#fff;border:1px solid var(--color-divider)')}>
              <div style={S('font:400 13px/1.6 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>{v.fsInfoText}</div>
            </div>
          ) : null}
          {v.sel.fsIsLow ? (
            <div style={S('margin-top:11px;display:grid;gap:8px')}>
              <button onClick={v.openConsent} className={hv('background:#a80d26;border-color:#a80d26')} style={S("min-height:50px;padding:13px;background:var(--color-warn);color:#fff;border:1px solid var(--color-warn);cursor:pointer;font:600 13.5px 'Barlow Condensed',sans-serif;letter-spacing:.13em;text-transform:uppercase")}>Zamów bez gwarancji handlowej</button>
              <div style={S('font:400 11.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-700)')}>Dotyczy dobrowolnej gwarancji handlowej DKM Power Transmission Sp. z o.o.</div>
              <div style={S(`display:grid;grid-template-columns:${v.formCols};gap:8px`)}>
                <button onClick={v.backToResults} className={hv('background:var(--color-accent-100)')} style={S("min-height:46px;padding:11px;background:transparent;border:1px solid var(--color-accent);cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.11em;text-transform:uppercase;color:var(--color-accent)")}>Wybierz większą przekładnię</button>
                <button onClick={v.askAdvisor} className={hv('background:var(--color-accent-100)')} style={S("min-height:46px;padding:11px;background:transparent;border:1px solid var(--color-accent);cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.11em;text-transform:uppercase;color:var(--color-accent)")}>Skonsultuj dobór</button>
              </div>
            </div>
          ) : null}
          {v.sel.fsNeedsAdvice ? (
            <>
              <button onClick={v.askAdvisor} className={hv('background:var(--color-accent-100)')} style={S("margin-top:11px;width:100%;min-height:46px;padding:11px;background:transparent;border:1px solid var(--color-accent);cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.11em;text-transform:uppercase;color:var(--color-accent)")}>Skonsultuj dobór</button>
              <div style={S('margin-top:6px;font:400 11.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-700)')}>Dział techniczny DKM Power Transmission Sp. z o.o.</div>
            </>
          ) : null}
        </div>
      </div>

      {v.hasCard ? (
        <div style={S('margin:18px 20px 0;border:1px solid var(--color-accent);background:#fff;box-shadow:0 3px 12px rgba(41,38,91,.12)')}>
          <button onClick={v.openCard} className={hv('filter:brightness(.98)')} style={S('width:100%;display:block;padding:0;background:#fff;border:0;cursor:pointer')}>
            <span role="img" aria-label={'Karta techniczna ' + v.sel.box} style={S(`display:block;height:104px;background-color:#fff;background-image:${v.cardBg};background-size:cover;background-position:top center;background-repeat:no-repeat`)}></span>
          </button>
          <div style={S('display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;background:var(--color-accent);flex-wrap:wrap')}>
            <span style={S('min-width:0')}>
              <span style={S("display:block;font:600 16px/1.1 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#fff")}>Karta techniczna · {v.sel.box}</span>
              <span style={S('display:block;margin-top:2px;font:400 11.5px Barlow,sans-serif;color:rgba(255,255,255,.78)')}>wymiary w mm</span>
            </span>
            <span style={S('flex:none;display:flex;align-items:center;gap:8px')}>
              <button onClick={v.printCard} className={hv('background:rgba(255,255,255,.16)')} style={S("min-height:40px;padding:9px 12px;background:transparent;border:1px solid rgba(255,255,255,.6);color:#fff;cursor:pointer;font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase")}>Drukuj</button>
              <button onClick={v.openCard} className={hv('background:var(--color-accent-100)')} style={S("min-height:40px;padding:9px 12px;background:#fff;border:1px solid #fff;color:var(--color-accent);cursor:pointer;font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase")}>Powiększ ⤢</button>
            </span>
          </div>
        </div>
      ) : null}

      <div style={S(`padding:16px 20px 0;display:grid;grid-template-columns:${v.specCols};column-gap:26px`)}>
        {v.specs.map((s, i) => (
          <div key={i} style={S('display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:10px 0;border-bottom:1px solid var(--color-divider)')}>
            <span style={S('font:400 14px Barlow,sans-serif;color:var(--color-neutral-700)')}>{s.k}</span>
            <span style={S('font:600 16px Barlow,sans-serif;font-variant-numeric:tabular-nums;text-align:right')}>{s.v}</span>
          </div>
        ))}
      </div>

      {v.hasBore ? (
        <div style={S(`margin:18px 20px 0;border:1px solid ${v.boreBd}`)}>
          <div style={S(`display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;background:${v.boreBd};color:#fff`)}>
            <span style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Wał wyjściowy — tuleja drążona</span>
            <span style={S(`font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${v.boreTagFg}`)}>{v.boreTag}</span>
          </div>
          <div style={S('display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--color-divider)')}>
            <div style={S('background:var(--color-bg);padding:14px 14px 13px')}>
              <div style={S("font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-500)")}>Średnica otworu</div>
              <div style={S(`margin-top:5px;font:600 30px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:${v.boreBd}`)}>{v.boreStd}</div>
            </div>
            <div style={S('background:var(--color-bg);padding:14px 14px 13px')}>
              <div style={S("font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-500)")}>Rowek wpustowy</div>
              <div style={S(`margin-top:5px;font:600 30px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:${v.boreBd}`)}>{v.boreKeyVal}</div>
            </div>
          </div>
          {v.hasBoreOpt ? (
            <div style={S('padding:12px 14px;border-top:1px solid var(--color-divider);background:var(--color-surface)')}>
              <div style={S("font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:8px")}>Wybierz średnicę otworu</div>
              <div style={S(`display:grid;grid-template-columns:${v.formCols};gap:9px`)}>
                {v.boreOpts.map((o, i) => (
                  <button key={i} onClick={o.pick} className={hv('border-color:var(--color-accent)')} style={S(`min-height:58px;padding:9px 12px;background:${o.bg};color:${o.fg};border:1px solid ${o.bd};cursor:pointer;text-align:left`)}>
                    <span style={S("display:block;font:600 20px/1.05 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums")}>{o.label}</span>
                    <span style={S(`display:block;margin-top:2px;font:400 11.5px/1.35 Barlow,sans-serif;color:${o.subColor}`)}>{o.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {v.boreOptOn ? (
            <div style={S('padding:12px 14px;border-top:1px solid var(--color-divider);background:var(--color-mid-bg)')}>
              <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-mid-ink)")}>Ta przekładnia nie jest dostępna z magazynu — zapytaj DKM</div>
              <p style={S('margin:6px 0 0;font:400 12.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>{v.boreOptMsg}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={S('padding:16px 20px 0')}>
        <div style={S('display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--color-divider);border:1px solid var(--color-divider)')}>
          {v.headline.map((h, i) => (
            <div key={i} style={S('background:var(--color-bg);padding:12px 11px')}>
              <div style={S("font: 600 21px 'Barlow Condensed',sans-serif; letter-spacing: .04em; color: var(--color-accent)")}>{h.k}</div>
              <div style={S('margin-top:3px;font:400 12.5px/1.35 Barlow,sans-serif;color:var(--color-neutral-700)')}>{h.d}</div>
              <div style={S("margin-top:5px;font:600 30px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:var(--color-accent)")}>{h.v}<span style={S('font-size:17px;color:var(--color-neutral-700)')}> {h.u}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div style={S('margin:18px 20px 0;border:1px solid var(--color-divider)')}>
        <div style={S('display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;background:var(--color-accent);color:#fff')}>
          <span style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Sposób mocowania</span>
          <span style={S('font:400 11px Barlow,sans-serif;color:rgba(255,255,255,.7)')}>wybierz do zapytania</span>
        </div>
        <div style={S('display:grid;gap:0')}>
          {v.mountGroups.map((g, gi) => (
            <div key={gi}>
              {g.showQ ? (
                <div style={S('margin:12px 14px 0;padding:13px 14px;border:1px solid var(--color-accent-300);background:var(--color-accent-100)')}>
                  <div style={S("font:600 15px/1.15 'Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--color-accent)")}>Czy potrzebujesz dodatkowych elementów montażowych?</div>
                  <div style={S('margin-top:4px;font:400 12.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-700)')}>Kołnierz boczny FA/FB lub ramię reakcyjne.</div>
                  <div style={S(`margin-top:11px;display:grid;grid-template-columns:${v.formCols};gap:9px`)}>
                    <button onClick={v.extraNo} className={hv('border-color:var(--color-accent)')} style={S(`min-height:46px;padding:11px;background:${g.noBg};border:1px solid ${g.noBd};cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.11em;text-transform:uppercase;color:${g.noFg}`)}>{g.noLabel}</button>
                    <button onClick={v.extraYes} className={hv('border-color:var(--color-accent)')} style={S(`min-height:46px;padding:11px;background:${g.yesBg};border:1px solid ${g.yesBd};cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.11em;text-transform:uppercase;color:${g.yesFg}`)}>Tak, pokaż opcje</button>
                  </div>
                </div>
              ) : null}
              {g.visible ? (
                <>
                  <div style={S('padding:11px 14px 0;display:flex;align-items:center;justify-content:space-between;gap:10px')}>
                    <span style={S("font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700)")}>{g.g}</span>
                    {g.canHide ? (
                      <button onClick={v.extraNo} className={hv('border-color:var(--color-accent);color:var(--color-accent)')} style={S("flex:none;min-height:36px;padding:7px 10px;background:transparent;border:1px solid var(--color-divider);cursor:pointer;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.11em;text-transform:uppercase;color:var(--color-neutral-700)")}>Nie potrzebuję</button>
                    ) : null}
                  </div>
                  <div style={S(`padding:9px 14px 0;display:grid;grid-template-columns:${v.mountTileCols};gap:10px`)}>
                    {g.o.map((o, oi) => (
                      <button key={oi} onClick={o.pick} disabled={o.off} className={hv('filter:brightness(.97)')} style={S(`min-height:${v.tileMinH};padding:10px 8px 12px;background:${o.tile};color:${o.fg};border:1px solid ${o.mark};cursor:pointer;opacity:${o.opac};display:flex;flex-direction:column;align-items:center;gap:8px`)}>
                        <span role="img" aria-label={o.l} style={S(`width:100%;max-width:${v.tilePicMax};margin:0 auto;aspect-ratio:1 / 1;background-color:#fff;background-image:${o.pic};background-size:contain;background-position:center;background-repeat:no-repeat`)}></span>
                        <span style={S('font:600 14.5px/1.25 Barlow,sans-serif;text-align:center;text-wrap:balance')}>{o.l}</span>
                        <span style={S("margin-top:auto;font:600 10.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;opacity:.7")}>{o.status}</span>
                      </button>
                    ))}
                  </div>
                  <div style={S('padding:10px 14px 0;display:grid;gap:10px')}>
                    {g.o.map((o, oi) => (o.sel ? <PickedDetail key={oi} v={v} o={o} /> : null))}
                  </div>
                </>
              ) : null}
            </div>
          ))}
          {v.hasMountPick ? (
            <div style={S('margin:13px 14px;padding:10px 12px;background:var(--color-ok-bg);border-left:4px solid var(--color-ok);font:500 13px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}>Wybrano: {v.mountPicked} — trafi do zapytania i na kartę PDF.</div>
          ) : null}
        </div>

        <div style={S("margin:30px 20px 0;padding-top:22px;border-top:3px solid var(--color-accent);font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--color-neutral-500)")}>Wyposażenie opcjonalne</div>
        <div style={S('margin:12px 20px 0;padding:13px 14px;border:1px solid var(--color-accent-300);background:var(--color-accent-100)')}>
          <div style={S("font:600 15px/1.15 'Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--color-accent)")}>Czy potrzebujesz dodatkowego wyposażenia?</div>
          <div style={S('margin-top:4px;font:400 12.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-700)')}>Wał zdawczy jednostronny SS lub dwustronny DS.</div>
          <div style={S(`margin-top:11px;display:grid;grid-template-columns:${v.formCols};gap:9px`)}>
            <button onClick={v.accNo} className={hv('border-color:var(--color-accent)')} style={S(`min-height:46px;padding:11px;background:${v.accNoBg};border:1px solid ${v.accNoBd};cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.11em;text-transform:uppercase;color:${v.accNoFg}`)}>{v.accNoLabel}</button>
            <button onClick={v.accYes} className={hv('border-color:var(--color-accent)')} style={S(`min-height:46px;padding:11px;background:${v.accYesBg};border:1px solid ${v.accYesBd};cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.11em;text-transform:uppercase;color:${v.accYesFg}`)}>Tak, pokaż opcje</button>
          </div>
        </div>
        {v.accShow ? (
          <div style={S('margin:12px 20px 0;border:1px solid var(--color-divider)')}>
            <div style={S('display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 13px;background:var(--color-surface);border-bottom:1px solid var(--color-divider);border-left:4px solid var(--color-ok)')}>
              <span style={S("font:600 14px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent)")}>Pozostałe wyposażenie</span>
              <span style={S('font:400 12px Barlow,sans-serif;color:var(--color-neutral-700)')}>dodaj do zapytania</span>
            </div>
            <div>
              <div style={S(`padding:13px 14px;display:grid;grid-template-columns:${v.mountTileCols};gap:10px`)}>
                {v.accAll.map((o, i) => (
                  <button key={i} onClick={o.pick} className={hv('filter:brightness(.97)')} style={S(`min-height:${v.tileMinH};padding:10px 8px 12px;background:${o.tile};color:${o.fg};border:1px solid ${o.lineMark};cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px`)}>
                    <span role="img" aria-label={o.l} style={S(`width:100%;max-width:${v.tilePicMax};margin:0 auto;aspect-ratio:1 / 1;background-color:#fff;background-image:${o.pic};background-size:contain;background-position:center;background-repeat:no-repeat`)}></span>
                    <span style={S('font:600 14.5px/1.25 Barlow,sans-serif;text-align:center;text-wrap:balance')}>{o.l}</span>
                    <span style={S("margin-top:auto;font:600 10.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;opacity:.7")}>{o.status}</span>
                  </button>
                ))}
              </div>
              <div style={S('padding:0 14px 13px;display:grid;gap:10px')}>
                {v.accAll.map((o, i) => (o.sel ? <PickedDetail key={i} v={v} o={o} /> : null))}
              </div>
              {v.hasAcc ? (
                <div style={S('margin:13px 14px;padding:10px 12px;background:var(--color-ok-bg);border-left:4px solid var(--color-ok);font:500 13px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}>Wybrano: {v.accPicked} — trafi do zapytania i na kartę PDF.</div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div style={S('margin:14px 20px 0;padding:13px 14px;border:1px solid var(--color-accent-300);background:var(--color-accent-100)')}>
          <div style={S("font:600 15px/1.15 'Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--color-accent)")}>Dodać falownik do regulacji prędkości?</div>
          <div style={S('margin-top:4px;font:400 12.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-700)')}>Dobierz falownik dopasowany do wybranego silnika.</div>
          <div style={S(`margin-top:11px;display:grid;grid-template-columns:${v.formCols};gap:9px`)}>
            <button onClick={v.invNo} className={hv('border-color:var(--color-accent)')} style={S(`min-height:46px;padding:11px;background:${v.invNoBg};border:1px solid ${v.invNoBd};cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.11em;text-transform:uppercase;color:${v.invNoFg}`)}>{v.invNoLabel}</button>
            <button onClick={v.invYes} className={hv('border-color:var(--color-accent)')} style={S(`min-height:46px;padding:11px;background:${v.invYesBg};border:1px solid ${v.invYesBd};cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.11em;text-transform:uppercase;color:${v.invYesFg}`)}>Tak, pokaż opcje</button>
          </div>
        </div>
        {v.invSectionShow ? (
          <div style={S('margin:14px 20px 0;border:1px solid var(--color-divider)')}>
            {v.invMotor1F ? (
              <div style={S('padding:13px 14px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900)')}>Do silnika 1-fazowego nie stosuje się falownika. Wybierz silnik 3-fazowy, żeby dobrać przemiennik częstotliwości.</div>
            ) : null}
            {v.invShow ? (
              <div style={S('padding:13px 14px')}>
                <div style={S("font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:8px")}>Zasilanie falownika — wybierz</div>
                <div style={S('display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px')}>
                  {v.invPhaseOpts.map((o, i) => (
                    <button key={i} onClick={o.pick} className={hv('border-color:var(--color-accent)')} style={S(`min-height:46px;padding:11px;background:${o.bg};color:${o.fg};border:1px solid ${o.bd};cursor:pointer;font:600 15px 'Barlow Condensed',sans-serif;letter-spacing:.1em`)}>{o.label}</button>
                  ))}
                </div>
                {v.invIs1F ? (
                  <div style={S('margin-top:11px;padding:12px 13px;background:var(--color-warn-bg);border-left:4px solid var(--color-warn)')}>
                    <div style={S("font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-warn)")}>Uwaga — zmiana połączenia silnika</div>
                    <div style={S('margin-top:5px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Silniki trójfazowe o napięciu znamionowym 230/400 V i mocy 0,06–3,0 kW są standardowo konfigurowane w układzie <strong>gwiazdy (Y)</strong>. W przypadku współpracy z falownikiem zasilanym jednofazowo 230 V, którego napięcie wyjściowe wynosi 1 × 230 V, należy połączyć uzwojenia silnika w układzie <strong>trójkąta (Δ)</strong>.</div>
                  </div>
                ) : null}
                {v.invPhasePicked ? (
                  <>
                    <div style={S(`margin-top:9px;display:grid;grid-template-columns:${v.formCols};gap:9px`)}>
                      {v.invOpts.map((f, i) => (
                        <button key={i} onClick={f.pick} className={hv('border-color:var(--color-accent)')} style={S(`min-height:76px;padding:11px 13px;background:${f.bg};color:${f.fg};border:1px solid ${f.bd};cursor:pointer;text-align:left`)}>
                          <span style={S('display:flex;align-items:baseline;justify-content:space-between;gap:8px')}>
                            <span style={S("font:600 19px/1.05 'Barlow Condensed',sans-serif;letter-spacing:.06em")}>{f.series} · {f.kw}</span>
                            <span style={S(`flex:none;font:600 10px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${f.sub}`)}>{f.tag}</span>
                          </span>
                          <span style={S(`display:block;margin-top:4px;font:400 11.5px Barlow,sans-serif;color:${f.sub}`)}>{f.sku}</span>
                          <span style={S("display:block;margin-top:5px;font:600 18px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums")}>{f.price} <span style={S(`font:400 11.5px Barlow,sans-serif;color:${f.sub}`)}>netto · {f.avail}</span></span>
                        </button>
                      ))}
                    </div>
                    {v.invEmpty ? (
                      <div style={S('margin-top:11px;font:400 13px/1.5 Barlow,sans-serif;color:var(--color-neutral-700)')}>Dla tej mocy i tego zasilania nie mamy falownika w cenniku — zapytaj doradcę.</div>
                    ) : null}
                  </>
                ) : null}
                {v.invPicked ? (
                  <div style={S('margin-top:11px;padding:10px 12px;background:var(--color-ok-bg);border-left:4px solid var(--color-ok);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap')}>
                    <span style={S('font:500 13px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}>✓ {v.invPickedLabel} — trafi do zapytania</span>
                    <button onClick={v.clearInv} className={hv('border-color:var(--color-accent);color:var(--color-accent)')} style={S("flex:none;min-height:38px;padding:8px 12px;background:transparent;border:1px solid var(--color-divider);cursor:pointer;font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-700)")}>Usuń falownik</button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {v.hasDims ? (
          <div style={S('padding:18px 20px 0')}>
            <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:8px")}>Wymiary korpusu {v.sel.box}</div>
            <div style={S(`display:grid;grid-template-columns:${v.specCols};column-gap:26px`)}>
              {v.dimRows.map((d, i) => (
                <div key={i} style={S('display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:9px 0;border-bottom:1px solid var(--color-divider)')}>
                  <span style={S('font:400 14px Barlow,sans-serif;color:var(--color-neutral-700)')}>{d.k}</span>
                  <span style={S('font:600 16px Barlow,sans-serif;font-variant-numeric:tabular-nums;text-align:right')}>{d.v}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div style={S('padding:18px 20px 0')}>
          <div style={S('border:1px solid var(--color-accent);border-top:5px solid var(--color-accent)')}>
            {v.hasFlangeChoice ? (
              <div style={S('padding:12px 16px;border-bottom:1px solid var(--color-divider);background:var(--color-accent-100)')}>
                <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-accent);margin-bottom:8px")}>Przyłącze silnika — wybierz wariant</div>
                <div style={S(`display:grid;grid-template-columns:${v.formCols};gap:9px`)}>
                  {v.flangeOpts2.map((f, i) => (
                    <button key={i} onClick={f.pick} className={hv('border-color:var(--color-accent)')} style={S(`min-height:56px;padding:9px 12px;background:${f.bg};color:${f.fg};border:1px solid ${f.bd};cursor:pointer;text-align:left`)}>
                      <span style={S("display:block;font:600 19px/1.05 'Barlow Condensed',sans-serif;letter-spacing:.08em")}>{f.label}</span>
                      <span style={S(`display:block;margin-top:2px;font:400 12px Barlow,sans-serif;color:${f.subColor}`)}>{f.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div style={S(`padding:14px 16px;display:grid;grid-template-columns:${v.formCols};gap:14px`)}>
              <div>
                <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>Przekładnia — cena netto</div>
                <div style={S("margin-top:2px;font:600 34px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:var(--color-accent-700)")}>{v.sel.priceLabel}</div>
                <div style={S(`margin-top:6px;display:flex;align-items:center;gap:6px;font:600 12.5px Barlow,sans-serif;color:${v.sel.availColor}`)}><span style={S(`width:8px;height:8px;background:${v.sel.availDot};flex:none`)}></span>{v.sel.availLabel}</div>
                <div style={S('margin-top:4px;font:400 12.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-700)')}>{v.sel.box} · i = {v.sel.i} · kołnierz {v.sel.flangePicked}</div>
              </div>
              <div>
                <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)")}>Silnik — cena netto</div>
                <div style={S("margin-top:2px;font:600 34px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:var(--color-accent-700)")}>{v.sel.motorNetLabel}</div>
                {v.sel.hasMotorPrice ? (
                  <div style={S(`margin-top:6px;display:flex;align-items:center;gap:6px;font:600 12.5px Barlow,sans-serif;color:${v.sel.motAvailColor}`)}><span style={S(`width:8px;height:8px;background:${v.sel.motAvailDot};flex:none`)}></span>{v.sel.motAvailLabel}</div>
                ) : null}
                {v.sel.hasMotorPrice ? (
                  <div style={S('margin-top:6px;font:400 12.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-700)')}>{v.sel.motorName}</div>
                ) : null}
                <div style={S('margin-top:4px;font:400 12.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-700)')}>{v.sel.p1} kW · {v.sel.rpmLabel} · kołnierz {v.sel.flangePicked}</div>
                <div style={S('margin-top:6px;display:inline-block;padding:4px 9px;background:var(--color-accent-100);border:1px solid var(--color-accent-300);font:600 12.5px Barlow,sans-serif;color:var(--color-accent-700)')}>{v.sel.motVoltLabel}</div>
                {v.hasPhChoice ? (
                  <div style={S('margin-top:10px')}>
                    <div style={S("font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:6px")}>Zasilanie silnika</div>
                    <div style={S(`display:grid;grid-template-columns:${v.formCols};gap:8px`)}>
                      {v.phOpts.map((o, i) => (
                        <button key={i} onClick={o.pick} className={hv('border-color:var(--color-accent)')} style={S(`min-height:52px;padding:9px 11px;background:${o.bg};color:${o.fg};border:1px solid ${o.bd};cursor:pointer;text-align:left`)}>
                          <span style={S("display:block;font:600 14px 'Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase")}>{o.label}</span>
                          <span style={S(`display:block;margin-top:2px;font:400 11.5px Barlow,sans-serif;color:${o.sub}`)}>{o.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div style={S("padding:8px 16px;border-top:1px solid var(--color-divider);background:var(--color-accent-100);font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-accent-700)")}>Ceny netto — bez podatku VAT</div>
            {v.hasSelExtras ? (
              <div style={S('padding:12px 16px;border-top:1px solid var(--color-divider)')}>
                <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:7px")}>Wybrane wyposażenie — cena netto</div>
                {v.selExtras.map((e, i) => (
                  <div key={i} style={S('display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:4px 0;font:400 13.5px Barlow,sans-serif;color:var(--color-neutral-900)')}>
                    <span>{e.label}</span>
                    <span style={S(`flex:none;font:600 17px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:${e.color}`)}>{e.price}</span>
                  </div>
                ))}
              </div>
            ) : null}
            <div style={S('padding:12px 16px;border-top:1px solid var(--color-divider);display:flex;align-items:baseline;justify-content:space-between;gap:12px;background:var(--color-surface)')}>
              <span style={S("font:600 14px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent)")}>Zestaw netto</span>
              <span style={S("font:600 26px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:var(--color-accent-700)")}>{v.sel.setNetLabel}</span>
            </div>
          </div>
        </div>

        <div style={S('padding:18px 20px 24px;display:grid;gap:10px')}>
          <button className={'blueprint ' + hv('background:var(--color-accent-600);border-color:var(--color-accent-600)')} onClick={v.addToRfq} style={S("position:relative;min-height:56px;padding:15px;background:var(--color-accent);color:var(--color-bg);border:1px solid var(--color-accent);cursor:pointer;font:600 15px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase")}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
            {v.rfqLabel}
          </button>
          <button onClick={v.printSheet} className={hv('background:var(--color-accent-100)')} style={S("width:100%;min-height:50px;padding:13px;background:transparent;border:1px solid var(--color-accent);color:var(--color-accent);cursor:pointer;font:600 13.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>PDF · pełne dane</button>
        </div>
      </div>
    </div>
  );
}
