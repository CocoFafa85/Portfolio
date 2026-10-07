import type { Random } from '../random';

/** Lightning around the convector during a jump (LOT 3, B2). */
export interface BoltSettings {
    count: number;
    /** Midpoint subdivisions: a bolt has 2^depth segments */
    depth: number;
    /** Sideways kick of each midpoint, as a share of its segment length */
    jitter: number;
}

/** A jagged path from (x1, y1) to (x2, y2) by midpoint displacement, as SVG path data. */
export function boltPath(random: Random, x1: number, y1: number, x2: number, y2: number, depth: number, jitter: number): string {
    let points = [x1, y1, x2, y2];
    for (let level = 0; level < depth; level++) {
        const next = [points[0], points[1]];
        for (let i = 2; i < points.length; i += 2) {
            const ax = points[i - 2];
            const ay = points[i - 1];
            const bx = points[i];
            const by = points[i + 1];
            const length = Math.hypot(bx - ax, by - ay) || 1;
            const kick = (random() - 0.5) * jitter * length;
            next.push((ax + bx) / 2 - ((by - ay) / length) * kick, (ay + by) / 2 + ((bx - ax) / length) * kick, bx, by);
        }
        points = next;
    }
    let path = '';
    for (let i = 0; i < points.length; i += 2) path += `${i === 0 ? 'M' : ' L'}${points[i].toFixed(1)} ${points[i + 1].toFixed(1)}`;
    return path;
}

/**
 * Bolts shot from the flux capacitor (origin) to random points of the
 * console's edge, `width` × `height`. Built once per console size, never
 * during the jump. Deterministic for `random`.
 */
export function createBolts(random: Random, originX: number, originY: number, width: number, height: number, settings: BoltSettings): string[] {
    const bolts: string[] = [];
    for (let i = 0; i < settings.count; i++) {
        // Walk round the edge so the bolts spread on every side
        const side = i % 4;
        const along = random();
        const x = side === 0 ? along * width : side === 1 ? width : side === 2 ? along * width : 0;
        const y = side === 0 ? 0 : side === 1 ? along * height : side === 2 ? height : along * height;
        bolts.push(boltPath(random, originX, originY, x, y, settings.depth, settings.jitter));
    }
    return bolts;
}
