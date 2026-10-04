import { inRange, type Random, type Range } from '../random';

/** Settings of one depth layer of the home starfield (values in effects.ts). */
export interface StarLayerSpec {
    /** Stars per million CSS pixels of screen */
    perMegapixel: number;
    /** Never fewer stars than this, even on a small screen */
    min: number;
    /** Sprite radius in CSS pixels */
    radius: Range;
    alpha: Range;
    /** Horizontal drift, CSS pixels per second (left or right, drawn at random) */
    speed: Range;
    /** Shift in CSS pixels for a pointer at the screen edge: the nearer, the larger */
    parallax: number;
    /** Twinkle amplitude (0 = steady) */
    twinkle: number;
    /** Sprite tints the layer draws from (indexes into the palette) */
    tints: readonly number[];
}

/** Fields of a star: x and y (0..1 of the screen), radius, alpha, speed (px/s), tint, twinkle phase */
export const STAR_STRIDE = 7;
/** A star leaving one side comes back on the other after this extra margin (share of the width) */
const WRAP_MARGIN = 0.05;

export interface StarLayer {
    count: number;
    data: Float32Array;
}

/** Stars of a layer for a screen, packed for allocation-free drawing. Deterministic for `random`. */
export function createStarLayer(spec: StarLayerSpec, width: number, height: number, random: Random): StarLayer {
    const megapixels = (width * height) / 1e6;
    const count = Math.max(spec.min, Math.round(megapixels * spec.perMegapixel));
    const data = new Float32Array(count * STAR_STRIDE);
    for (let i = 0; i < count; i++) {
        const base = i * STAR_STRIDE;
        data[base] = random();
        data[base + 1] = random();
        data[base + 2] = inRange(random, spec.radius);
        data[base + 3] = inRange(random, spec.alpha);
        data[base + 4] = inRange(random, spec.speed) * (random() < 0.5 ? -1 : 1);
        data[base + 5] = spec.tints[Math.floor(random() * spec.tints.length)];
        data[base + 6] = random() * Math.PI * 2;
    }
    return { count, data };
}

/** Drifts every star of a layer sideways; a star leaving the screen re-enters on the other side. */
export function driftStars(layer: StarLayer, deltaMs: number, width: number): void {
    const span = 1 + 2 * WRAP_MARGIN;
    for (let i = 0; i < layer.count; i++) {
        const base = i * STAR_STRIDE;
        let x = layer.data[base] + (layer.data[base + 4] * deltaMs) / 1000 / width;
        if (x < -WRAP_MARGIN) x += span;
        else if (x > 1 + WRAP_MARGIN) x -= span;
        layer.data[base] = x;
    }
}

/** Alpha of a star at `time` (ms): its own level, gently modulated when the layer twinkles. */
export function starAlpha(layer: StarLayer, index: number, twinkle: number, time: number): number {
    const base = index * STAR_STRIDE;
    const alpha = layer.data[base + 3];
    if (twinkle <= 0) return alpha;
    return alpha * (1 - twinkle + twinkle * (0.5 + 0.5 * Math.sin(time / 700 + layer.data[base + 6])));
}
