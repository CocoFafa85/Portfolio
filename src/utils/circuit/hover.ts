import type { Board } from './board';
import { distanceToPolyline } from './geometry';

/** Spatial grid: traces crossing each cell, in compressed rows (start offsets + items). */
export interface HoverIndex {
    cell: number;
    cols: number;
    rows: number;
    start: Uint32Array;
    items: Uint32Array;
}

export interface HoverSettings {
    /** Lighting radius around the pointer, at most one grid cell */
    radius: number;
    /** Share of the gap to the target glow closed per frame */
    rise: number;
    /** Glow kept per frame once the pointer is gone */
    decay: number;
}

/** Per-trace glow (0..1) and the last frame each trace was lit, sized once per board. */
export interface GlowState {
    glow: Float32Array;
    seen: Uint32Array;
    frame: number;
}

export interface Pointer {
    x: number;
    y: number;
    active: boolean;
}

const cellOf = (index: HoverIndex, x: number, y: number): number => {
    const cx = Math.floor(x / index.cell);
    const cy = Math.floor(y / index.cell);
    return cx < 0 || cy < 0 || cx >= index.cols || cy >= index.rows ? -1 : cy * index.cols + cx;
};

/** Builds the grid once per board, so a frame only measures the traces near the pointer. */
export function createHoverIndex(board: Board, cell: number): HoverIndex {
    const index: HoverIndex = {
        cell,
        cols: Math.max(1, Math.ceil(board.width / cell)),
        rows: Math.max(1, Math.ceil(board.height / cell)),
        start: new Uint32Array(0),
        items: new Uint32Array(0),
    };
    const buckets: number[][] = Array.from({ length: index.cols * index.rows }, () => []);
    const { points, traceStart } = board;
    for (let t = 0; t < board.traceCount; t++) {
        for (let i = traceStart[t] + 1; i < traceStart[t + 1]; i++) {
            const x0 = points[2 * i - 2];
            const y0 = points[2 * i - 1];
            const dx = points[2 * i] - x0;
            const dy = points[2 * i + 1] - y0;
            const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (cell / 2)));
            for (let s = 0; s <= steps; s++) {
                const c = cellOf(index, x0 + (dx * s) / steps, y0 + (dy * s) / steps);
                if (c >= 0 && buckets[c][buckets[c].length - 1] !== t) buckets[c].push(t);
            }
        }
    }
    index.start = new Uint32Array(buckets.length + 1);
    buckets.forEach((bucket, c) => { index.start[c + 1] = index.start[c] + bucket.length; });
    index.items = Uint32Array.from(buckets.flat());
    return index;
}

export function createGlowState(traceCount: number): GlowState {
    return { glow: new Float32Array(traceCount), seen: new Uint32Array(traceCount), frame: 0 };
}

/**
 * Fades every glow, then lights the traces within `radius` of the pointer
 * (3 × 3 cells around it), once per trace even when it crosses several cells.
 * Allocation free. Returns true while any trace glows.
 */
export function updateGlow(
    state: GlowState,
    board: Board,
    index: HoverIndex,
    pointer: Pointer,
    settings: HoverSettings
): boolean {
    const { glow, seen } = state;
    const frame = ++state.frame;
    let lit = false;
    for (let t = 0; t < glow.length; t++) {
        const value = glow[t] * settings.decay;
        glow[t] = value < 0.01 ? 0 : value;
        if (value >= 0.01) lit = true;
    }
    if (!pointer.active) return lit;

    const cx = Math.floor(pointer.x / index.cell);
    const cy = Math.floor(pointer.y / index.cell);
    for (let y = cy - 1; y <= cy + 1; y++) {
        for (let x = cx - 1; x <= cx + 1; x++) {
            if (x < 0 || y < 0 || x >= index.cols || y >= index.rows) continue;
            const c = y * index.cols + x;
            for (let k = index.start[c]; k < index.start[c + 1]; k++) {
                const t = index.items[k];
                if (seen[t] === frame) continue;
                seen[t] = frame;
                const distance = distanceToPolyline(
                    board.points, board.traceStart[t], board.traceStart[t + 1], pointer.x, pointer.y);
                if (distance >= settings.radius) continue;
                const target = 1 - distance / settings.radius;
                if (target > glow[t]) glow[t] += (target - glow[t]) * settings.rise;
                lit = true;
            }
        }
    }
    return lit;
}
