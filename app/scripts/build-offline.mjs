// Buduje jeden samodzielny plik HTML — całą aplikację z katalogiem, cennikiem,
// rysunkami i czcionkami w środku. Otwarty z dysku (file://) działa bez internetu
// i można go dodać do ekranu głównego telefonu.
//
// Obrazy trafiają do window.__resources pod kluczami 'a_<nazwa_pliku>' — tak samo
// jak w prototypie, więc metoda A() w logice znajduje je bez żadnej zmiany w kodzie.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const dist = join(root, 'dist');
const outDir = join(root, 'dist-offline');
const outFile = join(outDir, 'DKM Dobor przekladni v3.html');

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
};
const dataUri = async (path) =>
  'data:' + (MIME[extname(path).toLowerCase()] || 'application/octet-stream') +
  ';base64,' + (await readFile(path)).toString('base64');

const resKey = (name) => 'a_' + name.replace(/[^a-zA-Z0-9]/g, '_');

// ——— czcionki: podmieniamy url(./barlow-XX.woff2) na data: ———
let fontCss = await readFile(join(dist, 'fonts', 'fonts.css'), 'utf8');
for (const f of (await readdir(join(dist, 'fonts'))).filter((f) => f.endsWith('.woff2'))) {
  fontCss = fontCss.split('./' + f).join(await dataUri(join(dist, 'fonts', f)));
}

// ——— obrazy z assets/ ———
const assetNames = await readdir(join(dist, 'assets'));
const resources = {};
const inlineAsset = {};
for (const name of assetNames) {
  const uri = await dataUri(join(dist, 'assets', name));
  resources[resKey(name)] = uri;
  inlineAsset['assets/' + name] = uri;
}

// ——— arkusz i skrypt aplikacji ———
const buildFiles = await readdir(join(dist, 'build'));
const cssName = buildFiles.find((f) => f.endsWith('.css'));
const jsName = buildFiles.find((f) => f.endsWith('.js'));
let appCss = cssName ? await readFile(join(dist, 'build', cssName), 'utf8') : '';
let appJs = await readFile(join(dist, 'build', jsName), 'utf8');

// Literalne ścieżki do obrazów (logo, kafelki, zdjęcie na starcie) nie idą przez
// A(), więc podmieniamy je w treści. W skrypcie kierujemy je do window.__resources,
// żeby ten sam obraz nie wylądował w pliku dwa razy; w arkuszu (gdzie nie da się
// wstawić wyrażenia) wpisujemy data: URI.
for (const [path, uri] of Object.entries(inlineAsset)) {
  const key = resKey(basename(path));
  for (const q of ['"', "'"]) {
    appJs = appJs.split(q + path + q).join('(window.__resources.' + key + ')');
  }
  appJs = appJs.split(path).join(uri); // gdyby gdzieś została goła ścieżka
  appCss = appCss.split(path).join(uri);
}

const icon180 = resources[resKey('app-icon-180.png')];
const icon192 = resources[resKey('app-icon-192.png')];
const icon512 = resources[resKey('app-icon-512.png')];

const html = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>DKM · Dobór przekładni ślimakowych</title>
<meta name="theme-color" content="#29265b">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="DKM Dobór">
<meta name="application-name" content="DKM Dobór">
<link rel="apple-touch-icon" sizes="180x180" href="${icon180}">
<link rel="icon" sizes="192x192" type="image/png" href="${icon192}">
<link rel="icon" sizes="512x512" type="image/png" href="${icon512}">
<script>
// Obrazy wbudowane w plik — logika czyta je metodą A().
window.__resources = ${JSON.stringify(resources)};
// Manifest budujemy w pamięci, żeby „Dodaj do ekranu głównego” działało
// także dla pliku otwartego z dysku.
(function(){
  try{
    var mf={name:'DKM · Dobór przekładni ślimakowych',short_name:'DKM Dobór',
      start_url:location.href,scope:'./',display:'standalone',
      background_color:'#ffffff',theme_color:'#29265b',lang:'pl',
      icons:[{src:window.__resources.${resKey('app-icon-192.png')},sizes:'192x192',type:'image/png',purpose:'any maskable'},
             {src:window.__resources.${resKey('app-icon-512.png')},sizes:'512x512',type:'image/png',purpose:'any maskable'}]};
    var l=document.createElement('link'); l.rel='manifest';
    l.href=URL.createObjectURL(new Blob([JSON.stringify(mf)],{type:'application/manifest+json'}));
    document.head.appendChild(l);
  }catch(e){}
})();
</script>
<style>
${fontCss}
${appCss}
</style>
</head>
<body>
<div id="app"></div>
<script>
${appJs}
</script>
</body>
</html>
`;

await mkdir(outDir, { recursive: true });
await writeFile(outFile, html);
console.log('Zapisano ' + outFile + ' — ' + (Buffer.byteLength(html) / 1048576).toFixed(1) + ' MB');
