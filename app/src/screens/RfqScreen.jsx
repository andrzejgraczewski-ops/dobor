// Zamówienie w trzech etapach: Napęd → Dane → Płatność.
// Na ekranach ≥ 900 px po prawej stoi stałe podsumowanie (aside).
import React from 'react';
import { S, hv } from '../lib/style.js';

function QtyBox({ dec, qty, inc }) {
  return (
    <span style={S('flex:none;display:flex;align-items:center;border:1px solid var(--color-accent-300)')}>
      <button onClick={dec} className={hv('background:var(--color-accent-100)')} style={S("min-height:38px;min-width:36px;background:transparent;border:0;cursor:pointer;font:600 17px 'Barlow Condensed',sans-serif;color:var(--color-accent)")}>−</button>
      <span style={S("min-width:26px;text-align:center;font:600 16px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums")}>{qty}</span>
      <button onClick={inc} className={hv('background:var(--color-accent-100)')} style={S("min-height:38px;min-width:36px;background:transparent;border:0;cursor:pointer;font:600 17px 'Barlow Condensed',sans-serif;color:var(--color-accent)")}>+</button>
    </span>
  );
}

function NoWtyList({ v }) {
  return (
    <div style={S('display:grid;gap:1px;background:var(--color-divider)')}>
      {v.noWtyList.map((w, i) => (
        <div key={i} style={S('background:#fff;padding:9px 12px;display:flex;align-items:baseline;justify-content:space-between;gap:10px')}>
          <span style={S('font:600 13px Barlow,sans-serif;color:var(--color-neutral-900)')}>{w.name}<span style={S('display:block;margin-top:2px;font:400 11.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>SKU {w.sku}</span></span>
          <span style={S('flex:none;text-align:right')}><span style={S("display:block;font:600 14px 'Barlow Condensed',sans-serif;color:var(--color-warn)")}>fs = {w.fs}</span><span style={S(`display:block;margin-top:2px;font:600 11px Barlow,sans-serif;color:${w.okColor}`)}>{w.state}</span></span>
        </div>
      ))}
    </div>
  );
}

function Step1({ v }) {
  return (
    <div style={S('padding:16px 20px 20px')}>
      <div style={S('margin-bottom:12px')}>
        <div style={S("font:600 21px/1.05 'Barlow Condensed',sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--color-accent)")}>Twój napęd</div>
        <div style={S('margin-top:3px;font:400 12.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>ustaw ilości osobno — przekładnia, silnik, wyposażenie</div>
      </div>
      <div style={S("margin-bottom:12px;padding:8px 11px;background:var(--color-accent-100);border-left:4px solid var(--color-accent-700);font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-accent-700)")}>Wszystkie kwoty poniżej są cenami netto — VAT doliczamy w podsumowaniu</div>
      {v.rfqRows.map((r, ri) => (
        <div key={ri} style={S('padding:14px 0;border-bottom:1px solid var(--color-divider)')}>
          <div style={S('display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start')}>
            <div style={S('min-width:0')}>
              <button onClick={r.open} className={hv('color:var(--color-accent-700)')} style={S('padding:0;background:transparent;border:0;cursor:pointer;font:600 18px/1.15 Barlow,sans-serif;color:var(--color-accent);text-align:left')}>{r.box} <span style={S('font:400 13px Barlow,sans-serif;color:var(--color-accent-700);text-decoration:underline;text-underline-offset:3px')}>karta →</span></button>
              <div style={S('margin-top:3px;font:400 12.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-700)')}>{r.specLine}</div>
              {r.boreWarn ? (
                <div style={S('margin-top:7px;padding:8px 11px;background:var(--color-mid-bg);border-left:4px solid var(--color-mid)')}>
                  <div style={S("font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-mid-ink)")}>Niedostępna z magazynu — zapytaj o wycenę</div>
                  <div style={S('margin-top:3px;font:400 12px/1.45 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>{r.boreWarnTxt}</div>
                </div>
              ) : null}
              {r.hasFs ? (
                <span style={S(`display:inline-flex;align-items:center;gap:6px;margin-top:6px;padding:3px 8px;background:${r.fsBg};color:${r.fsColor};font:600 11.5px Barlow,sans-serif`)}>{r.fsIcon} {r.fsLine}</span>
              ) : null}
              {r.noWty ? (
                <div style={S('margin-top:8px;border:1px solid var(--color-warn);border-left:4px solid var(--color-warn)')}>
                  <div style={S("padding:8px 11px;background:var(--color-warn);color:#fff;font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase")}>Bez dobrowolnej gwarancji handlowej DKM Power Transmission Sp. z o.o.</div>
                  <div style={S('padding:8px 11px;background:var(--color-warn-bg);font:600 12px Barlow,sans-serif;color:var(--color-warn)')}>Świadomy wybór klienta — fs poniżej 1,0</div>
                  <div style={S('display:grid;gap:1px;background:var(--color-divider)')}>
                    {r.wtyLines.map((w, wi) => (
                      <div key={wi} style={S('background:#fff;padding:6px 11px;display:flex;align-items:baseline;justify-content:space-between;gap:10px')}>
                        <span style={S('font:400 11.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>{w.k}</span>
                        <span style={S('flex:none;font:600 12px Barlow,sans-serif;color:var(--color-neutral-900)')}>{w.v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={S('padding:8px 11px;background:#fff;font:400 11.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Brak dobrowolnej gwarancji handlowej nie wyłącza praw, których zgodnie z przepisami nie można ograniczyć. Dotyczy wyłącznie tej przekładni — silnik, falownik, kołnierze i wały pozostają na standardowych warunkach.</div>
                  {r.needsConsent ? (
                    <button onClick={r.askConsent} style={S("width:100%;min-height:46px;padding:11px;background:var(--color-warn);color:#fff;border:0;border-top:1px solid var(--color-warn);cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase")}>Potwierdź świadomy wybór</button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div style={S('flex:none;display:flex;align-items:center;gap:6px')}>
              <button onClick={r.remove} className={hv('background:var(--color-warn-bg);border-color:var(--color-warn);color:var(--color-warn)')} style={S('min-height:44px;min-width:44px;margin-left:2px;background:transparent;border:1px solid var(--color-divider);cursor:pointer;font:600 15px Barlow,sans-serif;color:var(--color-neutral-700)')}>✕</button>
            </div>
          </div>
          <div style={S('margin-top:12px;display:grid;gap:1px;background:var(--color-divider);border:1px solid var(--color-divider)')}>
            <div style={S('background:var(--color-bg);padding:7px 11px;display:flex;align-items:baseline;justify-content:space-between;gap:10px')}>
              <span style={S("font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-accent)")}>Motoreduktor</span>
              <span style={S('font:400 11px Barlow,sans-serif;color:var(--color-neutral-500)')}>usuń ✕ to, czego nie zamawiasz</span>
            </div>
            {r.hasGear ? (
              <div style={S('background:#fff;padding:9px 11px;display:flex;align-items:center;gap:10px;min-height:52px;flex-wrap:wrap')}>
                <span style={S('flex:1;min-width:100px')}>
                  <span style={S(`display:block;font:500 14px Barlow,sans-serif;color:${r.gearFg}`)}>Przekładnia</span>
                  <span style={S('display:block;margin-top:1px;font:400 11.5px Barlow,sans-serif;color:var(--color-neutral-500)')}>{r.gearSub}</span>
                </span>
                <QtyBox dec={r.gearDec} qty={r.gearQty} inc={r.gearInc} />
                <span style={S('flex:none;min-width:78px;text-align:right')}>
                  <span style={S(`display:block;font:600 17px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:${r.gearFg}`)}>{r.gearSum}</span>
                  <span style={S('display:block;font:400 11px Barlow,sans-serif;color:var(--color-neutral-500)')}>{r.gearPer}</span>
                </span>
                <button onClick={r.gearDrop} title="Usuń przekładnię z pozycji" className={hv('border-color:var(--color-warn);color:var(--color-warn);background:var(--color-warn-bg)')} style={S('flex:none;min-height:38px;min-width:38px;background:transparent;border:1px solid var(--color-divider);cursor:pointer;font:600 14px Barlow,sans-serif;color:var(--color-neutral-500)')}>✕</button>
              </div>
            ) : null}
            {r.hasMot ? (
              <div style={S('background:#fff;padding:9px 11px;display:flex;align-items:center;gap:10px;min-height:52px;flex-wrap:wrap')}>
                <span style={S('flex:1;min-width:100px')}>
                  <span style={S(`display:block;font:500 14px Barlow,sans-serif;color:${r.motFg}`)}>Silnik</span>
                  <span style={S('display:block;margin-top:1px;font:400 11.5px Barlow,sans-serif;color:var(--color-neutral-500)')}>{r.motSub}</span>
                </span>
                <QtyBox dec={r.motDec} qty={r.motQty} inc={r.motInc} />
                <span style={S('flex:none;min-width:78px;text-align:right')}>
                  <span style={S(`display:block;font:600 17px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:${r.motFg}`)}>{r.motSum}</span>
                  <span style={S('display:block;font:400 11px Barlow,sans-serif;color:var(--color-neutral-500)')}>{r.motPer}</span>
                </span>
                <button onClick={r.motDrop} title="Usuń silnik z pozycji" className={hv('border-color:var(--color-warn);color:var(--color-warn);background:var(--color-warn-bg)')} style={S('flex:none;min-height:38px;min-width:38px;background:transparent;border:1px solid var(--color-divider);cursor:pointer;font:600 14px Barlow,sans-serif;color:var(--color-neutral-500)')}>✕</button>
              </div>
            ) : null}
            <div style={S('background:var(--color-bg);padding:7px 11px;display:flex;align-items:baseline;justify-content:space-between;gap:10px')}>
              <span style={S('min-width:0')}>
                <span style={S("display:block;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-accent)")}>Czy Twój napęd jest kompletny?</span>
                <span style={S('display:block;margin-top:2px;font:400 11px/1.45 Barlow,sans-serif;color:var(--color-neutral-700)')}>Dobierz wyposażenie dopasowane do wybranej przekładni i silnika.</span>
              </span>
              <span style={S('flex:none;font:400 11px Barlow,sans-serif;color:var(--color-neutral-500)')}>{r.extraCount}</span>
            </div>
            {r.hasExtras ? r.extraRows.map((e, ei) => (
              <div key={ei} style={S('background:#fff;padding:9px 11px;display:flex;align-items:center;gap:10px;min-height:52px;flex-wrap:wrap')}>
                <span style={S('flex:1;min-width:100px;font:500 13.5px Barlow,sans-serif;color:var(--color-neutral-900)')}>{e.label}</span>
                {e.canQty ? <QtyBox dec={e.qDec} qty={e.qty} inc={e.qInc} /> : null}
                <span style={S('flex:none;min-width:78px;text-align:right')}>
                  <span style={S("display:block;font:600 17px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:var(--color-accent-700)")}>{e.sum}</span>
                  <span style={S('display:block;font:400 11px Barlow,sans-serif;color:var(--color-neutral-500)')}>{e.per}</span>
                </span>
                <button onClick={e.toggle} title="Usuń z pozycji" className={hv('border-color:var(--color-warn);color:var(--color-warn);background:var(--color-warn-bg)')} style={S('flex:none;min-height:38px;min-width:38px;background:transparent;border:1px solid var(--color-divider);cursor:pointer;font:600 14px Barlow,sans-serif;color:var(--color-neutral-500)')}>✕</button>
              </div>
            )) : null}
            <div style={S('background:#fff;padding:11px')}>
              <div style={S('display:flex;flex-wrap:wrap;gap:6px')}>
                {r.canAddGear ? (
                  <button onClick={r.gearBack} className={hv('border-style:solid;background:var(--color-accent-100)')} style={S('min-height:40px;padding:8px 11px;background:transparent;border:1px dashed var(--color-accent);cursor:pointer;font:500 12.5px Barlow,sans-serif;color:var(--color-accent-700)')}>{r.gearBackLabel}</button>
                ) : null}
                {r.canAddMot ? (
                  <button onClick={r.motBack} className={hv('border-style:solid;background:var(--color-accent-100)')} style={S('min-height:40px;padding:8px 11px;background:transparent;border:1px dashed var(--color-accent);cursor:pointer;font:500 12.5px Barlow,sans-serif;color:var(--color-accent-700)')}>{r.motBackLabel}</button>
                ) : null}
                {r.addOpts.map((o, oi) => (
                  <button key={oi} onClick={o.add} className={hv('border-style:solid;border-color:var(--color-accent);background:var(--color-accent-100)')} style={S('min-height:40px;padding:8px 11px;background:transparent;border:1px dashed var(--color-accent-300);cursor:pointer;font:500 12.5px Barlow,sans-serif;color:var(--color-accent-700)')}>+ {o.label} <span style={S('font-variant-numeric:tabular-nums;color:var(--color-neutral-500)')}>{o.price}</span></button>
                ))}
              </div>
              {r.inv1F ? (
                <div style={S('margin-top:9px;padding:10px 12px;background:var(--color-warn-bg);border-left:4px solid var(--color-warn)')}>
                  <div style={S("font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-warn)")}>Uwaga — zmiana połączenia silnika</div>
                  <div style={S('margin-top:4px;font:400 12px/1.5 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Silniki trójfazowe o napięciu znamionowym 230/400 V i mocy 0,06–3,0 kW są standardowo konfigurowane w układzie gwiazdy (Y). Przy falowniku zasilanym jednofazowo 230 V, którego napięcie wyjściowe wynosi 1 × 230 V, należy połączyć uzwojenia silnika w układzie trójkąta (Δ).</div>
                </div>
              ) : null}
              {r.hasInvHint ? (
                <div style={S('margin-top:8px;font:400 11.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-500)')}>{r.invHint}</div>
              ) : null}
            </div>
            <div style={S('background:var(--color-accent);padding:11px;display:flex;align-items:baseline;justify-content:space-between;gap:12px')}>
              <span style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#fff")}>Wartość pozycji netto</span>
              <span style={S("font:600 21px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:#fff")}>{r.lineTotal}</span>
            </div>
          </div>
        </div>
      ))}
      {v.rfqEmpty ? (
        <div style={S('padding:18px 0;font:400 14.5px/1.6 Barlow,sans-serif;color:var(--color-neutral-700)')}>Koszyk jest pusty. Wróć do wyników i dodaj przekładnię z karty produktu.</div>
      ) : null}
      {v.hasCartTotals ? (
        <div style={S('margin-top:14px;padding:14px 16px;background:var(--color-surface);border:1px solid var(--color-divider)')}>
          <div style={S('margin-bottom:10px;padding-bottom:9px;border-bottom:1px solid var(--color-divider)')}>
            <div style={S('display:flex;justify-content:space-between;gap:12px;font:400 13px Barlow,sans-serif;color:var(--color-neutral-700)')}>
              <span>Wartość towaru</span>
              <span style={S('text-align:right;font-variant-numeric:tabular-nums;color:var(--color-neutral-900)')}>{v.cartGoodsLabel} <span style={S('font-size:11px;color:var(--color-neutral-500)')}>netto</span><br /><span style={S('font-size:12px;color:var(--color-neutral-700)')}>{v.cartGoodsGross} brutto</span></span>
            </div>
            <div style={S('margin-top:6px;display:flex;justify-content:space-between;gap:12px;font:400 13px Barlow,sans-serif;color:var(--color-neutral-700)')}>
              <span>Wysyłka · {v.shipKg}</span>
              <span style={S('text-align:right;font-variant-numeric:tabular-nums;font-weight:600;color:var(--color-neutral-900)')}>{v.shipPrice} <span style={S('font-size:11px;font-weight:400;color:var(--color-neutral-500)')}>netto</span><br /><span style={S('font-size:12px;font-weight:400;color:var(--color-neutral-700)')}>{v.shipGross} brutto</span></span>
            </div>
            <div style={S('margin-top:3px;font:400 12px Barlow,sans-serif;color:var(--color-neutral-500)')}>{v.shipTier}</div>
            {v.shipHasCod ? (
              <div style={S('margin-top:2px;font:400 12px Barlow,sans-serif;color:var(--color-neutral-500)')}>{v.shipCod}</div>
            ) : null}
            {v.shipFree ? (
              <div style={S('margin-top:3px;font:600 12px Barlow,sans-serif;color:var(--color-ok-ink)')}>Wysyłka gratis — zamówienie powyżej 3 000 zł netto</div>
            ) : null}
            {v.shipShowToFree ? (
              <div style={S('margin-top:3px;font:400 12px Barlow,sans-serif;color:var(--color-accent-700)')}>{v.shipToFree}</div>
            ) : null}
            {v.shipUnknown ? (
              <div style={S('margin-top:3px;font:400 12px Barlow,sans-serif;color:var(--color-neutral-500)')}>Masę części bez danych potwierdzimy przy wycenie wysyłki.</div>
            ) : null}
          </div>
          <div style={S('display:flex;justify-content:space-between;gap:12px;font:400 14px Barlow,sans-serif;color:var(--color-neutral-700)')}><span>Razem netto z wysyłką</span><span style={S('font-variant-numeric:tabular-nums')}>{v.cartNet}</span></div>
          <div style={S('margin-top:5px;display:flex;justify-content:space-between;gap:12px;font:400 14px Barlow,sans-serif;color:var(--color-neutral-700)')}><span>VAT 23%</span><span style={S('font-variant-numeric:tabular-nums')}>{v.cartVat}</span></div>
          <div style={S('margin-top:8px;padding-top:8px;border-top:1px solid var(--color-divider);display:flex;align-items:baseline;justify-content:space-between;gap:12px')}>
            <span style={S("font:600 15px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent)")}>Razem brutto z wysyłką</span>
            <span style={S("font:600 28px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:var(--color-accent-700)")}>{v.cartGross}</span>
          </div>
        </div>
      ) : null}
      {v.cartMissing ? (
        <div style={S('margin-top:10px;padding:10px 12px;background:var(--color-accent-100);border-left:4px solid var(--color-accent);font:400 12.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}>Część pozycji nie ma ceny w cenniku — wycenimy je i doliczymy do proformy.</div>
      ) : null}
      {v.rfqMid ? (
        <div style={S('margin-top:10px;padding:11px 13px;background:var(--color-mid-bg);border-left:4px solid var(--color-mid);font:400 12.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}>Wybrana konfiguracja wymaga sprawdzenia rzeczywistych warunków pracy.</div>
      ) : null}
      {v.rfqNoWty ? (
        <div style={S('margin-top:10px;border:1px solid var(--color-warn)')}>
          <div style={S('padding:11px 13px;background:var(--color-warn)')}>
            <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#fff")}>Poniższe przekładnie są zamawiane bez dobrowolnej gwarancji handlowej DKM Power Transmission Sp. z o.o.</div>
          </div>
          <NoWtyList v={v} />
          <div style={S('padding:9px 12px;background:var(--color-warn-bg);font:400 11.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}>Brak dobrowolnej gwarancji handlowej dotyczy wyłącznie wskazanych przekładni i tego zamówienia. Nie ogranicza uprawnień, których zgodnie z przepisami nie można wyłączyć.</div>
        </div>
      ) : null}
    </div>
  );
}

function Step2({ v }) {
  const field = (label, value, onChange, placeholder, extra) => (
    <label style={S('display:block')}>
      <span style={S('display:block;font:500 12px Barlow,sans-serif;color:var(--color-neutral-700);margin-bottom:4px')}>{label}</span>
      <input value={value} onChange={onChange} placeholder={placeholder} {...(extra || {})} style={S('width:100%;min-height:48px;padding:10px 12px;background:var(--color-bg);border:1px solid var(--color-divider);color:var(--color-text);font:500 15px Barlow,sans-serif')} />
    </label>
  );
  return (
    <>
      <div style={S('padding:16px 20px 20px')}>
        <div style={S('margin-bottom:12px')}>
          <div style={S("font:600 21px/1.05 'Barlow Condensed',sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--color-accent)")}>Dostawa</div>
          <div style={S('margin-top:3px;font:400 12.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>wybierz sposób dostawy</div>
        </div>
        {v.hasStepErr ? (
          <div style={S('margin-bottom:12px;padding:11px 13px;background:var(--color-warn);color:#fff;font:600 13px/1.5 Barlow,sans-serif')}>{v.stepErrMsg}</div>
        ) : null}
        <div style={S("font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:7px")}>Sposób dostawy</div>
        <div style={S(`display:grid;grid-template-columns:${v.delCols};gap:9px`)}>
          {v.delOpts.map((o, i) => (
            <button key={i} onClick={o.pick} className={hv('border-color:var(--color-accent)')} style={S(`min-height:48px;padding:12px;background:${o.bg};color:${o.fg};border:1px solid ${o.bd};cursor:pointer;font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase`)}>{o.label}</button>
          ))}
        </div>
      </div>
      <div style={S('padding:16px 20px 20px')}>
        <div style={S('margin-bottom:12px')}>
          <div style={S("font:600 21px/1.05 'Barlow Condensed',sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--color-accent)")}>Dane do zamówienia</div>
          <div style={S('margin-top:3px;font:400 12.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>firmę i NIP podaj, jeśli chcesz fakturę</div>
        </div>
        <div style={S(`display:grid;grid-template-columns:${v.formCols};gap:11px`)}>
          {field('Imię', v.cFirst, v.setFirst, 'imię')}
          {field('Nazwisko', v.cLast, v.setLast, 'nazwisko')}
          {field('E-mail', v.cEmail, v.setEmail, 'adres@firma.pl', { inputMode: 'email' })}
          {field('Telefon', v.cPhone, v.setPhone, '+48', { inputMode: 'tel' })}
          <label style={S('display:block')}>
            <span style={S('display:block;font:500 12px Barlow,sans-serif;color:var(--color-neutral-700);margin-bottom:4px')}>Firma <span style={S('color:var(--color-neutral-500)')}>· opcjonalnie</span></span>
            <input value={v.cFirm} onChange={v.setFirm} placeholder="nazwa firmy" style={S('width:100%;min-height:48px;padding:10px 12px;background:var(--color-bg);border:1px solid var(--color-divider);color:var(--color-text);font:500 15px Barlow,sans-serif')} />
          </label>
          <label style={S('display:block')}>
            <span style={S('display:block;font:500 12px Barlow,sans-serif;color:var(--color-neutral-700);margin-bottom:4px')}>NIP <span style={S('color:var(--color-neutral-500)')}>· do faktury</span></span>
            <input value={v.cNip} onChange={v.setNip} inputMode="numeric" placeholder="10 cyfr" style={S('width:100%;min-height:48px;padding:10px 12px;background:var(--color-bg);border:1px solid var(--color-divider);color:var(--color-text);font:500 15px Barlow,sans-serif')} />
          </label>
        </div>
        <label style={S('display:block;margin-top:11px')}>
          <span style={S('display:block;font:500 12px Barlow,sans-serif;color:var(--color-neutral-700);margin-bottom:4px')}>Uwagi (opcjonalnie)</span>
          <input value={v.cNote} onChange={v.setNote} placeholder="np. termin dostawy, numer zamówienia u Ciebie" style={S('width:100%;min-height:48px;padding:10px 12px;background:var(--color-bg);border:1px solid var(--color-divider);color:var(--color-text);font:500 15px Barlow,sans-serif')} />
        </label>
        <div style={S('margin-top:12px;padding:11px 13px;background:var(--color-ok-bg);border-left:4px solid var(--color-ok);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap')}>
          <span style={S('font:400 13px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}>Wolisz zamówić telefonicznie? Zadzwoń do nas.<br />Pon.–pt., 8:00–16:00</span>
          <span style={S('display:flex;gap:8px;flex-wrap:wrap')}>
            <a href="tel:+48512082994" style={S("min-height:44px;padding:11px 13px;background:var(--color-ok-ink);color:#fff;text-decoration:none;font:600 15px 'Barlow Condensed',sans-serif;letter-spacing:.06em")}>512 082 994</a>
            <a href="tel:+48516645907" style={S("min-height:44px;padding:11px 13px;border:1px solid var(--color-ok-ink);color:var(--color-ok-ink);text-decoration:none;font:600 15px 'Barlow Condensed',sans-serif;letter-spacing:.06em")}>516 645 907</a>
          </span>
        </div>
      </div>
    </>
  );
}

function Step3({ v }) {
  return (
    <>
      <div style={S('padding:16px 20px 4px')}>
        <div style={S("font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:7px")}>Jak płacisz</div>
        <div style={S(`display:grid;grid-template-columns:${v.formCols};gap:9px`)}>
          {v.payOpts.map((o, i) => (
            <button key={i} onClick={o.pick} className={hv('border-color:var(--color-accent)')} style={S(`min-height:48px;padding:12px;background:${o.bg};color:${o.fg};border:1px solid ${o.bd};cursor:pointer;font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase`)}>{o.label}</button>
          ))}
        </div>
        <div style={S('margin:16px 0 0;border-top:1px solid var(--color-divider)')}></div>
      </div>
      <div style={S('padding:16px 20px 20px')}>
        <div style={S('margin-bottom:12px')}>
          <div style={S("font:600 21px/1.05 'Barlow Condensed',sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--color-accent)")}>Płatność i potwierdzenie</div>
          <div style={S('margin-top:3px;font:400 12.5px Barlow,sans-serif;color:var(--color-neutral-700)')}></div>
        </div>
        <button onClick={v.toggleLegal} className={hv('border-color:var(--color-accent)')} style={S('width:100%;min-height:46px;padding:11px 13px;background:var(--color-accent-100);border:1px solid var(--color-accent-300);cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left')}>
          <span style={S("font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-accent)")}>Ważna informacja techniczna</span>
          <span style={S("flex:none;font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--color-accent-700)")}>{v.legalLabel}</span>
        </button>
        {v.legalOpen ? (
          <div style={S('padding:13px 15px;border:1px solid var(--color-divider);border-top:0')}>
            <p style={S('margin:0 0 8px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Wyniki prezentowane przez aplikację DKM Power Transmission Sp. z o.o. mają charakter <strong>pomocniczy</strong> i stanowią wstępne zestawienie przekładni, silników oraz wyposażenia na podstawie danych katalogowych i parametrów wskazanych przez użytkownika.</p>
            <p style={S('margin:0 0 8px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Prezentowany współczynnik pracy przekładni fs odnosi się do parametrów katalogowych analizowanego zestawienia, w szczególności do znamionowej mocy wybranego silnika. Aplikacja nie określa rzeczywistego obciążenia maszyny, faktycznie pobieranej mocy, przebiegu momentu obrotowego ani wszystkich warunków eksploatacji konkretnego urządzenia.</p>
            <p style={S('margin:0 0 8px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Moc znamionowa silnika nie musi odpowiadać rzeczywistemu zapotrzebowaniu napędzanej maszyny. Silnik może pracować z obciążeniem niższym od znamionowego, jednak potwierdzenie takiego stanu wymaga indywidualnej analizy rzeczywistych warunków pracy.</p>
            <p style={S('margin:0 0 8px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Zestawienia ze współczynnikiem <strong>fs poniżej 1,0</strong> znajdują się poza zakresem rekomendowanym przez DKM Power Transmission Sp. z o.o. przy założeniu pełnego wykorzystania znamionowej mocy silnika. Mogą prowadzić do przeciążenia przekładni, jeżeli rzeczywiste obciążenie przekroczy jej dopuszczalne parametry.</p>
            <p style={S('margin:0 0 8px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Klient może świadomie zamówić przekładnię dla zestawienia ze współczynnikiem fs poniżej 1,0, pod warunkiem wyraźnego potwierdzenia informacji o ograniczeniach technicznych oraz akceptacji zakupu bez dobrowolnej gwarancji handlowej DKM Power Transmission Sp. z o.o.</p>
            <p style={S('margin:0 0 8px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Brak dobrowolnej gwarancji handlowej dotyczy wyłącznie wskazanej przekładni i konkretnego zamówienia, o ile nie wskazano inaczej. Nie oznacza automatycznego pozbawienia ochrony pozostałych produktów, silników, falowników ani akcesoriów znajdujących się w tym samym zamówieniu.</p>
            <p style={S('margin:0 0 8px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Zestawienia ze współczynnikiem <strong>fs od 1,0 do wartości poniżej 1,3</strong> wymagają indywidualnej weryfikacji. Ich przydatność zależy w szczególności od rzeczywistego momentu obciążenia, czasu pracy, charakteru obciążenia, liczby rozruchów, przeciążeń chwilowych, bezwładności układu, temperatury, sposobu sterowania, pozycji montażowej oraz sił promieniowych i osiowych.</p>
            <p style={S('margin:0 0 8px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Współczynnik <strong>fs równy lub wyższy niż 1,3</strong> nie stanowi samodzielnego potwierdzenia prawidłowego doboru ani bezpieczeństwa zastosowania. W zależności od warunków eksploatacji może być wymagany wyższy współczynnik pracy.</p>
            <p style={S('margin:0 0 8px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Krótkotrwałe przeciążenia, rozruchy i okresowe zwiększenie zapotrzebowania na moc wymagają sprawdzenia dopuszczalnych momentów, czasu trwania obciążenia, częstotliwości występowania oraz warunków cieplnych i mechanicznych napędu.</p>
            <p style={S('margin:0 0 8px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Ostatecznego doboru powinien dokonać użytkownik, projektant maszyny, integrator albo inna osoba posiadająca informacje o rzeczywistych warunkach pracy urządzenia. W przypadku wątpliwości zalecany jest kontakt z działem działem technicznym DKM Power Transmission Sp. z o.o.</p>
            <p style={S('margin:0 0 8px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>DKM Power Transmission Sp. z o.o. nie odpowiada za konsekwencje zastosowania produktu niezgodnie z jego parametrami katalogowymi, przekazanymi ostrzeżeniami, instrukcją użytkowania lub rzeczywistymi wymaganiami aplikacji w zakresie, w jakim konsekwencje te wynikają z nieprawidłowych, niepełnych albo niezweryfikowanych danych dotyczących danego zastosowania.</p>
            <p style={S('margin:0;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Powyższe postanowienia nie wyłączają ani nie ograniczają odpowiedzialności, której zgodnie z obowiązującymi przepisami prawa nie można wyłączyć ani ograniczyć, w szczególności odpowiedzialności za wady produktu, szkody wyrządzone przez produkt niebezpieczny oraz uprawnień przysługujących konsumentom.</p>
          </div>
        ) : null}
        <button onClick={v.toggleAccept} className={hv('background:var(--color-accent-100)')} style={S(`width:100%;margin-top:12px;padding:13px 14px;background:transparent;border:1px solid ${v.acceptBorder};cursor:pointer;text-align:left;display:flex;align-items:flex-start;gap:12px`)}>
          <span style={S(`flex:none;width:26px;height:26px;border:2px solid ${v.acceptBorder};background:${v.acceptBox};color:#fff;font:600 16px/22px Barlow,sans-serif;text-align:center`)}>{v.acceptMark}</span>
          <span style={S('font:400 13.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-900)')}>Zapoznałem się z <strong>Ważną informacją techniczną</strong>, <strong>Regulaminem</strong> i <strong>Polityką prywatności</strong> i akceptuję ich treść. Wynik doboru wymaga weryfikacji technicznej.</span>
        </button>
        <div style={S('display:flex;gap:14px;margin-top:10px;flex-wrap:wrap')}>
          <button onClick={v.goTerms} style={S('padding:0;background:none;border:0;cursor:pointer;font:600 13px Barlow,sans-serif;color:var(--color-accent-700);text-decoration:underline')}>Regulamin</button>
          <button onClick={v.goLegal} style={S('padding:0;background:none;border:0;cursor:pointer;font:600 13px Barlow,sans-serif;color:var(--color-accent-700);text-decoration:underline')}>Polityka prywatności</button>
        </div>
        {v.acceptErr ? (
          <div style={S('margin-top:12px;padding:11px 14px;background:var(--color-warn);color:#fff;font:600 13px/1.5 Barlow,sans-serif')}>Aby wysłać, potwierdź zapoznanie się z Regulaminem.</div>
        ) : null}
        {v.needQuote ? (
          <div style={S('margin-top:12px;padding:12px 14px;background:var(--color-accent-100);border-left:4px solid var(--color-accent);font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Część pozycji nie ma ceny — wyślij zapytanie, a wycenimy je i odeślemy proformę. Możesz też od razu zamówić: brakujące ceny doliczymy do proformy.</div>
        ) : null}
        {v.rfqNoWty ? (
          <div style={S('margin-top:16px;border:1px solid var(--color-warn)')}>
            <div style={S('padding:11px 13px;background:var(--color-warn)')}>
              <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#fff")}>Poniższe przekładnie są zamawiane bez dobrowolnej gwarancji handlowej DKM Power Transmission Sp. z o.o.</div>
            </div>
            <NoWtyList v={v} />
            <div style={S('padding:9px 12px;background:var(--color-warn-bg);font:400 11.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}>Brak dobrowolnej gwarancji handlowej dotyczy wyłącznie wskazanych przekładni i tego zamówienia. Nie ogranicza uprawnień, których zgodnie z przepisami nie można wyłączyć.</div>
          </div>
        ) : null}
        <button data-order-btn="1" disabled={v.sending} onClick={v.orderRfq} className={hv('background:var(--color-accent-600);color:var(--color-bg);border-color:var(--color-accent-600)')} style={S(`margin-top:14px;width:100%;min-height:56px;padding:15px;background:${v.orderBg};color:${v.orderFg};border:1px solid ${v.orderBd};cursor:${v.sendCur};pointer-events:${v.sendPE};opacity:${v.sendOp};font:600 14.5px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase`)}>{v.orderLabel}</button>
        {v.sentOk ? (
          <div data-sent-panel="1" style={S('margin-top:12px;padding:14px 15px;border:1px solid var(--color-ok);background:var(--color-ok-bg)')}>
            <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-ok-ink)")}>{v.sentTitle}</div>
            <div style={S("margin-top:6px;font:600 19px 'Barlow Condensed',sans-serif;letter-spacing:.04em;color:var(--color-accent)")}>Numer zgłoszenia: {v.sentRef}</div>
            <div style={S('margin-top:5px;font:400 13px/1.5 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>{v.sentNote}</div>
          </div>
        ) : null}
        {v.hasSendErr ? (
          <div style={S('margin-top:12px;padding:14px 15px;border:1px solid var(--color-warn);background:var(--color-warn-bg)')}>
            <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-warn)")}>Wysyłka nie udała się</div>
            <div style={S('margin-top:6px;font:400 13px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>{v.sendErr}</div>
            <button onClick={v.copyRfq} className={hv('background:var(--color-accent-600)')} style={S("margin-top:11px;width:100%;min-height:48px;padding:13px;background:var(--color-accent);color:var(--color-bg);border:1px solid var(--color-accent);cursor:pointer;font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>{v.copyLabel}</button>
            <a href={v.rfqMailto} style={S("margin-top:8px;display:block;text-align:center;min-height:44px;padding:13px;border:1px solid var(--color-accent-300);font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent);text-decoration:none")}>Wyślij mailem na {v.rfqEmail}</a>
            <div style={S('margin-top:12px;max-height:170px;overflow:auto;padding:10px;border:1px solid var(--color-divider);background:var(--color-bg);font:400 12px/1.5 ui-monospace,monospace;color:var(--color-neutral-900);white-space:pre-wrap;-webkit-user-select:text;user-select:text')}>{v.mailText}</div>
          </div>
        ) : null}
        {v.hasOrderErr ? (
          <div style={S('margin-top:10px;padding:11px 14px;background:var(--color-warn);color:#fff;font:600 13px/1.5 Barlow,sans-serif')}>{v.orderErr}</div>
        ) : null}
        {v.showQuote ? (
          <button disabled={v.sending} onClick={v.sendRfq} className={hv('border-color:var(--color-accent)')} style={S(`margin-top:10px;width:100%;min-height:52px;padding:14px;background:${v.sendBg};color:${v.sendFg};border:1px solid ${v.sendBd};cursor:${v.sendCur};pointer-events:${v.sendPE};opacity:${v.sendOp};font:600 14px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase`)}>{v.sendLabel}</button>
        ) : null}
        <div style={S('margin-top:8px;font:400 12px/1.5 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Zgłoszenie wysyłamy prosto do DKM — nie musisz otwierać poczty. Przy proformie wysyłka rusza po jej opłaceniu, przy pobraniu — po potwierdzeniu zamówienia.</div>
        {v.sendFail ? (
          <div style={S('margin-top:12px;padding:14px;border:1px solid var(--color-warn);background:#fff')}>
            <div style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-warn)")}>Nie udało się otworzyć poczty</div>
            <div style={S('margin-top:6px;font:400 13.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-900);text-wrap:pretty')}>Ta przeglądarka nie ma podpiętego programu pocztowego. Skopiuj treść i wyślij ją na <strong>{v.rfqEmail}</strong> — mailem lub przez WhatsApp.</div>
            <button onClick={v.copyRfq} className={hv('background:var(--color-accent-600)')} style={S("margin-top:12px;width:100%;min-height:48px;padding:13px;background:var(--color-accent);color:var(--color-bg);border:1px solid var(--color-accent);cursor:pointer;font:600 13.5px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase")}>{v.copyLabel}</button>
            <a href={v.rfqMailto} style={S("margin-top:8px;display:block;text-align:center;min-height:44px;padding:13px;border:1px solid var(--color-accent-300);font:600 13.5px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-accent);text-decoration:none")}>Napisz na {v.rfqEmail}</a>
            <div style={S('margin-top:12px;max-height:170px;overflow:auto;padding:10px;border:1px solid var(--color-divider);background:var(--color-bg);font:400 12px/1.5 ui-monospace,monospace;color:var(--color-neutral-900);white-space:pre-wrap;-webkit-user-select:text;user-select:text')}>{v.mailText}</div>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function RfqScreen({ v }) {
  return (
    <div style={S(`width:100%;max-width:${v.rfqDocW};margin:0 auto`)}>
      <div style={S('padding:17px 20px 14px;border-bottom:1px solid var(--color-divider);display:flex;align-items:flex-end;justify-content:space-between;gap:12px')}>
        <h2 style={S("margin:0;font:600 28px/1 'Barlow Condensed',sans-serif")}>Zamówienie</h2>
        <button onClick={v.closeRfq} className={hv('border-color:var(--color-accent);background:var(--color-accent-100)')} style={S("flex:none;min-height:40px;padding:9px 12px;background:transparent;border:1px solid var(--color-accent-300);cursor:pointer;font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-accent-700)")}>← Dobieraj dalej</button>
      </div>

      <div data-rfq-top="1" style={S('padding:11px 14px;background:var(--color-accent);display:flex;align-items:center;gap:7px')}>
        {v.rfqTabs.map((t, i) => (
          <button key={i} onClick={t.go} className={hv('border-color:#fff')} style={S(`flex:1;min-width:0;min-height:44px;padding:8px 6px;background:${t.bg};border:1px solid ${t.bd};cursor:${t.cur};display:flex;align-items:center;justify-content:center;gap:7px`)}>
            <span style={S(`flex:none;min-width:22px;height:22px;background:${t.numBg};color:${t.numFg};font:600 14px/22px 'Barlow Condensed',sans-serif;text-align:center`)}>{t.num}</span>
            <span style={S(`min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${t.fg}`)}>{t.label}</span>
          </button>
        ))}
      </div>
      {v.showFold ? (
        <button onClick={v.goStep1} className={hv('background:var(--color-accent-100)')} style={S('width:100%;padding:12px 16px;background:var(--color-surface);border:0;border-bottom:1px solid var(--color-divider);cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left')}>
          <span style={S('flex:1;min-width:0')}>
            {v.foldLines.map((f, i) => (
              <span key={i} style={S(`display:block;font:600 13px/1.35 Barlow,sans-serif;color:${f.color}`)}>{f.text}</span>
            ))}
          </span>
          <span style={S('flex:none;text-align:right')}>
            <span style={S("display:block;font:600 17px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:var(--color-accent-700)")}>{v.cartNet}</span>
            <span style={S("display:block;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-accent)")}>zmień ▾</span>
          </span>
        </button>
      ) : null}
      <div style={S(`display:grid;grid-template-columns:${v.rfqCols};gap:0;align-items:start`)}>
        <div style={S('min-width:0')}>
          {v.isStep1 ? <Step1 v={v} /> : null}
          {v.isStep2 ? <Step2 v={v} /> : null}
          {v.isStep3 ? <Step3 v={v} /> : null}
        </div>
        {v.rfqWide ? (
          <aside style={S('position:sticky;top:14px;align-self:start;margin:16px 20px 20px 0;border:1px solid var(--color-divider);background:#fff')}>
            <div style={S("padding:11px 13px;background:var(--color-surface);border-bottom:1px solid var(--color-divider);font:600 11.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent)")}>Twoje zamówienie</div>
            <div style={S('display:grid;gap:1px;background:var(--color-divider)')}>
              {v.sumRows.map((p, i) => (
                <div key={i} style={S(`background:#fff;padding:10px 13px;border-left:3px solid ${p.mark}`)}>
                  <div style={S(`font:600 10.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${p.tagFg}`)}>{p.tag}</div>
                  <div style={S('margin-top:2px;font:600 14.5px/1.2 Barlow,sans-serif;color:var(--color-neutral-900)')}>{p.name}</div>
                  <div style={S('margin-top:2px;font:400 11.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>{p.spec}</div>
                  <div style={S(`margin-top:4px;font:600 15px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:${p.sumColor}`)}>{p.sum}</div>
                  {p.boreOpt ? (
                    <div style={S('margin-top:5px;padding:6px 8px;background:var(--color-mid-bg);border-left:3px solid var(--color-mid);font:400 11px/1.4 Barlow,sans-serif;color:var(--color-neutral-900)')}>{p.boreNote}</div>
                  ) : null}
                </div>
              ))}
            </div>
            <div style={S('padding:11px 13px;border-top:1px solid var(--color-divider)')}>
              <div style={S('display:flex;justify-content:space-between;gap:10px;font:400 12.5px Barlow,sans-serif;color:var(--color-neutral-700)')}><span>Razem netto z wysyłką</span><span style={S('font-variant-numeric:tabular-nums')}>{v.cartNet}</span></div>
              <div style={S('margin-top:3px;display:flex;justify-content:space-between;gap:10px;font:400 12.5px Barlow,sans-serif;color:var(--color-neutral-700)')}><span>VAT 23%</span><span style={S('font-variant-numeric:tabular-nums')}>{v.cartVat}</span></div>
              <div style={S('margin-top:4px;display:flex;justify-content:space-between;gap:10px;font:400 12px Barlow,sans-serif;color:var(--color-neutral-700)')}><span>Wysyłka · {v.shipKg}</span><span style={S('font-variant-numeric:tabular-nums')}>{v.shipPrice}</span></div>
              <div style={S('margin-top:7px;padding-top:7px;border-top:1px solid var(--color-divider);display:flex;align-items:baseline;justify-content:space-between;gap:10px')}>
                <span style={S("font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-accent)")}>Brutto</span>
                <span style={S("font:600 23px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;color:var(--color-accent-700)")}>{v.cartGross}</span>
              </div>
            </div>
            {v.cartMissing ? (
              <div style={S('padding:10px 13px;background:var(--color-mid-bg);border-top:1px solid var(--color-mid);font:400 11.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}><strong style={S('color:var(--color-mid-ink)')}>Kwota niepełna.</strong> Część pozycji nie ma ceny — doliczymy je po wycenie. Złóż zapytanie zamiast zamówienia.</div>
            ) : null}
            {v.rfqBoreOpt ? (
              <div style={S('padding:10px 13px;background:var(--color-mid-bg);border-top:1px solid var(--color-mid);font:400 11.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}><strong style={S('color:var(--color-mid-ink)')}>⌀ {v.rfqBoreCount}</strong> Wykonanie specjalne — inne SKU, brak w magazynie.</div>
            ) : null}
            {v.rfqNoWty ? (
              <div style={S('padding:10px 13px;background:var(--color-warn-bg);border-top:1px solid var(--color-warn);font:400 11.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}><strong style={S('color:var(--color-warn)')}>▲ {v.noWtyCount}</strong> {v.noWtyNote}</div>
            ) : null}
            <div style={S('padding:10px 13px;border-top:1px solid var(--color-divider);font:400 11.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-700)')}>Pytania? <a href="tel:+48512082994" style={S('color:var(--color-accent-700);font-weight:600')}>512 082 994</a> · <a href="tel:+48516645907" style={S('color:var(--color-accent-700);font-weight:600')}>516 645 907</a> · pon.–pt. 8–16</div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
