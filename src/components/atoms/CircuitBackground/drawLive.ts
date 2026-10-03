import type { Board } from '../../../utils/circuit/board';
import { pointAlong, type Point } from '../../../utils/circuit/geometry';
import { pulseDistance, pulseTrace, type PulsePool } from '../../../utils/circuit/pulses';
import { addTracePath } from './drawBoard';
import type { CircuitPalette } from './palette';

export interface LiveStyle {
    glow: { width: number; alpha: number };
    pulse: {
        trail: number;
        segments: number;
        width: number;
        alpha: number;
        haloRadius: number;
        haloAlpha: number;
        coreRadius: number;
    };
}

const FULL_TURN = Math.PI * 2;

// Scratch points reused by every frame: the loop allocates nothing
const tail: Point = { x: 0, y: 0 };
const head: Point = { x: 0, y: 0 };

/** Draws the animated layer: traces lit by the cursor, then the data pulses. Every frame. */
export function drawLive(
    ctx: CanvasRenderingContext2D,
    board: Board,
    glow: Float32Array,
    pool: PulsePool,
    palette: CircuitPalette,
    style: LiveStyle
): void {
    ctx.clearRect(0, 0, board.width, board.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = palette.copperLight;
    ctx.lineWidth = style.glow.width;
    for (let t = 0; t < board.traceCount; t++) {
        if (glow[t] === 0) continue;
        ctx.globalAlpha = glow[t] * style.glow.alpha;
        ctx.beginPath();
        addTracePath(ctx, board, t);
        ctx.stroke();
    }

    const { trail, segments } = style.pulse;
    const step = trail / segments;
    ctx.strokeStyle = palette.pulse;
    ctx.lineWidth = style.pulse.width;
    for (let slot = 0; slot < pool.capacity; slot++) {
        const t = pulseTrace(pool, slot);
        if (t < 0) continue;
        const from = board.traceStart[t];
        const to = board.traceStart[t + 1];
        const length = board.traceLength[t];
        const distance = pulseDistance(pool, slot);

        // Trail: short chords, brighter towards the head
        for (let s = 0; s < segments; s++) {
            const d0 = Math.max(0, distance - trail + s * step);
            const d1 = Math.min(length, distance - trail + (s + 1) * step);
            if (d1 <= d0) continue;
            pointAlong(board.points, from, to, d0, tail);
            pointAlong(board.points, from, to, d1, head);
            ctx.globalAlpha = ((s + 1) / segments) * style.pulse.alpha;
            ctx.beginPath();
            ctx.moveTo(tail.x, tail.y);
            ctx.lineTo(head.x, head.y);
            ctx.stroke();
        }
        if (distance > length) continue;

        // Head: soft halo and a white-hot core
        pointAlong(board.points, from, to, distance, head);
        ctx.globalAlpha = style.pulse.haloAlpha;
        ctx.fillStyle = palette.pulse;
        ctx.beginPath();
        ctx.arc(head.x, head.y, style.pulse.haloRadius, 0, FULL_TURN);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = palette.pulseCore;
        ctx.beginPath();
        ctx.arc(head.x, head.y, style.pulse.coreRadius, 0, FULL_TURN);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
