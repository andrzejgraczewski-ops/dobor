// Ekran startowy: hero (tylko na szerokim ekranie), nota o standardzie
// 1400 obr/min, kafelki kryteriów doboru, ostatnie dobory, cały katalog, stopka.
import React from 'react';
import { S, hv } from '../lib/style.js';

export default function HomeScreen({ v }) {
  return (
    <>
      <div style={S(`position:relative;padding:26px 20px 10px;overflow:hidden;background:
        radial-gradient(120% 140% at 100% 0%,var(--color-accent-100) 0%,rgba(255,255,255,0) 62%),
        repeating-linear-gradient(90deg,rgba(41,38,91,.05) 0 1px,transparent 1px 26px),
        var(--color-bg);border-bottom:1px solid var(--color-divider)`)}>
        <div style={S('position:absolute;left:0;right:0;bottom:0;height:3px;background:linear-gradient(90deg,var(--color-accent) 0 33.33%,var(--color-accent-700) 33.33% 66.66%,var(--color-ok) 66.66% 100%)')}></div>
        {v.wide ? (
          <div style={S('position:relative;margin:0 0 20px;height:230px;overflow:hidden;border:1px solid var(--color-divider);background:var(--color-accent-100)')}>
            {/* kadrowanie „cover” tak jak w prototypie: obraz wypełnia wysokość
                ramki i jest wyśrodkowany, nadmiar szerokości się przycina */}
            <div style={S('position:absolute;inset:0;overflow:hidden;background:rgba(127,127,127,.08)')}>
              <img src="assets/hero-przekladnia.png" alt="Przekładnia ślimakowa DKM" style={S('position:absolute;left:50%;top:50%;height:100%;width:auto;max-width:none;transform:translate(-50%,-50%);display:block')} />
            </div>
            <div style={S('position:absolute;left:0;top:0;bottom:0;width:40%;padding:34px 30px;display:flex;flex-direction:column;justify-content:center;gap:10px;pointer-events:none')}>
              <div style={S("font:600 34px/1.02 'Barlow Condensed',sans-serif;letter-spacing:.02em;text-transform:uppercase;color:#fff")}>Przekładnie<br />ślimakowe</div>
              <div style={S('font:400 14px/1.5 Barlow,sans-serif;color:rgba(255,255,255,.82)')}>Korpusy DKM025 – DKM150 · moce 0,06 – 15 kW<br />Cały katalog doboru w jednym miejscu.</div>
            </div>
          </div>
        ) : null}
        <h1 style={S("position:relative;margin:0;font:600 32px/1.05 'Barlow Condensed',sans-serif;letter-spacing:.005em")}>Znajdźmy napęd idealny dla Twojej maszyny</h1>
        <p style={S('margin:8px 0 0;font:400 14.5px/1.55 Barlow,sans-serif;color:var(--color-neutral-700);text-wrap:pretty')}>Wybierz kryterium, które znasz najlepiej — od niego zaczniemy dobór. Pozostałe parametry uzupełnisz później i możesz je zmienić na każdym etapie.</p>
      </div>
      <div style={S('margin:16px 20px 0;padding:11px 13px;background:var(--color-ok-bg);border-left:4px solid var(--color-ok);font:400 12.5px/1.5 Barlow,sans-serif;color:var(--color-neutral-900)')}>Dobór prowadzę na <strong style={S('font-weight:600')}>silniku 1400 obr/min</strong> (4-biegunowym) — tak realizuje się większość napędów. Prędkości 900 i 2800 obr/min włączysz jednym przyciskiem w wynikach.</div>
      <img data-tile="p1" src="assets/tile-p1.png" alt="" style={S('display:none')} />
      <img data-tile="i" src="assets/tile-i.png" alt="" style={S('display:none')} />
      <img data-tile="swap" src="assets/tile-swap.png" alt="" style={S('display:none')} />
      <img data-tile="n2" src="assets/tile-n2.png" alt="" style={S('display:none')} />
      <img data-tile="m2" src="assets/tile-m2.png" alt="" style={S('display:none')} />
      <img data-tile="bore" src="assets/tile-bore.png" alt="" style={S('display:none')} />
      <img data-tile="type" src="assets/tile-type.png" alt="" style={S('display:none')} />
      <div style={S("padding:22px 20px 0;font:600 15px/1.2 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700);text-align:center")}>Kryteria doboru</div>
      <div style={S(`padding:12px 20px 0;display:grid;grid-template-columns:${v.tileGrid};gap:13px`)}>
        {v.entries.map((e, i) => (
          <button key={i} onClick={e.go} className={hv('border-color:var(--color-accent);box-shadow:0 6px 20px rgba(41,38,91,.13)')} style={S('position:relative;padding:20px 16px 22px;background:#fff;border:1px solid var(--color-divider);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:14px;box-shadow:0 2px 10px rgba(41,38,91,.06)')}>
            <span role="img" aria-label={e.title} style={S(`width:100%;height:164px;background-image:${e.tile};background-size:${e.tileSize};background-position:center;background-repeat:no-repeat`)}></span>
            <span style={S('font:600 16.5px/1.25 Barlow,sans-serif;color:var(--color-accent);text-align:center;text-wrap:pretty')}>{e.short}</span>
            <span style={S('font:400 12.5px/1.45 Barlow,sans-serif;color:var(--color-neutral-700);text-align:center;text-wrap:pretty')}>{e.desc}</span>
            <span style={S("margin-top:auto;padding:7px 18px;background:var(--color-accent-200);font:600 22px/1 'Barlow Condensed',sans-serif;color:var(--color-accent);font-variant-numeric:tabular-nums")}>{e.sym}</span>
          </button>
        ))}
      </div>
      {v.hasHist ? (
        <div style={S('padding:18px 20px 0')}>
          <div style={S("margin-top:0;font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:9px")}>Ostatnie dobory</div>
          <div style={S('display:grid;gap:7px')}>
            {v.histRows.map((h, i) => (
              <button key={i} onClick={h.go} className={hv('background:var(--color-accent-100);border-color:var(--color-accent);border-left-color:var(--color-accent)')} style={S('min-height:54px;padding:10px 14px;background:transparent;border:1px solid var(--color-divider);border-left:4px solid var(--color-accent-700);cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left')}>
                <span style={S('font:500 14.5px/1.35 Barlow,sans-serif')}>{h.label}</span>
                <span style={S('flex:none;font:400 12.5px Barlow,sans-serif;color:var(--color-neutral-700)')}>{h.sub} →</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div style={S('padding:16px 20px 0')}>
        <button onClick={v.browseAll} className={hv('background:var(--color-accent-100);border-color:var(--color-accent)')} style={S('width:100%;min-height:50px;padding:13px 16px;background:transparent;border:1px solid var(--color-divider);cursor:pointer;display:flex;align-items:baseline;justify-content:space-between;gap:12px;text-align:left')}>
          <span style={S("font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Przeglądaj cały katalog</span>
          <span style={S('font:400 13px Barlow,sans-serif;color:var(--color-neutral-700)')}>{v.totalCount} pozycji</span>
        </button>
      </div>
      <div style={S('margin:24px 0 0;padding:26px 20px 30px;background:var(--color-accent);color:#fff')}>
        <div style={S('font:600 24px/1.2 Barlow,sans-serif;letter-spacing:.005em')}>DKM Power Transmission<span style={S('font-weight:400;color:rgba(255,255,255,.7)')}> Sp. z o.o.</span></div>
        <div style={S(`margin-top:14px;display:grid;grid-template-columns:${v.footCols};gap:16px 26px;font:400 16px/1.65 Barlow,sans-serif;color:rgba(255,255,255,.9)`)}>
          <div>ul. 3 Maja 20<br />87-640 Czernikowo<br />NIP 879-268-87-36</div>
          <div style={S('display:grid;gap:6px')}>
            <a href="mailto:sklep@d-k-m.eu" style={S('color:#fff;font-weight:600;text-decoration:underline')}>sklep@d-k-m.eu</a>
            <a href="tel:+48512082994" style={S('color:#fff;font-weight:600;text-decoration:none')}>+48 512 082 994</a>
            <a href="tel:+48516645907" style={S('color:#fff;font-weight:600;text-decoration:none')}>+48 516 645 907</a>
          </div>
        </div>
        <div style={S('margin-top:22px;padding-top:16px;border-top:1px solid rgba(255,255,255,.25);font:400 12.5px/1.6 Barlow,sans-serif;color:rgba(255,255,255,.72)')}>
          © 2026 DKM Power Transmission Sp. z o.o. · Wszelkie prawa zastrzeżone · Proprietary &amp; Confidential
        </div>
        <button onClick={v.goLegal} className={hv('background:rgba(255,255,255,.12)')} style={S("margin-top:12px;min-height:44px;padding:11px 14px;background:transparent;border:1px solid rgba(255,255,255,.45);color:#fff;cursor:pointer;font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Informacje prawne · RODO</button>
        {/* odstęp między przyciskami pochodzi z odstępu w źródle prototypu */}
        {' '}
        <button onClick={v.goTerms} className={hv('background:rgba(255,255,255,.12)')} style={S("margin-top:10px;margin-left:10px;min-height:44px;padding:11px 14px;background:transparent;border:1px solid rgba(255,255,255,.45);color:#fff;cursor:pointer;font:600 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Regulamin</button>
      </div>
    </>
  );
}
