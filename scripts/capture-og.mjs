// Captures the share image public/og-image.jpg (LOT 7, D1: composition B « Porte ouverte », 2026-10-14):
// the home page of the production build, its stargate dialled (the nine chevrons locked, the event horizon
// formed, just before the dive) and the three roles on one line under the name. `npm run build`, then
// `npm run gen:og`. Headless Chrome through the DevTools protocol, no dependency: Chrome encodes the JPEG.
// Method: the build is served by `vite preview`; a 1200 × 630 viewport rendered at density 2 and scaled
// down (smooth edges); the dial is started once the gate has assembled, after the first shooting star and
// before the first comet (StarField: firstMeteorMs, firstCometMs in src/data/effects.ts), else the page is
// reloaded. The roles decode one into another on the site: the capture writes them all, as reduced motion does.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(root, 'public', 'og-image.jpg');
const VIEW = { width: 1200, height: 630 };
const QUALITY = 88;
const BUDGET = 300 * 1024;
const PORT = 4179;
const TRIES = 6;
// Page clock (ms): the gate engine boots at idle, then assembles (gateEffects.introMs 1 400) ; the dial starts
// in [DIAL_FROM, DIAL_UNTIL] (first meteor gone, first comet at 5 000 not yet there), shot SHOT_AFTER later
const GATE_SETTLE_MS = 2000;
const DIAL_FROM = 3700;
const DIAL_UNTIL = 4300;
const SHOT_AFTER = 400;

// The roles and their separator, read from content.ts (the only source of the texts)
const content = readFileSync(join(root, 'src', 'data', 'content.ts'), 'utf8');
const roles = JSON.parse(content.match(/roles: (\[[^\]]+\])/)?.[1] ?? 'null');
const separator = content.match(/rolesSeparator: "([^"]*)"/)?.[1];
if (!roles || separator === undefined) throw new Error('capture-og : rôles introuvables dans content.ts');
const subtitle = roles.join(separator);
if (!existsSync(join(root, 'dist', 'index.html'))) throw new Error('capture-og : dist absent, lancer npm run build');

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const preview = spawn(process.execPath, [join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(PORT), '--strictPort'],
    { cwd: root, stdio: 'ignore' });
let chrome = null;
// Whatever happens (an error included), the server and the browser stop with the script
process.on('exit', () => { chrome?.kill(); preview.kill(); });
const url = `http://localhost:${PORT}/`;
let served = false;
for (let i = 0; i < 100 && !served; i++) {
    try { served = (await fetch(url)).ok; } catch { await pause(150); }
}
if (!served) throw new Error(`capture-og : vite preview ne répond pas sur ${url}`);

const browser = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((path) => existsSync(path));
if (!browser) throw new Error('capture-og : Chrome ou Edge introuvable');
const port = 9500 + Math.floor(Math.random() * 400);
chrome = spawn(browser, ['--headless=new', `--remote-debugging-port=${port}`, '--no-first-run', '--hide-scrollbars',
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'capture-og-'))}`, `--window-size=${VIEW.width},${VIEW.height}`, 'about:blank'], { stdio: 'ignore' });

let targets;
for (let i = 0; i < 100 && !targets; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch { await pause(150); }
}
const socket = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
});
const send = (method, params = {}) => new Promise((resolve) => { const i = ++id; pending.set(i, resolve); socket.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

// In the page: the clock, and when the gate is assembled (its engine chunk loaded + boot + assembly)
const NOW = 'performance.now()';
const GATE_READY = `(() => { const e = performance.getEntriesByType('resource').find((r) => r.name.includes('gateEngine'));
    return e ? e.responseEnd + ${GATE_SETTLE_MS} : null; })()`;
const DIAL = `(() => { document.querySelector('h1 + p').textContent = ${JSON.stringify(subtitle)};
    document.querySelectorAll('nav a')[1].click(); return true; })()`;
const STATE = `({ path: location.pathname, dialing: document.querySelector('nav')?.hasAttribute('data-dialing'),
    subtitle: document.querySelector('h1 + p')?.textContent })`;

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { ...VIEW, deviceScaleFactor: 2, mobile: false });
let shot = null;
for (let attempt = 1; attempt <= TRIES && !shot; attempt++) {
    await send('Page.navigate', { url });
    await pause(1500);
    await evaluate('document.fonts.ready.then(() => true)');
    let now = await evaluate(NOW);
    let ready = await evaluate(GATE_READY);
    while (now < DIAL_UNTIL && (ready === null || now < Math.max(ready, DIAL_FROM))) {
        await pause(25);
        [now, ready] = [await evaluate(NOW), await evaluate(GATE_READY)];
    }
    if (now >= DIAL_UNTIL) { console.log(`capture-og : essai ${attempt}, fenêtre manquée (porte prête à ${Math.round(ready)} ms)`); continue; }
    await evaluate(DIAL);
    await pause(SHOT_AFTER);
    const before = await evaluate(STATE);
    const image = await send('Page.captureScreenshot', { format: 'jpeg', quality: QUALITY, clip: { x: 0, y: 0, ...VIEW, scale: 0.5 } });
    const after = await evaluate(STATE);
    const ok = [before, after].every((s) => s.path === '/' && s.dialing && s.subtitle === subtitle);
    if (ok && image.result) shot = image.result.data;
    else console.log(`capture-og : essai ${attempt}, état inattendu ${JSON.stringify(after)}`);
}
socket.close();
if (!shot) throw new Error(`capture-og : aucune capture valable en ${TRIES} essais`);
writeFileSync(OUT, Buffer.from(shot, 'base64'));
const size = statSync(OUT).size;
console.log(`capture-og : og-image.jpg ${VIEW.width}×${VIEW.height}, ${(size / 1024).toFixed(1)} Ko (budget ${BUDGET / 1024} Ko)`);
process.exit(size > BUDGET ? 1 : 0);
