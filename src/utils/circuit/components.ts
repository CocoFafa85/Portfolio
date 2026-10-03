import { between, inRange, type Random } from '../random';
import type { BoardConfig, Chip, Part } from './board';
import { calmDensity, calmHalfWidth } from './density';
import { routeBusTrace, type BusTrace } from './geometry';

/** Mutable state of a board being generated (plain arrays, packed at the end). */
export interface Builder {
    width: number;
    height: number;
    cfg: BoardConfig;
    random: Random;
    points: number[];
    starts: number[];
    vias: number[];
    pins: number[];
    /** x0,y0,x1,y1 of the space taken by each component (margin included) */
    boxes: number[];
    chips: Chip[];
    parts: Part[];
}

/** Outward directions of the four sides of a component: left, right, top, bottom */
const SIDES = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const;
const PLACEMENT_ATTEMPTS = 24;

const randomTurn = (random: Random): -1 | 1 => (random() < 0.5 ? -1 : 1);

function addTrace(b: Builder, trace: BusTrace): void {
    b.starts.push(b.points.length / 2);
    routeBusTrace(b.points, trace);
    const end = b.points.length;
    b.vias.push(b.points[end - 2], b.points[end - 1]);
}

/** Finds a free spot for a w × h component, favouring the sides of the screen. */
function place(b: Builder, w: number, h: number): { x: number; y: number } | null {
    const { width, height, cfg, random, boxes } = b;
    if (width < w + 8 || height < h + 8) return null;
    for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS; attempt++) {
        const x = between(random, w / 2 + 4, width - w / 2 - 4);
        const y = between(random, h / 2 + 4, height - h / 2 - 4);
        if (random() > calmDensity(x, width, cfg.calm)) continue;
        const x0 = x - w / 2 - cfg.margin;
        const y0 = y - h / 2 - cfg.margin;
        const x1 = x + w / 2 + cfg.margin;
        const y1 = y + h / 2 + cfg.margin;
        let free = true;
        for (let i = 0; i < boxes.length && free; i += 4) {
            free = x1 < boxes[i] || x0 > boxes[i + 2] || y1 < boxes[i + 1] || y0 > boxes[i + 3];
        }
        if (!free) continue;
        boxes.push(x0, y0, x1, y1);
        return { x, y };
    }
    return null;
}

/** QFP (pins on 4 sides) or SOIC (pins on the long sides), each side fanning out a bus. */
export function addChip(b: Builder, label: string): void {
    const { cfg, random } = b;
    const qfp = random() < cfg.qfpShare;
    const w = inRange(random, qfp ? cfg.qfpSize : cfg.soicWidth);
    const h = qfp ? w : inRange(random, cfg.soicHeight);
    const spot = place(b, w, h);
    if (!spot) return;
    b.chips.push({ x: spot.x, y: spot.y, w, h, label });

    for (const [dirX, dirY] of SIDES) {
        if (!qfp && dirX !== 0) continue;
        const along = dirX !== 0 ? h : w;
        const count = Math.max(2, Math.floor((along - 4) / cfg.pitch));
        const turn = randomTurn(random);
        const lead = inRange(random, cfg.lead);
        const diagonal = inRange(random, cfg.diagonal);
        const tail = inRange(random, cfg.tail);
        const edgeX = spot.x + (dirX * w) / 2;
        const edgeY = spot.y + (dirY * h) / 2;
        for (let i = 0; i < count; i++) {
            const offset = (i - (count - 1) / 2) * cfg.pitch;
            const px = edgeX + (dirY !== 0 ? offset : 0);
            const py = edgeY + (dirX !== 0 ? offset : 0);
            const x = px + dirX * cfg.pinLength;
            const y = py + dirY * cfg.pinLength;
            b.pins.push(px, py, x, y);
            if (random() > cfg.keepPin) continue;
            const rank = turn < 0 ? i : count - 1 - i;
            // Shorter tails towards the calm band, staggered vias so they never touch
            const reach = tail * calmDensity(x + dirX * (lead + diagonal + tail), b.width, cfg.calm);
            addTrace(b, {
                x, y, dirX, dirY, turn, rank, pitch: cfg.pitch, lead, diagonal,
                tail: reach + (rank % 2) * cfg.pitch * 1.5,
            });
        }
    }
}

/** Two-pad passive (resistor, capacitor), each pad routed to a via. */
export function addPart(b: Builder, label: string): void {
    const { cfg, random } = b;
    const vertical = random() < 0.4;
    const w = vertical ? cfg.partSize / 2 : cfg.partSize;
    const h = vertical ? cfg.partSize : cfg.partSize / 2;
    const spot = place(b, w, h);
    if (!spot) return;
    b.parts.push({ x: spot.x, y: spot.y, vertical, label });
    for (const side of [-1, 1]) {
        if (random() > cfg.keepPin) continue;
        const dirX = vertical ? 0 : side;
        const dirY = vertical ? side : 0;
        addTrace(b, {
            x: spot.x + (dirX * w) / 2, y: spot.y + (dirY * h) / 2, dirX, dirY,
            turn: randomTurn(random), rank: 0, pitch: cfg.pitch,
            lead: inRange(random, cfg.partLead), diagonal: inRange(random, cfg.partDiagonal),
            tail: inRange(random, cfg.partLead),
        });
    }
}

/** Bus of parallel traces entering from a screen edge, kept out of the calm band. */
export function addEdgeBus(b: Builder): void {
    const { width, height, cfg, random } = b;
    const [sideX, sideY] = SIDES[Math.floor(random() * SIDES.length)];
    const dirX = -sideX;
    const dirY = -sideY;
    const count = Math.round(inRange(random, cfg.busTraces));
    const along = dirX !== 0 ? height : width;
    const start = between(random, 20, Math.max(21, along - 20 - count * cfg.pitch));
    const x0 = dirX !== 0 ? (dirX > 0 ? -4 : width + 4) : start;
    const y0 = dirY !== 0 ? (dirY > 0 ? -4 : height + 4) : start;
    if (dirY !== 0 && random() > calmDensity(x0, width, cfg.calm)) return;

    const turn = randomTurn(random);
    const diagonal = inRange(random, cfg.diagonal);
    const tail = inRange(random, cfg.lead);
    const maxReach = dirX !== 0
        ? Math.max(16, width / 2 - calmHalfWidth(width, cfg.calm) - diagonal - tail)
        : height / 3;
    const lead = Math.min(inRange(random, cfg.busReach), maxReach);
    for (let i = 0; i < count; i++) {
        const rank = turn < 0 ? i : count - 1 - i;
        addTrace(b, {
            x: x0 + (dirY !== 0 ? i * cfg.pitch : 0), y: y0 + (dirX !== 0 ? i * cfg.pitch : 0),
            dirX, dirY, turn, rank, pitch: cfg.pitch, lead, diagonal,
            tail: tail + (rank % 2) * cfg.pitch * 1.5,
        });
    }
}
