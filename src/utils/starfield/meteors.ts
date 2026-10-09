import { inRange, type Random, type Range } from '../random';

/** Settings of the shooting stars (values in effects.ts). */
export interface MeteorSettings {
    /** Pause between two shooting stars, in ms */
    intervalMs: Range;
    /** Speed in CSS pixels per second */
    speed: Range;
    /** Tail length in CSS pixels */
    length: Range;
    lifeMs: Range;
    /** Angle below the horizontal, in radians */
    angle: Range;
    /** Births happen in this top share of the screen */
    startBand: number;
    /** Births happen in this share of the width, from the side the meteor comes from (the whole
     *  crossing stays on screen: the slow comet); default anywhere between 10 % and 90 % */
    entrySpan?: Range;
}

/** Fields of a meteor: x, y, vx, vy (px/s), tail length, age and life (ms), active flag */
const STRIDE = 8;
const FADE_IN = 0.12;
const FADE_OUT = 0.35;

/** Fixed pool of shooting stars: no allocation per frame. */
export interface MeteorPool {
    data: Float32Array;
    capacity: number;
}

export function createMeteorPool(capacity: number): MeteorPool {
    return { data: new Float32Array(capacity * STRIDE), capacity };
}

/** Starts a shooting star in a free slot (false when the pool is full). Heads left or right at random. */
export function spawnMeteor(pool: MeteorPool, width: number, height: number, settings: MeteorSettings, random: Random): boolean {
    for (let slot = 0; slot < pool.capacity; slot++) {
        const base = slot * STRIDE;
        if (pool.data[base + 7] > 0) continue;
        const direction = random() < 0.5 ? -1 : 1;
        const angle = inRange(random, settings.angle);
        const speed = inRange(random, settings.speed);
        const entry = settings.entrySpan ? inRange(random, settings.entrySpan) : 0.1 + random() * 0.8;
        pool.data[base] = width * (direction > 0 || !settings.entrySpan ? entry : 1 - entry);
        pool.data[base + 1] = height * settings.startBand * random();
        pool.data[base + 2] = Math.cos(angle) * speed * direction;
        pool.data[base + 3] = Math.sin(angle) * speed;
        pool.data[base + 4] = inRange(random, settings.length);
        pool.data[base + 5] = 0;
        pool.data[base + 6] = inRange(random, settings.lifeMs);
        pool.data[base + 7] = 1;
        return true;
    }
    return false;
}

/** Ages and moves every shooting star, frees the finished ones. Returns those still alive. */
export function advanceMeteors(pool: MeteorPool, deltaMs: number): number {
    let alive = 0;
    for (let slot = 0; slot < pool.capacity; slot++) {
        const base = slot * STRIDE;
        if (pool.data[base + 7] <= 0) continue;
        const age = pool.data[base + 5] + deltaMs;
        if (age >= pool.data[base + 6]) {
            pool.data[base + 7] = 0;
            continue;
        }
        pool.data[base + 5] = age;
        pool.data[base] += (pool.data[base + 2] * deltaMs) / 1000;
        pool.data[base + 1] += (pool.data[base + 3] * deltaMs) / 1000;
        alive++;
    }
    return alive;
}

/** Brightness of a meteor: quick fade in, steady, long fade out. 0 for a free slot. */
export function meteorAlpha(pool: MeteorPool, slot: number): number {
    const base = slot * STRIDE;
    if (pool.data[base + 7] <= 0) return 0;
    const life = pool.data[base + 5] / pool.data[base + 6];
    if (life < FADE_IN) return life / FADE_IN;
    if (life > 1 - FADE_OUT) return (1 - life) / FADE_OUT;
    return 1;
}

/** Head position, unit direction and tail length of a slot, written into `out` (x, y, dx, dy, length). */
export function meteorPose(pool: MeteorPool, slot: number, out: Float32Array): void {
    const base = slot * STRIDE;
    const vx = pool.data[base + 2];
    const vy = pool.data[base + 3];
    const speed = Math.hypot(vx, vy) || 1;
    out[0] = pool.data[base];
    out[1] = pool.data[base + 1];
    out[2] = vx / speed;
    out[3] = vy / speed;
    out[4] = pool.data[base + 4];
}
