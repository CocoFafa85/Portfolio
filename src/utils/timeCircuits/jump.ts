/**
 * Time jump of the convector (LOT 3, B2): the speedometer climbs to 88 mph,
 * faster and faster, the jump lands (the text panel shows the new era), the
 * speed falls back to zero. Pure timeline: the visual layers (capacitor,
 * lightning, flash, fire trails) are CSS keyframes started with the same
 * timings; only the speed digits and the landing are driven from here.
 */
export interface JumpTimeline {
    /** 0 → topSpeed over accelMs, along a power curve (higher = later surge) */
    accelMs: number;
    topSpeed: number;
    speedCurve: number;
    /** Destination reached: the panel shows the era */
    arriveMs: number;
    /** The text starts to reveal */
    revealMs: number;
    /** The speed holds at the top until decayAtMs, then falls to 0 over decayMs */
    decayAtMs: number;
    decayMs: number;
    /** End of every effect */
    endMs: number;
}

export interface JumpState {
    /** Current speed, 0..topSpeed */
    speed: number;
    arrived: boolean;
    revealed: boolean;
    done: boolean;
}

export function createJumpState(): JumpState {
    return { speed: 0, arrived: false, revealed: false, done: false };
}

/** State of a jump `elapsedMs` after its start, written into `out` (no allocation per frame). */
export function jumpState(elapsedMs: number, t: JumpTimeline, out: JumpState): JumpState {
    const e = Math.max(0, elapsedMs);
    if (e < t.accelMs) out.speed = t.topSpeed * (e / t.accelMs) ** t.speedCurve;
    else if (e < t.decayAtMs) out.speed = t.topSpeed;
    else out.speed = t.topSpeed * Math.max(0, 1 - (e - t.decayAtMs) / t.decayMs) ** 2;
    out.arrived = e >= t.arriveMs;
    out.revealed = e >= t.revealMs;
    out.done = e >= t.endMs;
    return out;
}

/**
 * Where a new jump starts when the visitor picks another era mid-way: at the
 * elapsed time the acceleration reaches the current speed, so the speedometer
 * never drops back to zero.
 */
export function resumeAt(speed: number, t: JumpTimeline): number {
    const share = Math.min(1, Math.max(0, speed / t.topSpeed));
    return t.accelMs * share ** (1 / t.speedCurve);
}

/** The two speedometer digits, without a leading zero: `blank` is the font's empty cell. */
export function formatSpeed(speed: number, blank: string): string {
    const value = Math.min(99, Math.max(0, Math.floor(speed)));
    return value < 10 ? `${blank}${value}` : String(value);
}
