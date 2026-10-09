/** Logic of the Projects trajectory (LOT 5): pure, no React, no DOM. */

/** The year a time-circuit display can show: four digits, or null (a year still to provide). */
export function yearDigits(year: string): string | null {
    return /^\d{4}$/.test(year) ? year : null;
}

/** Side of the axis a card sits on, in reading order: left, right, left… (staggered, from 1024 px) */
export function sideOf(index: number): 'left' | 'right' {
    return index % 2 === 0 ? 'left' : 'right';
}

/**
 * Progress along the axis at which the flame reaches each point: its offset from the axis's start over
 * the axis's length, kept within 0..1 (measured once per resize).
 */
export function nodeThresholds(offsets: readonly number[], axisLength: number): number[] {
    if (axisLength <= 0) return offsets.map(() => 0);
    return offsets.map((offset) => Math.min(1, Math.max(0, offset / axisLength)));
}

/** How many points the flame has passed at `progress` (0..1): those are lit, the others wait. */
export function litCount(thresholds: readonly number[], progress: number): number {
    let count = 0;
    for (const threshold of thresholds) if (progress >= threshold) count++;
    return count;
}

export interface Spark { x: number; y: number }
export interface Ember { x: number; y: number; durationMs: number; delayMs: number }
type Range = readonly [number, number] | readonly number[];

const lerp = ([from, to]: Range, t: number): number => from + (to - from) * t;

/** Where the sparks of an igniting point fly: `count` of them evenly around it, `reach` px away. */
export function sparkPaths(count: number, reach: number): Spark[] {
    return Array.from({ length: count }, (_, k) => {
        const angle = (k / count) * Math.PI * 2 + 0.4;
        return { x: Math.round(Math.cos(angle) * reach), y: Math.round(Math.sin(angle) * reach) };
    });
}

/**
 * The embers of the flame's head: left and right in turn, drifting and rising more for each, slower
 * each, their starts spread over the first one's rise (negative delays: already under way).
 */
export function emberPaths(settings: { count: number; drift: Range; rise: Range; durationMs: Range }): Ember[] {
    const { count, drift, rise, durationMs } = settings;
    return Array.from({ length: count }, (_, k) => {
        const t = count > 1 ? k / (count - 1) : 0;
        return {
            x: Math.round(lerp(drift, t)) * (k % 2 === 0 ? -1 : 1),
            y: -Math.round(lerp(rise, (k * 3) % count / Math.max(1, count - 1))),
            durationMs: Math.round(lerp(durationMs, t)),
            delayMs: 0 - Math.round((k / count) * durationMs[0]),
        };
    });
}
