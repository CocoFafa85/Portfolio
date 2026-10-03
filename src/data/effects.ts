import type { Transition } from 'motion/react';
import type { PixelRatioCaps } from '../utils/canvas';
import type { BoardConfig } from '../utils/circuit/board';
import type { HoverSettings } from '../utils/circuit/hover';

/**
 * Tuning constants of the visual effects (durations, springs, densities).
 * Kept apart from the components so a feel change never touches their logic.
 */

/** Navigation bar (LOT 1, C1) */
export const navEffects = {
    /** Glide of the active-page indicator along the luminous line */
    indicator: { type: 'spring', visualDuration: 0.4, bounce: 0.15 } satisfies Transition,
};

/** Printed-circuit background of the inner pages (LOT 1, C3) */
export const circuitEffects = {
    /** Same seed on every visit: the board only changes with the screen size */
    seed: 1955,
    board: {
        pitch: 6,
        pinLength: 4,
        margin: 34,
        keepPin: 0.8,
        chipsPerMegapixel: 7,
        minChips: 2,
        partsPerMegapixel: 36,
        edgeBusesPerMegapixel: 5,
        calm: { ratio: 0.32, maxHalfWidth: 520, floor: 0.1, ramp: 120 },
        qfpShare: 0.55,
        qfpSize: [36, 60],
        soicWidth: [28, 46],
        soicHeight: [12, 16],
        lead: [4, 14],
        diagonal: [8, 34],
        tail: [16, 110],
        partSize: 22,
        partLead: [4, 10],
        partDiagonal: [4, 14],
        busTraces: [3, 6],
        busReach: [60, 240],
    } satisfies BoardConfig,
    /** Static drawing (once per resize) */
    style: {
        maskAlpha: 0.9,
        traceWidth: 2.2,
        traceAlpha: 0.42,
        sheenWidth: 0.8,
        sheenAlpha: 0.12,
        pinWidth: 1.4,
        viaRadius: 3,
        holeRadius: 1.2,
        padSize: 5,
        silkAlpha: 0.5,
        silkWidth: 0.6,
        labelFont: '9px monospace',
        labelOffset: 9,
        grainSize: 96,
        grainAlpha: 0.08,
    },
    /** Rare data pulses (the only animated part) */
    pulse: {
        max: 3,
        intervalMs: [1400, 3400],
        speed: 150,
        trail: 42,
        minTraceLength: 60,
        segments: 6,
        width: 2,
        alpha: 0.9,
        haloRadius: 6,
        haloAlpha: 0.2,
        coreRadius: 1.6,
    },
    /** Discreet lighting of the traces near the cursor (fine pointers only) */
    hover: { radius: 80, rise: 0.2, decay: 0.92 } satisfies HoverSettings,
    hoverCell: 96,
    glow: { width: 2.4, alpha: 0.55 },
    pixelRatio: { fine: 2, coarse: 1.5, maxPixels: 8_000_000 } satisfies PixelRatioCaps,
    resizeDebounceMs: 150,
} as const;
