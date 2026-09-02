// Nakładki pełnoekranowe: rysunek wymiarowy elementu i powiększona karta techniczna.
import React from 'react';
import { S } from '../lib/style.js';

export function DimOverlay({ v }) {
  return (
    <div style={S('position:fixed;inset:0;z-index:62;background:rgba(41,38,91,.94);overflow:auto;padding:16px')}>
      <div style={S('max-width:1000px;margin:0 auto')}>
        <div style={S('display:flex;align-items:center;justify-content:space-between;gap:12px;padding-bottom:10px')}>
          <span style={S("font:600 17px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#fff")}>{v.dim.title}</span>
          <button onClick={v.closeDim} style={S("flex:none;min-height:44px;padding:10px 16px;background:#fff;color:var(--color-accent);border:0;cursor:pointer;font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Zamknij ✕</button>
        </div>
        {v.dim.hasImg ? (
          <div role="img" aria-label="Rysunek wymiarowy" style={S(`width:100%;aspect-ratio:${v.dim.ratio};background-color:#fff;background-image:${v.dim.img};background-size:contain;background-position:center;background-repeat:no-repeat`)}></div>
        ) : null}
        {v.dim.hasRows ? (
          <div style={S(`margin-top:12px;display:grid;grid-template-columns:${v.dim.cols};gap:1px;background:rgba(255,255,255,.3)`)}>
            {v.dim.rows.map((d, i) => (
              <div key={i} style={S('background:#fff;padding:11px 13px')}>
                <div style={S("font:600 15px 'Barlow Condensed',sans-serif;letter-spacing:.06em;color:var(--color-accent)")}>{d.k}</div>
                <div style={S("margin-top:3px;font:600 22px/1.05 'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums")}>{d.v}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function CardOverlay({ v }) {
  return (
    <div onClick={v.closeCard} style={S('position:fixed;inset:0;z-index:60;background:rgba(41,38,91,.92);overflow:auto;padding:16px;cursor:zoom-out')}>
      <div style={S('max-width:1000px;margin:0 auto')}>
        <div style={S('display:flex;justify-content:flex-end;padding-bottom:10px')}>
          <button onClick={v.closeCard} style={S("min-height:44px;padding:10px 16px;background:#fff;color:var(--color-accent);border:0;cursor:pointer;font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase")}>Zamknij ✕</button>
        </div>
        <div role="img" aria-label="Karta techniczna" style={S(`width:100%;aspect-ratio:${v.cardRatio};background-color:#fff;background-image:${v.cardZoomBg};background-size:contain;background-position:center;background-repeat:no-repeat`)}></div>
      </div>
    </div>
  );
}
