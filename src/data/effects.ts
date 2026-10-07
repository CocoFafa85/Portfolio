import type { Transition } from 'motion/react';
import type { PixelRatioCaps } from '../utils/canvas';
import type { BoardConfig } from '../utils/circuit/board';
import type { DecodeSettings } from '../utils/decode';
import type { StarLayerSpec } from '../utils/starfield/layers';
import type { MeteorSettings } from '../utils/starfield/meteors';
import type { DialTimeline } from '../utils/stargate/dial';
import type { GateConfig } from '../utils/stargate/geometry';
import type { FitSettings } from '../utils/stargate/view';
import type { HoverSettings } from '../utils/circuit/hover';
import type { BoltSettings } from '../utils/timeCircuits/bolts';
import type { JumpTimeline } from '../utils/timeCircuits/jump';
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
    /** Subtitle: the first role decodes from noise with the title, then each role decodes into the next */
    roles: {
        seed: 7, steps: 20, spread: 0.3, introMs: 900, morphMs: 480, holdMs: 2200,
    } satisfies DecodeSettings & Record<'introMs' | 'morphMs' | 'holdMs', number>,
};

/** Home nebula, Paper Shaders mesh gradient (LOT 2, H4) */
export const nebulaEffects = {
    /** Colour spots, as design tokens; the void repeats so the darkness dominates */
    tokens: ['--nebula-void', '--nebula-violet-deep', '--nebula-violet', '--nebula-void', '--nebula-magenta', '--nebula-teal'],
    /** Pace of the colour waves: slightly faster after review (2026-10-07, was 0.14) */
    speed: 0.19,
    distortion: 0.85,
    swirl: 0.25,
    grainMixer: 0.08,
    grainOverlay: 0.1,
    /** A soft nebula needs few pixels: never above the device ratio 1, capped in device pixels */
    minPixelRatio: 1,
    maxPixelCount: { fine: 1_500_000, coarse: 600_000 },
    /** The shader fades in over the CSS gradient once its chunk is loaded */
    fadeInMs: 900,
    /** The shader chunk loads at the first idle moment after bootAfterMs (see gateEffects), at the latest idleTimeoutMs later */
    bootAfterMs: 900,
    idleTimeoutMs: 1500,
};

/**
 * Home starfield over the nebula (LOT 2, H4): mid and blurred near layers, shooting stars.
 * The far layer (400 small pale stars per megapixel) was removed after review (2026-10-07):
 * the background reads more even.
 */
export const starEffects = {
    seed: 2035,
    /** Sprite tints: 0 white, 1 cyan, 2 violet, 3 pink (palette.ts); the near layer uses the soft sprite */
    layers: [
        { perMegapixel: 110, min: 34, radius: [2.1, 3.9], alpha: [0.5, 0.9], speed: [6, 12], parallax: 11, twinkle: 0.25, tints: [0, 1, 2, 3] },
        { perMegapixel: 8, min: 5, radius: [6, 15], alpha: [0.05, 0.14], speed: [10, 20], parallax: 28, twinkle: 0, tints: [0] },
    ] satisfies StarLayerSpec[],
    /** Index of the layer drawn with the soft out-of-focus sprite (depth of field) */
    blurredLayer: 1,
    meteor: {
        max: 2, intervalMs: [4500, 9000], speed: [650, 1000], length: [110, 220], lifeMs: [700, 1100],
        angle: [0.35, 0.7], startBand: 0.35,
    } satisfies MeteorSettings & { max: number },
    /** First shooting star, after the title has lit up */
    firstMeteorMs: 2500,
    /** Share of the remaining distance the parallax closes each frame */
    pointerSmoothing: 0.06,
    sprite: { size: 64, core: 0.25, softCore: 0.6, softEdge: 0.35 },
    trail: { width: 256, height: 8, bright: 0.55, headRadius: 5, thickness: 3.2 },
    pixelRatio: { fine: 2, coarse: 1.5, maxPixels: 8_000_000 } satisfies PixelRatioCaps,
    resizeDebounceMs: 150,
};

/**
 * Home particle gate, the orbital menu (LOT 2, H3; model units: gate radius 1).
 * Review of 2026-10-07: denser and finer for a sharper gate (~16 000 → ~27 400 particles).
 */
export const gateEffects = {
    seed: 2026,
    shape: {
        ring: { inner: 0.8, outer: 1, depth: 0.13, rimShare: 0.2, rimWidth: 0.012, points: 12600, bodySize: [1.6, 2.9], rimSize: 2.2, delay: [0, 0.3] },
        aura: { inner: 0.95, reach: 0.24, depth: 0.3, points: 2800, size: [2.4, 4.2], delay: [0, 0.4] },
        glyphs: {
            count: 39, radius: 0.7, rim: 0.62, width: 0.075, height: 0.09, vertices: [3, 5],
            rimPoints: 1260, pointsPerGlyph: 60, rimSize: 1.6, glyphSize: 1.8, delay: [0.2, 0.5],
        },
        chevrons: {
            count: 9, outer: 1.08, inner: 0.93, outerHalf: 0.065, innerHalf: 0.03,
            core: { outer: 1.045, inner: 0.965, outerHalf: 0.03, innerHalf: 0.015 },
            depth: 0.08, bodyPoints: 290, corePoints: 126, bodySize: 1.9, coreSize: 2.2, delay: [0.45, 0.7],
        },
        horizon: { radius: 0.6, depth: 0.05, points: 4700, size: [1.2, 2.7], delay: [0.55, 0.9] },
        scatter: { radius: [2.4, 6.4], widen: 1.6, depth: -3 },
    } satisfies GateConfig,
    /** Chevron of each orbital destination, in content.nav order (top, lower right, lower left) */
    destinations: [0, 3, 6],
    /** Radius (model units) where the destination numbers sit, inside their chevron */
    labelRadius: 0.5,
    /** Particles generated per frame while the gate boots: one slice stays well under a long task (50 ms) on a slow phone */
    geometryChunk: 1500,
    /** The gate assembles from the particle cloud on arrival; the links work at once */
    introMs: 1400,
    /** WebGL boots at the first idle moment after bootAfterMs since the page started (at the latest
     *  bootTimeoutMs later): never while the GPU is still drawing the first frames */
    bootAfterMs: 900,
    bootTimeoutMs: 1200,
    /** Height: aura 1.19 + room for the tilt (clear of the title); width: chevron tips 1.08.
     *  Dive: the camera stops just short of the horizon, still full of its dust when the cover lands */
    fit: { extent: 1.26, sideExtent: 1.12, margin: 8, camera: 2.6, diveDepth: 2.5 } satisfies FitSettings,
    /** Idle camera sway (radians, ms); the pointer tilt was removed after review (2026-10-07) */
    sway: { x: 0.02, y: 0.03, periodX: 2300, periodY: 3100 },
    /** Share of the remaining light a hovered chevron gains each frame */
    hoverSmoothing: 0.2,
    /** Horizon dust brightness at rest (it reaches 1 as the horizon forms) */
    horizonIdle: 0.38,
    /** Particle size scale: proportional to the gate radius on screen */
    pointSize: { scale: 3.2, referenceRadius: 260, min: 0.7 },
    shimmer: 0.004,
    /** Links follow the tilted gate once it moved by more than this (CSS px) */
    linkEpsilon: 0.25,
    dial: {
        chevronStepMs: 38, flare: 1.6, flareMs: 180, spin: 3.8, spinMs: 460,
        horizonAtMs: 320, vortexMs: 320, brightenMs: 220, diveAtMs: 520, diveMs: 420, navigateAtMs: 760,
    } satisfies DialTimeline,
    pixelRatio: { fine: 2, coarse: 1.5, maxPixels: 8_000_000 } satisfies PixelRatioCaps,
    resizeDebounceMs: 150,
};

/**
 * DeLorean convector of the About page (LOT 3, A2): the time jump played
 * when an era is chosen (ms from the jump start). The speed digits and the
 * landing follow `jump` (utils/timeCircuits/jump.ts); the visual layers are
 * CSS keyframes started with `layers`, as CSS variables of the console.
 */
export const convectorEffects = {
    jump: {
        accelMs: 900, topSpeed: 88, speedCurve: 2.1, arriveMs: 1035, revealMs: 1160, decayAtMs: 1150, decayMs: 600, endMs: 1750,
    } satisfies JumpTimeline,
    layers: {
        /** The chosen row flickers as it arms */
        armMs: 280,
        /** Lightning crackles around the console just before 88 */
        boltsAt: 800, boltsMs: 290,
        /** White-blue flash (peak at a third), then the fire trails as the jump lands */
        flashAt: 950, flashMs: 240,
        fireAt: 1035, fireMs: 750,
        /** The capacitor charges with the speed, holds a moment after landing, then cools */
        coolAt: 1115, coolMs: 520,
    },
    bolts: { count: 6, depth: 5, jitter: 0.42 } satisfies BoltSettings,
    boltSeed: 1955,
    /** The flux capacitor powers on at the first idle moment after powerOnAfterMs (its glows are
     *  the costliest part of the console to paint: never in the first frames), at the latest powerOnTimeoutMs later */
    powerOnAfterMs: 700,
    powerOnTimeoutMs: 1200,
    /** Era text after the landing: each line fades and rises in */
    reveal: { durationS: 0.38, staggerS: 0.09, rise: 10 },
    resizeDebounceMs: 150,
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
