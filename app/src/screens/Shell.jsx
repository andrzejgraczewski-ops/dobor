// Powłoka aplikacji: nagłówek z logo i okruszkami, obszar treści z ekranami,
// dolny pasek koszyka i baner zgody na analitykę. Układ i style 1:1 z prototypu.
import React from 'react';
import { S, hv } from '../lib/style.js';
import HomeScreen from './HomeScreen.jsx';
import TermsScreen from './TermsScreen.jsx';
import LegalScreen from './LegalScreen.jsx';
import AskP1Screen from './AskP1Screen.jsx';
import AskIScreen from './AskIScreen.jsx';
import AskN2Screen from './AskN2Screen.jsx';
import AskTypeScreen from './AskTypeScreen.jsx';
import AskBoreScreen from './AskBoreScreen.jsx';
import AskM2Screen from './AskM2Screen.jsx';
import SwapScreen from './SwapScreen.jsx';
import CardAScreen from './CardAScreen.jsx';
import CardBScreen from './CardBScreen.jsx';
import ResultsScreen from './ResultsScreen.jsx';
import DetailScreen from './DetailScreen.jsx';
import ConsentScreen from './ConsentScreen.jsx';
import RfqScreen from './RfqScreen.jsx';
import { DimOverlay, CardOverlay } from './Overlays.jsx';

export default function Shell({ v }) {
  return (
    <div style={S(`min-height:100vh;display:flex;flex-direction:column;background:var(--color-bg);max-width:${v.shellW};margin:0 auto;border-left:1px solid var(--color-divider);border-right:1px solid var(--color-divider);box-shadow:0 0 0 1px rgba(255,255,255,.18),0 30px 80px rgba(12,10,40,.45)`)}>

      <div style={S('flex:none;position:sticky;top:0;z-index:6;background:var(--color-bg);border-bottom:1px solid var(--color-divider)')}>
        <div style={S(`padding:${v.brandPad};display:flex;align-items:center;justify-content:${v.brandJustify}`)}>
          <img src="assets/dkm-logo.png" alt="DKM Power Transmission" style={S(`height:${v.logoH};width:auto;display:block`)} />
        </div>
        {v.showBrandTitle ? (
          <div style={S('padding:12px 20px 12px;display:flex;align-items:stretch;justify-content:center;gap:12px')}>
            <span style={S('width:4px;background:linear-gradient(180deg,var(--color-accent) 0 50%,var(--color-ok) 50% 100%);flex:none')}></span>
            <h1 style={S("margin:0;font:600 25px/1.06 'Barlow Condensed',sans-serif;letter-spacing:.045em;text-transform:uppercase;color:var(--color-accent)")}>Dobór przekładni<br /><span style={S('color:var(--color-accent-700)')}>ślimakowych</span></h1>
          </div>
        ) : null}
        {v.showCrumbs ? (
          <div style={S('padding:0 20px 11px;display:flex;align-items:center;gap:9px;flex-wrap:wrap')}>
            {v.canStepBack ? (
              <button onClick={v.stepBack} className={hv('background:var(--color-accent-600);border-color:var(--color-accent-600)')} style={S("min-height:34px;padding:5px 11px;background:var(--color-accent);border:1px solid var(--color-accent);cursor:pointer;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-bg)")}>← Wstecz</button>
            ) : null}
            <button onClick={v.goHome} className={hv('background:var(--color-accent-100);border-color:var(--color-accent)')} style={S("min-height:34px;padding:5px 9px;background:transparent;border:1px solid var(--color-divider);cursor:pointer;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-accent-700)")}>← Nowy dobór</button>
            <span style={S("font:600 20px/1.15 'Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--color-accent)")}>{v.crumbLabel}</span>
          </div>
        ) : null}
      </div>

      <div style={S('flex:1')}>
        {v.isHome ? <HomeScreen v={v} /> : null}
        {v.isTerms ? <TermsScreen v={v} /> : null}
        {v.isLegal ? <LegalScreen v={v} /> : null}
        {v.isAskP1 ? <AskP1Screen v={v} /> : null}
        {v.isAskI ? <AskIScreen v={v} /> : null}
        {v.dimOpen ? <DimOverlay v={v} /> : null}
        {v.cardOpen ? <CardOverlay v={v} /> : null}
        {v.isAskN2 ? <AskN2Screen v={v} /> : null}
        {v.isAskType ? <AskTypeScreen v={v} /> : null}
        {v.isAskBore ? <AskBoreScreen v={v} /> : null}
        {v.isAskM2 ? <AskM2Screen v={v} /> : null}
        {v.isSwap ? <SwapScreen v={v} /> : null}
        {v.isCardA ? <CardAScreen v={v} /> : null}
        {v.isCardB ? <CardBScreen v={v} /> : null}
        {v.isResults ? <ResultsScreen v={v} /> : null}
        {v.isDetail ? <DetailScreen v={v} /> : null}
        {v.isConsent ? <ConsentScreen v={v} /> : null}
        {v.isRfq ? <RfqScreen v={v} /> : null}
      </div>

      <div style={S('flex:none;position:sticky;bottom:0;z-index:6;display:flex;align-items:stretch;border-top:1px solid var(--color-accent);box-shadow:0 -6px 18px rgba(41,38,91,.18)')}>
        {v.isDetail ? (
          <button onClick={v.back} className={hv('background:var(--color-accent-600)')} style={S("flex:none;min-height:64px;padding:14px 16px calc(env(safe-area-inset-bottom) + 14px);border:0;border-right:1px solid rgba(255,255,255,.35);background:var(--color-accent-700);color:#fff;cursor:pointer;font:600 14px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap")}>{v.backLabel}</button>
        ) : null}
        {v.isRfq ? (
          <>
            {v.canBack ? (
              <button onClick={v.rfqBack} className={hv('background:var(--color-accent-600)')} style={S("flex:none;min-height:64px;padding:14px 15px calc(env(safe-area-inset-bottom) + 14px);border:0;border-right:1px solid rgba(255,255,255,.35);background:var(--color-accent-700);color:#fff;cursor:pointer;font:600 13.5px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap")}>← Wstecz</button>
            ) : null}
            <button onClick={v.stepNext} className={hv('filter:brightness(1.12)')} style={S(`flex:1;min-width:0;min-height:64px;padding:14px 18px calc(env(safe-area-inset-bottom) + 14px);border:0;background:${v.nextBg};color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left`)}>
              <span style={S('min-width:0')}>
                <span style={S("display:block;font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;opacity:.85")}>{v.nextHint}</span>
                <span style={S("display:block;margin-top:1px;font:600 21px/1 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums")}>{v.cartGross}</span>
              </span>
              <span style={S("flex:none;font:600 15px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase")}>{v.nextLabel}</span>
            </button>
          </>
        ) : null}
        {v.notRfq ? (
          <button onClick={v.openRfq} className={hv('background:var(--color-accent-600)')} style={S('flex:1;min-width:0;min-height:64px;padding:14px 20px calc(env(safe-area-inset-bottom) + 14px);border:0;background:var(--color-accent);color:var(--color-bg);cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left')}>
            <span style={S("min-width:0;overflow:hidden;text-overflow:ellipsis;font:600 15px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>{v.rfqBarLabel}</span>
            <span style={S('display:flex;align-items:center;gap:9px;flex:none')}>
              <span style={S("min-width:30px;padding:3px 8px;background:var(--color-bg);color:var(--color-accent-700);font:600 17px/1.15 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;text-align:center")}>{v.rfqCount}</span>
              <span style={S("font:600 16px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase")}>szt.</span>
              <span style={S("padding-left:9px;border-left:1px solid rgba(255,255,255,.35);font:600 17px 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums;white-space:nowrap")}>{v.rfqBarSum}</span>
              <span style={S("font:600 16px 'Barlow Condensed',sans-serif")}>→</span>
            </span>
          </button>
        ) : null}
      </div>

      {v.anaAsk ? (
        <div style={S('position:fixed;left:0;right:0;bottom:0;z-index:120;padding:15px 18px calc(env(safe-area-inset-bottom) + 15px);background:var(--color-accent);color:#fff;box-shadow:0 -6px 22px rgba(41,38,91,.28)')}>
          <div style={S(`width:100%;max-width:${v.stepW};margin:0 auto`)}>
            <div style={S("font:600 17px/1.2 'Barlow Condensed',sans-serif;letter-spacing:.04em;text-transform:uppercase")}>Pomóż nam poprawić konfigurator</div>
            <div style={S('margin-top:6px;font:400 12.5px/1.5 Barlow,sans-serif;color:rgba(255,255,255,.88);text-wrap:pretty')}>Za Twoją zgodą mierzymy anonimowo wejścia oraz użycie koszyka. Nie przekazujemy danych kontaktowych ani treści zamówienia do analityki.</div>
            <div style={S(`margin-top:11px;display:grid;grid-template-columns:${v.formCols};gap:9px`)}>
              <button onClick={v.anaNo} className={hv('background:rgba(255,255,255,.14)')} style={S("min-height:46px;padding:12px;background:transparent;border:1px solid rgba(255,255,255,.5);color:#fff;cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Nie zgadzam się</button>
              <button onClick={v.anaYes} className={hv('opacity:.9')} style={S("min-height:46px;padding:12px;background:#fff;border:1px solid #fff;color:var(--color-accent);cursor:pointer;font:600 12.5px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Akceptuję analitykę</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
