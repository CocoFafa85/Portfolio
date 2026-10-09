/** Tokens of the turning gradient, in order (the HoloCard border's: main.scss :root) */
const STOPS = ['--neon-cyan', '--neon-violet', '--neon-pink', '--neon-cyan', '--neon-violet', '--neon-cyan'];

let colours: string[] | null = null;

/** Resolves the tokens once (canvas colours are plain strings, read at setup only). */
function readColours(): string[] {
    if (!colours) {
        const style = getComputedStyle(document.documentElement);
        colours = STOPS.map((token) => style.getPropertyValue(token).trim());
    }
    return colours;
}

/**
 * Paints the conic gradient of the neon border once, over the whole canvas
 * (the frame turns the canvas itself; only its ring shows through the mask).
 * Without conic gradients (old browsers), the same colours in a sweep.
 */
export function paintNeonTurn(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    const stops = readColours();
    const gradient = typeof ctx.createConicGradient === 'function'
        ? ctx.createConicGradient(0, width / 2, height / 2)
        : ctx.createLinearGradient(0, 0, width, height);
    stops.forEach((colour, index) => gradient.addColorStop(index / (stops.length - 1), colour));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}
