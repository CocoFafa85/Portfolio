/** Pseudo-random source returning numbers in [0, 1). */
export type Random = () => number;

/** [min, max) bounds of a random value */
export type Range = readonly [number, number];

/**
 * Seeded generator (mulberry32): the same seed always yields the same
 * sequence, so a generated board is reproducible and testable.
 */
export function createRandom(seed: number): Random {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Uniform number in [min, max). */
export function between(random: Random, min: number, max: number): number {
    return min + random() * (max - min);
}

/** Uniform number in a [min, max) range given as a pair. */
export function inRange(random: Random, range: Range): number {
    return between(random, range[0], range[1]);
}
