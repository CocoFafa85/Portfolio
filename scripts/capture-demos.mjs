// Captures the project visuals of the Projects page (LOT 5, P1) into src/assets/projects/<id>-<width>.webp:
// screenshots of the live demos (MemoryGame, SolarSystem, PortfolioFirst — Corentin's own sites) and the
// themed visuals drawn by scripts/visuals/*.html (SoulSweeper, PouceStop: concept art, no demo yet).
// Headless Chrome through the DevTools protocol, no dependency: Chrome encodes the WebP itself.
// Method: a 1440 × 900 viewport (DPR 1), the demo brought to a telling state (see `prepare`), then the
// whole viewport scaled to each width of projectVisuals.json (16:10), WebP at its quality. `npm run gen:visuals`.
// SolarSystem: its welcome dialog shows an e-mail address (no contact details on the portfolio): closed first.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
// Widths, quality and folder: src/data/projectVisuals.json (also read by the cards and postbuild.mjs)
const settings = JSON.parse(readFileSync(join(root, 'src', 'data', 'projectVisuals.json'), 'utf8'));
const VIEWPORT = { width: 1440, height: 900 };
const WIDTHS = settings.widths;
const QUALITY = settings.quality;
const BUDGET = 500 * 1024;
const visual = (name) => pathToFileURL(join(root, 'scripts', 'visuals', `${name}.html`)).href;

// Expressions evaluated in the page once it settled; each resolves when the view is ready
const sleep = 'const sleep = (ms) => new Promise((r) => setTimeout(r, ms));';
const MEMORY = `(async () => { ${sleep}
    const pairs = { 'Past Simple': 'I brushed my teeth this morning.', 'Present Continuous': "I'm brushing my teeth.", 'Future Simple': 'I will brush my teeth tomorrow morning.' };
    const cards = [...document.querySelectorAll('.card-wrapper')];
    const find = (text) => cards.find((c) => c.querySelector('.card-back').textContent.trim().startsWith(text));
    for (const [tense, sentence] of Object.entries(pairs)) { find(tense)?.click(); await sleep(450); find(sentence)?.click(); await sleep(1400); }
    find('Past Perfect')?.click(); await sleep(900);
    return document.body.innerText.includes('3 / 10') ? 'ok' : 'pairs not matched'; })()`;
const SOLAR = `(async () => { ${sleep}
    const button = (re) => [...document.querySelectorAll('button')].find((b) => re.test((b.getAttribute('aria-label') || '') + '|' + b.textContent.trim()));
    button(/Bon voyage/)?.click(); await sleep(800);
    button(/menu des astres/)?.click(); await sleep(500);
    button(/Planètes/)?.click(); await sleep(500);
    [...document.querySelectorAll('button.body-menu__item')].find((b) => b.textContent.trim() === 'Saturne')?.click(); await sleep(3500);
    button(/menu des astres/)?.click(); await sleep(300);
    const canvas = document.querySelector('canvas');
    for (let i = 0; i < 6; i++) { canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, clientX: innerWidth / 2, clientY: innerHeight / 2, bubbles: true, cancelable: true })); await sleep(60); }
    await sleep(3000);
    // The e-mail address of the welcome dialog must not be on screen
    return ['[at]', '@'].some((mark) => document.body.innerText.includes(mark)) ? 'adresse e-mail visible' : 'ok'; })()`;
const READY = `(async () => { for (let i = 0; i < 100 && !window.__visualReady; i++) await new Promise((r) => setTimeout(r, 50)); return window.__visualReady ? 'ok' : 'not drawn'; })()`;

/** id → page to capture, settle time (ms) and preparation: the ids of content.projects.list */
const TARGETS = [
    { id: 'memory', url: 'https://cocofafa85.github.io/EnglishMemory/Memory.html', waitMs: 3000, prepare: MEMORY },
    { id: 'first-portfolio', url: 'https://cocofafa85.github.io/PortfolioFirst/index.html', waitMs: 8000 },
    { id: 'solar', url: 'https://cocofafa85.github.io/SolarSystem/index.html', waitMs: 6000, prepare: SOLAR },
    { id: 'soulsweeper', url: visual('soulsweeper'), waitMs: 300, prepare: READY },
    { id: 'poucestop', url: visual('poucestop'), waitMs: 300, prepare: READY },
];

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((path) => existsSync(path));
if (!browser) throw new Error('capture-demos : Chrome ou Edge introuvable');

const port = 9500 + Math.floor(Math.random() * 400);
// File access: the themed visuals load the Orbitron files of node_modules
const chrome = spawn(browser, ['--headless=new', `--remote-debugging-port=${port}`, '--no-first-run', '--hide-scrollbars', '--allow-file-access-from-files',
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'capture-'))}`, `--window-size=${VIEWPORT.width},${VIEWPORT.height}`, 'about:blank'], { stdio: 'ignore' });

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

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { ...VIEWPORT, deviceScaleFactor: 1, mobile: false });
const outDir = join(root, ...settings.dir.split('/'));
mkdirSync(outDir, { recursive: true });
let total = 0;
for (const target of TARGETS) {
    await send('Page.navigate', { url: target.url });
    await pause(target.waitMs);
    if (target.prepare) {
        const run = await send('Runtime.evaluate', { expression: target.prepare, awaitPromise: true, returnByValue: true });
        const state = run.result?.result?.value;
        if (state !== 'ok') throw new Error(`capture-demos : ${target.id} pas prêt (${state ?? run.result?.exceptionDetails?.text})`);
    }
    for (const width of WIDTHS) {
        const shot = await send('Page.captureScreenshot', {
            format: 'webp', quality: QUALITY,
            clip: { x: 0, y: 0, ...VIEWPORT, scale: width / VIEWPORT.width },
        });
        if (!shot.result) throw new Error(`capture-demos : échec de la capture de ${target.id}`);
        const file = join(outDir, `${target.id}-${width}.webp`);
        writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
        const size = statSync(file).size;
        total += size;
        console.log(`capture-demos : ${target.id}-${width}.webp ${(size / 1024).toFixed(1)} Ko`);
    }
}
console.log(`capture-demos : ${TARGETS.length * WIDTHS.length} fichiers, ${(total / 1024).toFixed(1)} Ko au total (budget ${BUDGET / 1024} Ko)`);
socket.close();
chrome.kill();
process.exit(total > BUDGET ? 1 : 0);
