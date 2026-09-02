// Punkt wejścia. Dane katalogu, cennika i wymiarów są ładowane jako moduły
// z efektem ubocznym — tak jak w prototypie ustawiają globalne window.DKM_*,
// więc odświeżenie cennika to nadal podmiana jednego pliku w src/data/.
import React from 'react';
import { createRoot } from 'react-dom/client';

import './styles/industry.css';
import './styles/global.css';

import './data/catalog-data.js';
import './data/dims-data.js';
import './data/price-data.js';

import App from './App.jsx';
import { domainGuard } from './lib/guard.js';

if (domainGuard()) {
  createRoot(document.getElementById('app')).render(<App />);
}

// Service worker działa tylko po HTTP(S) — z pliku otwartego lokalnie (file://)
// rejestracja i tak jest niemożliwa, a wersja offline nie potrzebuje cache'u.
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
