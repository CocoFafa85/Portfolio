import type { Board } from '../../../utils/circuit/board';
import type { Random } from '../../../utils/random';
import type { CircuitPalette } from './palette';

export interface BoardStyle {
    maskAlpha: number;
    traceWidth: number;
    traceAlpha: number;
    sheenWidth: number;
    sheenAlpha: number;
    pinWidth: number;
    viaRadius: number;
    holeRadius: number;
    padSize: number;
    silkAlpha: number;
    silkWidth: number;
    labelFont: string;
    labelOffset: number;
    grainSize: number;
    grainAlpha: number;
}

const FULL_TURN = Math.PI * 2;

/** Adds trace `t` to the current path (shared with the live layer). */
export function addTracePath(ctx: CanvasRenderingContext2D, board: Board, t: number): void {
    const { points, traceStart } = board;
    const from = traceStart[t];
    ctx.moveTo(points[2 * from], points[2 * from + 1]);
    for (let i = from + 1; i < traceStart[t + 1]; i++) ctx.lineTo(points[2 * i], points[2 * i + 1]);
}

/** Small tile of grey noise, repeated as the grain of the matte solder mask. */
export function createGrainTile(size: number, random: Random): HTMLCanvasElement {
    const tile = document.createElement('canvas');
    tile.width = size;
    tile.height = size;
    const ctx = tile.getContext('2d');
    if (!ctx) return tile;
    const image = ctx.createImageData(size, size);
    for (let i = 0; i < image.data.length; i += 4) {
        const grey = Math.floor(random() * 256);
        image.data[i] = grey;
        image.data[i + 1] = grey;
        image.data[i + 2] = grey;
        image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    return tile;
}

function drawParts(ctx: CanvasRenderingContext2D, board: Board, palette: CircuitPalette, style: BoardStyle): void {
    const pad = style.padSize;
    const reach = board.partSize / 2 - pad / 2;
    ctx.fillStyle = palette.gold;
    for (const part of board.parts) {
        for (const side of [-1, 1]) {
            const x = part.x + (part.vertical ? 0 : side * reach);
            const y = part.y + (part.vertical ? side * reach : 0);
            ctx.fillRect(x - pad / 2, y - pad / 2, pad, pad);
        }
    }
    ctx.globalAlpha = style.silkAlpha;
    ctx.strokeStyle = palette.silk;
    ctx.fillStyle = palette.silk;
    ctx.lineWidth = style.silkWidth;
    for (const part of board.parts) {
        const w = (part.vertical ? board.partSize / 2 : board.partSize) + 4;
        const h = (part.vertical ? board.partSize : board.partSize / 2) + 4;
        ctx.strokeRect(part.x - w / 2, part.y - h / 2, w, h);
        ctx.fillText(part.label, part.x - w / 2, part.y - h / 2 - 2);
    }
    ctx.globalAlpha = 1;
}

function drawChips(ctx: CanvasRenderingContext2D, board: Board, palette: CircuitPalette, style: BoardStyle): void {
    ctx.beginPath();
    for (let i = 0; i < board.pins.length; i += 4) {
        ctx.moveTo(board.pins[i], board.pins[i + 1]);
        ctx.lineTo(board.pins[i + 2], board.pins[i + 3]);
    }
    ctx.lineCap = 'butt';
    ctx.strokeStyle = palette.pin;
    ctx.lineWidth = style.pinWidth;
    ctx.stroke();
    for (const chip of board.chips) {
        const x = chip.x - chip.w / 2;
        const y = chip.y - chip.h / 2;
        ctx.fillStyle = palette.chip;
        ctx.fillRect(x, y, chip.w, chip.h);
        ctx.strokeStyle = palette.chipEdge;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, chip.w - 1, chip.h - 1);
        ctx.globalAlpha = style.silkAlpha;
        ctx.fillStyle = palette.silk;
        ctx.beginPath();
        ctx.arc(x + 5, y + 5, 1.5, 0, FULL_TURN);
        ctx.fill();
        ctx.fillText(chip.label, x, y - style.labelOffset);
        ctx.globalAlpha = 1;
    }
}

function drawVias(ctx: CanvasRenderingContext2D, board: Board, palette: CircuitPalette, style: BoardStyle): void {
    for (const [radius, colour] of [[style.viaRadius, palette.gold], [style.holeRadius, palette.mask]] as const) {
        ctx.beginPath();
        for (let i = 0; i < board.vias.length; i += 2) {
            ctx.moveTo(board.vias[i] + radius, board.vias[i + 1]);
            ctx.arc(board.vias[i], board.vias[i + 1], radius, 0, FULL_TURN);
        }
        ctx.fillStyle = colour;
        ctx.fill();
    }
}

/** Draws the whole static board (mask, grain, copper, components, silkscreen). Once per resize. */
export function drawBoard(
    ctx: CanvasRenderingContext2D,
    board: Board,
    palette: CircuitPalette,
    grain: CanvasPattern | null,
    style: BoardStyle
): void {
    const { width, height } = board;
    ctx.clearRect(0, 0, width, height);
    // Slightly translucent mask: the layout's violet glow still breathes through
    ctx.globalAlpha = style.maskAlpha;
    ctx.fillStyle = palette.mask;
    ctx.fillRect(0, 0, width, height);
    if (grain) {
        ctx.globalAlpha = style.grainAlpha;
        ctx.fillStyle = grain;
        ctx.fillRect(0, 0, width, height);
    }

    // Copper under the mask: one path, a body stroke then a thin sheen
    ctx.beginPath();
    for (let t = 0; t < board.traceCount; t++) addTracePath(ctx, board, t);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalAlpha = style.traceAlpha;
    ctx.strokeStyle = palette.copper;
    ctx.lineWidth = style.traceWidth;
    ctx.stroke();
    ctx.globalAlpha = style.sheenAlpha;
    ctx.strokeStyle = palette.copperLight;
    ctx.lineWidth = style.sheenWidth;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.font = style.labelFont;
    ctx.textBaseline = 'bottom';
    drawChips(ctx, board, palette, style);
    drawParts(ctx, board, palette, style);
    drawVias(ctx, board, palette, style);
}
