// Logika doboru DKM — przeniesiona 1:1 z prototypu v3 (klasa Component).
//
// Zmiany wobec prototypu ograniczone do minimum:
//  • klasa dziedziczy po React.Component zamiast po DCLogic z runtime'u
//    Claude Design (ten sam kontrakt: state, setState, cykl życia);
//  • widok siedzi w App.jsx — tu zostaje wyłącznie logika i renderVals();
//  • w searchHits() zmienna z cyframi zapytania nazywa się digits, a nie num
//    — przesłaniała funkcję num() i wyszukanie SKU falownika (np. "E500")
//    kończyło się wyjątkiem.
import React from 'react';
import { CAT, TERMS, LOADS, HOURS, ZVALS, TEMPS, r1, FSMINS, fsPass, num, fs1, zl, zl2, V, plural } from './lib/consts.js';

export class DkmLogic extends React.Component {
  static defaultProps = { fsMin: 1.0, rfqEmail: 'sklep@d-k-m.eu' };
  A(f){ const R=window.__resources||{}; return R['a_'+String(f).replace(/[^a-zA-Z0-9]/g,'_')]||('assets/'+f); }
  state={screen:'home',mode:null,p1:null,i:null,n2Exact:null,box:null,rpmSel:1400,m2:'',n2:'',load:1,hours:1,z:10,temp:0,fsMinSel:null,fsOnly:false,wide:false,
    refine:false,sel:null,rfq:[],just:false,prevScreen:'home',typeQ:'',hist:[],hideLow:true,
    c:{first:'',last:'',firm:'',nip:'',email:'',phone:'',note:'',street:'',zip:'',city:''},del:'kurier',pay:'proforma',orderErr:'',ordered:false,flangePick:null,borePick:null,
    anaConsent:null,sending:false,sentOk:false,sentRef:'',sendErr:''};

  GA_ID='G-79013G7BXL';
  ANA_KEY='dkm-analytics-consent';
  FORM_URL='https://formspree.io/f/mgaewanz';
  // GA4 ładuje się dopiero po zgodzie — nigdy wcześniej, żeby nie zbierać danych bez niej
  loadGA(){
    if(this._ga||typeof document==='undefined') return;
    this._ga=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('js',new Date());
    window.gtag('config',this.GA_ID,{anonymize_ip:true});
    // Po cofnięciu i ponownym udzieleniu zgody skrypt jest już w dokumencie —
    // drugi znacznik oznaczałby podwójne liczenie wejść w GA4.
    const src='https://www.googletagmanager.com/gtag/js?id='+this.GA_ID;
    if(document.querySelector('script[src="'+src+'"]')) return;
    const s=document.createElement('script');
    s.async=true; s.src=src;
    document.head.appendChild(s);
  }
  // do analityki trafia wyłącznie fakt zdarzenia — żadnych danych kontaktowych ani treści
  track(name,params){
    if(this.state.anaConsent!=='yes') return;
    try{ window.gtag&&window.gtag('event',name,params||{}); }catch(e){}
  }
  anaSet=v=>{
    try{ localStorage.setItem(this.ANA_KEY,v); }catch(e){}
    this.setState({anaConsent:v});
    if(v==='yes'){
      try{ window['ga-disable-'+this.GA_ID]=false; }catch(e){}
      this.loadGA();
      try{ window.gtag&&window.gtag('consent','update',{analytics_storage:'granted'});
        window.gtag&&window.gtag('event','analytics_consent'); }catch(e){}
      return;
    }
    // cofnięcie zgody musi faktycznie zatrzymać pomiar, nie tylko zmienić napis
    try{
      window['ga-disable-'+this.GA_ID]=true;
      window.gtag&&window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied'});
      document.cookie.split(';').forEach(c=>{
        const k=c.split('=')[0].trim();
        if(k==='_ga'||k.indexOf('_ga_')===0||k==='_gid'||k.indexOf('_gat')===0)
          document.cookie=k+'=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      });
      this._ga=false;
    }catch(e){}
  };
  // numer zgłoszenia nadawany po stronie aplikacji — do czasu automatycznej proformy
  refNo(){
    const d=new Date(), p=n=>String(n).padStart(2,'0');
    return 'DKM-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'
      +p(d.getHours())+p(d.getMinutes())+p(d.getSeconds())+'-'
      +String(Math.floor(Math.random()*900)+100);
  }
  submitForm(kind){
    // blokuje i wysyłkę w toku, i okno potwierdzenia — inaczej odruchowe drugie
    // dotknięcie przycisku „✓ wysłane” generuje kolejne zamówienie z nowym numerem
    if(this.state.sending||this.state.sentOk) return;
    const S=this.state,c=S.c,order=kind==='order';
    const ref=this.refNo();
    const body=this.mailBody(order?'order':undefined);
    const payload={
      _subject:(order?'ZAMÓWIENIE':'ZAPYTANIE OFERTOWE')+' '+ref+' — przekładnie ślimakowe ('+S.rfq.length+' poz.)',
      numer_zgloszenia:ref,
      rodzaj:order?'Zamówienie':'Zapytanie ofertowe',
      imie:c.first||'',nazwisko:c.last||'',
      firma:c.firm||'—',nip:c.nip||'—',
      email:c.email||'',telefon:c.phone||'',
      adres_dostawy:(c.street||c.zip||c.city)
        ?[c.street,[c.zip,c.city].filter(Boolean).join(' ')].filter(Boolean).join(', '):'—',
      dostawa:order?(S.del==='odbior'?'Odbiór osobisty':'Kurier / spedycja'):'—',
      platnosc:order?(S.pay==='pobranie'?'Za pobraniem':'Proforma'):'—',
      pozycje:S.rfq.map(x=>this.tradeOf(x).name+' · '+x.box+' · i '+x.i
        +(x.p1!=null?(' · '+num(x.p1)+' kW'):'')
        +(x.fs?(' · fs '+x.fs):'')+' · '+x.qty+' szt.').join('\n'),
      wiadomosc:body
    };
    this.setState({sending:true,sendFail:false,sendErr:'',sentOk:false,sentRef:'',mailText:body});
    // Bez limitu czasu wolne albo niedostępne Formspree potrafi wisieć minutami,
    // a klient widzi tylko wygaszony przycisk i nie wie, czy zamówienie poszło.
    // Po 20 s przerywamy i pokazujemy panel awaryjny z treścią do skopiowania.
    const ctrl=(typeof AbortController!=='undefined')?new AbortController():null;
    const timedOut={v:false};
    const timer=setTimeout(()=>{ timedOut.v=true; try{ ctrl&&ctrl.abort(); }catch(e){} },20000);
    fetch(this.FORM_URL,{method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify(payload),
      ...(ctrl?{signal:ctrl.signal}:{})})
      .then(r=>{ clearTimeout(timer); if(!r.ok) throw new Error('HTTP '+r.status); return r.json().catch(()=>({})); })
      .then(()=>{
        this.track(order?'submit_order':'submit_rfq',order?{payment:S.pay||'proforma'}:{});
        this.setState({sending:false,sentOk:true,sentRef:ref,ordered:order});
        // potwierdzenie pojawia się pod przyciskiem — na telefonie bywa poza ekranem
        setTimeout(()=>{ try{
          const el=document.querySelector('[data-sent-panel]');
          if(el&&el.scrollIntoView) el.scrollIntoView({block:'center',behavior:'smooth'});
        }catch(e){} },60);
        clearTimeout(this._doneT);
        this._doneT=order
          ?setTimeout(()=>{
            try{ localStorage.removeItem('dkm-rfq-v2'); }catch(e){}
            this.setState({rfq:[],ordered:false,sentOk:false,sentRef:'',screen:'home',
              c:{first:'',last:'',firm:'',nip:'',email:'',phone:'',note:'',street:'',zip:'',city:''},
              accepted:false,rfqStep:1});
          },5000)
          // zapytanie nie czyści koszyka, ale panel musi zgaśnąć, żeby klient mógł
          // wysłać następne po poprawieniu pozycji
          :setTimeout(()=>this.setState({sentOk:false,sentRef:''}),8000);
      })
      .catch(()=>{
        clearTimeout(timer);
        this.setState({sending:false,mailText:body,
          sendErr:timedOut.v
            ? 'Wysyłka trwała zbyt długo i została przerwana — zamówienie NIE zostało wysłane. '
              +'Sprawdź połączenie i spróbuj ponownie albo skopiuj treść poniżej i wyślij ją na '
              +(this.props.rfqEmail||'sklep@d-k-m.eu')+'.'
            : 'Nie udało się wysłać formularza. Sprawdź połączenie z internetem i spróbuj ponownie. Jeżeli problem się powtarza, skopiuj treść i wyślij ją na '
              +(this.props.rfqEmail||'sklep@d-k-m.eu')+'.'});
      });
  }

  componentDidMount(){
    this._pScreen=this.state.screen; this._pRfq=this.state.rfq;
    try{const r=localStorage.getItem('dkm-rfq-v2'); if(r) this.setState({rfq:this.hydrate(JSON.parse(r)||[])});}catch(e){}
    this._hydrated=true;
    try{const h=localStorage.getItem('dkm-hist-v1'); if(h) this.setState({hist:JSON.parse(h)||[]});}catch(e){}
    try{ this.mq=window.matchMedia('(min-width:900px)');
      this.onMq=e=>this.setState({wide:e.matches});
      this.setState({wide:this.mq.matches});
      this.mq.addEventListener?this.mq.addEventListener('change',this.onMq):this.mq.addListener(this.onMq);
    }catch(e){}
    try{const a=localStorage.getItem(this.ANA_KEY);
      if(a==='yes'||a==='no'){ this.setState({anaConsent:a}); if(a==='yes') this.loadGA(); }
    }catch(e){}
  }
  componentWillUnmount(){ try{ this.mq&&(this.mq.removeEventListener?this.mq.removeEventListener('change',this.onMq):this.mq.removeListener(this.onMq)); }catch(e){} clearTimeout(this._doneT); }
  priceForItem(row,iecPick){
    const list=this.variants(row);
    if(!list.length) return {boxNet:null,motNet:null,motName:'',iec:String(row.flange||''),iecPick:null};
    const sorted=list.slice().sort((a,b)=>
      (a.v.status-b.v.status)||((a.v.setNet||a.v.gearNet||1e9)-(b.v.setNet||b.v.gearNet||1e9)));
    const pref=this.prefFlange(row);
    const prefHit=pref&&list.find(x=>x.type===pref);
    const hit=(iecPick&&list.find(x=>x.fl===iecPick))
      ||((prefHit&&prefHit.v.status<=sorted[0].v.status&&prefHit.v.gearNet!=null)?prefHit:null);
    const p=hit||sorted[0];
    return {boxNet:p.v.gearNet!=null?p.v.gearNet:null,
      motNet:p.v.motNet!=null?p.v.motNet:null,
      motName:p.v.motName||'',iec:p.fl,iecPick:p.fl};
  }
  refreshExtras(list,box){
    return (list||[]).map(e=>{
      if(e.off) return e;
      if(/^INV/.test(e.code)){
        const f=e.sku?this.invById(e.sku):null;
        return f?{...e,net:f[4],stock:f[5]>0}:e;
      }
      if(e.code==='PCV') return e;
      const o=this.optOf(e.code,box);
      // brak kodu w cenniku → zostaw dotychczasową cenę, nie kasuj jej po cichu
      return o?{...e,net:o.net,stock:o.q>0}:e;
    });
  }
  hydrate(rfq){
    // ceny i stany liczymy ZAWSZE z aktualnego price-data.js — ze storage bierzemy
    // tylko decyzje klienta: ilość, „z silnikiem”, wariant przyłącza i wyposażenie
    const stamp=((window.DKM_PRICE||{}).updated)||'';
    const out=rfq.map(x=>{
      const row=CAT().find(rr=>this.key(rr)===this.baseKey(x.k));
      if(!row) return {...x,withMotor:x.withMotor!==false,extras:x.extras||[]};
      const band=this.fsBand(row.fs);
      const ph=this.phOfKey(x.k)||(x.ph===1?1:3);
      const one=ph===1?this.mot1f(row):null;
      return {...x,...this.priceForItem(row,x.iecPick),
        ...(x.boreOpt==null?this.boreMigrate(row.box):{}),
        ...(x.boreOpt?{boxNet:null}:{}),
        ph,
        ...(one?{motNet:one.net,motName:one.name,motSku:one.sku}:{}),
        fs:fs1(row.fs),fsRaw:row.fs,fsBand:band,noWty:band==='low',
        gearSku:x.gearSku||this.gearSkuOf(row),
        motSku:one?one.sku:(ph===1?'':(x.motSku||((this.pickVar(row)||{v:{}}).v.motSku||''))),
        scope:this.scopeOf(x),withMotor:this.scopeOf(x)!=='gear',
        extras:this.refreshExtras(x.extras,row.box),stamp};
    });
    return out;
  }
  persist(rfq){ try{localStorage.setItem('dkm-rfq-v2',JSON.stringify(rfq));}catch(e){} }
  snapKey(s){ return [s.p1,s.i,s.n2Exact,s.box,s.rpmSel,s.m2,s.n2,s.fsMinSel,s.mode].join('|'); }
  saveHist(){
    const S=this.state; if(S.screen!=='results') return;
    const k=this.snapKey(S); if(k===this.lastHist) return;
    const parts=[];
    if(S.p1!=null) parts.push('P₁ '+num(S.p1)+' kW');
    if(S.i!=null) parts.push('i = '+num(S.i));
    if(S.n2Exact!=null) parts.push('n₂ '+num(S.n2Exact)+' obr/min');
    if(this.numIn(S.m2)!=null) parts.push('M₂ ≥ '+num(this.numIn(S.m2))+' Nm');
    if(S.box!=null) parts.push(S.box);
    if(S.fsMinSel!=null) parts.push(S.fsMinSel==='below'?'fs < 1,0':'fs ≥ '+fs1(S.fsMinSel));
    if(!parts.length) return;
    this.lastHist=k;
    const snap={k,label:parts.join(' · '),sub:this.matches().length+' '+plural(this.matches().length,'pozycja','pozycje','pozycji'),
      st:{p1:S.p1,i:S.i,n2Exact:S.n2Exact,box:S.box,rpmSel:S.rpmSel,m2:S.m2,n2:S.n2,fsMinSel:S.fsMinSel,mode:S.mode,load:S.load,hours:S.hours,z:S.z,temp:S.temp}};
    this.setState(s=>{const hist=[snap,...s.hist.filter(x=>x.k!==k)].slice(0,3);
      try{localStorage.setItem('dkm-hist-v1',JSON.stringify(hist));}catch(e){} return {hist};});
  }
  componentDidUpdate(){
    this.saveHist();
    if(this._hydrated&&this._pRfq!==this.state.rfq){ this._pRfq=this.state.rfq; this.persist(this.state.rfq); }
    if(this._pScreen!==this.state.screen){
      this._pScreen=this.state.screen;
      try{ window.scrollTo(0,0); document.documentElement.scrollTop=0; document.body.scrollTop=0; }catch(e){}
    }
  }
  askAdvisor=()=>{
    const S=this.state,to=this.props.rfqEmail||'sklep@d-k-m.eu',L=[];
    L.push('Proszę o pomoc w doborze przekładni ślimakowej.','','Szukane parametry:');
    if(S.p1!=null) L.push('· Moc silnika P₁ₙ: '+num(S.p1)+' kW');
    if(S.i!=null) L.push('· Przełożenie i: '+num(S.i));
    if(S.n2Exact!=null) L.push('· Prędkość obrotowa na wale wyjściowym n₂: '+num(S.n2Exact)+' obr/min');
    if(this.numIn(S.m2)!=null) L.push('· Moment obrotowy na wale wyjściowym M₂: min. '+num(this.numIn(S.m2))+' Nm');
    if(this.numIn(S.n2)!=null) L.push('· Prędkość obrotowa na wale wyjściowym n₂: ok. '+num(this.numIn(S.n2))+' obr/min');
    if(S.box!=null) L.push('· Typ przekładni: '+S.box);
    L.push('· Prędkość obrotowa silnika: '+(S.rpmSel==null?'dowolna':num(S.rpmSel)+' obr/min'));
    if(S.mode==='m2') L.push('· warunki pracy: obciążenie '+LOADS[S.load].k+' · '+HOURS[S.hours].h+' h/dobę · Z = '+S.z+' 1/h · '+TEMPS[S.temp].l+' → wymagane fs '+fs1(this.fsReqNum()));
    L.push('','PROPONOWANY DOBÓR — wymaga weryfikacji technicznej.','Katalog nie zawiera pozycji spełniającej te warunki — proszę o propozycję.','','Wysłano z aplikacji DKM Dobór przekładni ślimakowych.');
    window.location.href='mailto:'+to+'?subject='+encodeURIComponent('Prośba o dobór przekładni — brak pozycji w katalogu')+'&body='+encodeURIComponent(L.join('\n'));
  };
  setC(f,v){ this.setState(s=>({c:{...s.c,[f]:v}})); }
  qty(k,d){ this.setState(s=>{const rfq=s.rfq.map(x=>{
    if(x.k!==k) return x;
    const q=Math.max(1,x.qty+d);
    return {...x,qty:q,extras:(x.extras||[]).map(e=>e.qm?e:({...e,qty:q}))};
  });return {rfq};}); }
  exQtyChange(k,code,d){ this.setState(s=>{const rfq=s.rfq.map(x=>x.k!==k?x:
    ({...x,extras:(x.extras||[]).map(e=>e.code!==code?e:({...e,qty:Math.max(1,this.exQty(e)+d),qm:true}))}));
    return {rfq};}); }
  toggleMotor(k){ this.setState(s=>{const rfq=s.rfq.map(x=>x.k===k?{...x,withMotor:!x.withMotor}:x);return {rfq};}); }
  // masy z cennika (wt): silnik po SKU, korpus po wielko\u015bci, wyposa\u017cenie po KOD|KORPUS
  WT(){ return ((window.DKM_PRICE||{}).wt)||{}; }
  kgGear(box){ const t=this.WT().gear||{}; return t[box]||0; }
  kgMot(sku){ const t=this.WT().mot||{}; return t[sku]||0; }
  kgOpt(code,box){ const t=this.WT().opt||{}; return t[code+'|'+box]||0; }
  kgInv(sku){ const t=this.WT().inv||{}; return t[sku]||0; }
  // PCV pomijamy w masie \u2014 os\u0142ona wa\u017cy tyle, \u017ce nie zmienia podzia\u0142u paczek
  kgExtra(e,box){
    const code=String(e.code||'');
    if(code==='PCV') return 0;
    if(/^INV/.test(code)) return this.kgInv(e.sku);
    return this.kgOpt(code,box);
  }
  lineWeight(x){
    const g=this.gQty(x), m=this.mQty(x);
    let kg=g*this.kgGear(x.box)+m*this.kgMot(x.motSku);
    if(g>0) (x.extras||[]).filter(e=>!e.off).forEach(e=>{
      kg+=(e.qty==null?1:e.qty)*this.kgExtra(e,x.box);
    });
    return kg;
  }
  // Wysy\u0142ka \u2014 cennik DKM (26.08.2026), kwoty netto:
  //   kurier: paczka do 31 kg 25 z\u0142, 31\u201340 kg 40 z\u0142
  //   spedycja (Raben): 40\u2013100 kg 130 z\u0142, 100\u2013150 kg 180 z\u0142, powy\u017cej \u2014 wycena
  //   pobranie +5 z\u0142; od 3000 z\u0142 netto towaru wysy\u0142ka gratis
  // Dzielimy na paczki, gdy wychodzi taniej ni\u017c jedna przesy\u0142ka spedycj\u0105.
  SPED=['DKM110','DKM130','DKM150'];
  SHIP_FREE=3000; SHIP_COD=5; PACK_MAX=40; PACK_CHEAP=31;
  // pojedyncze sztuki do pakowania \u2014 nie da si\u0119 podzieli\u0107 silnika ani korpusu
  shipItems(){
    const out=[];
    this.state.rfq.forEach(x=>{
      const g=this.gQty(x), m=this.mQty(x);
      const kgG=this.kgGear(x.box), kgM=this.kgMot(x.motSku);
      for(let i=0;i<g;i++) out.push({kg:kgG,sped:this.SPED.indexOf(x.box)>=0});
      for(let i=0;i<m;i++) out.push({kg:kgM,sped:false});
      if(g>0) (x.extras||[]).filter(e=>!e.off).forEach(e=>{
        const kg=this.kgExtra(e,x.box), q=e.qty==null?1:e.qty;
        for(let i=0;i<q;i++) if(kg>0) out.push({kg,sped:false});
      });
    });
    return out;
  }
  packCost(kg){ return kg<=this.PACK_CHEAP?25:(kg<=this.PACK_MAX?40:null); }
  // first-fit decreasing przy limicie 31 kg \u2014 sztuki nie da si\u0119 podzieli\u0107
  packFFD(items,limit){
    if(items.some(kg=>kg>limit)) return null;
    const bins=[];
    items.slice().sort((a,b)=>b-a).forEach(kg=>{
      const i=bins.findIndex(x=>x+kg<=limit+1e-9);
      if(i>=0) bins[i]+=kg; else bins.push(kg);
    });
    return bins;
  }
  // Pr\u00f3g 31\u201340 kg (40 z\u0142) stosujemy TYLKO do pojedynczej sztuki, kt\u00f3rej nie da si\u0119 rozbi\u0107.
  // Reszta pakuje si\u0119 wed\u0142ug taniej regu\u0142y 31 kg.
  courierPlan(items){
    if(!items.length) return null;
    if(items.some(kg=>kg>this.PACK_MAX)) return null;      // za ci\u0119\u017ckie na kuriera
    const heavy=items.filter(kg=>kg>this.PACK_CHEAP);      // ka\u017cda osobn\u0105 paczk\u0105 po 40 z\u0142
    const light=items.filter(kg=>kg<=this.PACK_CHEAP);
    const bins=light.length?this.packFFD(light,this.PACK_CHEAP):[];
    if(bins==null) return null;
    const all=heavy.concat(bins);
    const costs=all.map(kg=>this.packCost(kg));
    if(!all.length||costs.some(c=>c==null)) return null;
    return {packs:all.length,net:costs.reduce((a,c)=>a+c,0),
      bins:all.map(kg=>Math.round(kg*10)/10)};
  }
  // cennik spedycji startuje od 40 kg \u2014 ni\u017cej nie jest alternatyw\u0105
  spedCost(kg){ if(kg<=this.PACK_MAX) return null; return kg<=100?130:(kg<=150?180:null); }
  shipPlan(){
    const R=this.state.rfq;
    const items=this.shipItems();
    const kg=Math.round(items.reduce((a,x)=>a+x.kg,0)*10)/10;
    // ka\u017cda sztuka musi mie\u0107 mas\u0119 \u2014 zerowa masa silnika zani\u017ca\u0142aby koszt
    const known=R.length>0&&R.every(x=>{
      if(this.gQty(x)>0&&!(this.kgGear(x.box)>0)) return false;
      if(this.mQty(x)>0&&!(this.kgMot(x.motSku)>0)) return false;
      if(this.gQty(x)===0) return true;
      return (x.extras||[]).filter(e=>!e.off&&e.code!=='PCV')
        .every(e=>this.kgExtra(e,x.box)>0);
    });
    const mustSped=items.some(x=>x.sped);
    const cour=mustSped?null:this.courierPlan(items.map(x=>x.kg));
    const sp=this.spedCost(kg);
    let mode='', net=null, tier='', packs=0;
    if(!known){ tier='masa do potwierdzenia'; }
    else if(cour&&(sp==null||cour.net<=sp)){
      mode='kurier'; net=cour.net; packs=cour.packs;
      tier='kurier \u00b7 '+cour.packs+' '+plural(cour.packs,'paczka','paczki','paczek')
        +' ('+cour.bins.map(b=>num(b)+' kg').join(' + ')+')'
        +((sp!=null&&cour.packs>1)?' \u2014 taniej ni\u017c spedycja':'');
    } else if(sp!=null){
      mode='spedycja'; net=sp; packs=1;
      tier='spedycja (Raben) \u00b7 '+(kg<=100?'40\u2013100 kg':'100\u2013150 kg')+' \u2014 zam\u00f3wienie do 9:00';
    } else { tier='powy\u017cej 150 kg \u2014 wycena indywidualna'; }
    const cod=this.state.pay==='pobranie'&&net!=null?this.SHIP_COD:0;
    const free=net!=null&&this.cartGoods()>=this.SHIP_FREE;
    return {kg,known,mode,packs,tier,sped:mode==='spedycja',
      base:net,cod,net:free?cod:(net==null?null:net+cod),free};
  }
  cartGoods(){ return this.state.rfq.reduce((a,x)=>a+this.lineTotal(x),0); }
  cartNet(){ const sp=this.shipPlan(); return this.cartGoods()+(sp.net||0); }
  cartMissing(){ return this.state.rfq.some(x=>{
    if(this.gQty(x)>0&&x.boxNet==null) return true;
    if(this.mQty(x)>0&&x.motNet==null) return true;
    return (x.extras||[]).some(e=>!e.off&&e.net==null);
  }); }
  DELS={kurier:'Kurier'};
  PAYS={proforma:'Proforma — przedpłata',pobranie:'Za pobraniem — u kuriera'};
  itemStatus(x){
    if(x.boreOpt) return 2;
    const row=CAT().find(rr=>this.key(rr)===this.baseKey(x.k)); if(!row) return 2;
    const list=this.variants(row); if(!list.length) return 2;
    const hit=x.iecPick&&list.find(y=>y.fl===x.iecPick);
    return (hit||list[0]).v.status;
  }
  // przycisk zapytania ma sens tylko wtedy, gdy coś czeka na wycenę albo na termin
  showQuote(){
    return this.cartMissing()||this.state.rfq.some(x=>this.itemStatus(x)!==0);
  }
  canOrder(){ return this.state.rfq.length>0&&!this.cartMissing(); }
  mailBody(mode){
    const S=this.state,c=S.c,L=[],order=mode==='order';
    L.push(order?'ZAMÓWIENIE — przekładnie ślimakowe DKM':'Zapytanie ofertowe — przekładnie ślimakowe DKM',
      'Wszystkie ceny podane poniżej są cenami NETTO (bez podatku VAT).','');
    const low=S.rfq.filter(x=>x.noWty);
    if(low.length){
      L.push('=========================================================',
        'UWAGA: ZAMÓWIENIE PRZEKŁADNI Z fs PONIŻEJ 1,0',
        '=========================================================');
      low.forEach(x=>{
        L.push('Przekładnia: '+x.box+' · i '+x.i,
          'SKU przekładni: '+(x.gearSku||'—'),
          'Silnik: '+x.p1+' kW'+(x.rpm?(' · '+x.rpm+' obr/min'):'')+(x.iec?(' · '+x.iec):''),
          'SKU silnika: '+(x.motSku||'—'),
          'Współczynnik pracy: fs = '+x.fs,
          'Status: poza zalecanym zakresem',
          'Dobrowolna gwarancja handlowa DKM Power Transmission Sp. z o.o.: nieudzielona',
          'Akceptacja ostrzeżenia technicznego: '+((x.consent&&x.consent.a)?'tak':'NIE'),
          'Akceptacja braku dobrowolnej gwarancji handlowej: '+((x.consent&&x.consent.b)?'tak':'NIE'),
          'Data i godzina akceptacji: '+((x.consent&&x.consent.at)||'brak'),
          'Wersja warunków: '+((x.consent&&x.consent.ver)||this.CONSENT_V),'');
      });
      L.push('Metoda realizacji: '+(this.PAYS[S.pay]||'—'),
        'Informacja czytelna dla pracownika realizującego zamówienie.','');
    }
    const bopt=S.rfq.filter(x=>x.boreOpt);
    if(bopt.length){
      L.push('=========================================================',
        'UWAGA: WYKONANIE SPECJALNE — NIESTANDARDOWA TULEJA DRĄŻONA',
        '=========================================================');
      bopt.forEach(x=>{
        L.push('Przekładnia: '+x.box+' · i '+x.i,
          'Oznaczenie wykonania standardowego: '+(x.gearSku||'—'),
          'Tuleja drążona wału wyjściowego: ⌀ '+x.boreD+' mm'+(x.boreStdD?(' (standard ⌀ '+x.boreStdD+' mm)'):''),
          'Status: NIEDOSTĘPNA Z MAGAZYNU — wykonanie specjalne, inne SKU',
          'Dane techniczne (P₁, M₂, i, n₂, fs): identyczne jak w wykonaniu standardowym',
          'Do potwierdzenia przez DKM: cena, termin realizacji, oznaczenie katalogowe (SKU)','');
      });
    }
    S.rfq.forEach((x,ix)=>{
      L.push((ix+1)+'. '+this.tradeOf(x).tag+' — '+x.box+' — szt. '+x.qty);
      L.push('   przełożenie i = '+x.i+' · moment obrotowy M₂ '+x.m2+' Nm'+(x.n2?(' · prędkość obrotowa n₂ '+x.n2+' obr/min'):''));
      if(x.bore) L.push('   tuleja drążona '+x.bore);
      if(x.mount) L.push('   sposób mocowania: '+x.mount+(x.foot?(' · '+(x.footLabel||'rozstaw')+' '+x.foot):'')
        +(x.bolt?(' · otwory ØR '+x.bolt.r+' · typowa śruba '+x.bolt.s):''));
      if(x.face) L.push('   '+x.face);
      if(x.arm) L.push('   ramię reakcyjne: '+x.arm);
      if(x.shaft) L.push('   wał zdawczy: '+x.shaft);
      if(x.flange2) L.push('   '+x.flange2);
      if(x.acc) L.push('   akcesoria: '+x.acc);
      const band=x.fsBand||this.fsBand(x.fsRaw!=null?x.fsRaw:x.fs);
      L.push('   silnik '+(x.p1?(x.p1+' kW'):'')+(x.rpm?(' · '+x.rpm+' obr/min'):'')+(x.iec?(' · przyłącze '+x.iec):''));
      if(x.gearSku) L.push('   SKU przekładni: '+x.gearSku);
      if(x.motSku) L.push('   SKU silnika: '+x.motSku);
      L.push('   współczynnik pracy przekładni: '+(band==='none'?'brak danych':('fs = '+x.fs))
        +' — '+this.FS_META[band].label);
      if(band==='low'){
        L.push('   >>> Bez dobrowolnej gwarancji handlowej DKM Power Transmission Sp. z o.o. — świadomy wybór klienta.',
          '       Akceptacja ograniczeń technicznych: '+((x.consent&&x.consent.a)?'tak':'NIE'),
          '       Akceptacja zakupu bez gwarancji handlowej: '+((x.consent&&x.consent.b)?'tak':'NIE'),
          '       Data akceptacji: '+((x.consent&&x.consent.at)||'brak'));
      } else if(band==='mid'){
        L.push('   >>> Wymagana weryfikacja rzeczywistych warunków pracy. Gwarancja na standardowych warunkach.');
      } else if(band==='none'){
        L.push('   >>> Brak danych do określenia fs — prosimy o weryfikację doboru.');
      }
      const gq=this.gQty(x), mq=this.mQty(x);
      if(gq>0) L.push('   przekładnia: '+gq+' szt. × '+(x.boxNet!=null?(zl(x.boxNet)+' netto'):'cena na zapytanie'));
      if(mq>0){ L.push('   silnik '+(x.motName||'')+': '+mq+' szt. × '+(x.motNet!=null?(zl(x.motNet)+' netto'):'cena na zapytanie'));
        L.push('   zasilanie silnika: '+(this.motVoltOf(x,{name:x.motName})||'do potwierdzenia')); }
      if(gq===0) L.push('   ZAKRES: sam silnik (bez przekładni)');
      else if(mq===0) L.push('   ZAKRES: sama przekładnia (bez silnika)');
      (x.extras||[]).filter(e=>!e.off)
        .forEach(e=>{const q=this.exQty(e);
          L.push('   '+e.label+' — '+q+' szt. × '+(e.net===0?'gratis':(e.net!=null?(zl(e.net)+' / szt.'):'na zapytanie'))
            +(e.net?(' = '+zl(e.net*q)):''));});
      L.push('   wartość pozycji netto: '+zl(this.lineTotal(x)));
      L.push('');
    });
    const net=this.cartNet();
    if(net){
      const sp=this.shipPlan();
      L.push('— Wysyłka —');
      L.push('masa zamówienia: '+num(sp.kg)+' kg');
      L.push('sposób: '+(sp.sped?'spedycja (Raben) — zamówienie do 9:00':'kurier')+' — '+sp.tier);
      L.push('koszt netto: '+(sp.free?'gratis (zamówienie powyżej 3 000 zł netto)':(sp.net==null?'do wyceny':zl(sp.net)))
        +(sp.cod?(' — w tym pobranie '+zl(sp.cod)):''));
      if(!sp.known) L.push('UWAGA: część pozycji bez masy w cenniku — wycenić wysyłkę ręcznie');
      L.push('');
      L.push('— Podsumowanie —');
      L.push('Razem netto: '+zl(net));
      L.push('VAT 23%: '+zl2(net*0.23));
      L.push('Razem brutto: '+zl2(net*1.23));
      if(this.cartMissing()) L.push('Uwaga: część pozycji bez ceny w cenniku — proszę o wycenę.');
      L.push('');
    }
    if(low.length){
      L.push('— Warunki zakupu przekładni poza zalecanym zakresem —');
      low.forEach(x=>{
        L.push('Klient wybrał przekładnię '+x.box+', SKU '+(x.gearSku||'—')+', w zestawieniu z silnikiem '
          +x.p1+' kW, dla którego współczynnik pracy wynosi fs = '+x.fs+', czyli poniżej 1,0.');
        L.push('Przed złożeniem zamówienia klient został poinformowany, że przy pełnym wykorzystaniu znamionowej mocy silnika przekładnia może zostać przeciążona oraz że DKM Power Transmission Sp. z o.o. nie rekomenduje pracy tego zestawienia przy pełnym obciążeniu.');
        L.push('Klient świadomie zaakceptował zakup wskazanej przekładni bez dobrowolnej gwarancji handlowej DKM Power Transmission Sp. z o.o.');
        L.push('Data i godzina akceptacji: '+((x.consent&&x.consent.at)||'brak')+'.');
        L.push('Adnotacja do pozycji: Przekładnia bez dobrowolnej gwarancji handlowej DKM Power Transmission Sp. z o.o. — fs = '+x.fs+', świadomy wybór klienta.','');
      });
      L.push('Treść zaakceptowanych oświadczeń:','1) '+this.CONSENT_A,'2) '+this.CONSENT_B,
        'Brak dobrowolnej gwarancji handlowej dotyczy wyłącznie wskazanych przekładni i tego zamówienia. Nie obejmuje silników, falowników, kołnierzy, wałów ani innych akcesoriów.',
        'Brak dobrowolnej gwarancji handlowej nie ogranicza uprawnień ani odpowiedzialności, których zgodnie z obowiązującymi przepisami nie można wyłączyć.','');
    }
    if(S.rfq.some(x=>(x.fsBand||this.fsBand(x.fsRaw))==='mid'))
      L.push('Część pozycji ma współczynnik pracy fs w zakresie 1,0–1,3 — wybrana konfiguracja wymaga sprawdzenia rzeczywistych warunków pracy.','');
    const person=[c.first,c.last].filter(Boolean).join(' ')||c.name||'';
    L.push('— Dane kontaktowe —');
    if(c.firm||c.nip){
      L.push('Firma: '+(c.firm||'—'));
      L.push('NIP: '+(c.nip||'—'));
    } else L.push('Klient: osoba prywatna');
    L.push('Osoba: '+(person||'—'));
    L.push('E-mail: '+(c.email||'—'));
    L.push('Telefon: '+(c.phone||'—'));
    if(c.street||c.zip||c.city)
      L.push('Adres dostawy: '+[c.street,[c.zip,c.city].filter(Boolean).join(' ')].filter(Boolean).join(', '));
    if(c.note) L.push('','Uwagi: '+c.note);
    if(order){
      L.push('','— Zamówienie —');
      L.push('Dostawa: '+(this.DELS[S.del]||'—'));
      L.push('Płatność: '+(this.PAYS[S.pay]||'—'));
      if(this.cartMissing()) L.push('','Część pozycji nie ma ceny w cenniku — proszę o wycenę i doliczenie ich do proformy.');
      L.push('',S.pay==='pobranie'
        ? 'Proszę o potwierdzenie zamówienia i wysyłkę za pobraniem.'
        : 'Proszę o wystawienie faktury proforma i potwierdzenie terminu wysyłki.');
    }
    L.push('','Wysłano z aplikacji DKM Dobór przekładni ślimakowych.',
      'DKM Power Transmission Sp. z o.o. · ul. 3 Maja 20, 87-640 Czernikowo · NIP 879-268-87-36',
      'sklep@d-k-m.eu · +48 512 082 994 · +48 516 645 907',
      '© 2026 DKM Power Transmission Sp. z o.o. — wszelkie prawa zastrzeżone. Wyniki doboru mają charakter pomocniczy i wymagają weryfikacji technicznej.',
      'Nadawca potwierdził zapoznanie się z Ważną informacją techniczną, Regulaminem aplikacji (wersja 1.0 z 20.08.2026) oraz Polityką prywatności.');
    return L.join('\n');
  }
  send=()=>{
    if(!this.state.rfq.length) return;
    if(!this.state.accepted){ this.setState({acceptErr:true}); return; }
    this.submitForm('rfq');
  };
  order=()=>{
    const S=this.state,c=S.c;
    if(!S.rfq.length) return;
    const miss=[];
    if(!c.first) miss.push('imię');
    if(!c.last) miss.push('nazwisko');
    if(c.firm&&!c.nip) miss.push('NIP (uzupełnij razem z nazwą firmy)');
    if(c.nip&&!c.firm) miss.push('nazwa firmy (uzupełnij razem z NIP-em)');
    if(!c.phone) miss.push('telefon');
    if(!c.email) miss.push('e-mail');
    if(S.del!=='odbior'){
      if(!c.street) miss.push('ulica i numer');
      if(!c.zip) miss.push('kod pocztowy');
      if(!c.city) miss.push('miejscowość');
    }
    if(!S.del) miss.push('sposób dostawy');
    if(!S.pay) miss.push('forma płatności');
    if(!S.accepted) miss.push('akceptacja regulaminu');
    if(miss.length){ this.setState({orderErr:'Do złożenia zamówienia brakuje: '+miss.join(', ')+'.'}); return; }
    // przekładnie z fs < 1,0 wymagają zapisanej świadomej zgody klienta
    const pend=S.rfq.filter(x=>x.noWty&&!x.consent);
    if(pend.length){ this.setState({orderErr:'Aby kontynuować, potwierdź zapoznanie się z ograniczeniami technicznymi i warunkami zakupu dla: '
      +pend.map(x=>x.box+' (fs = '+x.fs+')').join(', ')+'.'}); return; }
    this.setState({orderErr:''});
    this.submitForm('order');
  };  dispatch=(to,subj,body)=>{
    // 1) natywne udostępnianie (działa też w przeglądarkach wbudowanych w WhatsApp/Messenger)
    if(navigator.share){
      try{
        const p=navigator.share({title:subj,text:subj+'\n\n'+body});
        if(p&&p.then){
          p.then(()=>{ this.setState({sent:true}); setTimeout(()=>this.setState({sent:false}),4000); })
           .catch(()=>this.mailFallback(to,subj,body));
          return;
        }
      }catch(e){ /* niezabezpieczony kontekst — idziemy dalej */ }
    }
    this.mailFallback(to,subj,body);
  };
  mailFallback=(to,subj,body)=>{
    const url='mailto:'+to+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);
    let left=false;
    const mark=()=>{ left=true; };
    window.addEventListener('blur',mark,{once:true});
    document.addEventListener('visibilitychange',mark,{once:true});
    try{
      const a=document.createElement('a');
      a.href=url; a.target='_blank'; a.rel='noopener';
      document.body.appendChild(a); a.click(); a.remove();
    }catch(e){ /* obsłuży panel awaryjny */ }
    this.setState({sent:true});
    setTimeout(()=>{
      window.removeEventListener('blur',mark);
      // jeśli żaden program pocztowy nie przejął kliknięcia — pokaż panel awaryjny
      this.setState({sent:false,sendFail:!left&&!document.hidden,mailText:body});
    },1400);
  };
  copyRfq=()=>{
    const t=this.mailBody();
    const done=()=>{ this.setState({copied:true}); setTimeout(()=>this.setState({copied:false}),3000); };
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(done).catch(()=>this.copyLegacy(t,done)); }
    else this.copyLegacy(t,done);
  };
  copyLegacy=(t,done)=>{
    const ta=document.createElement('textarea');
    ta.value=t; ta.style.cssText='position:fixed;left:-9999px;top:0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try{ document.execCommand('copy'); done(); }catch(e){}
    ta.remove();
  };
  key(r){ return r.box+r.motor+r.i+r.n2; }
  fsChart(){
    const S=this.state, L=LOADS[S.load], t=Math.log10(S.z/5)/Math.log10(20);
    return r1(L.lo+(L.hi-L.lo)*t+HOURS[S.hours].add);
  }
  fsReqNum(){ const S=this.state;
    // na ekranie warunków liczę wykres od razu, żeby wymagane fs aktualizowało się na żywo
    if(!(S.mode==='m2'||S.condDone||S.screen==='v3cond')) return this.props.fsMin ?? 1.0;
    const m=TEMPS[S.temp].m; return m==null?this.fsChart():r1(this.fsChart()*m); }
  numIn(v){ const n=parseFloat(String(v).replace(',','.')); return isFinite(n)&&n>0?n:null; }

  inStock(r){
    if(this.boreIsOpt(r.box)) return false;
    const p=this.pickVar(r);
    return !!(p&&p.v.status===0);
  }
  matches(skip){
    const S=this.state, m2=this.numIn(S.m2), n2=this.numIn(S.n2), fsReq=this.fsReqNum();
    const on=f=>skip!==f;
    let rows=CAT().filter(r=>
      (!on('p1')||S.p1==null||r.p1===S.p1)&&
      (!on('i')||S.i==null||r.i===S.i)&&
      (!on('n2')||S.n2Exact==null||r.n2===S.n2Exact)&&
      (!on('bore')||S.boreSel==null||this.boxFitsBore(r.box,S.boreSel))&&
      (!on('box')||S.box==null||r.box===S.box)&&
      (!on('rpm')||S.rpmSel==null||r.rpm===S.rpmSel)&&
      (m2==null||r.m2>=m2)&&
      (n2==null||Math.abs(r.n2-n2)/n2<=0.3)&&
      (!on('fs')||fsPass(r.fs,S.fsMinSel))&&
      (!on('stock')||!S.stockOnly||this.inStock(r))&&
      (!on('ph')||S.motPh!==1||this.has1F(r))&&
      (!on('low')||!S.hideLow||this.fsBand(r.fs)!=='low'));
    if(m2!=null) rows.sort((a,b)=>(b.fs>=fsReq)-(a.fs>=fsReq)||(a.m2-m2)-(b.m2-m2));
    else rows.sort((a,b)=>a.i-b.i||a.m2-b.m2);
    return rows;
  }

  facet(f){
    if(f==='bore'){
      const pool=this.matches('bore'), m=new Map(), std=new Set();
      pool.forEach(r=>{
        const b=(window.DKM_BORE||{})[r.box]; if(!b) return;
        const add=d=>m.set(d,(m.get(d)||0)+1);
        add(b.std); std.add(b.std); (b.opt||[]).forEach(add);
      });
      const vals=[...m.keys()].sort((a,b)=>a-b);
      // optOnly: ta średnica nie występuje jako tuleja standardowa w żadnej pozycji z puli
      return vals.map(v=>({v,count:m.get(v),optOnly:!std.has(v)}));
    }
    const key={p1:'p1',i:'i',n2:'n2',box:'box',rpm:'rpm'}[f];
    const pool=this.matches(f), m=new Map();
    pool.forEach(r=>{ const v=r[key]; if(v==null) return; m.set(v,(m.get(v)||0)+1); });
    const vals=[...m.keys()].sort((a,b)=>f==='box'?String(a).localeCompare(String(b)):(f==='n2'||f==='rpm'?b-a:a-b));
    return vals.map(v=>({v,count:m.get(v)}));
  }

  HKEYS=['p1','i','n2Exact','box','rpmSel','boreSel','borePick','m2','n2','fsMinSel','screen','mode','sel','refine'];
  snap(){
    const s=this.state, o={};
    this.HKEYS.forEach(k=>{ o[k]=s[k]; });
    return o;
  }
  pushHist(next){
    const S=this.state, h=(S.ustack||[]).concat([this.snap()]).slice(-25);
    // Po wybraniu wartości kryterium klient przechodzi najpierw przez zawężenie
    // (Karta A) i warunki pracy (Karta B) — lista pojawia się dopiero po nich.
    const patch={...next};
    if(patch.screen==='results'&&!S.flowDone&&!patch.flowDone) patch.screen='v3refine';
    this.setState({...patch,ustack:h});
  }
  stepBack=()=>{
    const h=(this.state.ustack||[]).slice();
    const prev=h.pop();
    if(!prev) return;
    this.setState({...prev,ustack:h});
  };
  fieldOf(f){ return {p1:'p1',i:'i',n2:'n2Exact',box:'box',rpm:'rpmSel',bore:'boreSel'}[f]; }
  setField(f,v){ const p={sel:null}; p[this.fieldOf(f)]=v; this.pushHist(p); }

  // Potwierdzone serie zamienników (lista ostateczna od DKM, 02.09.2026) — wyłącznie
  // te sześć oznaczeń dostaje plakietkę „Odpowiednik DKM”. Wcześniejsza, szersza lista
  // (MRV, NRV, RV, PM, WI, RMI, UMI, MR, TM, VF, W) została zawężona: bez potwierdzenia
  // wymiarów nie twierdzimy, że dany wyrób jest zamiennikiem.
  ALT_SERIES=['NMRV','CMI','PMRV','SMI','VMR','WMI'];
  NO_NUM_MAP=[];
  // Oznaczenia wprost wykluczone z listy zamienników. „PM” jest prefiksem „PMRV”,
  // więc bez tej listy „PM40” dostawałoby plakietkę „Odpowiednik DKM”. Samo „pm” bez
  // numeru nadal prowadzi do listy rozmiarów PMRV — blokujemy tylko konkretny numer.
  EXCLUDED=['MRV','NRV','RV','PM','WI','RMI','UMI','MR','TM','VF','W'];
  // wyszukiwarka: oznaczenie DKM, odpowiednik innej serii, SKU falownika albo silnika
  searchHits(q){
    const s=String(q||'').trim().toUpperCase(); if(s.length<2) return [];
    const out=[];
    const digits=s.replace(/[^0-9]/g,'');  // cyfry z zapytania — nie mylić z num() formatującym liczby
    const letters=s.replace(/[^A-Z]/g,'');
    // marka rozpoznawana już po pierwszych literach: „vm” → VMR, „wm” → WMI/WI.
    // Dokładne trafienie ma pierwszeństwo, żeby „W” nie stało się WMI.
    const exact=this.ALT_SERIES.indexOf(letters)>=0?letters:null;
    // prefiks marki dopiero od dwóch liter — jedna litera to nie oznaczenie serii
    const cand=letters.length>=2?this.ALT_SERIES.filter(x=>x.indexOf(letters)===0):[];
    // wykluczone oznaczenie z podanym numerem idzie zwykłą ścieżką, bez plakietki zamiennika
    const blocked=this.EXCLUDED.indexOf(letters)>=0;
    const series=exact||(cand.length?cand[0]:null);
    const noMapHit=exact
      ?(this.NO_NUM_MAP.indexOf(exact)>=0?[exact]:[])
      :cand.filter(x=>this.NO_NUM_MAP.indexOf(x)>=0);
    const noMap=noMapHit.length>0;
    // numer rozmiaru jako prefiks, bez zer wiodących po obu stronach:
    // „3” → 030, „63” → 063, „15” → 150. Niejednoznaczny „1” daje 110, 130 i 150.
    const nz=v=>String(v).replace(/^0+/,'')||'0';
    const numN=nz(digits);
    const hasNum=!!digits&&numN!=='0';
    const boxes=[...new Set(CAT().map(r=>r.box))].sort();
    const cnt=b=>CAT().filter(r=>r.box===b).length;
    const go=b=>()=>this.reset({screen:'results',mode:null,box:b,rpmSel:null,flowDone:true});
    // sama nazwa serii bez rozmiaru (albo seria, której numeracji nie mapujemy)
    // — zamiast „nie znalazłem” dajemy wybór rozmiaru
    if(series&&(!hasNum||noMap)){
      const note=noMap?('Numeracja '+noMapHit.join(' / ')+' nie odpowiada 1:1 rozmiarom DKM — dobierz rozmiar po wymiarach montażowych.'):'';
      boxes.forEach(b=>{const n=cnt(b);
        out.push({label:b,tag:noMap?'Rozmiar DKM':'Odpowiednik DKM',note,
          sub:'Rozmiar '+b.replace('DKM','')+' · '+n+' '+plural(n,'zestawienie','zestawienia','zestawień'),
          go:go(b)});});
      return out.slice(0,12);
    }
    boxes.forEach(b=>{
      const bn=b.replace('DKM','');
      const byNum=hasNum&&nz(bn).indexOf(numN)===0;
      if(b.indexOf(s)<0&&!byNum) return;
      const n=cnt(b), alt=!!series&&!(blocked&&hasNum)&&byNum;
      out.push({label:b,tag:alt?'Odpowiednik DKM':'Przekładnia DKM',
        sub:(alt?('Zamiennik korpusu '+s+' — zweryfikuj wymiary przed zamówieniem · '):'')
          +n+' '+plural(n,'zestawienie','zestawienia','zestawień')+' w katalogu',
        go:go(b)});
    });
    const inv=((window.DKM_PRICE||{}).inv||[]).filter(f=>String(f[0]).toUpperCase().indexOf(s)>=0).slice(0,3);
    inv.forEach(f=>out.push({label:f[0],tag:'Falownik '+f[1],
      sub:num(f[2])+' kW · '+(f[3]===1?'1 × 230 V':'3 × 400 V')+' · dodasz go na karcie zestawu',
      go:()=>this.setState({screen:'home'})}));
    const nam=((window.DKM_PRICE||{}).nam)||{};
    Object.keys(nam).filter(k=>String(k).toUpperCase().indexOf(s)>=0).slice(0,3)
      .forEach(k=>out.push({label:k,tag:'Silnik',sub:nam[k],go:()=>this.setState({screen:'home'})}));
    return out.slice(0,6);
  }
  group(f,label,unit,cols){
    const cur=this.state[this.fieldOf(f)];
    // na telefonie węższe siatki — 6 kolumn na 390 px daje 52 px na kafelek,
    // czyli mniej niż wygodny obszar dotyku i łamiące się liczby
    const nCols=this.state.wide?cols:({p1:3,i:4,n2:3,box:2,bore:3,rpm:3}[f]||3);
    const fmt=v=>f==='box'?String(v):(f==='bore'?('⌀ '+num(v)):num(v));
    const opts=[{v:null,l:'wszystkie',c:null}].concat(this.facet(f).map(o=>({v:o.v,l:fmt(o.v),c:o.count,optOnly:o.optOnly})))
      .map(o=>{const on=cur===o.v, any=o.v==null;
        return {label:o.l,count:o.c==null?'':(f==='rpm'&&o.v===1400?o.c+' · std':String(o.c)),optOnly:!!o.optOnly,
          // pełne granatowe wypełnienie tylko dla świadomie wybranej wartości;
          // „wszystkie” = brak zawężenia, więc dostaje sam obrys
          bg:(on&&!any)?V('accent'):'transparent',
          fg:(on&&!any)?V('bg'):((on&&any)?V('accent'):V('text')),
          bd:on?V('accent'):V('divider'),
          cg:(on&&!any)?'rgba(255,255,255,.7)':V('neutral-500'),
          go:()=>this.setField(f,o.v)};});
    return {label:label,unit:unit,cols:String(nCols),opts,f,cur};
  }

  // 'flange' w katalogu występuje w dwóch formatach:
  //   '71B5/B14'      — jeden rozmiar IEC, dwa typy kołnierza
  //   '112B5/132B5'   — dwa różne rozmiary IEC (wspólne przyłącze przekładni)
  flangeList(r){
    const raw=String(r.flange||'').trim(); if(!raw) return [];
    const segs=raw.split('/'); let iec=null; const out=[];
    segs.forEach(seg=>{
      const m=/^(\d+)?(B\d+)$/.exec(seg.trim()); if(!m) return;
      if(m[1]) iec=m[1];
      if(!iec) return;
      out.push({fl:iec+m[2],iec:iec,type:m[2]});
    });
    return out;
  }
  varOf(r,fl){
    const Vv=(window.DKM_PRICE||{}).var||{};
    const e=Vv[[r.box,fl,r.i,r.p1,r.rpm].join('|')];
    if(!e) return null;
    return {gearNet:e[0],gearQ:e[1],motNet:e[2],motQ:e[3],setNet:e[4],setQ:e[5],status:e[6],
      motSku:e[7],motName:(((window.DKM_PRICE||{}).nam)||{})[e[7]]||''};
  }
  // wybrany wariant przy\u0142\u0105cza: r\u0119czny wyb\u00f3r klienta, inaczej dost\u0119pny/ta\u0144szy
  variants(r){
    return this.flangeList(r).map(f=>({...f,v:this.varOf(r,f.fl)})).filter(x=>x.v);
  }
  // domy\u015blne przy\u0142\u0105cze: DKM025\u2013090 do 1,5 kW \u2192 B14, DKM110\u2013150 \u2192 B5
  prefFlange(r){
    if(['DKM110','DKM130','DKM150'].indexOf(r.box)>=0) return 'B5';
    if(['DKM025','DKM030','DKM040','DKM050','DKM063','DKM075','DKM090'].indexOf(r.box)>=0
      && +r.p1<=1.5) return 'B14';
    return null;
  }
  pickVar(r){
    const list=this.variants(r);
    if(!list.length) return null;
    const want=this.state.flangePick;
    const hit=want&&list.find(x=>x.fl===want);
    if(hit) return hit;
    const sorted=list.slice().sort((a,b)=>
      (a.v.status-b.v.status)||((a.v.setNet||a.v.gearNet||1e9)-(b.v.setNet||b.v.gearNet||1e9)));
    const pref=this.prefFlange(r);
    const prefHit=pref&&list.find(x=>x.type===pref);
    // preferencja tylko wtedy, gdy nie pogarsza dost\u0119pno\u015bci ani nie gubi ceny
    if(prefHit&&prefHit.v.status<=sorted[0].v.status&&prefHit.v.gearNet!=null) return prefHit;
    return sorted[0];
  }
  optOf(code,box){
    const e=(((window.DKM_PRICE||{}).opt)||{})[code+'|'+box];
    return e?{net:e[0],q:e[1]}:null;
  }
  // --- falowniki: kandydaci to moc równa mocy silnika i jeden stopień wyżej
  motorPhases(r){
    const m=r?this.motorOf(r):null;
    return /1\s*fazow/i.test((m&&m.name)||'')?1:3;
  }
  invList(r){ return this.invListFor(this.state.invPhase,r?r.p1:0); }
  // wspólna reguła: w KAŻDEJ serii moc dopasowana i jeden stopień wyżej, E500 przed E280
  invListFor(ph,p1){
    const all=(window.DKM_PRICE||{}).inv||[];
    if(!ph) return [];
    const fit=all.filter(x=>x[3]===ph&&x[2]>=this.numOf(p1)-1e-9);
    if(!fit.length) return [];
    // w KAŻDEJ serii bierzemy moc dopasowaną i jeden stopień wyżej
    const out=[];
    [...new Set(fit.map(x=>x[1]))].forEach(ser=>{
      const inSer=fit.filter(x=>x[1]===ser);
      const steps=[...new Set(inSer.map(x=>x[2]))].sort((a,b)=>a-b).slice(0,2);
      inSer.filter(x=>steps.indexOf(x[2])>=0).forEach(x=>out.push(x));
    });
    return out.sort((a,b)=>(a[1]==='E500'?-1:1)-(b[1]==='E500'?-1:1)||(a[2]-b[2]));
  }
  invById(sku){ return ((window.DKM_PRICE||{}).inv||[]).find(x=>x[0]===sku)||null; }
  PCV_FREE=['DKM030','DKM040','DKM050','DKM063','DKM075','DKM090'];
  pcvFree(box){ return this.PCV_FREE.indexOf(box)>=0; }
  extrasFor(box){
    const S=this.state,out=[];
    const add=(code,label)=>{ const e=this.optOf(code,box);
      out.push({code,label,net:e?e.net:null,stock:e?e.q>0:false}); };
    if(this.mountsHas('2a')) add('FA','Ko\u0142nierz boczny FA');
    if(this.mountsHas('2b')) add('FB','Ko\u0142nierz boczny FB');
    if(this.mountsHas('3')) add('ARM','Rami\u0119 reakcyjne');
    (S.acc||[]).forEach(a=>{
      if(a==='DS') add('DS','Wa\u0142 zdawczy dwustronny');
      else if(a==='SS') add('SS','Wa\u0142 zdawczy jednostronny');
      else if(a==='PCV'&&!this.pcvFree(box)) out.push({code:'PCV',label:'Os\u0142ona PCV',net:null,stock:false});
    });
    if(this.pcvFree(box)) out.push({code:'PCV',label:'Os\u0142ona PCV \u2014 w standardzie',net:0,stock:true});
    if(S.inv){
      const f=this.invById(S.inv);
      if(f) out.push({code:'INV',net:f[4],stock:f[5]>0,sku:f[0],
        label:'Falownik '+f[1]+' '+num(f[2])+' kW · '+(f[3]===1?'1 × 230 V':'3 × 400 V')+' · '+f[0]});
    }
    return out;
  }
  OPT_LABELS={FA:'Kołnierz boczny FA',FB:'Kołnierz boczny FB',ARM:'Ramię reakcyjne',
    SS:'Wał zdawczy jednostronny',DS:'Wał zdawczy dwustronny',PCV:'Osłona PCV'};
  // dobieranie wyposażenia wprost w zamówieniu — bez powrotu na kartę
  addExtra(k,code){ this.setState(s=>{
    const rfq=s.rfq.map(x=>{ if(x.k!==k) return x;
      const cur=(x.extras||[]).slice();
      const i=cur.findIndex(e=>e.code===code);
      if(i>=0){ cur[i]={...cur[i],off:false}; return {...x,extras:cur}; }
      if(/^INV/.test(code)){
        const f=this.invForItem(code==='INV1'?1:3,x.p1);
        if(!f) return x;
        cur.push({code,label:this.invLabel(f),sku:f[0],net:f[4],stock:f[5]>0,qty:1});
        return {...x,extras:cur};
      }
      const free=code==='PCV'&&this.pcvFree(x.box);
      const op=this.optOf(code,x.box);
      cur.push({code,label:this.OPT_LABELS[code]+(free?' — w standardzie':''),
        net:free?0:(op?op.net:null),stock:free?true:(op?op.q>0:false),qty:1});
      return {...x,extras:cur};
    });
    return {rfq};}); }
  numOf(v){ const n=parseFloat(String(v==null?'':v).replace(',','.')); return isFinite(n)?n:0; }
  invForItem(ph,p1){ return this.invListFor(ph,p1)[0]||null; }
  invLabel(f){ return 'Falownik '+f[1]+' '+num(f[2])+' kW · '+(f[3]===1?'1 × 230 V':'3 × 400 V')+' · '+f[0]; }
  addableFor(x){
    const have=(x.extras||[]).filter(e=>!e.off).map(e=>e.code);
    // ta sama reguła co na karcie produktu: część musi istnieć dla tej wielkości
    // dokładnie ta sama reguła co kafelki na karcie produktu:
    // filtrujemy tylko kołnierze (katalog ich tam nie przewiduje);
    // ramię, wały i osłona są zawsze do zamówienia — bez ceny jako „na zapytanie”
    const exists=c=>(c!=='FA'&&c!=='FB')
      ||!!this.optOf(c,x.box)||!!(((window.DKM_FLANGE||{})[c]||{})[x.box]);
    const out=['FA','FB','ARM','SS','DS','PCV'].filter(c=>have.indexOf(c)<0&&exists(c))
      .map(c=>{ const free=c==='PCV'&&this.pcvFree(x.box); const op=this.optOf(c,x.box);
        return {code:c,label:this.OPT_LABELS[c],
          price:free?'gratis':(op?(zl(op.net)+' netto'):'cena na zapytanie')}; });
    // falowniki — osobno na 3 × 400 V i 1 × 230 V, można dobrać oba
    // fazę starego wpisu 'INV' ustalamy z jego SKU — nie zakładamy 400 V
    const legacy=(x.extras||[]).filter(e=>!e.off&&e.code==='INV')
      .map(e=>{const f=e.sku?this.invById(e.sku):null; return f?f[3]:3;});
    if(!/1\s*fazow/i.test(x.motName||'')) [[3,'INV3','Falownik 400 V'],[1,'INV1','Falownik 230 V']].forEach(([ph,code,label])=>{
      if(have.indexOf(code)>=0||legacy.indexOf(ph)>=0) return;
      const f=this.invForItem(ph,x.p1); if(!f) return;
      out.push({code,label:label+' · '+num(f[2])+' kW',price:zl(f[4])+' netto'});
    });
    return out;
  }
  exQty(e){ return e.qty==null?1:e.qty; }
  extrasNet(list){ return (list||[]).reduce((a,x)=>a+((x.off||x.net==null)?0:x.net*this.exQty(x)),0); }
  scopeOf(x){ return x.scope||(x.withMotor===false?'gear':'set'); }
  // przekładnia i silnik mają własne ilości — np. 2 przekładnie i 1 silnik z zestawu
  // jedna liczba tylko gdy przek\u0142adnia i silnik id\u0105 w parze \u2014 inaczej oba liczniki
  qtyLabel(x){
    const g=this.gQty(x), m=this.mQty(x);
    if(g===0) return m+' \u00d7 silnik';
    if(m===0) return g+' \u00d7 przek\u0142adnia';
    if(g===m) return g+' szt.';
    return g+' \u00d7 przek\u0142adnia + '+m+' \u00d7 silnik';
  }
  gQty(x){ return x.gq==null?(this.scopeOf(x)==='motor'?0:x.qty):x.gq; }
  mQty(x){ return x.mq==null?(this.scopeOf(x)==='gear'?0:x.qty):x.mq; }
  setPartQty(k,which,v){ this.setState(s=>{
    const rfq=s.rfq.map(x=>{ if(x.k!==k) return x;
      const g=this.gQty(x), m=this.mQty(x);
      let gq=which==='g'?Math.max(0,Math.min(99,v)):g;
      let mq=which==='m'?Math.max(0,Math.min(99,v)):m;
      if(gq===0&&mq===0) return x;            // pozycja nie mo\u017ce zosta\u0107 pusta
      const sc=gq>0&&mq>0?'set':(mq>0?'motor':'gear');
      return {...x,gq,mq,scope:sc,withMotor:mq>0,qty:Math.max(1,gq,mq)};
    });
    return {rfq};}); }
  partQty(k,which,d){ this.setState(s=>{
    const rfq=s.rfq.map(x=>{ if(x.k!==k) return x;
      const g=this.gQty(x), m=this.mQty(x);
      let gq=which==='g'?Math.max(0,Math.min(99,g+d)):g;
      let mq=which==='m'?Math.max(0,Math.min(99,m+d)):m;
      const sc=gq>0&&mq>0?'set':(mq>0?'motor':'gear');
      return {...x,gq,mq,scope:sc,withMotor:mq>0,qty:Math.max(1,gq,mq)};
    });
    return {rfq};}); }
  // podstawa (przek\u0142adnia + silnik) mno\u017cy si\u0119 przez ilo\u015b\u0107 pozycji,
  // wyposa\u017cenie ma w\u0142asne ilo\u015bci \u2014 np. 2 zestawy i 3 ko\u0142nierze
  lineBase(x){ return (x.boxNet||0)*this.gQty(x)+(x.motNet||0)*this.mQty(x); }
  lineTotal(x){ return this.lineBase(x)+this.extrasNet(x.extras); }
  lineNet(x){ return this.lineTotal(x); }
  setScope(k,sc){ this.setState(s=>{const rfq=s.rfq.map(x=>{ if(x.k!==k) return x;
      const n=Math.max(1,this.gQty(x),this.mQty(x));
      const gq=sc==='motor'?0:n, mq=sc==='gear'?0:n;
      return {...x,scope:sc,withMotor:mq>0,gq,mq,qty:n};
    });
    return {rfq};}); }
  toggleExtra(k,code){ this.setState(s=>{const rfq=s.rfq.map(x=>x.k!==k?x:
    ({...x,extras:(x.extras||[]).map(e=>e.code===code?{...e,off:!e.off}:e)}));
    return {rfq};}); }
  // napi\u0119cie wy\u0142\u0105cznie z opisu handlowego w cenniku \u2014 nic nie domy\u015blamy
  voltOf(name){
    const t=String(name||'').replace(/\s+/g,' ');
    const d=/(\d{3})\s*\/\s*(\d{3})\s*v/i.exec(t);
    if(d) return d[1]+'/'+d[2]+' V';
    const s1=/(?:U-)?(\d{1}\s*[x\u00d7]\s*)?(\d{3})\s*v/i.exec(t);
    if(s1) return s1[2]+' V';
    return null;
  }
  voltLabel(name){ return this.voltOf(name)||'napi\u0119cie potwierdzimy'; }
  // silniki 1-fazowe z cennika s\u0105 w ca\u0142o\u015bci na 230 V \u2014 opis nie zawsze to pisze
  motVoltOf(r,mot){
    const n=(mot&&mot.name)||'';
    if(/1\s*fazow/i.test(n)) return this.voltOf(n)||'230 V';
    // 3-fazowe: opis z cennika, a gdy go brak \u2014 regu\u0142a DKM (do 3 kW 230/400 V, wy\u017cej 400/690 V)
    const kw=parseFloat(String(r&&r.p1).replace(',','.'));
    return this.voltOf(n)||(isFinite(kw)?(kw<=3?'230/400 V':'400/690 V'):null);
  }
  // silniki 1-fazowe z cennika: klucz kW|obr/min|IEC+ko\u0142nierz
  // silniki 1-fazowe z cennika: dopasowanie po mocy, obrotach i rozmiarze IEC
  // (cennik opisuje ko\u0142nierz z \u0142apami: B34 = B14 + \u0142apy, B35 = B5 + \u0142apy)
  // silniki 1-fazowe z cennika: klucz to moc i obroty; ko\u0142nierz dobieramy najlepiej pasuj\u0105cy
  // (cennik opisuje ko\u0142nierz z \u0142apami: B34 = B14 + \u0142apy, B35 = B5 + \u0142apy)
  m1fList(r){
    const T=(window.DKM_PRICE||{}).m1f||{};
    const kw=parseFloat(String(r&&r.p1).replace(',','.'));
    const rpm=String(r&&r.rpm);
    return Object.keys(T).filter(k=>{const p=k.split('|');
      return parseFloat(p[0])===kw && String(p[1])===rpm;})
      .map(k=>{const v=T[k];return {key:k,fl:k.split('|')[2],sku:v[0],name:v[1],net:v[2],q:v[3]};});
  }
  // wyb\u00f3r 1-fazowego dotyczy wy\u0142\u0105cznie otwartej karty \u2014 nie ca\u0142ego katalogu
  isOpen(r){ const s=this.state.sel; return !!(r&&s&&this.key(r)===this.key(s)); }
  // wyb\u00f3r zasilania jest filtrem doboru: obowi\u0105zuje w ca\u0142ej aplikacji
  wants1F(r){ return this.state.motPh===1&&(!r||!!this.mot1f(r)); }
  has1F(r){ return !!this.mot1f(r); }
  phTag(r){ return this.motorPhases(r)===1?'1F':'3F'; }
  lineKey(r){ return this.key(r)+'|'+this.phTag(r); }
  baseKey(k){ return String(k||'').replace(/\|[13]F$/,''); }
  phOfKey(k){ return /\|1F$/.test(String(k||''))?1:(/\|3F$/.test(String(k||''))?3:null); }
  // nazwa handlowa pozycji \u2014 ekran, mail, proforma i wydruk czytaj\u0105 to samo
  tradeOf(x){
    const g=this.gQty(x), m=this.mQty(x);
    const oneF=/1\s*fazow/i.test(x.motName||'');
    if(g>0&&m>0) return {tag:'Motoreduktor '+(oneF?'1F':'3F'),
      name:'Silnik '+(x.p1||'')+' kW '+(x.rpm||'')+' obr/min + Przek\u0142adnia '+x.box+' i'+x.i};
    if(m>0&&!g) return {tag:'Silnik',name:'Silnik '+(x.p1||'')+' kW '+(x.rpm||'')+' obr/min'};
    return {tag:'Przek\u0142adnia',name:x.box+' i'+x.i};
  }
  mot1f(r){
    if(!r) return null;
    const list=this.m1fList(r); if(!list.length) return null;
    const p=this.pickVar(r);
    const want=[]; if(p&&p.fl) want.push(p.fl);
    this.flangeList(r).forEach(f=>{ if(want.indexOf(f.fl)<0) want.push(f.fl); });
    const alt=f=>String(f).replace(/B14$/,'B34').replace(/B5$/,'B35');
    for(const f of want){ const hit=list.find(x=>x.fl===f)||list.find(x=>x.fl===alt(f)); if(hit) return hit; }
    // brak silnika w zgodnym typie ko\u0142nierza \u2014 nie proponujemy nic:
    // B5 i B14 to r\u00f3\u017cne ko\u0142nierze, taki silnik nie przykr\u0119ci si\u0119 do przek\u0142adni
    return null;
  }
  m1fFor(r,fl){ return this.mot1f(r); }
  motorOf(r){
    if(this.wants1F(r)){ const o=this.mot1f(r); if(o) return o; }
    const p=this.pickVar(r);
    return (p&&p.v.motNet!=null)?{net:p.v.motNet,q:p.v.motQ,name:p.v.motName,sku:p.v.motSku}:null;
  }
  boxNetOf(r){
    if(this.boreIsOpt(r.box)) return null;
    const p=this.pickVar(r);
    return p&&p.v.gearNet!=null?p.v.gearNet:null;
  }
  gearSkuOf(r){ const p=this.pickVar(r); if(!p) return '';
    const b=this.boreFor(r.box);
    return r.box+' '+p.fl+' I'+num(r.i)+((b&&b.opt)?(' /D'+b.d):''); }
  // świadoma zgoda klienta — treść oświadczeń zapisywana razem z pozycją
  CONSENT_V='DKM-fs-1.1/2026-08';
  CONSENT_A='Potwierdzam, że zostałem poinformowany, iż przy współczynniku fs poniżej 1,0 i pełnym wykorzystaniu znamionowej mocy silnika może dojść do przeciążenia przekładni.';
  CONSENT_B='Potwierdzam, że świadomie wybieram zakup tej przekładni bez dobrowolnej gwarancji handlowej DKM Power Transmission Sp. z o.o., z zachowaniem uprawnień, których nie można wyłączyć na podstawie obowiązujących przepisów.';
  flangeOf(r){ const p=this.pickVar(r); return p?p.fl:String(r.flange||''); }
  priceOf(r){
    const w=this.state.wide, p=this.pickVar(r), v=p?p.v:null;
    const bOpt=this.boreIsOpt(r.box);
    const net=(!bOpt&&v&&v.gearNet!=null)?v.gearNet:null;
    const one=this.wants1F(r)?this.mot1f(r):null;
    const mot=one?{net:one.net,q:one.q,name:one.name}
      :((v&&v.motNet!=null)?{net:v.motNet,q:v.motQ,name:v.motName}:null);
    let aL='sprawdzamy',aC=V('neutral-700'),aD=V('neutral-400');
    if(bOpt){ aL='niedostępna — zapytaj'; aC=V('mid-ink'); aD=V('mid'); }
    else if(v){
      if(v.status===0){ aL='w magazynie'; aC=V('ok-ink'); aD=V('ok'); }
      else if(v.status===1){ aL='dostawa 1\u20133 dni'; aC=V('accent-700'); aD='var(--dkm-blue)'; }
      else { aL='zapytaj o cen\u0119'; aC=V('neutral-700'); aD=V('neutral-400'); }
    }
    return {priceLabel:net!=null?zl(net):(bOpt?'wykonanie na zapytanie':'cena na zapytanie'),
      priceFs:net!=null?(w?'25px/1':'21px/1'):(w?'15px/1.15':'13px/1.15'),
      priceColor:net!=null?V('accent-700'):V('neutral-700'),
      priceTt:net!=null?'none':'uppercase',priceLs:net!=null?'0':'.08em',
      motorLabel:mot?('+ '+zl(mot.net)):'+ silnik na zapytanie',
      motorFs:mot?(w?'16px/1.15':'14px/1.15'):(w?'12px/1.2':'11px/1.2'),
      motorColor:mot?V('accent'):V('neutral-500'),
      motorName:mot?mot.name:'',hasMotorPrice:!!mot,
      motQ:mot?mot.q:0,
      flangePicked:p?p.fl:String(r.flange||''),
      boxNet:net,motNet:mot?mot.net:null,
      boreOpt:bOpt,boreLine:this.boreTxt(r.box),
      boreNote:bOpt?('Tuleja drążona '+this.boreFor(r.box).d+' mm — wykonanie specjalne, niedostępne z magazynu.'):'',
      availLabel:aL,availColor:aC,availDot:aD};
  }
  // Współczynnik pracy przekładni fs — cztery zakresy przyjęte przez DKM Power Transmission Sp. z o.o. w konfiguratorze.
  // Klasyfikacja na wartości rzeczywistej (nieokrąglonej); zaokrąglenie tylko przy wyświetlaniu.
  // Dwie reguły, jedna klasyfikacja — identycznie jak w V4:
  //  • fs < 1,0 — przeciążenie przy znamionowej mocy silnika. Bezwzględne, niezależne
  //    od warunków pracy; to ono uruchamia zgodę i brak gwarancji.
  //  • fs < wymagane fs — za mały zapas dla zadeklarowanych warunków (minimum 1,2).
  fsBand(fs){
    const v=(fs===''||fs==null)?NaN:parseFloat(String(fs).replace(',','.'));
    if(!isFinite(v)) return 'none';
    if(v<1.0) return 'low';
    // Gdy klient podał warunki pracy, obowiązuje wynik wykresu — także gdy wypada
    // poniżej 1,2. Inaczej ekran mówiłby „wymagany fs ≥ 1,0”, a pozycja z fs 1,0
    // dostawała pomarańczowy status. Próg 1,2 zostaje jako domyślny bez warunków.
    return v<this.fsReqEff()?'mid':'ok';
  }
  // jeden wymagany zapas dla całej aplikacji — klasyfikacja pasm, karta PDF i teksty
  // muszą cytować tę samą liczbę, inaczej ekran mówi co innego niż wydruk
  fsReqEff(){ const S=this.state;
    return (S.mode==='m2'||S.condDone)?this.fsReqNum():1.2; }
  FS_META={
    ok:{order:0,label:'Dobór wstępnie odpowiedni',short:'wstępnie odpowiedni',icon:'✓',
      msg:'Zestawienie mieści się w przyjętym orientacyjnym zakresie doboru. Ostateczna przydatność zależy od rzeczywistych warunków pracy maszyny.'},
    mid:{order:1,label:'Wymagana weryfikacja zastosowania',short:'wymaga weryfikacji',icon:'!',
      msg:'Możliwość zastosowania zależy od rzeczywistego obciążenia maszyny, charakteru pracy, czasu pracy, liczby rozruchów i chwilowych przeciążeń.'},
    low:{order:2,label:'Poza zalecanym zakresem',short:'poza zalecanym zakresem',icon:'▲',
      msg:'Przy wykorzystaniu znamionowej mocy wybranego silnika przekładnia może zostać przeciążona. DKM Power Transmission Sp. z o.o. nie rekomenduje pracy tego zestawienia przy pełnej mocy silnika.'},
    none:{order:3,label:'Brak danych — wymagana weryfikacja',short:'brak danych',icon:'i',
      msg:'Na podstawie dostępnych danych nie można określić współczynnika pracy tego zestawienia.'}
  };
  fsColors(band){
    if(band==='low') return {ink:V('warn'),bg:V('warn'),fg:V('bg'),soft:V('warn-bg')};
    if(band==='mid') return {ink:V('mid-ink'),bg:V('mid'),fg:V('bg'),soft:V('mid-bg')};
    if(band==='none') return {ink:V('neutral-700'),bg:V('neutral-300'),fg:V('neutral-900'),soft:V('surface')};
    return {ink:V('ok-ink'),bg:V('ok-bg'),fg:V('ok-ink'),soft:V('ok-bg')};
  }
  decorate(r){
    const band=this.fsBand(r.fs), M=this.FS_META[band], C=this.fsColors(band);
    return {...r,...this.priceOf(r),fs:fs1(r.fs),m2:num(r.m2),n2:num(r.n2),i:num(r.i),p1:num(r.p1),fr2:String(r.fr2),
      rpmLabel:r.rpm?r.rpm+' obr/min':'silnik 1-biegowy',
      motVolt:this.motVoltOf(r,this.motorOf(r))||'napięcie potwierdzimy',
      phTag:'Motoreduktor '+this.phTag(r),
      // na telefonie kolumna nazwy ma ~100 px — pełny podpis łamał się na pięć linii,
      // więc kołnierz i napięcie zostają na karcie produktu
      rowSub:this.state.wide
        ?('Motoreduktor '+this.phTag(r)+' · '+num(r.p1)+' kW · '+(r.rpm?r.rpm+' obr/min':'silnik 1-biegowy')
          +' · '+r.flange+' · '+(this.motVoltOf(r,this.motorOf(r))||'napięcie potwierdzimy'))
        :(this.phTag(r)+' · '+num(r.p1)+' kW · '+(r.rpm?r.rpm+' obr/min':'1-biegowy')),
      fsBand:band,fsIcon:M.icon,fsStatus:M.label,fsShort:M.short,fsMsg:M.msg,
      fsIsLow:band==='low',fsIsMid:band==='mid',fsIsOk:band==='ok',fsIsNone:band==='none',
      noWty:band==='low',warn:band==='low',warnOnly:band==='mid',edge:band==='mid',
      note:M.short,noteColor:C.ink,fsBg:C.bg,fsFg:C.fg,fsSoft:C.soft,
      fsBorder:band==='low'?V('warn'):(band==='mid'?V('mid'):(band==='none'?V('neutral-300'):V('ok'))),
      fsNeedsAdvice:band==='mid'||band==='none',
      fsLabel:band==='none'?'fs —':('fs = '+fs1(r.fs))};
  }

  rfqStep(){ return this.state.rfqStep||1; }
  stepValid(n){
    const c=this.state.c||{};
    if(n===1) return this.state.rfq.length>0;
    if(n===2){
      const base=!!(String(c.first||'').trim()&&String(c.last||'').trim()
        &&/@/.test(String(c.email||''))&&String(c.phone||'').replace(/\D/g,'').length>=9);
      // adres wymagany tylko przy wysyłce — przy odbiorze osobistym służy do faktury
      if(this.state.del==='odbior') return base;
      return base&&!!(String(c.street||'').trim()&&String(c.zip||'').trim()&&String(c.city||'').trim());
    }
    return true;
  }
  goStep(n){
    if(n>this.rfqStep()){ for(let k=this.rfqStep();k<n;k++) if(!this.stepValid(k)){
      this.setState({rfqStep:k,stepErr:k}); return; } }
    this.setState({rfqStep:n,stepErr:0});
    try{const sc=document.scrollingElement||document.documentElement; if(sc) sc.scrollTop=0;
      const box=document.querySelector('[data-rfq-top]'); if(box&&box.parentElement) box.parentElement.scrollTop=0;}catch(e){}
  }
  confirmConsent=()=>{
    const S=this.state;
    if(!S.c1||!S.c2){ this.setState({consentErr:true}); return; }
    const now=new Date();
    const stamp=now.toLocaleDateString('pl-PL')+', '+now.toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'});
    this.pendingConsent={a:true,b:true,at:stamp,iso:now.toISOString(),
      ver:this.CONSENT_V,textA:this.CONSENT_A,textB:this.CONSENT_B};
    this.setState({consentErr:false});
    this.add();                       // add() zeruje c1/c2 po udanym dodaniu
  };
  add=()=>{
    const r=this.state.sel; if(!r) return;
    // przy fs < 1,0 zamówienie wymaga zapisanej zgody klienta
    const needs=this.fsBand(r.fs)==='low';
    if(needs&&!this.pendingConsent){ this.setState({screen:'consent',c1:false,c2:false,consentErr:false}); return; }
    const consent=needs?this.pendingConsent:null;
    this.pendingConsent=null;
    this.track('add_to_cart',{box:r.box});
    this.setState(s=>{
      const k=this.lineKey(r), hit=s.rfq.find(x=>x.k===k);
      const rfq=hit?s.rfq.map(x=>{
        if(x.k!==k) return x;
        // klient wrócił na kartę i dobrał wyposażenie — dopisujemy je do istniejącej pozycji
        const q=x.qty+1, gq=this.gQty(x)+1, mq=this.mQty(x)>0?this.mQty(x)+1:0;
        const cur=(x.extras||[]).slice();
        this.extrasFor(r.box).forEach(f=>{
          const i=cur.findIndex(e=>e.code===f.code);
          if(i<0) cur.push({...f,qty:1});
          else if(f.code==='INV'&&cur[i].sku!==f.sku) cur[i]={...f,qty:cur[i].qty||1};
          else cur[i]={...cur[i],off:false};   // ponowny wyb\u00f3r na karcie wraca do wyceny
        });
        return {...x,qty:q,gq,mq,scope:mq>0?'set':'gear',withMotor:mq>0,extras:cur,
          consent:x.consent||consent||null};
      })
        :[...s.rfq,{k,qty:1,box:r.box,motor:r.motor,rpm:r.rpm?num(r.rpm):'',bore:this.boreLabel(r.box),boreD:(this.boreFor(r.box)||{}).d||null,boreStdD:(this.boreFor(r.box)||{}).std||null,boreOpt:this.boreIsOpt(r.box),mount:this.mountLabel(),foot:this.mountDim(r.box),footLabel:this.mountDimLabel(),bolt:(this.mountsHas('1a')||this.mountsHas('1b'))?((window.DKM_BOLT||{})[r.box]||null):null,
          face:this.faceRows(r.box).map(f=>f.k+' '+f.v).join(' · '),
          arm:this.armRows(r.box).map(f=>f.k+' '+f.v).join(' · '),acc:this.accLabel()+(this.pcv(r.box)?(' (osłona M '+num(this.pcv(r.box))+' mm)'):''),
          shaft:this.shaftRows(r.box).map(f=>f.k+' '+f.v).join(' · '),
          flange2:['FA','FB'].filter(v=>this.mountsHas(v==='FA'?'2a':'2b'))
            .map(v=>{const rr=this.flangeRows(r.box,v);
              return rr.length?('kołnierz '+v+': '+rr.map(f=>f.k+' '+f.v).join(' · ')):'';})
            .filter(Boolean).join(' | '),i:num(r.i),m2:num(r.m2),n2:num(r.n2),p1:num(r.p1),
          fs:fs1(r.fs),fsRaw:r.fs,fsBand:this.fsBand(r.fs),noWty:this.fsBand(r.fs)==='low',
          gearSku:this.gearSkuOf(r),motSku:(this.motorOf(r)||{}).sku||'',consent,
          iec:this.flangeOf(r),iecPick:(this.pickVar(r)||{}).fl||null,
          ph:this.wants1F(r)?1:3,
          boxNet:this.boxNetOf(r),motNet:(this.motorOf(r)||{}).net||null,motName:(this.motorOf(r)||{}).name||'',withMotor:true,extras:this.extrasFor(r.box).map(e=>({...e,qty:1}))}];
      return {rfq,just:true,screen:'rfq',prevScreen:'detail',c1:false,c2:false,consentErr:false};
    });
    setTimeout(()=>this.setState({just:false}),4000);
  };

  cardSrc(box){
    // Direct path — no hidden preload element needed, so the browser only
    // fetches the one dimension card actually being viewed, not all 10.
    const m=String(box||'').match(/(\d{3})/); if(!m) return null;
    return this.A('karta-'+m[1]+'.jpg');
  }
  cardRatio(box){
    const m=String(box||'').match(/(\d{3})/); if(!m) return '1240 / 1752';
    return '1240 / 1752'; // all dimension-card scans share this page ratio
  }
  openCard(){ const src=this.cardSrc(this.state.sel&&this.state.sel.box); if(src) this.setState({card:src}); }
  // Tuleja drążona wału wyjściowego: średnica standardowa = wyrób magazynowy.
  // KAŻDA inna średnica to wykonanie specjalne — dane techniczne (P₁, M₂, i, n₂, fs)
  // są identyczne, zmienia się wyłącznie otwór, ale to osobny wyrób: inne SKU,
  // brak w magazynie, więc nigdy nie pokazujemy ceny ani dostępności.
  boreFor(box){
    const b=(window.DKM_BORE||{})[box]; if(!b) return null;
    const S=this.state, list=b.opt||[];
    const want=S.borePick!=null?S.borePick:S.boreSel;
    const d=(want!=null&&(want===b.std||list.indexOf(want)>=0))?want:b.std;
    const opt=d!==b.std;
    return {d,opt,std:b.std,optList:list,
      key:opt?((b.optKey||{})[d]||b.key||null):(b.key||null)};
  }
  boreIsOpt(box){ const x=this.boreFor(box); return !!(x&&x.opt); }
  boreTxt(box){ const x=this.boreFor(box); if(!x) return '';
    return '⌀ '+x.d+' H7 mm'+(x.key?(' · rowek wpustowy '+x.key+' mm'):''); }
  // pozycje zapisane w koszyku przed 27.08.2026 nie mają pól tulei. Migrujemy je na
  // wykonanie standardowe, rozwiązując średnicę z samego korpusu — nie z bieżącego
  // filtra, żeby odświeżenie nie przypisało klientowi wykonania na zapytanie.
  boreMigrate(box){
    const b=(window.DKM_BORE||{})[box]; if(!b) return {};
    return {bore:'⌀ '+b.std+' H7 mm'+(b.key?(' · rowek wpustowy '+b.key+' mm'):''),
      boreD:b.std,boreStdD:b.std,boreOpt:false};
  }
  bore(box){
    const b=(window.DKM_BORE||{})[box]; if(!b) return null;
    const ok=b.optKey||{};
    return {std:'⌀ '+b.std+' H7 mm',
      opt:(b.opt&&b.opt.length)?('⌀ '+b.opt.map(o=>o+(ok[o]?(' H7 mm · rowek '+ok[o]+' mm'):' H7 mm')).join(' / ⌀ ')+' na zapytanie'):'',
      key:b.key?(b.key+' mm'):''};
  }
  mountFlat(){
    const G=(window.DKM_MOUNT||[]);
    const out=[];
    G.forEach(g=>g.o.forEach(o=>out.push({...o,g:g.g})));
    return out;
  }
  mountDim(box){
    const b=box||(this.state.sel&&this.state.sel.box);
    const m=this.mountsHas('1a')?'1a':(this.mountsHas('1b')?'1b':this.mountId());
    if(!b) return '';
    if(m==='1a') return (window.DKM_FOOT||{})[b]||'';
    if(m==='1b') return (window.DKM_SIDE||{})[b]||'';
    return '';
  }
  faceRows(box){
    const b=box||(this.state.sel&&this.state.sel.box);
    if(!this.mountsHas('1c')||!b) return [];
    const f=(window.DKM_FACE||{})[b]; if(!f) return [];
    return [{k:'Zamek centrujący ⌀E',v:f.e},{k:'Rozstaw otworów ⌀H',v:f.h},
      {k:'Otwory gwintowane PE',v:f.pe},{k:'Kąt rozmieszczenia α',v:f.a}];
  }
  armRows(box){
    const b=box||(this.state.sel&&this.state.sel.box);
    if(!this.mountsHas('3')||!b) return [];
    const a=(window.DKM_ARM||{})[b]; if(!a) return [];
    return [{k:'K1',v:num(a.K1)+' mm'},{k:'G',v:num(a.G)+' mm'},{k:'KG',v:num(a.KG)+' mm'},
      {k:'KH',v:num(a.KH)+' mm'},{k:'R',v:num(a.R)+' mm'},{k:'B',v:num(a.B)+' mm'}];
  }
  flangeRows(box,variant){
    const b=box||(this.state.sel&&this.state.sel.box), fv=variant||this.flangeVariant();
    if(!b||!fv) return [];
    const t=(window.DKM_FLANGE||{})[fv]||{}, r=t[b];
    if(!r) return [];
    const K=window.DKM_FLANGE_KEYS||[];
    return r.map((v,ix)=>({k:K[ix]||'',v:(ix===0||String(v).indexOf('⌀')===0||v==='—')?String(v):(v+' mm')}));
  }
  pcv(box){
    const b=box||(this.state.sel&&this.state.sel.box);
    if(!b||(this.state.acc||[]).indexOf('PCV')<0) return null;
    return (window.DKM_PCV||{})[b]||null;
  }
  accList(){
    const out=[]; (window.DKM_ACC||[]).forEach(g=>g.o.forEach(o=>out.push({...o,g:g.g})));
    return out;
  }
  accLabel(){
    const sel=this.state.acc||[];
    return this.accList().filter(a=>sel.indexOf(a.id)>=0).map(a=>a.l).join(' · ');
  }
  toggleAcc(id){
    this.setState(s=>{
      const cur=s.acc||[]; let next;
      if(cur.indexOf(id)>=0) next=cur.filter(x=>x!==id);
      else if(id==='SS'||id==='DS') next=[...cur.filter(x=>x!=='SS'&&x!=='DS'),id];
      else next=[...cur,id];
      return {acc:next};
    });
  }
  shaftRows(box){
    const b=box||(this.state.sel&&this.state.sel.box);
    const on=(this.state.acc||[]).some(x=>x==='SS'||x==='DS');
    if(!on||!b) return [];
    const s=(window.DKM_SHAFT||{})[b]; if(!s) return [];
    const ds=(this.state.acc||[]).indexOf('DS')>=0;
    const len=ds?{k:'L₁',v:num((window.DKM_SHAFT_DS_L1||{})[b])+' mm'}:{k:'L',v:num(s.L)+' mm'};
    return [{k:'Ød h6',v:'Ø'+num(s.d)+' mm'},{k:'B',v:num(s.B)+' mm'},{k:'B₁',v:num(s.B1)+' mm'},
      {k:'G₁',v:num(s.G1)+' mm'},len,{k:'f',v:s.f},
      {k:'b₁',v:num(s.b1)+' mm'},{k:'t₁',v:num(s.t1)+' mm'}];
  }
  detCols(n){ if(n<2) return 'minmax(0,1fr)';
    if(n%3===0) return 'repeat(3,minmax(0,1fr))';
    if(n%2===0) return 'repeat(2,minmax(0,1fr))';
    return 'repeat('+n+',minmax(0,1fr))'; }
  accDetail(id){
    const b=this.state.sel&&this.state.sel.box;
    const empty={rows:[],note:'',img:'none',ratio:'3 / 2',hasImg:false,hasRows:false,detailTitle:''};
    if(!b||(this.state.acc||[]).indexOf(id)<0) return empty;
    if(id==='SS'||id==='DS'){
      const r=this.shaftRows(b); if(!r.length) return empty;
      return {...empty,detailTitle:'Wał zdawczy '+id+' · wymiary',rows:r,hasRows:true,
        img:'url("'+this.A('acc-'+id.toLowerCase()+'.png')+'")',ratio:id==='DS'?'520 / 291':'1240 / 604',hasImg:true};
    }
    if(id==='PCV'){
      const m=this.pcv(b); if(!m) return empty;
      return {...empty,detailTitle:'Osłona PCV · wymiar M',rows:[{k:'M',v:num(m)+' mm'}],hasRows:true,
        img:'url("'+this.A('acc-pcv.png')+'")',ratio:'1000 / 486',hasImg:true};
    }
    return empty;
  }
  boxFitsBore(box,d){
    const b=(window.DKM_BORE||{})[box]; if(!b) return false;
    return b.std===d||(b.opt||[]).indexOf(d)>=0;
  }
  mountDetail(id){
    const b=this.state.sel&&this.state.sel.box;
    const empty={rows:[],note:'',img:'none',ratio:'3 / 2',hasImg:false,hasRows:false,detailTitle:''};
    if(!b||!this.mountsHas(id)) return empty;
    if(id==='1a'||id==='1b'){
      const v=this.mountDim(b); if(!v) return empty;
      const bolt=(window.DKM_BOLT||{})[b]||{};
      return {...empty,detailTitle:this.mountDimLabel(),
        rows:[{k:id==='1b'?'(V+Q) × C₁':'C × C₁',v},
          ...(bolt.r?[{k:'Otwory montażowe ØR',v:bolt.r},{k:'Typowa śruba',v:bolt.s}]:[])],
        hasRows:true,
        note:'Oznaczenia wymiarów (C, C₁, V, Q, ØR) odpowiadają symbolom na karcie wymiarowej produktu powyżej. Wymiary podano w mm, rozstaw mierzony w osiach otworów.'
          +(bolt.r?' Dobór długości i klasy wytrzymałości śrub zależy od konstrukcji urządzenia oraz warunków obciążenia.':'')};
    }
    if(id==='1c'){
      const r=this.faceRows(b); if(!r.length) return empty;
      return {...empty,detailTitle:'Mocowanie czołowe · zamek centrujący i otwory gwintowane',rows:r,hasRows:true,
        note:'Oznaczenia (ØE, ØH, PE, α) odpowiadają symbolom na karcie wymiarowej produktu powyżej. Otwory gwintowane rozmieszczone na powierzchni czołowej korpusu wokół osi wału wyjściowego; pozycjonowanie względem konstrukcji maszyny zapewnia zamek centrujący ØE w tolerancji h7. Wymiary w mm, głębokość gwintu liczona od powierzchni czołowej.'};
    }
    if(id==='2a'||id==='2b'){
      const fa=id==='2a', vn=fa?'FA':'FB';
      const r=this.flangeRows(b,vn);
      return {...empty,detailTitle:'Kołnierz '+vn+(r.length?' · wymiary':''),
        rows:r,hasRows:r.length>0,
        note:r.length?'':('Kołnierz '+vn+' nie jest przewidziany dla wielkości '+b+'.'),
        img:'url("'+this.A('mount-flange-'+(fa?'fa':'fb')+'.png')+'")',ratio:'480 / 324',hasImg:true};
    }
    if(id==='3'){
      const r=this.armRows(b); if(!r.length) return empty;
      return {...empty,detailTitle:'Ramię reakcyjne · wymiary',rows:r,hasRows:true,
        img:'url("'+this.A('mount-arm.png')+'")',ratio:'727 / 552',hasImg:true};
    }
    return empty;
  }
  mountUnavailable(id){
    const b=this.state.sel&&this.state.sel.box; if(!b) return false;
    if(id==='2a') return !this.optOf('FA',b)&&!((window.DKM_FLANGE||{}).FA||{})[b];
    if(id==='2b') return !this.optOf('FB',b)&&!((window.DKM_FLANGE||{}).FB||{})[b];
    if(id==='1a') return !(window.DKM_FOOT||{})[b];
    if(id==='1b') return !(window.DKM_SIDE||{})[b];
    if(id==='1c') return !(window.DKM_FACE||{})[b];
    if(id==='3') return !(window.DKM_ARM||{})[b];
    return false;
  }
  mountsHas(id){ return (this.state.mounts||[]).indexOf(id)>=0; }
  mountId(){ return (this.state.mounts||[])[0]||null; }
  flangeVariant(){ return this.mountsHas('2a')?'FA':(this.mountsHas('2b')?'FB':''); }
  flangeVariants(){ return [this.mountsHas('2a')?'FA':null,this.mountsHas('2b')?'FB':null].filter(Boolean).join(' + '); }
  mountDimLabel(){ return this.mountsHas('1b')
    ? 'Mocowanie boczne · rozstaw osi otworów (V+Q) × C₁'
    : 'Mocowanie na podstawie · rozstaw osi otworów C × C₁'; }
  mountLabel(){
    const all=this.mountFlat();
    return (this.state.mounts||[]).map(id=>{const m=all.find(x=>x.id===id);return m?(m.g+' — '+m.l):'';})
      .filter(Boolean).join(' + ');
  }
  boreLabel(box){
    const x=this.boreFor(box); if(!x) return '';
    return this.boreTxt(box)+(x.opt
      ?' — WYKONANIE NA ZAPYTANIE (niedostępne z magazynu, inne SKU, cena i termin do potwierdzenia)'
      :'');
  }
  specRows(withMount){
    const s=this.state.sel; if(!s) return [];
    const bore=this.boreLabel(s.box);
    return [
      {k:'Typ przekładni',v:s.box},
      {k:'Przełożenie i',v:num(s.i)},
      {k:'Moment obrotowy na wale wyjściowym M₂ₙ',v:num(s.m2)+' Nm'},
      {k:'Prędkość obrotowa na wale wyjściowym n₂',v:num(s.n2)+' obr/min'},
      {k:'Współczynnik pracy przekładni fs',v:fs1(s.fs)},
      {k:'Moc silnika P₁ₙ',v:num(s.p1)+' kW'},
      {k:'Prędkość obrotowa silnika n₁',v:s.rpm?num(s.rpm)+' obr/min':'—'},
      {k:'Kołnierz przyłączeniowy',v:s.flange},
      {k:'Tuleja drążona wału wyjściowego',v:(this.bore(s.box)||{}).std||'—'},
      {k:'Rowek wpustowy',v:(this.bore(s.box)||{}).key||'—'},
      {k:'Sposób mocowania',v:this.mountLabel()||'do ustalenia'},
      ...(withMount&&this.accLabel()?[{k:'Akcesoria',v:this.accLabel()}]:[]),
      ...(withMount&&this.pcv(s.box)?[{k:'Osłona PCV · wymiar M',v:num(this.pcv(s.box))+' mm'}]:[]),
      ...(withMount&&this.mountDim(s.box)?[{k:this.mountDimLabel(),v:this.mountDim(s.box)},
        ...(((window.DKM_BOLT||{})[s.box]||{}).r?[
          {k:'Otwory montażowe ØR',v:(window.DKM_BOLT||{})[s.box].r},
          {k:'Typowa śruba montażowa',v:(window.DKM_BOLT||{})[s.box].s}]:[])]:[]),
      ...(withMount?this.faceRows(s.box):[]),
      ...(withMount?this.armRows(s.box).map(r=>({k:'Ramię reakcyjne '+r.k,v:r.v})):[]),
      ...(withMount?this.shaftRows(s.box).map(r=>({k:'Wał zdawczy '+r.k,v:r.v})):[]),
      ...(withMount?['FA','FB'].filter(v=>this.mountsHas(v==='FA'?'2a':'2b'))
        .flatMap(v=>this.flangeRows(s.box,v).map(r=>({k:'Kołnierz '+v+' · '+r.k,v:r.v}))):[]),
      {k:'Obciążenie promieniowe Fᵣ₂',v:s.fr2+' N'}
    ];
  }
  printWin(title,body){
    // wydruk w tej samej stronie — popupy są blokowane na telefonie i w pliku offline
    const old=document.getElementById('dkmPrint'); if(old) old.remove();
    let st=document.getElementById('dkmPrintCss');
    if(!st){ st=document.createElement('style'); st.id='dkmPrintCss';
      st.textContent="#dkmPrint{position:fixed;inset:0;z-index:99999;overflow:auto;background:#fff !important;color:#29265b;color-scheme:only light;-webkit-overflow-scrolling:touch;font-family:Barlow,system-ui,-apple-system,\"Segoe UI\",sans-serif}#dkmPrint *{box-sizing:border-box}#dkmPrint .bar{position:sticky;top:0;display:flex;gap:10px;align-items:center;padding:10px 14px;background:#29265b;color:#fff}#dkmPrint .bar b{flex:1;font-size:15px;font-weight:600}#dkmPrint .bar button{min-height:44px;padding:10px 16px;font:600 14px inherit;cursor:pointer;border:1px solid #fff;background:transparent;color:#fff}#dkmPrint .bar button.pri{background:#38b184;border-color:#38b184;color:#0f3d2c}#dkmPrint .pg{padding:0 14px 24px;max-width:820px;margin:0 auto}#dkmPrint img{max-width:100%;display:block}#dkmPrint h1{margin:18px 0 2px;font-size:30px;letter-spacing:.01em}#dkmPrint .sub{margin:0 0 4px;font-size:15px;color:#575e78}#dkmPrint .rule{height:4px;background:linear-gradient(90deg,#29265b 0 34%,#17529e 34% 67%,#38b184 67%);margin:12px 0 18px}#dkmPrint h2{margin:22px 0 6px;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#575e78}#dkmPrint table{width:100%;border-collapse:collapse}#dkmPrint td{padding:8px 0;border-bottom:1px solid rgba(41,38,91,.18);font-size:14px}#dkmPrint td+td{text-align:right;font-weight:600;font-variant-numeric:tabular-nums}#dkmPrint .note{margin-top:16px;padding:12px 14px;border-left:4px solid #29265b;background:#eef2fa;font-size:13px;line-height:1.5}#dkmPrint .note.bad{border-color:#c62828;background:#c62828;color:#fff}#dkmPrint .hd{display:flex;align-items:flex-start;gap:16px;padding-top:14px}#dkmPrint .hd .lg{height:44px;width:auto;flex:none}#dkmPrint .hd .co{font-size:11.5px;line-height:1.5;color:#575e78;text-align:right;margin-left:auto}#dkmPrint .hd .co b{font-size:13px;color:#29265b}#dkmPrint .ft{margin-top:26px;padding-top:10px;border-top:1px solid rgba(41,38,91,.18);font-size:11.5px;line-height:1.55;color:#575e78}#dkmPrint .cp{margin-top:8px;font-size:10px;line-height:1.5;color:#7d859c}#dkmPrint .tn{margin:16px 0;padding:14px 16px;border:1px solid rgba(41,38,91,.18);border-left:4px solid #29265b;background:#eef2fa;break-inside:avoid}#dkmPrint .tnh{font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#29265b;margin-bottom:8px}#dkmPrint .tn p{margin:0 0 8px;font-size:12.5px;line-height:1.55}#dkmPrint .tn p:last-child{margin-bottom:0}#dkmPrint .bdg{display:inline-block;margin-top:14px;padding:5px 9px;background:#29265b;color:#fff;font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase}#dkmPrint .cap{margin-top:8px;font-size:11.5px;color:#575e78}#dkmPrint .ruler{margin-top:12px}#dkmPrint .ruler .bar{position:static;display:block;padding:0;background:repeating-linear-gradient(90deg,#29265b 0 .3mm,transparent .3mm 10mm);width:100mm;height:7mm;border:1px solid #29265b;border-top:0}#dkmPrint .ruler .lb{width:100mm;display:flex;justify-content:space-between;font-size:10px;color:#575e78;margin-top:3px}#dkmPrint .dw{max-width:150mm;margin:0 auto}#dkmPrint .dw img{border:0;outline:0}#dkmPrint .sheet{margin:14px 0 0}#dkmPrint .brk{margin:22px 0 0;border-top:1px dashed rgba(41,38,91,.35)}#dkmPrint .sheet img{width:100%;height:auto;border:0}#dkmPrint.cardOnly .hd{display:none}@media print{@page docpg{size:A4 portrait;margin:0}@page cardpg{size:A4 portrait;margin:0}#dkmPrint{page:docpg}#dkmPrint.cardOnly{page:cardpg}html,body{background:#fff !important;color-scheme:only light;forced-color-adjust:none;margin:0 !important;padding:0 !important;box-shadow:none !important;filter:none !important}body>*{display:none !important}body>#dkmPrint{display:block !important;position:static !important;inset:auto !important;overflow:visible !important;height:auto !important;border:0 !important;box-shadow:none !important;background:#fff !important;padding:0 !important}body>#dkmPrint.cardOnly{padding:8mm !important;min-height:100vh !important}#dkmPrint .bar{display:none !important}#dkmPrint .pg{padding:10mm 12mm !important;max-width:none !important;border:0 !important;box-shadow:none !important;background:#fff !important}#dkmPrint *{box-shadow:none !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}#dkmPrint .dw{max-width:none !important;width:100% !important;page-break-inside:avoid;break-inside:avoid}#dkmPrint .dw img{width:100% !important;object-fit:contain;border:0 !important}#dkmPrint .dw.card-only img{max-height:215mm}#dkmPrint.cardOnly .hd,#dkmPrint.cardOnly .cp{display:none !important}#dkmPrint.cardOnly .sheet{margin:0 !important;page-break-inside:avoid;break-inside:avoid}#dkmPrint.cardOnly .sheet img{width:100% !important;max-height:265mm;object-fit:contain;border:0 !important}#dkmPrint.cardOnly .ft{margin-top:4mm !important;padding-top:2mm !important;font-size:9px !important}#dkmPrint .brk{break-before:page;page-break-before:always;height:0;margin:0 !important;border-top:0 !important}#dkmPrint h1,#dkmPrint h2{break-after:avoid;page-break-after:avoid}#dkmPrint table,#dkmPrint .note,#dkmPrint .dw,#dkmPrint .tn,#dkmPrint .ruler{break-inside:avoid;page-break-inside:avoid}#dkmPrint tr{break-inside:avoid;page-break-inside:avoid}#dkmPrint .hd{break-after:avoid}#dkmPrint .ft{break-inside:avoid}#dkmPrint h2{margin-top:8mm !important;font-size:11px !important}#dkmPrint td{padding:5px 0 !important;font-size:11.5px !important}#dkmPrint h1{margin:6mm 0 1mm !important;font-size:24px !important}#dkmPrint .tn p{font-size:10.5px !important;line-height:1.45 !important;margin-bottom:5px !important}#dkmPrint .dw img{max-height:165mm !important}}"; document.head.appendChild(st); }
    const logo=(window.__resources||{}).a_dkm_logo_png||new URL('assets/dkm-logo.png',location.href).href;
    const d=document.createElement('div'); d.id='dkmPrint';
    d.innerHTML='<div class="bar"><b>'+title+'</b>'+
      '<button data-close>Zamknij</button>'+
      '<button class="pri" data-print>Drukuj</button></div>'+
      '<div class="pg"><div class="hd"><img class="lg" src="'+logo+'" alt="DKM">'+
      '<div class="co"><b>DKM Power Transmission Sp. z o.o.</b><br>ul. 3 Maja 20 \u00b7 87-640 Czernikowo \u00b7 NIP 879-268-87-36<br>'+
      'sklep@d-k-m.eu \u00b7 +48 512 082 994 \u00b7 +48 516 645 907</div></div>'+body+'</div>';
    document.body.appendChild(d);
    d.querySelector('[data-close]').onclick=()=>d.remove();
    d.querySelector('[data-print]').onclick=()=>{ try{ window.print(); }catch(e){} };
    d.scrollTop=0;
    return d;
  }
  printSheet(){
    const s=this.state.sel; if(!s) return;
    const d=this.decorate(s), esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;');
    const rows=this.specRows(true).map(r=>'<tr><td>'+esc(r.k)+'</td><td>'+esc(r.v)+'</td></tr>').join('');
    const dims=(window.DKM_DIMS&&window.DKM_DIMS[s.box])||null;
    const dimTbl=(dims&&dims.length)?('<h2>Wymiary korpusu '+esc(s.box)+'</h2><table>'+
      dims.map(r=>'<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td></tr>').join('')+'</table>'):'';
    let note='';
    if(d.noWty) note='<div class="note bad"><b>fs = '+d.fs+' · poniżej 1,0 — dostawa bez gwarancji.</b><br>DKM Power Transmission Sp. z o.o. realizuje takie zamówienie na życzenie klienta, ale nie obejmuje go gwarancją.</div>';
    else if(d.warnOnly) note='<div class="note"><b>fs = '+d.fs+' · poniżej wymaganego '+fs1(this.fsReqEff())+'.</b><br>Zbyt mały zapas na rozruchy i przeciążenia.</div>';
    else if(d.edge) note='<div class="note"><b>fs = '+d.fs+' · na granicy.</b><br>Gwarancja obowiązuje, ale nie ma zapasu na rozruchy i przeciążenia.</div>';
    const src=this.cardSrc(s.box);
    const drawing=src?('<h2>Karta techniczna</h2><div class="dw"><img src="'+new URL(src,location.href).href+'"></div>'):'';
    const dt=new Date().toLocaleDateString('pl-PL');
    this.printWin('DKM '+s.box+' — karta doboru',
      '<div class="bdg">Proponowany dobór · Motoreduktor '+this.phTag(s)+'</div><h1>'+esc(s.box)+'</h1>'+
      '<p class="sub">'+d.p1+' kW · '+d.rpmLabel+' · '+esc(s.flange)+
        ' · zasilanie silnika '+esc(this.motVoltOf(s,this.motorOf(s))||'do potwierdzenia')+'</p><div class="rule"></div>'+
      '<h2>Parametry doboru</h2><table>'+rows+'</table>'+dimTbl+note+drawing+
      '<div class="brk"></div>'+this.techNote()+
      '<div class="ft"><b>DKM Power Transmission Sp. z o.o.</b> · ul. 3 Maja 20, 87-640 Czernikowo · NIP 879-268-87-36<br>'+
      'sklep@d-k-m.eu · +48 512 082 994 · +48 516 645 907 · pon.–pt. 8:00–16:00<br>'+
      'Wygenerowano '+dt+' w aplikacji DKM Dobór przekładni ślimakowych. Dane z katalogu producenta.</div>'+this.copy());
  }
  printCard(){
    const sel=this.state.sel, src=this.cardSrc(sel&&sel.box); if(!src) return;
    const dt=new Date().toLocaleDateString('pl-PL');
    const win=this.printWin('DKM '+sel.box+' — karta techniczna',
      '<div class="sheet"><img src="'+new URL(src,location.href).href+'" alt="Karta techniczna '+sel.box+'"></div>'+
      '<div class="ft"><b>DKM Power Transmission Sp. z o.o.</b> · ul. 3 Maja 20, 87-640 Czernikowo · NIP 879-268-87-36 · '+
      'sklep@d-k-m.eu · +48 512 082 994 · wydruk '+dt+'</div>');
    if(win) win.classList.add('cardOnly');
  }
  techNote(){
    return '<div class="tn"><div class="tnh">Ważna informacja techniczna</div>'+
      '<p>Wyniki prezentowane przez aplikację DKM Power Transmission Sp. z o.o. mają charakter <b>pomocniczy</b> i stanowią wstępne zestawienie przekładni, silników oraz wyposażenia na podstawie danych katalogowych i parametrów wskazanych przez użytkownika.</p>'+
      '<p>Prezentowany współczynnik pracy przekładni fs odnosi się do parametrów katalogowych analizowanego zestawienia, w szczególności do znamionowej mocy wybranego silnika. Aplikacja nie określa rzeczywistego obciążenia maszyny, faktycznie pobieranej mocy, przebiegu momentu obrotowego ani wszystkich warunków eksploatacji konkretnego urządzenia.</p>'+
      '<p>Moc znamionowa silnika nie musi odpowiadać rzeczywistemu zapotrzebowaniu napędzanej maszyny. Silnik może pracować z obciążeniem niższym od znamionowego, jednak potwierdzenie takiego stanu wymaga indywidualnej analizy rzeczywistych warunków pracy.</p>'+
      '<p>Zestawienia ze współczynnikiem <b>fs poniżej 1,0</b> znajdują się poza zakresem rekomendowanym przez DKM Power Transmission Sp. z o.o. przy założeniu pełnego wykorzystania znamionowej mocy silnika. Mogą prowadzić do przeciążenia przekładni, jeżeli rzeczywiste obciążenie przekroczy jej dopuszczalne parametry.</p>'+
      '<p>Klient może świadomie zamówić przekładnię dla zestawienia ze współczynnikiem fs poniżej 1,0, pod warunkiem wyraźnego potwierdzenia informacji o ograniczeniach technicznych oraz akceptacji zakupu bez dobrowolnej gwarancji handlowej DKM Power Transmission Sp. z o.o.</p>'+
      '<p>Brak dobrowolnej gwarancji handlowej dotyczy wyłącznie wskazanej przekładni i konkretnego zamówienia, o ile nie wskazano inaczej. Nie oznacza automatycznego pozbawienia ochrony pozostałych produktów, silników, falowników ani akcesoriów znajdujących się w tym samym zamówieniu.</p>'+
      '<p>Zestawienia ze współczynnikiem <b>fs od 1,0 do wartości poniżej 1,3</b> wymagają indywidualnej weryfikacji. Ich przydatność zależy w szczególności od rzeczywistego momentu obciążenia, czasu pracy, charakteru obciążenia, liczby rozruchów, przeciążeń chwilowych, bezwładności układu, temperatury, sposobu sterowania, pozycji montażowej oraz sił promieniowych i osiowych.</p>'+
      '<p>Współczynnik <b>fs równy lub wyższy niż 1,3</b> nie stanowi samodzielnego potwierdzenia prawidłowego doboru ani bezpieczeństwa zastosowania. W zależności od warunków eksploatacji może być wymagany wyższy współczynnik pracy.</p>'+
      '<p>Krótkotrwałe przeciążenia, rozruchy i okresowe zwiększenie zapotrzebowania na moc wymagają sprawdzenia dopuszczalnych momentów, czasu trwania obciążenia, częstotliwości występowania oraz warunków cieplnych i mechanicznych napędu.</p>'+
      '<p>Ostatecznego doboru powinien dokonać użytkownik, projektant maszyny, integrator albo inna osoba posiadająca informacje o rzeczywistych warunkach pracy urządzenia. W przypadku wątpliwości zalecany jest kontakt z działem działem technicznym DKM Power Transmission Sp. z o.o.</p>'+
      '<p>DKM Power Transmission Sp. z o.o. nie odpowiada za konsekwencje zastosowania produktu niezgodnie z jego parametrami katalogowymi, przekazanymi ostrzeżeniami, instrukcją użytkowania lub rzeczywistymi wymaganiami aplikacji w zakresie, w jakim konsekwencje te wynikają z nieprawidłowych, niepełnych albo niezweryfikowanych danych dotyczących danego zastosowania.</p>'+
      '<p>Powyższe postanowienia nie wyłączają ani nie ograniczają odpowiedzialności, której zgodnie z obowiązującymi przepisami prawa nie można wyłączyć ani ograniczyć, w szczególności odpowiedzialności za wady produktu, szkody wyrządzone przez produkt niebezpieczny oraz uprawnień przysługujących konsumentom.</p>'+'</div>';
  }
  copy(){
    return '<div class="cp"><b>© 2026 DKM Power Transmission Sp. z o.o. · Wszelkie prawa zastrzeżone / All rights reserved.</b><br>'+
      'Dokument wygenerowany przez aplikację stanowiącą własność DKM Power Transmission Sp. z o.o. '+
      'Nieautoryzowane kopiowanie, modyfikowanie, rozpowszechnianie lub wykorzystywanie jest zabronione. '+
      'Dane osobowe zawarte w dokumencie przetwarza DKM Power Transmission Sp. z o.o. jako administrator, w celu obsługi zapytania (art. 6 ust. 1 lit. b i f RODO). '+
      'Wyniki doboru mają charakter pomocniczy i wymagają weryfikacji technicznej.<br>'+
      'This application and its components are proprietary to DKM Power Transmission Sp. z o.o. '+
      'Unauthorized copying, modification, distribution or use is prohibited.</div>';
  }
  ruler(){
    return '<div class="ruler"><div class="bar"></div>'+
      '<div class="lb"><span>0</span><span>50 mm</span><span>100 mm</span></div>'+
      '<div class="cap">Podziałka kontrolna wydruku — po wydrukowaniu pasek musi mieć dokładnie 100 mm. '+
      'Jeśli jest krótszy, drukarka przeskalowała stronę (ustaw skalę 100%).</div></div>';
  }
  reset(patch){ this.setState({p1:null,i:null,n2Exact:null,boreSel:null,box:null,rpmSel:1400,m2:'',n2:'',fsMinSel:null,sel:null,refine:false,condDone:false,flowDone:false,refineAsk:null,refinePick:[],q:'',...patch}); }

  fsGroup(){
    const S=this.state, opts=FSMINS.map(v=>{
      const n=this.matches('fs').filter(r=>fsPass(r.fs,v)).length;
      return {label:v==null?'wszystkie':(v==='below'?'< 1,0':('≥ '+fs1(v))),count:v==null?'':String(n),
        bg:S.fsMinSel===v?(v==='below'?V('warn'):V('accent')):'transparent',
        fg:S.fsMinSel===v?V('bg'):(v==='below'?V('warn'):V('text')),
        cg:S.fsMinSel===v?'rgba(255,255,255,.7)':V('neutral-500'),
        go:()=>this.setState({fsMinSel:v,sel:null})};
    });
    return {label:'Współczynnik pracy przekładni fs',unit:'',cols:'3',opts};
  }

  renderVals(){
    const mSel=id=>this.mountsHas(id);
    const S=this.state, fsReq=this.fsReqNum();
    const entries=[
      {sym:'P₁',ico:'p1',title:'Znam moc silnika',desc:'Wybieram moc znamionową, potem przełożenie i wariant korpusu.',
        go:()=>this.reset({screen:'askP1',mode:'p1'})},
      {sym:'i',ico:'i',title:'Znam przełożenie',desc:'Wybieram przełożenie i, moc silnika dobiorę w następnym kroku.',
        go:()=>this.reset({screen:'askI',mode:'i'})},
      {sym:'n₂',ico:'n2',title:'Znam prędkość obrotową na wale wyjściowym',desc:'Wybieram prędkość obrotową wału wyjściowego z katalogu — przełożenie policzy się samo.',
        go:()=>this.reset({screen:'askN2',mode:'n2'})},
      {sym:'M₂',ico:'m2',title:'Znam moment obrotowy na wale wyjściowym',desc:'Podaję moment i prędkość obrotową maszyny — aplikacja policzy zapas i fs.',
        go:()=>this.reset({screen:'askM2',mode:'m2',m2:'',n2:''})},
      {sym:'→DKM',ico:'swap',title:'Zamiennik',desc:'Masz już przekładnię innej marki (NMRV, CMI, PMRV, SMI, VMR, WMI)? Sprawdź, czy mamy jej odpowiednik.',
        go:()=>this.reset({screen:'askSwap',mode:null,q:''})},
      {sym:'Ød',ico:'bore',title:'Znam średnicę wału',desc:'Mam wałek o danej średnicy — wybieram tuleję drążoną, która na niego wchodzi.',
        go:()=>this.reset({screen:'askBore',mode:'bore'})}
    ];
    const POOL=S.rpmSel==null?CAT():CAT().filter(r=>r.rpm===S.rpmSel);
    const N2POOL=CAT();
    const n2List=[...new Set(N2POOL.map(r=>r.n2))].sort((a,b)=>b-a).map(v=>{
      const hit=N2POOL.filter(r=>r.n2===v);
      const rpms=[...new Set(hit.map(r=>r.rpm))].sort((a,b)=>a-b);
      return {label:num(v),count:hit.length,
        rpmNote:'n₁ '+rpms.join(' / '),
        go:()=>this.pushHist({n2Exact:v,rpmSel:null,screen:'results'})};
    });
    const rowsRaw=this.matches();
    const allRows=rowsRaw.map(r=>({...this.decorate(r),
      go:()=>this.setState({sel:r,screen:'detail',flangePick:null,borePick:null,inv:null,invPhase:null,mounts:[],acc:[]})}))
      .sort((a,b)=>(this.FS_META[a.fsBand].order-this.FS_META[b.fsBand].order));
    const rows=allRows.filter(r=>r.fsBand==='ok'||r.fsBand==='mid');
    const rowsOut=allRows.filter(r=>r.fsBand==='low'||r.fsBand==='none');
    const p1List=[...new Set(CAT().map(r=>r.p1))].sort((a,b)=>a-b).map(p=>{
      const rs=POOL.filter(r=>r.p1===p),all=CAT().filter(r=>r.p1===p),n=rs.length;
      const src=n?rs:all, lo=Math.min(...src.map(r=>r.m2)),hi=Math.max(...src.map(r=>r.m2));
      return {label:num(p),
        countLabel:n?(n+' '+plural(n,'wariant','warianty','wariantów')):'tylko 900 / 2800 obr/min',
        m2Label:lo===hi?num(lo):num(lo)+'–'+num(hi),
        go:()=>this.pushHist(n?{p1:p,screen:'results'}:{p1:p,rpmSel:null,screen:'results'})};
    });
    const iList=[...new Set(CAT().map(r=>r.i))].sort((a,b)=>a-b).map(i=>{
      const n=POOL.filter(r=>r.i===i).length;
      return {label:num(i),count:n?(n+' poz.'):'900/2800 obr',
        go:()=>this.pushHist(n?{i,screen:'results'}:{i,rpmSel:null,screen:'results'})};
    });
    const pick=(cur,ix)=>({bg:cur===ix?V('accent'):'transparent',fg:cur===ix?V('bg'):V('text')});
    const loadOpts=LOADS.map((d,ix)=>({label:d.l,desc:d.d,...pick(S.load,ix),
      dg:S.load===ix?'rgba(255,255,255,.75)':V('neutral-500'),go:()=>this.setState({load:ix,sel:null})}));
    const hourOpts=HOURS.map((d,ix)=>({label:d.h+' h',...pick(S.hours,ix),go:()=>this.setState({hours:ix,sel:null})}));
    const zOpts=ZVALS.map(z=>({label:String(z),...pick(S.z,z),go:()=>this.setState({z,sel:null})}));
    const tempOpts=TEMPS.map((d,ix)=>({label:d.l,...pick(S.temp,ix),go:()=>this.setState({temp:ix,sel:null})}));
    const tempMult=TEMPS[S.temp].m, chartFs=this.fsChart(), noMult=tempMult==null;
    const fsFormula='Wykres katalogowy: obciążenie '+LOADS[S.load].k+' · '+HOURS[S.hours].h+' h/dzień · Z = '+S.z+' 1/h → fs '+fs1(chartFs)
      +(noMult?' — bez korekty temperaturowej, katalog jej nie podaje'
        :(tempMult!==1?(' × '+num(tempMult)+' (temperatura '+TEMPS[S.temp].l+')'):''));

    const q=S.typeQ.trim().toLowerCase().replace(/\s+/g,'');
    const boxAll=[...new Set(CAT().map(r=>r.box))].sort();
    const typeHits=q.length<2?[]:boxAll.filter(b=>b.toLowerCase().includes(q)||b.toLowerCase().replace('dkm','').includes(q)).slice(0,6)
      .map(b=>{const n=CAT().filter(r=>r.box===b).length;
        return {label:b,count:n+' '+plural(n,'pozycja','pozycje','pozycji'),
          go:()=>{const h=(this.state.ustack||[]).concat([this.snap()]).slice(-25);
            this.reset({screen:'v3refine',mode:null,box:b,rpmSel:null,typeQ:'',ustack:h});}};});
    const histRows=S.hist.map(h=>({label:h.label,sub:h.sub,
      go:()=>this.setState({...h.st,screen:'results',sel:null,refine:false,flowDone:true})}));
    const DIMS=(window.DKM_DIMS||{});
    const dimRows=(S.sel&&DIMS[S.sel.box]?DIMS[S.sel.box]:[]).map(d=>({k:d[0],v:d[1]}));
    const chips=[];
    if(S.p1!=null) chips.push({label:'P₁ '+num(S.p1)+' kW',clear:()=>this.setState({p1:null,sel:null})});
    if(S.i!=null) chips.push({label:'i = '+num(S.i),clear:()=>this.setState({i:null,sel:null})});
    if(S.n2Exact!=null) chips.push({label:'n₂ = '+num(S.n2Exact)+' obr/min',clear:()=>this.setState({n2Exact:null,sel:null})});
    if(S.boreSel!=null) chips.push({label:'tuleja Ø'+num(S.boreSel)+' mm',clear:()=>this.setState({boreSel:null,sel:null})});
    if(this.numIn(S.m2)!=null) chips.push({label:'M₂ ≥ '+num(this.numIn(S.m2))+' Nm',clear:()=>this.setState({m2:'',sel:null})});
    if(this.numIn(S.n2)!=null) chips.push({label:'n₂ ≈ '+num(this.numIn(S.n2)),clear:()=>this.setState({n2:'',sel:null})});
    if(S.fsMinSel!=null) chips.push({label:S.fsMinSel==='below'?'fs < 1,0 · poza zalecanym zakresem':('fs ≥ '+fs1(S.fsMinSel)),clear:()=>this.setState({fsMinSel:null,sel:null})});
    if(S.box!=null) chips.push({label:'typ '+S.box,clear:()=>this.setState({box:null,sel:null})});
    if(S.rpmSel!=null) chips.push({label:'n₁ '+num(S.rpmSel)+' obr/min'+(S.rpmSel===1400?' · standard':''),clear:()=>this.setState({rpmSel:null,sel:null})});
    if(S.mode==='m2') chips.push({label:'obc. '+LOADS[S.load].k+' · '+HOURS[S.hours].h+' h · Z '+S.z+' · fs ≥ '+fs1(fsReq)+(TEMPS[S.temp].m==null?' (bez korekty temp.)':''),clear:()=>this.setState({mode:null,fsOnly:false})});

    const refineGroups=[
      this.group('p1','Moc silnika P₁ₙ','kW',4),
      this.group('i','Przełożenie i','',6),
      this.group('n2','Prędkość obrotowa n₂','obr/min',5),
      this.group('box','Typ przekładni','',4),
      this.group('bore','Średnica wału Ød','mm',5),
      this.group('rpm','Prędkość obrotowa silnika n₁','obr/min',4),
      this.fsGroup()
    ];
    const order={p1:['i','box','rpm'],i:['p1','box','rpm'],n2:['p1','i','box'],m2:['p1','i','box']}[S.mode]||['p1','i','box'];
    const stepLabel={p1:'Moc silnika P₁ₙ (kW)',i:'Przełożenie i',n2:'Prędkość obrotowa n₂',box:'Typ przekładni',rpm:'Prędkość obrotowa silnika n₁',bore:'Średnica wału Ød'};
    const shortLabel={p1:'Moc P₁',i:'Przełożenie i',n2:'Prędkość n₂',box:'Typ przekładni',rpm:'Prędkość silnika n₁',bore:'Średnica wału'};
    const avail=['p1','i','n2','box','bore','rpm'].filter(f=>S[this.fieldOf(f)]==null&&this.facet(f).length>1);
    const suggested=order.find(f=>avail.indexOf(f)>=0)||avail[0]||null;
    const activeTab=(S.stepTab&&avail.indexOf(S.stepTab)>=0)?S.stepTab:suggested;
    const stepTabs=avail.map(f=>({f,label:shortLabel[f],count:String(this.facet(f).length),
      on:f===activeTab,sug:f===suggested&&f!==activeTab,
      bg:f===activeTab?V('accent'):V('bg'),fg:f===activeTab?V('bg'):V('accent'),
      bd:f===activeTab?V('accent'):V('accent-300'),
      pick:()=>this.setState({stepTab:f})}));
    let nextStep=null;
    if(activeTab){
      const fc=this.facet(activeTab);
      const acc={p1:'moc silnika P₁ₙ (kW)',i:'przełożenie i',n2:'prędkość obrotową n₂',box:'typ przekładni',rpm:'prędkość obrotową silnika n₁',bore:'średnicę wału Ød'};
      nextStep={title:'Wybierz '+(acc[activeTab]||stepLabel[activeTab]),
        hint:'Zostało '+rowsRaw.length+' pozycji. Kliknij kryterium, które znasz — albo przewiń listę niżej.',
        opts:fc.map(o=>({label:activeTab==='box'?String(o.v):(activeTab==='bore'?('⌀ '+num(o.v)):num(o.v)),count:String(o.count),optOnly:!!o.optOnly,go:()=>this.setField(activeTab,o.v)}))};
    }
    const showStep=!!nextStep&&rowsRaw.length>8;
    const otherRpm=S.rpmSel==null?0:this.matches('rpm').length;

    const sel=S.sel?this.decorate(S.sel):null;
    const selVars=S.sel?this.variants(S.sel):[];
    const selPick=S.sel?this.pickVar(S.sel):null;
    const stTxt=st=>st===0?'w magazynie':(st===1?'dostawa 1–3 dni':'zapytaj o cenę');
    const selMot=S.sel?this.motorOf(S.sel):null;
    const selEx=sel?this.extrasFor(sel.box):[];
    const selExNet=this.extrasNet(selEx);
    const selSet=sel?((sel.boxNet||0)+(sel.motNet||0)+selExNet):0;
    const headline=S.sel?[{k:'M₂ₙ',d:'Moment obrotowy na wale wyjściowym',v:num(S.sel.m2),u:'Nm'},
      {k:'n₂',d:'Prędkość obrotowa na wale wyjściowym',v:num(S.sel.n2),u:'obr/min'},
      {k:'fs',d:'Współczynnik pracy przekładni',v:fs1(S.sel.fs),u:''}]:[];
    const specs=this.specRows();

    const step=this.rfqStep();
    const nLow=S.rfq.filter(x=>x.noWty).length;
    const tradeOf=x=>this.tradeOf(x);
    const rfqRows=S.rfq.map(x=>({...x,qty:String(x.qty),
      tradeTag:tradeOf(x).tag+(this.fsBand(x.fs)==='low'?(x.consent?' · bez gwarancji':' · wymaga zgody'):''),
      tradeName:tradeOf(x).name,
      sumSpec:(x.iec?(x.iec+' · '):'')+(x.fs?('fs '+x.fs+' · '):'')+this.qtyLabel(x),
      foldText:tradeOf(x).tag+' · '+x.box+' i'+x.i+' · '+this.qtyLabel(x)+(this.fsBand(x.fs)==='low'?(' · fs '+x.fs):'')+(x.boreOpt?' · tuleja ⌀ '+x.boreD+' mm na zapytanie':''),
      specLine:'i = '+x.i+' · M₂ '+x.m2+' Nm'+(x.n2?(' · n₂ '+x.n2+' obr/min'):'')+(x.p1?(' · '+x.p1+' kW'):'')+(x.rpm?(' · silnik '+x.rpm+' obr/min'):'')+(x.iec?(' · '+x.iec):'')+(x.bore?(' · tuleja '+x.bore):''),
      boreWarn:!!x.boreOpt,
      boreWarnTxt:x.boreOpt?('Tuleja drążona ⌀ '+x.boreD+' mm to wykonanie specjalne — inne SKU, cena i termin po potwierdzeniu przez DKM. Dane techniczne bez zmian.'):'',
      boxPrice:x.boxNet!=null?zl(x.boxNet):'na zapytanie',
      motPrice:x.motNet!=null?zl(x.motNet):'na zapytanie',
      motName:x.motName||'silnik',
      motOn:!!x.withMotor,
      motMark:x.withMotor?'✓':'',
      motBd:x.withMotor?V('accent'):V('divider'),
      motBg:x.withMotor?V('accent'):'transparent',
      lineTotal:this.lineTotal(x)?zl(this.lineTotal(x)):'—',
      gearQty:String(this.gQty(x)),motQty:String(this.mQty(x)),
      gearInc:()=>this.partQty(x.k,'g',1),gearDec:()=>this.partQty(x.k,'g',-1),
      motInc:()=>this.partQty(x.k,'m',1),motDec:()=>this.partQty(x.k,'m',-1),
      hasGear:this.gQty(x)>0, hasMot:this.mQty(x)>0,
      gearDrop:()=>this.setPartQty(x.k,'g',0),
      motDrop:()=>this.setPartQty(x.k,'m',0),
      gearBack:()=>this.setPartQty(x.k,'g',1),
      motBack:()=>this.setPartQty(x.k,'m',1),
      canAddGear:this.gQty(x)===0, canAddMot:this.mQty(x)===0,
      gearBackLabel:'+ Przekładnia '+x.box+(x.boxNet!=null?(' · '+zl(x.boxNet)):' · na zapytanie'),
      motBackLabel:'+ Silnik '+(x.p1?(x.p1+' kW'):'')+(x.motNet!=null?(' · '+zl(x.motNet)):' · na zapytanie'),
      gearFg:this.gQty(x)>0?V('neutral-900'):V('neutral-500'),
      motFg:this.mQty(x)>0?V('neutral-900'):V('neutral-500'),
      gearSum:this.gQty(x)>0?(x.boxNet!=null?zl(x.boxNet*this.gQty(x)):'na zapytanie'):'—',
      motSum:this.mQty(x)>0?(x.motNet!=null?zl(x.motNet*this.mQty(x)):'na zapytanie'):'—',
      gearPer:(this.gQty(x)>1&&x.boxNet!=null)?(this.gQty(x)+' × '+zl(x.boxNet)):'',
      motPer:(this.mQty(x)>1&&x.motNet!=null)?(this.mQty(x)+' × '+zl(x.motNet)):'',
      gearSub:x.box+(x.iec?(' · '+x.iec):''),
      motSub:(x.p1?(x.p1+' kW'):'')+(x.rpm?(' · '+x.rpm+' obr/min'):'')+' · '+(this.motVoltOf(x,{name:x.motName})||'napięcie potwierdzimy'),
      scopeOpts:[{v:'set',l:'Zestaw'},{v:'gear',l:'Sama przekładnia'},{v:'motor',l:'Sam silnik'}].map(o=>{
        const g=this.gQty(x),m=this.mQty(x);
        const cur=g>0&&m>0?'set':(m>0?'motor':'gear');
        const on=cur===o.v;
        return {label:o.l,bg:on?V('accent'):'transparent',fg:on?'#fff':V('accent'),
          sep:o.v==='set'?'transparent':V('accent-300'),
          pick:()=>this.setScope(x.k,o.v)};
      }),

      extraRows:(x.extras||[]).filter(e=>!e.off).map(e=>{
        const q=this.exQty(e);
        return {label:e.label,code:e.code,
        sum:e.net===0?'gratis':(e.net!=null?zl(e.net*q):'na zapytanie'),
        per:(e.net&&q>1)?(q+' × '+zl(e.net)):'',
        qty:String(q),
        canQty:!!e.net,
        qInc:()=>this.exQtyChange(x.k,e.code,1),
        qDec:()=>this.exQtyChange(x.k,e.code,-1),
        toggle:()=>this.toggleExtra(x.k,e.code)};}),
      hasExtras:(x.extras||[]).some(e=>!e.off),
      addOpts:this.addableFor(x).map(o=>({label:o.label,price:'· '+o.price,add:()=>this.addExtra(x.k,o.code)})),
      extraCount:(()=>{const n=(x.extras||[]).filter(e=>!e.off).length;
        return n===0?'nic nie dobrano':(n+(n===1?' pozycja':(n<5?' pozycje':' pozycji')));})(),
      hasAddOpts:this.addableFor(x).length>0,
      invHint:'Do silnika 1-fazowego nie stosuje się falownika.',
      hasInvHint:/1\s*fazow/i.test(x.motName||''),
      inv1F:(x.extras||[]).some(e=>{ if(e.off||!/^INV/.test(e.code)) return false;
        if(e.code==='INV1') return true;
        const f=e.sku?this.invById(e.sku):null; return !!f&&f[3]===1; }),
      motToggle:()=>this.toggleMotor(x.k),
      fsLine:(()=>{const b=x.fsBand||this.fsBand(x.fsRaw!=null?x.fsRaw:x.fs);
        return (b==='none'?'fs —':('fs = '+x.fs))+' · '+this.FS_META[b].short;})(),
      hasFs:!!x.fs||x.fsBand==='none',
      fsColor:(()=>{const b=x.fsBand||this.fsBand(x.fsRaw!=null?x.fsRaw:x.fs);return this.fsColors(b).fg;})(),
      fsBg:(()=>{const b=x.fsBand||this.fsBand(x.fsRaw!=null?x.fsRaw:x.fs);return this.fsColors(b).bg;})(),
      fsIcon:this.FS_META[x.fsBand||this.fsBand(x.fsRaw!=null?x.fsRaw:x.fs)].icon,
      noWty:!!x.noWty,
      wtyLines:x.noWty?[
        {k:'Dobrowolna gwarancja handlowa DKM Power Transmission Sp. z o.o.',v:'nieudzielona'},
        {k:'SKU przekładni',v:x.gearSku||'—'},
        {k:'Współczynnik pracy',v:'fs = '+x.fs},
        {k:'Klient potwierdził ograniczenia techniczne',v:(x.consent&&x.consent.a)?'tak':'nie'},
        {k:'Klient zaakceptował zakup bez gwarancji',v:(x.consent&&x.consent.b)?'tak':'nie'},
        {k:'Data akceptacji',v:(x.consent&&x.consent.at)||'brak'}]:[],
      needsConsent:!!x.noWty&&!x.consent,
      askConsent:()=>{const row=CAT().find(rr=>this.key(rr)===this.baseKey(x.k));
        if(row) this.setState({sel:row,screen:'consent',c1:false,c2:false,consentErr:false});},
      inc:()=>this.qty(x.k,1),dec:()=>this.qty(x.k,-1),
      open:()=>{ const row=CAT().find(rr=>this.key(rr)===this.baseKey(x.k));
        if(row) this.setState({sel:row,screen:'detail',fromRfq:true,flangePick:x.iecPick||null,borePick:(x.boreOpt&&x.boreD!=null)?x.boreD:null,inv:null,invPhase:null,mounts:[],acc:[],motPh:x.ph===1?1:3}); },
      remove:()=>this.setState(s=>({rfq:s.rfq.filter(y=>y.k!==x.k)}))}));
    const rfqNoWty=S.rfq.some(x=>x.noWty);
    const crumb={askP1:'Krok 1 z 3 · Moc silnika',askI:'Krok 1 z 3 · Przełożenie',askN2:'Krok 1 z 3 · Prędkość obrotowa na wale',askBore:'Krok 1 z 3 · Średnica wału',askType:'Krok 1 z 3 · Typ przekładni',askM2:'Wymagania maszyny',askSwap:'Wyszukiwarka zamienników',
      v3refine:'Krok 2 z 3 · Zawężenie doboru',v3cond:'Krok 3 z 3 · Warunki pracy',
      results:'Proponowany dobór',detail:'Proponowany dobór · karta produktu',rfq:'Zamówienie',
      legal:'Informacje prawne · RODO · bezpieczeństwo',terms:'Regulamin'}[S.screen]||'';

    return {
      tileGrid:S.wide?'repeat(3,minmax(0,1fr))':'repeat(2,minmax(0,1fr))',
      rowCols:S.wide?'minmax(150px,1fr) 78px 88px 112px':'minmax(0,1fr) 62px 72px 90px',
      rowGap:S.wide?'8px':'8px',
      priceUpdated:(window.DKM_PRICE||{}).updated||'',hasPriceDate:!!((window.DKM_PRICE||{}).updated),
      stockOnly:!!S.stockOnly,
      stockCount:String(this.matches('stock').filter(r=>this.inStock(r)).length),
      stockBg:S.stockOnly?V('ok-ink'):'transparent',
      stockFg:S.stockOnly?'#fff':V('ok-ink'),
      stockBd:S.stockOnly?V('ok-ink'):V('accent-300'),
      stockMark:S.stockOnly?'✓':'',
      toggleStock:()=>this.setState(s=>({stockOnly:!s.stockOnly,sel:null})),
      phFilter:[{ph:3,label:'3-fazowy 400 V'},{ph:1,label:'1-fazowy 230 V'}].map(o=>{
        const on=(S.motPh===1?1:3)===o.ph;
        const n=o.ph===1?this.matches('ph').filter(r=>this.has1F(r)).length:this.matches('ph').length;
        return {label:o.label,count:n+' pozycji',
          bg:on?V('accent'):'transparent',fg:on?V('bg'):V('text'),
          bd:on?V('accent'):V('accent-300'),sub:on?'rgba(255,255,255,.85)':V('neutral-700'),
          pick:()=>this.setState(o.ph===1?{motPh:1,sel:null,inv:null,invPhase:null}:{motPh:3,sel:null})};
      }),
      hideLow:!!S.hideLow,
      lowCount:String(this.matches('low').filter(r=>this.fsBand(r.fs)==='low').length),
      lowBg:S.hideLow?V('warn'):'transparent',
      lowFg:S.hideLow?'#fff':V('warn'),
      lowBd:S.hideLow?V('warn'):V('accent-300'),
      lowMark:S.hideLow?'✓':'',
      toggleLow:()=>this.setState(s=>({hideLow:!s.hideLow,sel:null})),
      entries:entries.map(e=>({...e,
        short:{type:'Typ przekładni',p1:'Moc silnika',i:'Przełożenie',n2:'Prędkość obrotowa na wale wyjściowym',m2:'Moment obrotowy na wale wyjściowym',bore:'Średnica wału',swap:'Zamiennik'}[e.ico]||e.title,
        tile:'url("'+this.A('tile-'+e.ico+'.png')+'")',
        // ikona zamiennika ma w pliku szeroki biały margines — skalujemy ją ponad
        // ramkę, żeby rysunek był tej samej wielkości co na pozostałych kafelkach
        tileSize:e.ico==='swap'?'contain':'contain'})),
      p1List,iList,n2List,loadOpts,hourOpts,zOpts,tempOpts,fsFormula,
      tempNote:TEMPS[S.temp].note,tempHasNote:!!TEMPS[S.temp].note,serviceCall:noMult,
      fsHeadline:noMult?'do ustalenia':('≥ '+fs1(fsReq)),
      rfqMid:S.rfq.some(x=>(x.fsBand||this.fsBand(x.fsRaw))==='mid'),
      noWtyList:S.rfq.filter(x=>x.noWty).map(x=>({
        name:x.box+' · i '+x.i+' · '+x.p1+' kW',sku:x.gearSku||'—',fs:x.fs,
        state:x.consent?('zaakceptowano '+x.consent.at):'wymaga potwierdzenia',
        okColor:x.consent?V('ok-ink'):V('warn')})),
      chips,refineGroups,rows,rowsOut,hasRowsOut:rowsOut.length>0,
      rowsOutCount:rowsOut.length+' '+plural(rowsOut.length,'zestawienie','zestawienia','zestawień'),
      specs,headline,rfqRows,rfqNoWty,
      cartNet:zl(this.cartNet()),cartVat:zl2(this.cartNet()*0.23),cartGross:zl2(this.cartNet()*1.23),
      hasCartTotals:this.cartNet()>0,cartMissing:this.cartMissing(),
      shipKg:(()=>{const p=this.shipPlan();return num(p.kg)+' kg';})(),
      shipTier:this.shipPlan().tier,
      shipPrice:(()=>{const p=this.shipPlan();
        return p.free?'gratis':(p.net==null?'do wyceny':zl(p.net));})(),
      shipCod:(()=>{const p=this.shipPlan();return p.cod?('w tym pobranie '+zl(p.cod)):'';})(),
      shipHasCod:this.shipPlan().cod>0,
      shipFree:this.shipPlan().free,
      shipUnknown:!this.shipPlan().known,
      shipToFree:(()=>{const p=this.shipPlan();const g=this.cartGoods();
        return (!p.free&&p.net!=null&&g>0)?('do darmowej wysyłki brakuje '+zl(this.SHIP_FREE-g)+' netto'):'';})(),
      shipShowToFree:(()=>{const p=this.shipPlan();const g=this.cartGoods();
        return !p.free&&p.net!=null&&g>0&&g<this.SHIP_FREE;})(),
      cartGoodsLabel:zl(this.cartGoods()),
      cartGoodsGross:zl2(this.cartGoods()*1.23),
      shipGross:(()=>{const p=this.shipPlan();
        return p.free?'gratis':(p.net==null?'do wyceny':zl2(p.net*1.23));})(),
      delCols:(Object.keys(this.DELS).length>1&&S.wide)?'repeat(2,minmax(0,1fr))':'minmax(0,1fr)',
      delOpts:Object.keys(this.DELS).map(k=>({label:this.DELS[k],on:S.del===k,
        bg:S.del===k?V('accent'):'transparent',fg:S.del===k?V('bg'):V('accent'),
        bd:S.del===k?V('accent'):V('accent-300'),pick:()=>this.setState({del:k,orderErr:''})})),
      payOpts:Object.keys(this.PAYS).map(k=>({label:this.PAYS[k],on:S.pay===k,
        bg:S.pay===k?V('accent'):'transparent',fg:S.pay===k?V('bg'):V('accent'),
        bd:S.pay===k?V('accent'):V('accent-300'),pick:()=>this.setState({pay:k,orderErr:''})})),
      orderRfq:this.order,orderErr:S.orderErr||'',hasOrderErr:!!S.orderErr,
      legalOpen:!!S.legalOpen,
      legalLabel:S.legalOpen?'Zwiń ▲':'Rozwiń ▼',
      toggleLegal:()=>this.setState(s=>({legalOpen:!s.legalOpen})),
      canOrder:this.canOrder(),needQuote:S.rfq.length>0&&this.cartMissing(),
      showQuote:S.rfq.length>0&&this.showQuote(),
      orderBg:this.canOrder()?V('accent'):'transparent',
      orderFg:this.canOrder()?V('bg'):V('accent'),
      orderBd:this.canOrder()?V('accent'):V('accent-300'),
      sendBg:this.canOrder()?'transparent':V('accent'),
      sendFg:this.canOrder()?V('accent'):V('bg'),
      sendBd:this.canOrder()?V('accent-300'):V('accent'),
      orderLabel:S.sending?'Wysyłam zamówienie…'
        :(S.ordered?'✓ zamówienie wysłane'
        :(S.pay==='pobranie'?'Zamawiam — wysyłka za pobraniem':'Zamawiam — proszę o proformę')),
      showStep,nextStep:nextStep||{title:'',hint:'',opts:[]},stepTabs,
      stdOn:S.rpmSel===1400,stdOff:S.rpmSel==null,
      stdBlocks:S.rpmSel!=null&&rowsRaw.length===0&&otherRpm>0,
      otherRpmNote:'Na pozostałych prędkościach silnika (900 / 2800 obr/min) '+(plural(otherRpm,'jest','są','jest'))+' '+otherRpm+' '+plural(otherRpm,'pozycja','pozycje','pozycji')+'.',
      showAllRpm:()=>this.setState({rpmSel:null,sel:null}),
      backToStd:()=>this.setState({rpmSel:1400,sel:null}),
      isHome:S.screen==='home',isAskP1:S.screen==='askP1',isAskI:S.screen==='askI',isAskM2:S.screen==='askM2',
      isAskN2:S.screen==='askN2',isAskBore:S.screen==='askBore',isAskType:S.screen==='askType',isLegal:S.screen==='legal',
      boreList:(()=>{
        const B=window.DKM_BORE||{},m={};
        Object.keys(B).forEach(box=>{
          const add=(d,opt)=>{ const k=String(d);
            const e=m[k]=m[k]||{d,std:[],opt:[]};
            (opt?e.opt:e.std).push(box.replace('DKM','')); };
          add(B[box].std,false); (B[box].opt||[]).forEach(d=>add(d,true));
        });
        return Object.values(m).sort((a,b)=>a.d-b.d).map(x=>{
          const only=!x.std.length;
          const std=x.std.length?('DKM '+x.std.join(' · ')):'';
          const opt=x.opt.length?('DKM '+x.opt.join(' · ')):'';
          return {label:'Ø'+x.d,
            tileBg:only?V('mid-bg'):'#fff',
            tileBd:only?V('mid'):V('divider'),
            tagBg:only?V('mid-ink'):V('ok-ink'),
            numColor:only?V('mid-ink'):V('accent'),
            tag:only?'tylko na zapytanie':'z magazynu',
            hasStd:!only,stdLine:std,
            hasOpt:x.opt.length>0,
            optLine:only?opt:('+ '+opt+' na zapytanie'),
            optColor:only?V('mid-ink'):V('neutral-700'),
            optFont:only?"600 12.5px/1.3 Barlow,sans-serif":"400 11px/1.3 Barlow,sans-serif",
            go:()=>this.pushHist({boreSel:x.d,borePick:null,screen:'results',sel:null})};
        });
      })(),
      goLegal:()=>this.setState(s=>({screen:'legal',legalFrom:s.screen})),
      goTerms:()=>this.setState(s=>({screen:'terms',legalFrom:s.screen==='terms'?s.legalFrom:s.screen})),
      terms:TERMS.map(x=>({...x,b:x.b||[],p2:x.p2||[],head:x.n+'. '+x.t})),
      isTerms:S.screen==='terms',termsVer:'Wersja 1.0 · 20 sierpnia 2026 r.',
      accepted:S.accepted,acceptErr:S.acceptErr,
      toggleAccept:()=>this.setState(s=>({accepted:!s.accepted,acceptErr:false})),
      acceptBox:S.accepted?V('accent'):'transparent',
      acceptMark:S.accepted?'✓':'',
      acceptBorder:S.acceptErr?V('warn'):(S.accepted?V('accent'):V('neutral-400')),
      closeLegal:()=>this.setState(s=>({screen:s.legalFrom||'home'})),
      isResults:S.screen==='results',isDetail:S.screen==='detail'&&!!sel,isRfq:S.screen==='rfq',
      isCardA:S.screen==='v3refine',isCardB:S.screen==='v3cond',
      isSwap:S.screen==='askSwap',
      q:S.q||'',
      setQ:e=>this.setState({q:e.target.value}),
      qHits:this.searchHits(S.q),
      hasQHits:this.searchHits(S.q).length>0,
      qNote:((this.searchHits(S.q)[0]||{}).note)||'',
      hasQNote:!!((this.searchHits(S.q)[0]||{}).note),
      qEmpty:String(S.q||'').trim().length>=2&&this.searchHits(S.q).length===0,
      cardGroups:(()=>{
        const defs=[['p1','Moc silnika P₁ₙ','kW',4],['i','Przełożenie i','',6],
          ['n2','Prędkość obrotowa na wale wyjściowym n₂','obr/min',5],
          ['box','Typ przekładni','',4],['bore','Średnica wału Ød','mm',5]];
        const pickd=S.refinePick||[];
        // kryterium podane na ekranie startowym pomijamy — klient nie ma wybierać
        // dwa razy tego samego. Zostaje, gdy sam zaznaczy je w tym kroku.
        const entry=f=>S[this.fieldOf(f)]!=null&&pickd.indexOf(f)<0;
        // n₂ = n₁ / i, więc przy ustalonej prędkości silnika jedno wynika z drugiego —
        // pokazywanie obu jako osobnych kryteriów byłoby pozorną możliwością wyboru
        const derived=f=>S.rpmSel!=null&&((f==='n2'&&entry('i'))||(f==='i'&&entry('n2')));
        return defs.filter(d=>pickd.indexOf(d[0])>=0&&!entry(d[0])&&!derived(d[0])).map(d=>{
          const g=this.group(d[0],d[1],d[2],d[3]);
          const fmt=v=>g.f==='box'?String(v):(g.f==='bore'?('⌀ '+num(v)):num(v));
          return {...g,headline:g.label+(g.unit?(' '+g.unit):''),
            on:g.cur!=null,
            state:g.cur!=null?fmt(g.cur):'dowolne',
            stateFg:g.cur!=null?V('accent'):V('neutral-500'),
            bd:g.cur!=null?V('accent'):V('divider'),
            clear:()=>this.setField(g.f,null)};});})(),
      // bramka: null = jeszcze nie pytano, false = klient nie zna parametrów, true = zna
      refineAsk:S.refineAsk===true,
      refineTiles:[['p1','Moc silnika','P₁'],['i','Przełożenie','i'],['n2','Prędkość obrotowa','n₂'],
        ['box','Typ przekładni','DKM'],['bore','Średnica wału','Ød']]
        // to samo co wyżej: bez kryterium podanego przed tym krokiem i bez tego,
        // które z niego wynika (i ↔ n₂ przy ustalonej prędkości silnika)
        .filter(([f])=>{const pickd=S.refinePick||[];
          const entry=g=>S[this.fieldOf(g)]!=null&&pickd.indexOf(g)<0;
          if(entry(f)) return false;
          if(S.rpmSel!=null&&((f==='n2'&&entry('i'))||(f==='i'&&entry('n2')))) return false;
          return true;})
        .map(([f,label,sym])=>{
        const on=(S.refinePick||[]).indexOf(f)>=0;
        return {label,sym,on,
          tile:'url("'+this.A('tile-'+(f==='box'?'type':f)+'.png')+'")',
          bg:on?V('accent-100'):'#fff',bd:on?V('accent'):V('divider'),
          mark:on?'✓':'',markBg:on?V('accent'):'transparent',
          markFg:on?'#fff':'transparent',
          toggle:()=>this.setState(s=>{
            const cur=s.refinePick||[], has=cur.indexOf(f)>=0;
            const next=has?cur.filter(x=>x!==f):cur.concat([f]);
            // odznaczenie kryterium czyści też jego wartość, żeby ukryty panel
            // nie zawężał listy w niewidoczny sposób
            const p={refinePick:next,sel:null};
            if(has) p[this.fieldOf(f)]=null;
            return p;
          })};}),
      hasRefinePick:(S.refinePick||[]).length>0,
      // co klient podał przed tym krokiem — pokazujemy zamiast pustego miejsca
      entryChips:(()=>{const pickd=S.refinePick||[];
        const out=[['p1','Moc silnika','kW'],['i','Przełożenie i',''],
          ['n2','Prędkość n₂','obr/min'],['box','Typ przekładni',''],['bore','Średnica wału','mm']]
          .filter(([f])=>S[this.fieldOf(f)]!=null&&pickd.indexOf(f)<0)
          .map(([f,label,unit])=>{const v=S[this.fieldOf(f)];
            return {label,value:(f==='box'?String(v):(f==='bore'?('⌀ '+num(v)):num(v)))+(unit?(' '+unit):''),note:''};});
        // prędkość wynikająca z przełożenia — pokazujemy jako wynik, nie jako wybór
        if(S.rpmSel!=null&&S.i!=null&&pickd.indexOf('i')<0&&pickd.indexOf('n2')<0&&S.n2Exact==null){
          const vals=[...new Set(rowsRaw.map(r=>r.n2))];
          if(vals.length===1) out.push({label:'Prędkość n₂',value:num(vals[0])+' obr/min',note:'wynik'});
        }
        return out;})(),
      hasEntryChips:(()=>{const pickd=S.refinePick||[];
        return ['p1','i','n2','box','bore'].some(f=>S[this.fieldOf(f)]!=null&&pickd.indexOf(f)<0);})(),
      // „Pomiń” rezygnuje z zawężania w TYM kroku, ale nie unieżywa kryterium
      // podanego na ekranie startowym — tego klient już nie widzi i nie mógłby go przywrócić
      pickAnswerNo:()=>{this.track('refine_step',{choice:'skip'});
        this.setState(s=>{const p={refineAsk:false,refinePick:[],sel:null};
          (s.refinePick||[]).forEach(f=>{p[this.fieldOf(f)]=null;});
          return p;});},
      pickAnswerYes:()=>{this.track('refine_step',{choice:'narrow'});
        this.setState({refineAsk:true});},
      answerNoBg:S.refineAsk===false?V('accent'):'#fff',
      answerNoFg:S.refineAsk===false?'#fff':V('accent'),
      answerYesBg:S.refineAsk===true?V('accent'):'#fff',
      answerYesFg:S.refineAsk===true?'#fff':V('accent'),
      cardACount:rowsRaw.length+' z '+POOL.length+' pozycji',
      goCardB:()=>this.pushHist({screen:'v3cond',sel:null}),
      goResults:()=>this.pushHist({screen:'results',condDone:true,flowDone:true,sel:null}),
      isConsent:S.screen==='consent'&&!!S.sel,
      consentA:this.CONSENT_A,consentB:this.CONSENT_B,
      consentErr:!!S.consentErr,
      c1Mark:S.c1?'✓':'',c2Mark:S.c2?'✓':'',
      c1Fill:S.c1?V('warn'):'transparent',c2Fill:S.c2?V('warn'):'transparent',
      c1Bd:S.consentErr&&!S.c1?V('warn'):(S.c1?V('warn'):V('neutral-400')),
      c2Bd:S.consentErr&&!S.c2?V('warn'):(S.c2?V('warn'):V('neutral-400')),
      c1Bg:S.c1?V('warn-bg'):'#fff',c2Bg:S.c2?V('warn-bg'):'#fff',
      toggleC1:()=>this.setState(st=>({c1:!st.c1,consentErr:false})),
      toggleC2:()=>this.setState(st=>({c2:!st.c2,consentErr:false})),
      openConsent:()=>this.setState({screen:'consent',c1:false,c2:false,consentErr:false}),
      closeConsent:()=>this.setState({screen:'results',sel:null,c1:false,c2:false,consentErr:false}),
      confirmConsent:this.confirmConsent,
      consentRows:S.sel?(()=>{const r=S.sel,p=this.pickVar(r);
        return [{k:'Przekładnia',v:r.box+' · i '+num(r.i),color:V('accent')},
          {k:'SKU przekładni',v:this.gearSkuOf(r)||'—',color:V('accent')},
          {k:'Silnik',v:num(r.p1)+' kW · '+(r.rpm?num(r.rpm)+' obr/min':'—')+' · '+this.flangeOf(r),color:V('accent')},
          {k:'SKU silnika',v:(p&&p.v.motSku)||'—',color:V('accent')},
          {k:'Współczynnik pracy',v:'fs = '+fs1(r.fs),color:V('warn')},
          {k:'Status',v:'poza zalecanym zakresem',color:V('warn')}];})():[],
      wide:S.wide,shellW:S.wide?'1180px':'520px',brandJustify:'center',
      // Na telefonie pełny nagłówek (logo + dwuwierszowy tytuł) zajmował ~190 px, czyli
      // blisko czwartą część ekranu — na ekranie startowym to wizytówka, ale na kolejnych
      // kartach tylko zabierał miejsce doborowi. Dalej zostaje samo pomniejszone logo.
      // W wersji web nic się nie zmienia, tam miejsca nie brakuje.
      showBrandTitle:S.wide||S.screen==='home',
      logoH:S.wide?'76px':(S.screen==='home'?'58px':'34px'),
      brandPad:(!S.wide&&S.screen!=='home')
        ?'calc(env(safe-area-inset-top) + 9px) 20px 9px'
        :'calc(env(safe-area-inset-top) + 14px) 20px 0',
      docW:S.wide?'720px':'none',
      // kroki kreatora mają wspólną szerokość z ekranem startowym i wyborem wartości
      // (pełna szerokość powłoki) — inaczej przejścia między krokami skaczą w bok
      stepW:'none',specCols:S.wide?'repeat(2,minmax(0,1fr))':'minmax(0,1fr)',
      resCols:S.wide?'392px minmax(0,1fr)':'minmax(0,1fr)',
      // dwie kolumny tylko tam, gdzie kafelek ma kilka linii opisu (średnice, zamiennik);
      // czysto liczbowe siatki (przełożenie, n₂) zostają przy trzech — przy dwóch lista
      // n₂ rośnie z 9 do 14 rzędów, a kafelek 169 px na dwuznakową liczbę to strata miejsca
      tileCols:S.wide?'repeat(6,minmax(0,1fr))':'repeat(2,minmax(0,1fr))',
      numTileCols:S.wide?'repeat(6,minmax(0,1fr))':'repeat(3,minmax(0,1fr))',
      powerCols:S.wide?'repeat(3,minmax(0,1fr))':'repeat(2,minmax(0,1fr))',
      // na telefonie kafelek mocy ma ~169 px — liczba i opis jeden pod drugim,
      // obok siebie zderzały się i łamały „kW” do osobnej linii
      powDir:S.wide?'row':'column',
      powAlign:S.wide?'baseline':'flex-start',
      powGap:S.wide?'14px':'5px',
      powSubAlign:S.wide?'right':'left',
      tempCols:S.wide?'repeat(5,minmax(0,1fr))':'repeat(3,minmax(0,1fr))',
      leftBorder:S.wide?'1px solid var(--color-divider)':'0',
      cardImg:S.sel?this.cardSrc(S.sel.box):null,hasCard:!!(S.sel&&this.cardSrc(S.sel.box)),
      cardBg:S.sel&&this.cardSrc(S.sel.box)?('url("'+this.cardSrc(S.sel.box)+'")'):'none',
      cardZoomBg:S.card?('url("'+S.card+'")'):'none',
      cardRatio:this.cardRatio(S.sel&&S.sel.box),
      cardOpen:!!S.card,cardZoom:S.card,
      openCard:()=>this.openCard(),closeCard:()=>this.setState({card:null}),
      printCard:()=>this.printCard(),printSheet:()=>this.printSheet(),
      pdfCols:(S.sel&&this.cardSrc(S.sel.box))?'repeat(2,minmax(0,1fr))':'minmax(0,1fr)',
      showCrumbs:S.screen!=='home',crumbLabel:crumb,noChips:chips.length===0,
      canStepBack:(S.ustack||[]).length>0,stepBack:this.stepBack,
      totalCount:String(POOL.length),
      poolNote:S.rpmSel!=null?('Liczby dla silnika '+num(S.rpmSel)+' obr/min — standard'):'Liczby dla wszystkich prędkości silnika',
      poolNoteAll:S.rpmSel!=null?('Cały katalog · liczby wariantów dla silnika '+num(S.rpmSel)+' obr/min (standard)'):'Cały katalog · wszystkie prędkości silnika',count:String(rows.length),empty:rows.length===0,
      m2In:S.m2,n2In:S.n2,fsReq:fs1(fsReq),
      setM2:e=>this.setState({m2:e.target.value,sel:null}),
      setN2:e=>this.setState({n2:e.target.value,sel:null}),
      runM2:()=>this.pushHist({screen:'results',fsMinSel:fsReq,condDone:true,flowDone:true}),
      browseAll:()=>this.reset({screen:'results',mode:null,flowDone:true}),
      goHome:()=>this.reset({screen:'home',mode:null,ustack:[]}),
      back:()=>this.setState(s=>({screen:s.fromRfq?'rfq':'results',fromRfq:false})),
      backLabel:S.fromRfq?'← Zapytanie':'← Wyniki',
      refineOpen:S.refine,toggleRefine:()=>this.setState(s=>({refine:!s.refine})),
      refineLabel:S.refine?'Ukryj filtry':'+ Zmień kryteria',

      invPhase:S.invPhase||null,
      invPhasePicked:!!S.invPhase,
      invIs1F:S.invPhase===1,
      invShow:S.sel?this.motorPhases(S.sel)===3:false,
      invEmpty:!!(S.sel&&S.invPhase&&this.motorPhases(S.sel)===3&&this.invList(S.sel).length===0),
      invPicked:!!S.inv,
      invPickedLabel:(()=>{const f=S.inv?this.invById(S.inv):null;
        return f?('Falownik '+f[1]+' '+num(f[2])+' kW · '+f[0]):'';})(),
      invMotor1F:S.sel?this.motorPhases(S.sel)===1:false,
      invNoneOn:!S.inv,
      invNoneMark:!S.inv?'✓':'',
      invNoneBd:!S.inv?V('accent'):V('divider'),
      invNoneBg:!S.inv?V('accent'):'transparent',
      invNoneFg:!S.inv?V('bg'):V('accent'),
      invPhaseOpts:[{ph:3,label:'3 × 400 V'},{ph:1,label:'1 × 230 V'}].map(o=>{
        const on=S.invPhase===o.ph;
        return {label:o.label,bg:on?V('accent'):'transparent',fg:on?V('bg'):V('accent'),
          bd:on?V('accent'):V('accent-300'),
          pick:()=>this.setState(s=>{
            if(s.invPhase===o.ph) return {invPhase:null,inv:null};
            // ta sama reguła co kafelki — sugerowany jest pierwszy z listy
            const list=this.invListFor(o.ph,s.sel?s.sel.p1:0);
            return {invPhase:o.ph,inv:list.length?list[0][0]:null};
          })};
      }),
      invOpts:(()=>{const L=S.sel?this.invList(S.sel):[];
        const firstInSer={}; L.forEach(f=>{ if(firstInSer[f[1]]==null) firstInSer[f[1]]=f[0]; });
        return L.map((f,ix)=>{
        const on=S.inv===f[0];
        const exact=Math.abs(f[2]-this.numOf(S.sel.p1))<0.01;
        const base=firstInSer[f[1]]===f[0];   // pierwszy stopień w swojej serii
        return {sku:f[0],series:f[1],kw:num(f[2])+' kW',
          exact,
          price:zl(f[4]),priceUnit:'netto',avail:f[6]===0?'w magazynie':(f[6]===1?'dostawa 1–3 dni':'zapytaj o cenę'),
          bg:on?V('accent'):'transparent',fg:on?V('bg'):V('text'),bd:on?V('accent'):V('accent-300'),
          sub:on?'rgba(255,255,255,.85)':V('neutral-700'),
          tag:on?'✓ wybrany':(base?((ix===0?'sugerowany · ':'')+(exact?'dopasowany':'najbliższy')):'stopień wyżej'),
          // kliknięcie zawsze WYBIERA — rezygnacja tylko przyciskiem „Usuń falownik”
          pick:()=>this.setState({inv:f[0]})};
      });})(),
      clearInv:()=>this.setState({inv:null}),
      fsInfoOpen:!!S.fsInfo,
      fsInfoLabel:S.fsInfo?'Ukryj wyjaśnienie':(S.sel&&this.fsBand(S.sel.fs)==='low'
        ?'Dlaczego mimo to można kupić tę przekładnię?':'Co oznacza współczynnik pracy fs?'),
      fsInfoText:(S.sel&&this.fsBand(S.sel.fs)==='low')
        ?'Silnik o określonej mocy znamionowej nie zawsze pracuje z pełnym obciążeniem. Przykładowo silnik 0,75 kW może w danej maszynie rzeczywiście pracować z obciążeniem odpowiadającym mocy 0,37 lub 0,55 kW. Aplikacja nie zna jednak rzeczywistego obciążenia maszyny, charakteru pracy ani chwilowych przeciążeń. Dlatego nie może potwierdzić, że dana przekładnia będzie odpowiednia do konkretnego zastosowania. Klient może świadomie wybrać taki produkt, jednak przekładnia w tym zamówieniu nie będzie objęta dobrowolną gwarancją handlową DKM.'
        :'Współczynnik pracy fs określa katalogową rezerwę przekładni dla analizowanego zestawienia z wybranym silnikiem. Aplikacja oblicza go na podstawie parametrów katalogowych, w szczególności znamionowej mocy silnika. Nie określa rzeczywistego obciążenia maszyny ani bezpieczeństwa całego urządzenia. Progi 1,0 i 1,3 są kryteriami przyjętymi przez DKM Power Transmission Sp. z o.o. w konfiguratorze.',
      toggleFsInfo:()=>this.setState(st=>({fsInfo:!st.fsInfo})),
      backToResults:()=>this.setState({screen:'results',sel:null,fsInfo:false}),
      hasFlangeChoice:selVars.length>1,      flangeOpts2:selVars.map(x=>{
        const on=!!(selPick&&selPick.fl===x.fl);
        return {label:x.fl,on,
          bg:on?V('accent'):'transparent',fg:on?V('bg'):V('accent'),bd:on?V('accent'):V('accent-300'),
          sub:(x.v.setNet!=null?(zl(x.v.setNet)+' netto'):(x.v.gearNet!=null?(zl(x.v.gearNet)+' netto'):'cena na zapytanie'))+' · '+stTxt(x.v.status),
          subColor:on?'rgba(255,255,255,.85)':V('neutral-700'),
          pick:()=>this.setState({flangePick:x.fl})};
      }),
      selExtras:selEx.map(e=>({label:e.label,price:e.net===0?'gratis':(e.net!=null?zl(e.net):'na zapytanie'),
        color:e.net===0?V('ok-ink'):(e.net!=null?V('accent-700'):V('neutral-700'))})),
      hasSelExtras:selEx.length>0,
      hasPhChoice:!!(S.sel&&this.mot1f(S.sel)),
      phOpts:(()=>{
        if(!S.sel) return [];
        const one=this.mot1f(S.sel); if(!one) return [];
        const p=this.pickVar(S.sel), three=p?p.v:null;
        const cur=S.motPh===1?1:3;
        return [
          {ph:3,label:'3-fazowy 400 V',net:three?three.motNet:null},
          {ph:1,label:'1-fazowy 230 V',net:one.net}
        ].map(o=>{
          const on=cur===o.ph;
          return {label:o.label,price:o.net!=null?(zl(o.net)+' netto'):'na zapytanie',
            bg:on?V('accent'):'transparent',fg:on?V('bg'):V('text'),
            bd:on?V('accent'):V('accent-300'),sub:on?'rgba(255,255,255,.85)':V('neutral-700'),
            pick:()=>this.setState(o.ph===1?{motPh:1,inv:null,invPhase:null}:{motPh:3})};
        });
      })(),
      selTradeTag:sel?('Motoreduktor '+this.phTag(S.sel)):'',
      selMotLine:sel?('Silnik '+sel.p1+' kW · '+sel.rpmLabel):'',
      selGearLine:sel?('+ Przekładnia '+sel.box+' i'+sel.i):'',
      selHeadLine:(()=>{ if(!sel) return '';
        const bore=this.boreTxt(sel.box)+(this.boreIsOpt(sel.box)?' — na zapytanie':'');
        return ['Motoreduktor '+this.phTag(sel),
          'silnik '+sel.p1+' kW · '+sel.rpmLabel,
          'przekładnia '+sel.box+' i'+sel.i,
          'kołnierz '+sel.flangePicked,
          num(sel.n2)+' obr/min', bore].filter(Boolean).join(' · '); })(),
      selHeadSub:(()=>{ if(!sel) return '';
        const bore=this.boreTxt(sel.box)+(this.boreIsOpt(sel.box)?' — na zapytanie':'');
        return ['kołnierz '+sel.flangePicked, num(sel.n2)+' obr/min', bore]
          .filter(Boolean).join(' · '); })(),
      sel:sel?{...sel,
        motAvailLabel:selMot?(selMot.q>0?'w magazynie':'dostawa 1–3 dni'):'',
        motAvailColor:selMot?(selMot.q>0?V('ok-ink'):V('accent-700')):V('neutral-700'),
        motAvailDot:selMot?(selMot.q>0?V('ok'):'var(--dkm-blue)'):V('neutral-400'),
        motVolt:this.motVoltOf(S.sel,selMot)||'napięcie potwierdzimy',
        motVoltLabel:this.motVoltOf(S.sel,selMot)?('Zasilanie '+this.motVoltOf(S.sel,selMot)):'Napięcie zasilania potwierdzimy',
        motorNetLabel:sel.motNet!=null?zl(sel.motNet):'na zapytanie',
        setNetLabel:(sel.boxNet!=null&&sel.motNet!=null)?zl(selSet)
          :(sel.boxNet!=null?(zl(sel.boxNet+selExNet)+' + silnik na zapytanie'):'na zapytanie')}:{},
      openRfq:()=>{this.track('view_cart',{items:S.rfq.length});
        this.setState(s=>({screen:'rfq',prevScreen:s.screen==='rfq'?s.prevScreen:s.screen}));},
      closeRfq:()=>this.setState(s=>({screen:s.prevScreen||'home'})),
      rfqEmpty:rfqRows.length===0,justAdded:!!S.just,
      rfqStep:step,isStep1:step===1,isStep2:step===2,isStep3:step===3,
      rfqCols:S.wide?'minmax(0,1fr) 330px':'minmax(0,1fr)',
      rfqDocW:'none',
      rfqWide:!!S.wide,notRfq:S.screen!=='rfq',
      rfqTabs:[[1,'Napęd'],[2,'Dane'],[3,'Płatność']].map(([n,label])=>{
        const cur=step===n, done=step>n;
        return {num:done?'✓':String(n),label,
          bg:cur?'#fff':'transparent',fg:cur?V('accent'):'#fff',
          bd:cur?'#fff':'rgba(255,255,255,.45)',cur:cur?'default':'pointer',
          numBg:cur?V('accent'):(done?V('ok'):'rgba(255,255,255,.25)'),
          numFg:'#fff',go:()=>this.goStep(n)};
      }),
      showFold:step>1&&rfqRows.length>0,
      goStep1:()=>this.goStep(1),
      foldLines:rfqRows.map(r=>({text:r.foldText,color:r.boreOpt?V('mid-ink'):(r.noWty?V('warn'):V('neutral-900'))})),
      sumRows:rfqRows.map(r=>({tag:r.tradeTag,name:r.tradeName,spec:r.sumSpec,
        sum:r.boreOpt?'przekładnia do wyceny':r.lineTotal,
        sumColor:r.boreOpt?V('mid-ink'):V('accent-700'),
        boreOpt:!!r.boreOpt,boreNote:r.boreOpt?('Tuleja ⌀ '+r.boreD+' mm — niedostępna z magazynu, cena po wycenie DKM.'):'',
        mark:r.boreOpt?V('mid'):(r.noWty?V('warn'):V('accent')),
        tagFg:r.boreOpt?V('mid-ink'):(r.noWty?V('warn'):V('accent'))})),
      rfqBoreCount:(()=>{const n=S.rfq.filter(x=>x.boreOpt).length;
        return n===1?'1 pozycja z tuleją na zapytanie.':(n+' pozycje z tuleją na zapytanie.');})(),
      rfqBoreOpt:S.rfq.some(x=>x.boreOpt),
      noWtyCount:nLow===1?'1 pozycja poza zakresem.':(nLow+' pozycje poza zakresem.'),
      noWtyNote:S.rfq.some(x=>x.noWty&&!x.consent)?'Zgodę potwierdzisz przed zamówieniem.':'Zgoda zapisana — szczegóły w podsumowaniu.',
      canBack:step>1,
      rfqBack:()=>this.goStep(step-1),
      stepNext:()=>{ if(step<3){ this.goStep(step+1); return; }
        try{const b=document.querySelector('[data-order-btn]');
          if(b) b.scrollIntoView?null:null, b&&b.focus({preventScroll:false});
          const box=b&&b.getBoundingClientRect(); const sc=document.scrollingElement||document.documentElement;
          if(box) sc.scrollTop=sc.scrollTop+box.top-120;}catch(e){}
      },
      nextLabel:step<3?'Dalej →':'↓ Potwierdź',
      nextHint:step===3?'do zapłaty':'razem brutto',
      nextBg:nLow?V('warn'):V('accent'),
      stepErrMsg:S.stepErr===2?(S.del==='odbior'
        ?'Uzupełnij imię, nazwisko, e-mail i telefon.'
        :'Uzupełnij imię, nazwisko, e-mail, telefon i adres dostawy.'):'',
      hasStepErr:!!S.stepErr,
      rfqLines:rfqRows.length+' '+plural(rfqRows.length,'pozycja','pozycje','pozycji')+' · '+S.rfq.reduce((a,x)=>a+x.qty,0)+' szt.',rfqCount:String(S.rfq.reduce((a,x)=>a+x.qty,0)),
      // wartość towaru netto w pasku koszyka — gdy choć jedna pozycja jest bez ceny,
      // pokazujemy „do wyceny” zamiast sumy zaniżonej o brakujące składniki
      rfqBarSum:this.cartMissing()?'do wyceny':zl(this.cartGoods()),
      cFirst:S.c.first||'',cLast:S.c.last||'',cNip:S.c.nip||'',
      cStreet:S.c.street||'',cZip:S.c.zip||'',cCity:S.c.city||'',
      setStreet:e=>this.setC('street',e.target.value),setZip:e=>this.setC('zip',e.target.value),
      setCity:e=>this.setC('city',e.target.value),
      // adres tylko przy wysyłce — fakturę wystawiamy w KSeF na NIP, więc przy odbiorze
      // osobistym żaden adres nie jest potrzebny
      showAddr:S.del!=='odbior',
      cName:S.c.name,cFirm:S.c.firm,cEmail:S.c.email,cPhone:S.c.phone,cNote:S.c.note,
      setFirst:e=>this.setC('first',e.target.value),setLast:e=>this.setC('last',e.target.value),
      setNip:e=>this.setC('nip',e.target.value),
      setName:e=>this.setC('name',e.target.value),setFirm:e=>this.setC('firm',e.target.value),
      setEmail:e=>this.setC('email',e.target.value),setPhone:e=>this.setC('phone',e.target.value),
      setNote:e=>this.setC('note',e.target.value),
      sendRfq:this.send,
      sendLabel:S.sending?'Wysyłam zapytanie…'
        :(S.sent?'✓ otwieram program pocztowy'
        :(this.cartMissing()?'Wyślij zapytanie — wycenimy brakujące pozycje':'Mam pytanie do tego doboru')),
      sendFail:!!S.sendFail,mailText:S.mailText||'',roTrue:true,noop:()=>{},
      copyRfq:this.copyRfq,copyLabel:S.copied?'✓ skopiowano do schowka':'Kopiuj treść zapytania',
      rfqMailto:'mailto:'+(this.props.rfqEmail||'sklep@d-k-m.eu')+'?subject='+encodeURIComponent('Zapytanie ofertowe — przekładnie ślimakowe'),
      typeQ:S.typeQ,
      setTypeQ:e=>this.setState({typeQ:e.target.value}),
      typeHits,hasTypeHits:typeHits.length>0,
      histRows,hasHist:histRows.length>0,
      askAdvisor:this.askAdvisor,
      dimRows,hasDims:dimRows.length>0,
      boreStd:(()=>{const x=S.sel?this.boreFor(S.sel.box):null; return x?('⌀ '+x.d+' H7'):'';})(),
      boreKeyVal:(()=>{const x=S.sel?this.boreFor(S.sel.box):null; return (x&&x.key)?(x.key+' mm'):'—';})(),
      boreBd:(S.sel&&this.boreIsOpt(S.sel.box))?V('mid'):V('accent'),
      boreTag:(S.sel&&this.boreIsOpt(S.sel.box))?'wykonanie na zapytanie':'w standardzie',
      boreTagFg:(S.sel&&this.boreIsOpt(S.sel.box))?'#fff':V('ok'),
      boreOptOn:!!(S.sel&&this.boreIsOpt(S.sel.box)),
      boreOptMsg:'Dane techniczne — moc P₁, moment obrotowy M₂, przełożenie i, prędkość n₂ oraz współczynnik pracy fs — są identyczne jak w wykonaniu standardowym. Zmienia się wyłącznie średnica tulei drążonej, a to osobny wyrób o innym oznaczeniu, którego nie trzymamy w magazynie. Cenę, termin realizacji i SKU potwierdza DKM Power Transmission Sp. z o.o.',
      boreOpts:(()=>{const x=S.sel?this.boreFor(S.sel.box):null; if(!x) return [];
        return [{d:x.std,opt:false}].concat(x.optList.map(d=>({d,opt:true}))).map(o=>{
          const on=o.d===x.d;
          return {label:'⌀ '+o.d+' mm',
            sub:o.opt?'na zapytanie · brak w magazynie':'standard · z magazynu',
            bg:on?(o.opt?V('mid'):V('accent')):'transparent',
            fg:on?'#fff':(o.opt?V('mid-ink'):V('accent')),
            bd:on?(o.opt?V('mid'):V('accent')):V('accent-300'),
            subColor:on?'rgba(255,255,255,.85)':V('neutral-700'),
            pick:()=>this.setState({borePick:o.d})};
        });})(),
      mountCols:S.wide?'repeat(3,minmax(0,1fr))':'repeat(2,minmax(0,1fr))',
      accAll:(window.DKM_ACC||[]).reduce((a,g)=>a.concat(g.o),[]).map(o=>{
        const on=(S.acc||[]).indexOf(o.id)>=0;
        const det=this.accDetail(o.id);
        const op=S.sel?this.optOf(o.id,S.sel.box):null;
        return {...o,sel:on,...det,
          hasDet:det.hasImg||det.hasRows,
          stripNote:'w zamówieniu',
          showImg:det.hasImg&&(S.dimOn||[]).indexOf(o.id)>=0,
          showRows:det.hasRows&&(S.dimOn||[]).indexOf(o.id)>=0,
          dimBtn:det.hasImg||det.hasRows,
          dimBtnLabel:((S.dimOn||[]).indexOf(o.id)>=0?'Ukryj wymiary':(det.hasImg?'Rysunek i wymiary →':'Zobacz wymiary →')),
          dimToggle:()=>this.setState(st=>{const cur=st.dimOn||[];
            return {dimOn:cur.indexOf(o.id)>=0?cur.filter(x=>x!==o.id):[...cur,o.id]};}),
          dimLabel:det.hasImg?'Rysunek i wymiary →':'Zobacz wymiary →',
          cols:this.detCols(det.rows.length),
          priceLine:op?((op.net===0?'gratis':zl(op.net))+' netto · '+(op.q>0?'w magazynie':'dostawa 1–3 dni'))
            :(o.id==='PCV'&&S.sel&&this.pcvFree(S.sel.box)?'gratis — w standardzie do tej wielkości':'cena na zapytanie'),
          showDim:()=>this.setState({dim:{title:det.detailTitle,img:det.img,ratio:det.ratio,
            rows:det.rows,cols:this.detCols(det.rows.length),hasRows:det.hasRows,hasImg:det.hasImg}}),
          pic:'url("'+this.A('acct-'+o.id+'.jpg')+'")',
          tile:on?V('accent'):V('bg'),fg:on?V('bg'):V('text'),
          lineMark:on?V('ok'):V('accent-300'),status:on?'wybrane':(o.id==='PCV'&&S.sel&&this.pcvFree(S.sel.box)?'w standardzie · gratis':'dodaj'),
          pick:()=>this.setState(s=>{const has=(s.acc||[]).indexOf(o.id)>=0;
            const acc=has?(s.acc||[]).filter(x=>x!==o.id):[...(s.acc||[]),o.id];
            return {acc};})};}),
      dimOpen:!!S.dim,dim:S.dim||{title:'',img:'',ratio:'1 / 1',rows:[],cols:'1fr',hasRows:false,hasImg:false},
      closeDim:()=>this.setState({dim:null}),
      mountTileCols:S.wide?'repeat(3,minmax(0,1fr))':'repeat(2,minmax(0,1fr))',
      tileMinH:S.wide?'220px':'auto',tilePicMax:S.wide?'130px':'170px',
      drawMax:S.wide?'980px':'100%',
      mountAll:(window.DKM_MOUNT||[]).reduce((a,g)=>a.concat(g.o),[]).map(o=>{
        const det=this.mountDetail(o.id);
        const code={'2a':'FA','2b':'FB','3':'ARM'}[o.id]||null;
        const op=(code&&S.sel)?this.optOf(code,S.sel.box):null;
        return {...o,
        hasDet:det.hasImg||det.hasRows,
        dimLabel:det.hasImg?'Rysunek i wymiary →':'Zobacz wymiary →',
        stripNote:code?'w zamówieniu':'wybrany sposób mocowania',
        showImg:det.hasImg&&(!code||(S.dimOn||[]).indexOf(o.id)>=0),
        showRows:det.hasRows&&(!code||(S.dimOn||[]).indexOf(o.id)>=0),
        dimBtn:!!code&&(det.hasImg||det.hasRows),
        dimBtnLabel:((S.dimOn||[]).indexOf(o.id)>=0?'Ukryj wymiary':(det.hasImg?'Rysunek i wymiary →':'Zobacz wymiary →')),
        dimToggle:()=>this.setState(st=>{const cur=st.dimOn||[];
          return {dimOn:cur.indexOf(o.id)>=0?cur.filter(x=>x!==o.id):[...cur,o.id]};}),
        priceLine:code?(op?(zl(op.net)+' netto \u00b7 '+(op.q>0?'w magazynie':'dostawa 1\u20133 dni')):'cena na zapytanie'):'',
        showDim:()=>this.setState({dim:{title:det.detailTitle,img:det.img,ratio:det.ratio,
          rows:det.rows,cols:this.detCols(det.rows.length),hasRows:det.hasRows,hasImg:det.hasImg}}),
        pic:'url("'+this.A('mnt-'+o.id+'.jpg')+'")',
        mark:mSel(o.id)?V('ok'):V('accent-300'),
        tile:mSel(o.id)?V('accent'):V('bg'),
        fg:mSel(o.id)?V('bg'):V('text'),
        sel:mSel(o.id),off:this.mountUnavailable(o.id),
        opac:this.mountUnavailable(o.id)?'.45':'1',
        ...this.mountDetail(o.id),
        cols:this.detCols(this.mountDetail(o.id).rows.length),
        status:this.mountUnavailable(o.id)?'brak dla tej wielkości':(mSel(o.id)?'wybrane':(/^1/.test(o.id)?'zobacz wymiary':'dodaj')),
        pick:()=>{ if(this.mountUnavailable(o.id)) return;
          this.setState(s=>{const cur=s.mounts||[];
            return {mounts:cur.indexOf(o.id)>=0?cur.filter(x=>x!==o.id):[...cur,o.id]};}); }};}),
      extraAsk:(()=>{const on=['2a','2b','3'].some(id=>this.mountsHas(id));
        return S.mountExtras==null?(on?true:null):S.mountExtras;})(),
      extraYes:()=>this.setState({mountExtras:true}),
      extraNo:()=>this.setState(st=>({mountExtras:false,
        mounts:(st.mounts||[]).filter(id=>['2a','2b','3'].indexOf(id)<0),
        dimOn:(st.dimOn||[]).filter(id=>['2a','2b','3'].indexOf(id)<0)})),
      mountGroups:(window.DKM_MOUNT||[]).map((g,gi)=>({...g,n:gi+1,
        optional:gi>0,
        visible:gi===0||(S.mountExtras==null?['2a','2b','3'].some(id=>this.mountsHas(id)):S.mountExtras===true),
        showQ:gi===1&&!(S.mountExtras==null?['2a','2b','3'].some(id=>this.mountsHas(id)):S.mountExtras===true),
        noOn:S.mountExtras===false,
        noLabel:S.mountExtras===true?'Nie, dziękuję':'✓ Nie, dziękuję',
        noBg:S.mountExtras===true?'transparent':V('accent'),
        noFg:S.mountExtras===true?V('accent-700'):V('bg'),
        noBd:S.mountExtras===true?V('accent-300'):V('accent'),
        yesBg:S.mountExtras===true?V('accent'):'transparent',
        yesFg:S.mountExtras===true?V('bg'):V('accent-700'),
        yesBd:S.mountExtras===true?V('accent'):V('accent-300'),
        canHide:gi===1&&(S.mountExtras==null?['2a','2b','3'].some(id=>this.mountsHas(id)):S.mountExtras===true),cols:S.wide?'repeat(3,minmax(0,1fr))':'repeat(2,minmax(0,1fr))',tiles:true,rows:false,o:g.o.map(o=>{
        const det=this.mountDetail(o.id);
        const code={'2a':'FA','2b':'FB','3':'ARM'}[o.id]||null;
        const dimOpen=(S.dimOn||[]).indexOf(o.id)>=0;
        return {...o,
        pic:'url("'+this.A('mnt-'+o.id+'.jpg')+'")',
        mark:mSel(o.id)?V('ok'):V('accent-300'),
        tile:mSel(o.id)?V('accent'):V('bg'),
        sel:mSel(o.id),
        showImg:det.hasImg&&(!code||dimOpen),
        showRows:det.hasRows&&(!code||dimOpen),
        dimBtn:!!code&&(det.hasImg||det.hasRows),
        dimBtnLabel:dimOpen?'Ukryj wymiary':(det.hasImg?'Rysunek i wymiary \u2192':'Zobacz wymiary \u2192'),
        dimToggle:()=>this.setState(st=>{const cur=st.dimOn||[];
          return {dimOn:cur.indexOf(o.id)>=0?cur.filter(x=>x!==o.id):[...cur,o.id]};}),
        stripNote:({'2a':1,'2b':1,'3':1}[o.id]?'w zam\u00f3wieniu':'wybrany spos\u00f3b mocowania'),
        priceLine:(()=>{const code={'2a':'FA','2b':'FB','3':'ARM'}[o.id];
          if(!code) return '';
          const op=S.sel?this.optOf(code,S.sel.box):null;
          return op?(zl(op.net)+' netto \u00b7 '+(op.q>0?'w magazynie':'dostawa 1\u20133 dni')):'cena na zapytanie';})(),
        ...this.mountDetail(o.id),
        cols:this.detCols(this.mountDetail(o.id).rows.length),
        status:this.mountUnavailable(o.id)?'brak dla tej wielkości':(mSel(o.id)?'wybrane':(/^1/.test(o.id)?'zobacz wymiary':'dodaj')),
        off:this.mountUnavailable(o.id),
        opac:this.mountUnavailable(o.id)?'.45':'1',
        bg:mSel(o.id)?V('accent'):'transparent',
        fg:mSel(o.id)?'#fff':V('neutral-900'),
        bd:mSel(o.id)?V('accent'):V('divider'),
        noDraw:!o.drawing,
        pick:()=>{ if(this.mountUnavailable(o.id)) return;
          this.setState(s=>{const cur=s.mounts||[];
            return {mounts:cur.indexOf(o.id)>=0?cur.filter(x=>x!==o.id):[...cur,o.id]};}); }};})})),
      mountPicked:this.mountLabel(),hasMountPick:(S.mounts||[]).length>0,
      accGroups:(window.DKM_ACC||[]).map(g=>({...g,o:g.o.map(o=>{
        const on=(S.acc||[]).indexOf(o.id)>=0;
        return {...o,sel:on,...this.accDetail(o.id),
          cols:this.detCols(this.accDetail(o.id).rows.length),
          tile:on?V('accent'):V('bg'),lineMark:on?V('ok'):V('accent-300'),
          status:on?'wybrane':(o.id==='PCV'&&S.sel&&this.pcvFree(S.sel.box)?'w standardzie · gratis':'dodaj'),bg:on?V('accent'):'transparent',fg:on?'#fff':V('neutral-900'),
          bd:on?V('accent'):V('divider'),noDraw:!o.drawing,mark:on?'✓':'',
          pick:()=>this.toggleAcc(o.id)};
      })})),
      invSectionShow:S.invSection==null?!!S.inv:S.invSection===true,
      invYes:()=>this.setState({invSection:true}),
      invNo:()=>this.setState({invSection:false,inv:null,invPhase:null}),
      invNoLabel:(S.invSection===true||(S.invSection==null&&!!S.inv))?'Nie, dziękuję':'✓ Nie, dziękuję',
      invNoBg:(S.invSection===true||(S.invSection==null&&!!S.inv))?'transparent':V('accent'),
      invNoFg:(S.invSection===true||(S.invSection==null&&!!S.inv))?V('accent-700'):V('bg'),
      invNoBd:(S.invSection===true||(S.invSection==null&&!!S.inv))?V('accent-300'):V('accent'),
      invYesBg:(S.invSection===true||(S.invSection==null&&!!S.inv))?V('accent'):'transparent',
      invYesFg:(S.invSection===true||(S.invSection==null&&!!S.inv))?V('bg'):V('accent-700'),
      invYesBd:(S.invSection===true||(S.invSection==null&&!!S.inv))?V('accent'):V('accent-300'),
      accShow:S.accExtras==null?((S.acc||[]).length>0):S.accExtras===true,
      accYes:()=>this.setState({accExtras:true}),
      accNo:()=>this.setState({accExtras:false,acc:[]}),
      accNoLabel:(S.accExtras===true||(S.accExtras==null&&(S.acc||[]).length>0))?'Nie, dziękuję':'✓ Nie, dziękuję',
      accNoBg:(S.accExtras===true||(S.accExtras==null&&(S.acc||[]).length>0))?'transparent':V('accent'),
      accNoFg:(S.accExtras===true||(S.accExtras==null&&(S.acc||[]).length>0))?V('accent-700'):V('bg'),
      accNoBd:(S.accExtras===true||(S.accExtras==null&&(S.acc||[]).length>0))?V('accent-300'):V('accent'),
      accYesBg:(S.accExtras===true||(S.accExtras==null&&(S.acc||[]).length>0))?V('accent'):'transparent',
      accYesFg:(S.accExtras===true||(S.accExtras==null&&(S.acc||[]).length>0))?V('bg'):V('accent-700'),
      accYesBd:(S.accExtras===true||(S.accExtras==null&&(S.acc||[]).length>0))?V('accent'):V('accent-300'),
      accPicked:this.accLabel(),hasAcc:(S.acc||[]).length>0,
      shaftRows:this.shaftRows(),showShaft:this.shaftRows().length>0,
      shaftVariant:(S.acc||[]).indexOf('DS')>=0?'DS — dwustronny':'SS — jednostronny',
      shaftBg:'url("'+this.A('acc-'+((S.acc||[]).indexOf('DS')>=0?'ds':'ss')+'.png')+'")',
      shaftRatio:(S.acc||[]).indexOf('DS')>=0?'520 / 291':'1240 / 604',
      pcvVal:this.pcv()?(num(this.pcv())+' mm'):'',showPcv:!!this.pcv(),
      pcvBg:'url("'+this.A('acc-pcv.png')+'")',
      footVal:S.sel?(this.mountDim()||''):'',footLabel:this.mountsHas('1b')?'Rozstaw montażowy (V+Q) × C₁':'Rozstaw otworów C × C₁',
      showFoot:!!(S.sel&&this.mountDim()),
      faceRows:this.faceRows(),showFace:this.faceRows().length>0,
      armRows:this.armRows(),showArm:this.armRows().length>0,
      flangeRows:this.flangeRows(),showFlange:this.flangeRows().length>0,
      flangeVariant:this.flangeVariant(),
      flangeNone:!!(this.flangeVariant()&&S.sel&&this.flangeRows().length===0),
      flangeBg:'url("'+this.A('mount-flange-'+(this.flangeVariant()==='FB'?'fb':'fa')+'.png')+'")',
      armBg:'url("'+this.A('mount-arm.png')+'")',
      hasBoreKey:!!(S.sel&&(this.boreFor(S.sel.box)||{}).key),
      hasBore:!!(S.sel&&this.boreFor(S.sel.box)),
      hasBoreOpt:!!(S.sel&&((this.boreFor(S.sel.box)||{optList:[]}).optList||[]).length),
      footCols:S.wide?'repeat(2,minmax(0,1fr))':'minmax(0,1fr) minmax(0,1fr)',
      rfqBarLabel:S.rfq.length?'Twój koszyk — zamów lub zapytaj':'Koszyk pusty — dodaj przekładnię',
      // baner zgody na analitykę — widoczny tylko dopóki decyzji nie ma
      gdprRows:(()=>{const pre=S.wide?'':'Podstawa prawna: ';
        return [
          ['Przyjęcie, weryfikacja i realizacja zamówienia albo przygotowanie oferty','art. 6 ust. 1 lit. b RODO — działania przed zawarciem umowy i wykonanie umowy'],
          ['Kontakt dotyczący złożonego zamówienia lub zapytania','art. 6 ust. 1 lit. b RODO'],
          ['Wystawienie dokumentów księgowych i wypełnienie obowiązków podatkowych','art. 6 ust. 1 lit. c RODO'],
          ['Dochodzenie lub obrona przed roszczeniami','art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes Administratora'],
          ['Analiza sposobu korzystania z aplikacji i jej ulepszanie przy użyciu Google Analytics 4','art. 6 ust. 1 lit. a RODO — zgoda użytkownika na analityczne pliki cookies']
        ].map(([cel,b])=>({cel,basis:pre+b}));})(),
      anaAsk:S.anaConsent==null,
      anaYes:()=>this.anaSet('yes'),
      anaNo:()=>this.anaSet('no'),
      anaOn:S.anaConsent==='yes',
      anaState:S.anaConsent==='yes'
        ?'Analityka włączona — mierzymy anonimowo wejścia i użycie koszyka.'
        :(S.anaConsent==='no'
          ?'Analityka wyłączona — nie zbieramy żadnych danych o korzystaniu z aplikacji.'
          :'Nie podjęto jeszcze decyzji — analityka nie jest uruchomiona.'),
      sending:!!(S.sending||S.sentOk),
      sendCur:(S.sending||S.sentOk)?'not-allowed':'pointer',
      sendPE:(S.sending||S.sentOk)?'none':'auto',
      sendOp:(S.sending||S.sentOk)?'.6':'1',
      sentOk:!!S.sentOk,sentRef:S.sentRef||'',
      sentTitle:S.ordered?'Zamówienie wysłane do DKM':'Zapytanie wysłane do DKM',
      sentNote:S.ordered
        ?'Potwierdzenie i proformę wyślemy na podany adres e-mail. Za chwilę wrócisz na ekran startowy.'
        :'Odpowiemy na podany adres e-mail. Koszyk zostaje — możesz go dalej edytować.',
      sendErr:S.sendErr||'',hasSendErr:!!S.sendErr,
      rfqEmail:this.props.rfqEmail||'sklep@d-k-m.eu',formCols:S.wide?'repeat(2,minmax(0,1fr))':'minmax(0,1fr)',
      addToRfq:this.add,rfqLabel:S.just?'✓ dodano do koszyka':'Dodaj do koszyka'
    };
  }
}
