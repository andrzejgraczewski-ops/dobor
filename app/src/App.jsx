// Spina logikę doboru z widokiem. renderVals() zwraca płaski obiekt, na którym
// renderują się ekrany — dokładnie tak, jak w prototypie (wartości nałożone na props).
import React from 'react';
import { DkmLogic } from './logic.js';
import Shell from './screens/Shell.jsx';

export default class App extends DkmLogic {
  render() {
    const v = { ...this.props, ...this.renderVals() };
    return <Shell v={v} />;
  }
}
