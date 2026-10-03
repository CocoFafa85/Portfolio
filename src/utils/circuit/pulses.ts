import type { Random } from '../random';

/** Fields of a pulse in the pool: trace index (-1 = free slot), distance travelled, speed (px/s) */
const STRIDE = 3;
const PICK_ATTEMPTS = 8;

/** Fixed pool of data pulses running along the traces: no allocation per frame. */
export interface PulsePool {
    data: Float32Array;
    capacity: number;
}

export function createPulsePool(capacity: number): PulsePool {
    const data = new Float32Array(capacity * STRIDE);
    for (let slot = 0; slot < capacity; slot++) data[slot * STRIDE] = -1;
    return { data, capacity };
}

/**
 * Starts a pulse on a random trace at least `minLength` long.
 * Returns false when the pool is full or no long-enough trace was drawn.
 */
export function spawnPulse(
    pool: PulsePool,
    traceLength: Float32Array,
    minLength: number,
    speed: number,
    random: Random
): boolean {
    for (let slot = 0; slot < pool.capacity; slot++) {
        const base = slot * STRIDE;
        if (pool.data[base] >= 0) continue;
        for (let attempt = 0; attempt < PICK_ATTEMPTS; attempt++) {
            const trace = Math.floor(random() * traceLength.length);
            if (traceLength[trace] < minLength) continue;
            pool.data[base] = trace;
            pool.data[base + 1] = 0;
            pool.data[base + 2] = speed;
            return true;
        }
        return false;
    }
    return false;
}

/** Moves every pulse and frees those whose trail has left the trace. Returns the pulses still alive. */
export function advancePulses(pool: PulsePool, traceLength: Float32Array, deltaMs: number, trail: number): number {
    let alive = 0;
    for (let slot = 0; slot < pool.capacity; slot++) {
        const base = slot * STRIDE;
        const trace = pool.data[base];
        if (trace < 0) continue;
        const distance = pool.data[base + 1] + (pool.data[base + 2] * deltaMs) / 1000;
        if (distance - trail > traceLength[trace]) {
            pool.data[base] = -1;
            continue;
        }
        pool.data[base + 1] = distance;
        alive++;
    }
    return alive;
}

/** Trace index of a slot, -1 when the slot is free. */
export const pulseTrace = (pool: PulsePool, slot: number): number => pool.data[slot * STRIDE];

/** Distance travelled by the pulse of a slot. */
export const pulseDistance = (pool: PulsePool, slot: number): number => pool.data[slot * STRIDE + 1];
