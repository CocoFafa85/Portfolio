// Themed visuals of the projects without a live demo (LOT 5, P1), drawn once on a canvas and
// captured by scripts/capture-demos.mjs. Concept art, not screenshots: the cards' alt texts say so.
// Every function draws on a logical W × H box (16:10); colours are the site's neon tokens.
const NEON = { cyan: '#00f3ff', green: '#39ff14', pink: '#ff2e6e', violet: '#bc13fe', amber: '#ffb21a', magenta: '#ff0080' };

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

function heart(g, x, y, s, full) {
    g.save(); g.translate(x, y); g.scale(s / 20, s / 20); g.beginPath();
    g.moveTo(10, 18); g.bezierCurveTo(-6, 8, 2, -4, 10, 4); g.bezierCurveTo(18, -4, 26, 8, 10, 18); g.closePath();
    if (full) { g.fillStyle = NEON.pink; g.shadowColor = NEON.pink; g.shadowBlur = 10; g.fill(); } else { g.strokeStyle = NEON.pink; g.lineWidth = 2.2; g.stroke(); }
    g.restore();
}

function wisp(g, x, y, s) {
    g.save(); g.translate(x, y);
    const halo = g.createRadialGradient(0, 0, 0, 0, 0, s * 2.4);
    halo.addColorStop(0, 'rgba(200,251,255,.75)'); halo.addColorStop(0.35, 'rgba(0,243,255,.28)'); halo.addColorStop(1, 'rgba(0,243,255,0)');
    g.globalCompositeOperation = 'lighter'; g.fillStyle = halo; g.beginPath(); g.arc(0, 0, s * 2.4, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = 'source-over';
    const body = g.createLinearGradient(0, -s, 0, s * 0.7); body.addColorStop(0, '#9ff6ff'); body.addColorStop(0.5, '#e8fdff'); body.addColorStop(1, '#ffffff');
    g.fillStyle = body; g.shadowColor = NEON.cyan; g.shadowBlur = s * 0.8; g.beginPath();
    g.moveTo(0, -s * 1.15); g.bezierCurveTo(s * 0.25, -s * 0.6, s * 0.75, -s * 0.35, s * 0.62, s * 0.2); g.bezierCurveTo(s * 0.52, s * 0.72, -s * 0.52, s * 0.72, -s * 0.62, s * 0.2); g.bezierCurveTo(-s * 0.75, -s * 0.35, -s * 0.2, -s * 0.5, 0, -s * 1.15); g.fill();
    g.shadowBlur = 0; g.fillStyle = '#0a1830';
    g.beginPath(); g.ellipse(-s * 0.2, s * 0.12, s * 0.08, s * 0.13, 0, 0, Math.PI * 2); g.ellipse(s * 0.2, s * 0.12, s * 0.08, s * 0.13, 0, 0, Math.PI * 2); g.fill();
    g.restore();
}

/** SoulSweeper (minesweeper × roguelike): a real minesweeper board in a dungeon, lit by a soul. */
function drawSoulSweeper(g, W, H) {
    const r = rng(7);
    g.fillStyle = '#07060d'; g.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 30) for (let x = -((y / 30) % 2) * 30; x < W; x += 60) { g.fillStyle = `rgba(${40 + r() * 20},${30 + r() * 14},${60 + r() * 24},${0.18 + r() * 0.12})`; g.fillRect(x + 1, y + 1, 58, 28); }
    const cols = 15, rows = 8, s = Math.floor(Math.min((W * 0.86) / cols, (H * 0.72) / rows)), ox = Math.round((W - cols * s) / 2), oy = Math.round(H * 0.13);
    g.fillStyle = '#05040a'; g.fillRect(ox - 10, oy - 10, cols * s + 20, rows * s + 20);
    g.strokeStyle = '#2a2440'; g.lineWidth = 3; g.strokeRect(ox - 10, oy - 10, cols * s + 20, rows * s + 20);
    const c0 = 7, r0 = 4, mine = [], cnt = [], open = [];
    for (let y = 0; y < rows; y++) { mine.push(Array(cols).fill(false)); cnt.push(Array(cols).fill(0)); open.push(Array(cols).fill(false)); }
    let placed = 0;
    while (placed < 19) { const x = Math.floor(r() * cols), y = Math.floor(r() * rows); if (mine[y][x] || (Math.abs(x - c0) <= 1 && Math.abs(y - r0) <= 1)) continue; mine[y][x] = true; placed++; }
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const yy = y + j, xx = x + i; if ((i || j) && yy >= 0 && yy < rows && xx >= 0 && xx < cols && mine[yy][xx]) cnt[y][x]++; }
    const stack = [[c0, r0]];
    while (stack.length) { const [x, y] = stack.pop(); if (open[y][x] || mine[y][x]) continue; open[y][x] = true; if (cnt[y][x] === 0) for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const xx = x + i, yy = y + j; if (xx >= 0 && xx < cols && yy >= 0 && yy < rows) stack.push([xx, yy]); } }
    const NUM = ['', NEON.cyan, NEON.green, NEON.pink, NEON.violet, NEON.amber, NEON.cyan, '#fff', '#fff'];
    let flags = 0, shown = false;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const px = ox + x * s, py = oy + y * s;
        if (open[y][x]) {
            g.fillStyle = '#100e1a'; g.fillRect(px, py, s, s); g.strokeStyle = '#1c1830'; g.lineWidth = 1; g.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
            if (cnt[y][x]) { g.fillStyle = NUM[cnt[y][x]]; g.shadowColor = NUM[cnt[y][x]]; g.shadowBlur = 8; g.font = `700 ${Math.round(s * 0.5)}px Orbitron, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(cnt[y][x]), px + s / 2, py + s / 2 + 1); g.shadowBlur = 0; }
            continue;
        }
        const gr = g.createLinearGradient(px, py, px + s, py + s); gr.addColorStop(0, '#2e2746'); gr.addColorStop(1, '#17132a'); g.fillStyle = gr; g.fillRect(px + 1, py + 1, s - 2, s - 2);
        g.fillStyle = 'rgba(122,92,255,.35)'; g.fillRect(px + 1, py + 1, s - 2, 2); g.fillRect(px + 1, py + 1, 2, s - 2);
        g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(px + 1, py + s - 3, s - 2, 2); g.fillRect(px + s - 3, py + 1, 2, s - 2);
        const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([i, j]) => open[y + j] && open[y + j][x + i]);
        if (mine[y][x] && edge && flags < 4 && r() < 0.7) {
            flags++; g.strokeStyle = '#d8d8e6'; g.lineWidth = 2; g.beginPath(); g.moveTo(px + s * 0.38, py + s * 0.78); g.lineTo(px + s * 0.38, py + s * 0.22); g.stroke();
            g.fillStyle = NEON.pink; g.shadowColor = NEON.pink; g.shadowBlur = 10; g.beginPath(); g.moveTo(px + s * 0.4, py + s * 0.22); g.lineTo(px + s * 0.74, py + s * 0.36); g.lineTo(px + s * 0.4, py + s * 0.5); g.fill(); g.shadowBlur = 0;
        } else if (mine[y][x] && edge && !shown && flags >= 2) {
            shown = true; g.fillStyle = '#16060c'; g.fillRect(px + 1, py + 1, s - 2, s - 2);
            const cx = px + s / 2, cy = py + s / 2, gl = g.createRadialGradient(cx, cy, 0, cx, cy, s * 0.9);
            gl.addColorStop(0, 'rgba(255,59,47,.7)'); gl.addColorStop(1, 'rgba(255,59,47,0)'); g.fillStyle = gl; g.fillRect(px - s / 2, py - s / 2, s * 2, s * 2);
            g.strokeStyle = '#2b2b38'; g.lineWidth = 3;
            for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * s * 0.38, cy + Math.sin(a) * s * 0.38); g.stroke(); }
            g.fillStyle = '#1a1a24'; g.beginPath(); g.arc(cx, cy, s * 0.24, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ff3b2f'; g.beginPath(); g.arc(cx, cy, s * 0.08, 0, Math.PI * 2); g.fill();
        }
    }
    const sx = ox + c0 * s + s / 2, sy = oy + r0 * s + s / 2;
    const fog = g.createRadialGradient(sx, sy, s * 1.6, sx, sy, W * 0.62);
    fog.addColorStop(0, 'rgba(4,3,8,0)'); fog.addColorStop(0.6, 'rgba(4,3,8,.32)'); fog.addColorStop(1, 'rgba(4,3,8,.78)'); g.fillStyle = fog; g.fillRect(0, 0, W, H);
    for (const tx of [ox - 34, ox + cols * s + 34]) {
        const ty = oy + rows * s * 0.45, tg = g.createRadialGradient(tx, ty, 0, tx, ty, 120);
        tg.addColorStop(0, 'rgba(255,150,40,.55)'); tg.addColorStop(1, 'rgba(255,120,30,0)');
        g.globalCompositeOperation = 'lighter'; g.fillStyle = tg; g.fillRect(tx - 120, ty - 120, 240, 240); g.globalCompositeOperation = 'source-over';
        g.fillStyle = '#3a2a1a'; g.fillRect(tx - 4, ty, 8, 26); g.fillStyle = '#ffcf6a'; g.beginPath(); g.ellipse(tx, ty - 6, 6, 11, 0, 0, Math.PI * 2); g.fill();
    }
    for (let k = 0; k < 16; k++) { const a = r() * Math.PI * 2, d = s * (0.8 + r() * 1.8); g.fillStyle = `rgba(159,246,255,${0.4 + r() * 0.5})`; g.beginPath(); g.arc(sx + Math.cos(a) * d, sy + Math.sin(a) * d * 0.7 - s * 0.3, 1 + r() * 2, 0, Math.PI * 2); g.fill(); }
    wisp(g, sx, sy - s * 0.1, s * 0.62);
    heart(g, 24, 22, 26, true); heart(g, 56, 22, 26, true); heart(g, 88, 22, 26, false);
    g.font = '700 20px Orbitron, sans-serif'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillStyle = '#d8d8e6'; g.fillText('ÉTAGE 3', W - 24, 36);
    g.textAlign = 'center'; g.font = '900 34px Orbitron, sans-serif';
    const lg = g.createLinearGradient(W / 2 - 180, 0, W / 2 + 180, 0); lg.addColorStop(0, NEON.violet); lg.addColorStop(1, NEON.pink);
    g.fillStyle = lg; g.shadowColor = NEON.pink; g.shadowBlur = 18; g.fillText('SOULSWEEPER', W / 2, H - 36); g.shadowBlur = 0;
}

function thumb(g, x, y, sz, color) {
    g.save(); g.translate(x, y); g.scale(sz / 24, sz / 24); g.fillStyle = color;
    rr(g, -6, -1, 14, 12, 3); g.fill(); rr(g, -3, -12, 6, 13, 3); g.fill(); rr(g, -11, 0, 4, 11, 1.5); g.fill();
    g.fillStyle = 'rgba(0,0,0,.35)'; for (let k = 0; k < 3; k++) g.fillRect(-5, 2 + k * 3, 12, 1.2);
    g.restore();
}

/** PouceStop (Android, Kotlin): a phone showing a trip on a map, a night road, a thumb-up stop sign. */
function drawPouceStop(g, W, H) {
    const r = rng(3), hz = H * 0.5;
    const sky = g.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#05040e'); sky.addColorStop(1, '#1a0b2e'); g.fillStyle = sky; g.fillRect(0, 0, W, hz);
    for (let k = 0; k < 70; k++) { g.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.6})`; g.fillRect(r() * W, r() * hz * 0.8, 1.5, 1.5); }
    const glow = g.createRadialGradient(W * 0.42, hz, 0, W * 0.42, hz, W * 0.5); glow.addColorStop(0, 'rgba(255,0,128,.35)'); glow.addColorStop(1, 'rgba(255,0,128,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
    for (let x = 0; x < W;) {
        const w = 18 + r() * 46, h = 20 + r() * 90; g.fillStyle = '#0b0918'; g.fillRect(x, hz - h, w, h);
        for (let k = 0; k < h / 14; k++) if (r() < 0.35) { g.fillStyle = [NEON.amber, NEON.cyan, NEON.magenta][Math.floor(r() * 3)]; g.globalAlpha = 0.55; g.fillRect(x + 4 + r() * (w - 10), hz - h + 6 + k * 13, 3, 4); g.globalAlpha = 1; }
        x += w + 2;
    }
    g.fillStyle = '#07060f'; g.fillRect(0, hz, W, H - hz);
    const vx = W * 0.42; g.fillStyle = '#0e0d18'; g.beginPath(); g.moveTo(vx - 6, hz); g.lineTo(vx + 6, hz); g.lineTo(W * 0.92, H); g.lineTo(-W * 0.08, H); g.fill();
    g.strokeStyle = 'rgba(0,243,255,.8)'; g.lineWidth = 2; g.shadowColor = NEON.cyan; g.shadowBlur = 10; g.beginPath(); g.moveTo(vx - 6, hz); g.lineTo(-W * 0.08, H); g.moveTo(vx + 6, hz); g.lineTo(W * 0.92, H); g.stroke(); g.shadowBlur = 0;
    g.strokeStyle = NEON.amber;
    for (let k = 0; k < 9; k++) { const t0 = Math.pow(k / 9, 1.8), t1 = Math.pow((k + 0.45) / 9, 1.8); g.lineWidth = 1 + t0 * 7; g.beginPath(); g.moveTo(vx + (W * 0.42 - vx) * t0, hz + (H - hz) * t0); g.lineTo(vx + (W * 0.42 - vx) * t1, hz + (H - hz) * t1); g.stroke(); }
    const px = W * 0.2, py = H * 0.56;
    g.fillStyle = '#2a2a3a'; g.fillRect(px - 3, py, 6, H * 0.4); g.fillStyle = NEON.amber; g.shadowColor = NEON.amber; g.shadowBlur = 22; g.beginPath(); g.arc(px, py - 4, 34, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
    g.fillStyle = '#111'; g.beginPath(); g.arc(px, py - 4, 29, 0, Math.PI * 2); g.fill(); thumb(g, px, py - 2, 36, NEON.amber);
    const fx = W * 0.6, fy = H * 0.07, fw = H * 0.5, fh = H * 0.88;
    g.save(); g.translate(fx + fw / 2, fy + fh / 2); g.rotate(-0.05); g.translate(-fw / 2, -fh / 2);
    g.shadowColor = 'rgba(0,243,255,.45)'; g.shadowBlur = 30; g.fillStyle = '#14141f'; rr(g, 0, 0, fw, fh, 30); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = '#3a3a52'; g.lineWidth = 3; rr(g, 0, 0, fw, fh, 30); g.stroke();
    const sx = 9, sy = 9, sw = fw - 18, sh = fh - 18;
    g.save(); rr(g, sx, sy, sw, sh, 22); g.clip();
    g.fillStyle = '#0a0f1e'; g.fillRect(sx, sy, sw, sh);
    g.strokeStyle = '#16213a'; g.lineWidth = 7;
    for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(sx - 20, sy + k * 52 + 10); g.lineTo(sx + sw + 20, sy + k * 52 - 40); g.stroke(); g.beginPath(); g.moveTo(sx + k * 46 - 30, sy); g.lineTo(sx + k * 46 + 20, sy + sh); g.stroke(); }
    g.fillStyle = 'rgba(57,255,20,.07)'; g.beginPath(); g.ellipse(sx + sw * 0.7, sy + sh * 0.3, 50, 34, 0.4, 0, Math.PI * 2); g.fill();
    const A = [sx + sw * 0.2, sy + sh * 0.64], B = [sx + sw * 0.78, sy + sh * 0.2];
    g.strokeStyle = NEON.amber; g.lineWidth = 5; g.shadowColor = NEON.amber; g.shadowBlur = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(A[0], A[1]); g.bezierCurveTo(sx + sw * 0.55, sy + sh * 0.6, sx + sw * 0.3, sy + sh * 0.32, B[0], B[1]); g.stroke(); g.shadowBlur = 0;
    g.fillStyle = NEON.cyan; g.beginPath(); g.arc(A[0], A[1], 9, 0, Math.PI * 2); g.fill(); g.fillStyle = '#0a0f1e'; g.beginPath(); g.arc(A[0], A[1], 4, 0, Math.PI * 2); g.fill();
    g.fillStyle = NEON.magenta; g.beginPath(); g.arc(B[0], B[1] - 12, 11, Math.PI, 0); g.lineTo(B[0], B[1] + 6); g.closePath(); g.fill();
    const mx = sx + sw * 0.44, my = sy + sh * 0.46; g.fillStyle = NEON.amber; g.shadowColor = NEON.amber; g.shadowBlur = 14; rr(g, mx - 19, my - 19, 38, 38, 10); g.fill(); g.shadowBlur = 0; thumb(g, mx, my + 1, 26, '#111');
    g.fillStyle = 'rgba(10,15,30,.92)'; g.fillRect(sx, sy, sw, 44); g.fillStyle = NEON.amber; g.font = '700 15px Orbitron, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('PouceStop', sx + 16, sy + 26);
    g.fillStyle = '#141428'; rr(g, sx, sy + sh * 0.72, sw, sh * 0.3, 18); g.fill(); g.fillStyle = '#3a3a52'; rr(g, sx + sw / 2 - 18, sy + sh * 0.72 + 8, 36, 4, 2); g.fill();
    g.fillStyle = '#2a2a44'; g.beginPath(); g.arc(sx + 30, sy + sh * 0.72 + 40, 14, 0, Math.PI * 2); g.fill(); rr(g, sx + 52, sy + sh * 0.72 + 30, sw * 0.45, 8, 4); g.fill(); rr(g, sx + 52, sy + sh * 0.72 + 44, sw * 0.3, 7, 4); g.fill();
    g.fillStyle = NEON.amber; rr(g, sx + 16, sy + sh - 54, sw - 32, 38, 19); g.fill(); thumb(g, sx + sw / 2, sy + sh - 35, 20, '#111');
    g.restore(); g.fillStyle = '#05050a'; g.beginPath(); g.arc(fw / 2, 22, 5, 0, Math.PI * 2); g.fill(); g.restore();
}

/** Draws `art` full screen on #art once the fonts are in, then flags window.__visualReady for the capture. */
function paint(art) {
    const cv = document.getElementById('art'), W = 960, H = 600, scale = innerWidth / W;
    cv.width = Math.round(W * scale); cv.height = Math.round(H * scale);
    document.fonts.ready.then(() => {
        const g = cv.getContext('2d'); g.scale(scale, scale); art(g, W, H);
        window.__visualReady = true;
    });
}
