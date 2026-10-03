import { inRange, type Random, type Range } from './random';

/** Star line of the hyperspace jump, shot from the screen centre. */
export interface RadialStreak {
    /** Direction in degrees */
    angle: number;
    /** Distance from the centre where it appears (px) */
    start: number;
    length: number;
    delay: number;
}

/** Light streak rushing past during the 88 mph trip. */
export interface SpeedStreak {
    /** Vertical position, % of the screen height */
    top: number;
    width: number;
    delay: number;
    duration: number;
}

export interface RadialSettings {
    count: number;
    start: Range;
    length: Range;
    delayMs: Range;
}

export interface SpeedSettings {
    count: number;
    top: Range;
    width: Range;
    delayMs: Range;
    durationMs: Range;
}

/** Star lines evenly spread around the circle (jittered), so no side looks empty. */
export function createRadialStreaks(settings: RadialSettings, random: Random): RadialStreak[] {
    const sector = 360 / settings.count;
    return Array.from({ length: settings.count }, (_, i) => ({
        angle: Math.round((i + random()) * sector),
        start: Math.round(inRange(random, settings.start)),
        length: Math.round(inRange(random, settings.length)),
        delay: Math.round(inRange(random, settings.delayMs)),
    }));
}

export function createSpeedStreaks(settings: SpeedSettings, random: Random): SpeedStreak[] {
    return Array.from({ length: settings.count }, () => ({
        top: Math.round(inRange(random, settings.top)),
        width: Math.round(inRange(random, settings.width)),
        delay: Math.round(inRange(random, settings.delayMs)),
        duration: Math.round(inRange(random, settings.durationMs)),
    }));
}
