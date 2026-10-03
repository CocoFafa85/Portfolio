/**
 * Geometry of printed-circuit traces. A trace is a polyline stored as x,y pairs
 * in a flat array; functions take [from, to) point indices so they work on the
 * packed Float32Array of a whole board without copying.
 */

export interface Point {
    x: number;
    y: number;
}

/** Extra lead per bus rank so parallel traces keep their spacing through a 45° bend. */
export const BEND_OFFSET = Math.SQRT2 - 1;

export interface BusTrace {
    /** Pin tip where the trace starts */
    x: number;
    y: number;
    /** Outward axis direction (-1, 0 or 1 on each axis, one axis only) */
    dirX: number;
    dirY: number;
    /** Side of the 45° jog along the perpendicular axis */
    turn: -1 | 1;
    /** 0 = innermost trace of the bus (on the side of the turn, bends first) */
    rank: number;
    /** Spacing between parallel traces */
    pitch: number;
    /** Straight part before the bend, diagonal run (per axis), straight part after */
    lead: number;
    diagonal: number;
    tail: number;
}

/** Routes one trace of a bus (lead, 45° jog, tail) and appends its 4 points to `out`. */
export function routeBusTrace(out: number[], trace: BusTrace): void {
    const { x, y, dirX, dirY, turn, rank, pitch, lead, diagonal, tail } = trace;
    const perpX = dirY !== 0 ? 1 : 0;
    const perpY = dirX !== 0 ? 1 : 0;
    const straight = lead + rank * pitch * BEND_OFFSET;
    const x1 = x + dirX * straight;
    const y1 = y + dirY * straight;
    const x2 = x1 + (dirX + turn * perpX) * diagonal;
    const y2 = y1 + (dirY + turn * perpY) * diagonal;
    out.push(x, y, x1, y1, x2, y2, x2 + dirX * tail, y2 + dirY * tail);
}

/** Length of the polyline made of points [from, to). */
export function polylineLength(points: ArrayLike<number>, from: number, to: number): number {
    let length = 0;
    for (let i = from + 1; i < to; i++) {
        length += Math.hypot(points[2 * i] - points[2 * i - 2], points[2 * i + 1] - points[2 * i - 1]);
    }
    return length;
}

/** Writes into `out` the point at `distance` along the polyline (clamped to its ends). */
export function pointAlong(points: ArrayLike<number>, from: number, to: number, distance: number, out: Point): Point {
    let remaining = Math.max(0, distance);
    for (let i = from + 1; i < to; i++) {
        const x0 = points[2 * i - 2];
        const y0 = points[2 * i - 1];
        const dx = points[2 * i] - x0;
        const dy = points[2 * i + 1] - y0;
        const length = Math.hypot(dx, dy);
        if (remaining <= length && length > 0) {
            out.x = x0 + (dx * remaining) / length;
            out.y = y0 + (dy * remaining) / length;
            return out;
        }
        remaining -= length;
    }
    out.x = points[2 * to - 2];
    out.y = points[2 * to - 1];
    return out;
}

/** Shortest distance from (px, py) to the polyline made of points [from, to). */
export function distanceToPolyline(points: ArrayLike<number>, from: number, to: number, px: number, py: number): number {
    let best = Infinity;
    for (let i = from + 1; i < to; i++) {
        const x0 = points[2 * i - 2];
        const y0 = points[2 * i - 1];
        const dx = points[2 * i] - x0;
        const dy = points[2 * i + 1] - y0;
        const lengthSq = dx * dx + dy * dy;
        const t = lengthSq > 0 ? Math.min(1, Math.max(0, ((px - x0) * dx + (py - y0) * dy) / lengthSq)) : 0;
        const distance = Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy));
        if (distance < best) best = distance;
    }
    return best;
}
