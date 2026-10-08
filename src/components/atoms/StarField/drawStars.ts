import { starEffects as fx } from '../../../data/effects';
import { STAR_STRIDE, starAlpha, type StarLayer } from '../../../utils/starfield/layers';
import { meteorAlpha, meteorPose, type MeteorPool } from '../../../utils/starfield/meteors';
import type { StarPalette } from './palette';

/** Pre-rendered images: one per tint, the meteor trail. Built once. */
export interface StarSprites {
    tints: HTMLCanvasElement[];
    trail: HTMLCanvasElement;
}

function canvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D | null] {
    const element = document.createElement('canvas');
    element.width = width;
    element.height = height;
    return [element, element.getContext('2d')];
}

/** White alpha mask (a radial falloff), then tinted: the colour keeps the mask's alpha. */
function disc(colour: string, core: number, edge: number): HTMLCanvasElement {
    const size = fx.sprite.size;
    const [element, ctx] = canvas(size, size);
    if (!ctx) return element;
    const half = size / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(core, `rgba(255, 255, 255, ${edge})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = colour;
    ctx.fillRect(0, 0, size, size);
    return element;
}

/** Tapered tail, transparent at the end and bright at the head, tinted with the trail token. */
function trail(colour: string): HTMLCanvasElement {
    const { width, height, bright } = fx.trail;
    const [element, ctx] = canvas(width, height);
    if (!ctx) return element;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.7, `rgba(255, 255, 255, ${bright})`);
    gradient.addColorStop(1, '#fff');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width - 4, 1);
    ctx.lineTo(width, height / 2);
    ctx.lineTo(width - 4, height - 1);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = colour;
    ctx.fillRect(0, 0, width, height);
    return element;
}

export function createStarSprites(palette: StarPalette): StarSprites {
    return {
        tints: palette.tints.map((colour) => disc(colour, fx.sprite.core, 1)),
        trail: trail(palette.trail),
    };
}

/** Draws a layer shifted by its parallax for the pointer (-0.5..0.5). No allocation. */
export function drawLayer(
    ctx: CanvasRenderingContext2D,
    layer: StarLayer,
    image: (tint: number) => HTMLCanvasElement,
    width: number,
    height: number,
    shiftX: number,
    shiftY: number,
    twinkle: number,
    time: number
): void {
    const { data } = layer;
    for (let i = 0; i < layer.count; i++) {
        const base = i * STAR_STRIDE;
        const radius = data[base + 2];
        ctx.globalAlpha = starAlpha(layer, i, twinkle, time);
        ctx.drawImage(image(data[base + 5]), data[base] * width + shiftX - radius, data[base + 1] * height + shiftY - radius, radius * 2, radius * 2);
    }
}

/** Draws the live shooting stars, each along its own heading. `pose` is a reused scratch buffer. */
export function drawMeteors(ctx: CanvasRenderingContext2D, pool: MeteorPool, sprites: StarSprites, ratio: number, pose: Float32Array): void {
    const { headRadius, thickness } = fx.trail;
    for (let slot = 0; slot < pool.capacity; slot++) {
        const alpha = meteorAlpha(pool, slot);
        if (alpha <= 0) continue;
        meteorPose(pool, slot, pose);
        ctx.setTransform(pose[2] * ratio, pose[3] * ratio, -pose[3] * ratio, pose[2] * ratio, pose[0] * ratio, pose[1] * ratio);
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprites.trail, -pose[4], -thickness / 2, pose[4], thickness);
        ctx.drawImage(sprites.tints[1], -headRadius, -headRadius, headRadius * 2, headRadius * 2);
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.globalAlpha = 1;
}
