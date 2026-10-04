/** Timing of the dial sequence after a click on a destination (values in effects.ts, ms). */
export interface DialTimeline {
    /** Delay between two chevrons locking, clockwise from the chosen one */
    chevronStepMs: number;
    /** Light of a chevron as it locks, before it settles at 1 */
    flare: number;
    flareMs: number;
    /** Extra rotation of the glyph ring (radians) and its duration */
    spin: number;
    spinMs: number;
    /** The event horizon forms: vortex spin-up and brightness */
    horizonAtMs: number;
    vortexMs: number;
    brightenMs: number;
    /** The camera dives through the gate */
    diveAtMs: number;
    diveMs: number;
    /** When the page changes: the trip channel then plays the hyperspace */
    navigateAtMs: number;
}

/** State of the gate at a moment of the sequence, written in place (no allocation). */
export interface DialState {
    /** Light of each chevron core (0 off, 1 on, more while flaring) */
    lit: Float32Array;
    spin: number;
    vortex: number;
    /** 0..1: from the idle horizon to its full brightness */
    horizon: number;
    dive: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeOutQuart = (t: number) => 1 - (1 - t) ** 4;
const easeInCubic = (t: number) => t ** 3;

export function createDialState(chevrons: number): DialState {
    return { lit: new Float32Array(chevrons), spin: 0, vortex: 0, horizon: 0, dive: 0 };
}

/**
 * Gate state `elapsed` ms after a click on chevron `chosen`: the chevrons
 * lock one after the other clockwise (each flares, then settles), the glyph
 * ring spins with inertia, the horizon forms, then the camera dives.
 */
export function dialState(elapsed: number, chosen: number, timeline: DialTimeline, out: DialState): void {
    const count = out.lit.length;
    for (let k = 0; k < count; k++) {
        const order = (k - chosen + count) % count;
        const since = elapsed - order * timeline.chevronStepMs;
        out.lit[k] = since < 0 ? 0 : 1 + (timeline.flare - 1) * (1 - clamp01(since / timeline.flareMs));
    }
    out.spin = timeline.spin * easeOutQuart(clamp01(elapsed / timeline.spinMs));
    const sinceHorizon = elapsed - timeline.horizonAtMs;
    out.vortex = easeOutCubic(clamp01(sinceHorizon / timeline.vortexMs));
    out.horizon = easeOutCubic(clamp01(sinceHorizon / timeline.brightenMs));
    out.dive = easeInCubic(clamp01((elapsed - timeline.diveAtMs) / timeline.diveMs));
}

/** Progress (0..1, eased) of the gate assembling from the particle cloud. */
export function assembleProgress(elapsed: number, durationMs: number): number {
    return easeOutCubic(clamp01(elapsed / durationMs));
}
