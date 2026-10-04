import type { Transition } from 'motion/react';
import type { PixelRatioCaps } from '../utils/canvas';
import type { BoardConfig } from '../utils/circuit/board';
import type { DecodeSettings } from '../utils/decode';
import type { HoverSettings } from '../utils/circuit/hover';
import type { RadialSettings, SpeedSettings } from '../utils/travelFx';

/**
 * Tuning constants of the visual effects (durations, springs, densities).
 * Kept apart from the components so a feel change never touches their logic.
 */

/** Home title and subtitle (LOT 2, H1 and H2) */
export const heroEffects = {
    /** Title decoded from glyph noise, then the neon tube lights up */
    decode: { seed: 1985, steps: 22, spread: 0.28, durationMs: 700 } satisfies DecodeSettings & { durationMs: number },
    igniteMs: 360,
};

/** Navigation bar (LOT 1, C1) */
export const navEffects = {
    /** Glide of the active-page indicator along the luminous line */
    indicator: { type: 'spring', visualDuration: 0.4, bounce: 0.15 } satisfies Transition,
    /** Fade of the whole bar when it appears or leaves (it is hidden on the home page) */
    appear: { duration: 0.3, ease: 'easeOut' } satisfies Transition,
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
    /** Static drawing (once per resize); darker, more even black after the reviews of 2026-10-03 and 2026-10-04 */
    style: {
        maskAlpha: 0.98,
        traceWidth: 2.2,
        traceAlpha: 0.16,
        sheenWidth: 0.8,
        sheenAlpha: 0.03,
        pinWidth: 1.4,
        viaRadius: 3,
        holeRadius: 1.2,
        padSize: 5,
        silkAlpha: 0.18,
        silkWidth: 0.6,
        labelFont: '9px monospace',
        labelOffset: 9,
        grainSize: 96,
        grainAlpha: 0.02,
    },
    /** Data pulses (the only animated part): frequency ×4 after review (was 1.4–3.4 s, 3 max) */
    pulse: {
        max: 8,
        intervalMs: [350, 850],
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

/** "Voyage" transitions between pages (LOT 1, C2) */
export const travelEffects = {
    /** Whole trip; the pages swap at half time, under the full cover */
    durationMs: 720,
    /** Reduced motion: a plain cross-fade, no overlay */
    reducedFadeMs: 150,
    seed: 88,
    /** Star lines shot from the centre (home ↔ inner page) */
    hyperspace: { count: 56, start: [8, 70], length: [40, 170], delayMs: [0, 140] } satisfies RadialSettings,
    /** Light streaks rushing past, then fire trails (between inner pages) */
    timeTravel: { count: 26, top: [2, 98], width: [80, 260], delayMs: [60, 380], durationMs: [240, 460] } satisfies SpeedSettings,
    /** Page movement while it leaves and arrives */
    page: { zoomOut: 1.25, zoomIn: 0.92, shift: 25, skew: -10 },
    ease: { leave: [0.6, 0, 0.8, 0.4], arrive: [0.2, 0.7, 0.3, 1] },
} as const;
