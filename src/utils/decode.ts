import { hashUnit } from './random';

/** Tuning of a decode effect (values in src/data/effects.ts). */
export interface DecodeSettings {
    /** Seed of the glyph draws and of the lock jitter */
    seed: number;
    /** Number of glyph changes over the whole decode */
    steps: number;
    /** Share of the timeline (0..1) given to the random jitter of each lock */
    spread: number;
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Progress (0..1) at which character `index` of a `length`-long text locks
 * on its final value: left to right, each lock jittered within `spread`.
 */
export function lockTime(index: number, length: number, settings: DecodeSettings): number {
    const order = length > 1 ? index / (length - 1) : 0;
    return order * (1 - settings.spread) + hashUnit(settings.seed, index, 0) * settings.spread;
}

/** Visible length of a frame: the target's, or interpolated from the source word when morphing. */
export function frameLength(target: string, progress: number, source?: string): number {
    if (source === undefined) return target.length;
    return Math.round(source.length + (target.length - source.length) * clamp01(progress));
}

/** True once character `index` shows its final value. */
export function isLocked(index: number, target: string, progress: number, settings: DecodeSettings, source?: string): boolean {
    const length = Math.max(target.length, source?.length ?? 0);
    return clamp01(progress) >= lockTime(index, length, settings);
}

/**
 * Character `index` of a decode frame: the target character once locked,
 * otherwise a glyph drawn from the seed that changes at every step. Spaces
 * shared by the source and the target stay spaces.
 */
export function decodeCharAt(
    index: number,
    target: string,
    progress: number,
    settings: DecodeSettings,
    glyphs: string,
    source?: string
): string {
    if (isLocked(index, target, progress, settings, source)) return target[index] ?? ' ';
    const blank = target[index] === ' ' && (source === undefined || source[index] === ' ');
    if (blank) return ' ';
    const step = Math.floor(clamp01(progress) * settings.steps);
    return glyphs[Math.floor(hashUnit(settings.seed, index, step + 1) * glyphs.length)];
}

/**
 * Text shown at `progress` (0..1) while `target` decodes, deterministic for a
 * seed: from pure noise (title) or from a `source` word (word to word morph).
 */
export function decodeFrame(
    target: string,
    progress: number,
    settings: DecodeSettings,
    glyphs: string,
    source?: string
): string {
    let frame = '';
    const length = frameLength(target, progress, source);
    for (let i = 0; i < length; i++) frame += decodeCharAt(i, target, progress, settings, glyphs, source);
    return frame;
}
