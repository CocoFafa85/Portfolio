import { starEffects as fx } from '../../../data/effects';
import { meteorAlpha, meteorPose, type MeteorPool } from '../../../utils/starfield/meteors';
import type { StarPalette } from './palette';
import { canvas } from './sprite';

/** The comet (home, review of 2026-10-09): glowing head, ion tail, dust tail. Built once. */
export interface CometSprites {
    head: HTMLCanvasElement;
    ion: HTMLCanvasElement;
    dust: HTMLCanvasElement;
}

/** Comet tail: a long taper, transparent at the end, bright and wide at the head. */
function cometTail(colour: string): HTMLCanvasElement {
    const { tailWidth: width, tailHeight: height } = fx.cometLook;
    const [element, ctx] = canvas(width, height);
    if (!ctx) return element;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.35)');
    gradient.addColorStop(1, '#fff');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.quadraticCurveTo(width * 0.7, 2, width, height * 0.3);
    ctx.lineTo(width, height * 0.7);
    ctx.quadraticCurveTo(width * 0.7, height - 2, 0, height / 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = colour;
    ctx.fillRect(0, 0, width, height);
    return element;
}

/** Comet head: a white core in a wide cyan glow (a white alpha mask tinted, then the core on top). */
function cometHead(glow: string): HTMLCanvasElement {
    const size = fx.cometLook.headSize;
    const [element, ctx] = canvas(size, size);
    if (!ctx) return element;
    const half = size / 2;
    const radial = (stops: [number, string][]) => {
        const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
        stops.forEach(([at, colour]) => gradient.addColorStop(at, colour));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
    };
    radial([[0, '#fff'], [0.3, 'rgba(255, 255, 255, 0.55)'], [1, 'rgba(255, 255, 255, 0)']]);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';
    radial([[0, '#fff'], [0.14, '#fff'], [0.3, 'rgba(255, 255, 255, 0)']]);
    return element;
}

export function createCometSprites(palette: StarPalette): CometSprites {
    return { head: cometHead(palette.tints[1]), ion: cometTail(palette.trail), dust: cometTail(palette.tints[2]) };
}

// The dust tail leaves the head a little apart from the ion tail: a fixed turn, computed once
const DUST_COS = Math.cos(fx.cometLook.dustAngle);
const DUST_SIN = Math.sin(fx.cometLook.dustAngle);

/** Draws the live comets: dust tail, ion tail, then the glowing head. `pose` is a reused scratch buffer. */
export function drawComets(ctx: CanvasRenderingContext2D, pool: MeteorPool, sprites: CometSprites, ratio: number, pose: Float32Array): void {
    const { headRadius, ionThickness, dustThickness, dustAlpha } = fx.cometLook;
    for (let slot = 0; slot < pool.capacity; slot++) {
        const alpha = meteorAlpha(pool, slot);
        if (alpha <= 0) continue;
        meteorPose(pool, slot, pose);
        const x = pose[0] * ratio;
        const y = pose[1] * ratio;
        const dx = pose[2];
        const dy = pose[3];
        const length = pose[4];
        const ux = dx * DUST_COS - dy * DUST_SIN;
        const uy = dx * DUST_SIN + dy * DUST_COS;
        ctx.globalAlpha = alpha * dustAlpha;
        ctx.setTransform(ux * ratio, uy * ratio, -uy * ratio, ux * ratio, x, y);
        ctx.drawImage(sprites.dust, -length * 0.8, -dustThickness / 2, length * 0.8, dustThickness);
        ctx.globalAlpha = alpha;
        ctx.setTransform(dx * ratio, dy * ratio, -dy * ratio, dx * ratio, x, y);
        ctx.drawImage(sprites.ion, -length, -ionThickness / 2, length, ionThickness);
        ctx.drawImage(sprites.head, -headRadius, -headRadius, headRadius * 2, headRadius * 2);
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.globalAlpha = 1;
}
