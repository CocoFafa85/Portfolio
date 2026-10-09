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
    /** No grain: its still grey specks broke the even background (review of 2026-10-08, was 0.08 / 0.1) */
    grainMixer: 0,
    grainOverlay: 0,
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
 * Home starfield over the nebula (LOT 2, H4), shooting stars. Reviews: far layer removed
 * (2026-10-07); grey out-of-focus near layer removed and the coloured layer tripled at three
 * speeds, slow (the original), medium and fast (2026-10-08); the fast layer slowed down, it
 * tired the eye (2026-10-09, was 48–70 px/s).
 */
export const starEffects = {
    seed: 2035,
    /** Sprite tints: 0 white, 1 cyan, 2 violet, 3 pink (palette.ts). Same stars, three drift speeds (px/s);
     *  the faster a layer, the nearer it feels: a little more parallax */
    layers: [
        { perMegapixel: 110, min: 34, radius: [2.1, 3.9], alpha: [0.5, 0.9], speed: [6, 12], parallax: 11, twinkle: 0.25, tints: [0, 1, 2, 3] },
        { perMegapixel: 110, min: 34, radius: [2.1, 3.9], alpha: [0.5, 0.9], speed: [20, 32], parallax: 16, twinkle: 0.25, tints: [0, 1, 2, 3] },
        { perMegapixel: 110, min: 34, radius: [2.1, 3.9], alpha: [0.5, 0.9], speed: [30, 40], parallax: 22, twinkle: 0.25, tints: [0, 1, 2, 3] },
    ] satisfies StarLayerSpec[],
    meteor: {
        max: 2, intervalMs: [4500, 9000], speed: [650, 1000], length: [110, 220], lifeMs: [700, 1100],
        angle: [0.35, 0.7], startBand: 0.35,
    } satisfies MeteorSettings & { max: number },
    /** First shooting star, after the title has lit up */
    firstMeteorMs: 2500,
    /** A comet every 10 s (review of 2026-10-09): ~4× slower than a shooting star and bigger, it
     *  crosses the screen from the side it comes from, behind the gate like the rest of the sky */
    comet: {
        max: 1, intervalMs: [10_000, 10_000], speed: [170, 220], length: [340, 440], lifeMs: [5200, 6000],
        angle: [0.2, 0.38], startBand: 0.28, entrySpan: [0.04, 0.3],
    } satisfies MeteorSettings & { max: number },
    firstCometMs: 5000,
    /** Comet sprites: glowing head (radius px), ion tail (cyan, straight) and dust tail (violet,
     *  fainter, a little apart: radians), tail thickness at the head (px) */
    cometLook: { headSize: 96, headRadius: 24, tailWidth: 512, tailHeight: 32, ionThickness: 9, dustThickness: 15, dustAngle: 0.07, dustAlpha: 0.38 },
    /** Share of the remaining distance the parallax closes each frame */
    pointerSmoothing: 0.06,
    sprite: { size: 64, core: 0.25 },
    trail: { width: 256, height: 8, bright: 0.55, headRadius: 5, thickness: 3.2 },
    /** The gate stands in front of the sky (review of 2026-10-09, whole gate): erased up to the ring
     *  (gate radius 1), fading out to the chevron tips; sprite size of the erasing disc */
    occlusion: { solid: 1, fade: 1.12, size: 128 },
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
    /** Bolts are drawn once per console size on two canvases: halo and core widths (CSS px) */
    boltStroke: { halo: 5, core: 1.4 },
    pixelRatio: { fine: 2, coarse: 1.5, maxPixels: 8_000_000 } satisfies PixelRatioCaps,
    /** The flux capacitor powers on at the first idle moment after powerOnAfterMs (its glows are
     *  the costliest part of the console to paint: never in the first frames), at the latest powerOnTimeoutMs later */
    powerOnAfterMs: 700,
    powerOnTimeoutMs: 1200,
    /** Arrival through a page trip: lamp test (every segment lit, 88:88) once powered, then the dates */
    arrivalTestMs: 900,
    /** Era text after the landing: each line fades and rises in */
    reveal: { durationS: 0.38, staggerS: 0.09, rise: 10 },
    resizeDebounceMs: 150,
};

/** Neon tube around the convector and the era text (About, review of 2026-10-08):
 *  violet → pink → cyan, a third of the cycle each, two pulses per colour */
export const neonFrameEffects = {
    cycleMs: 7500,
};

/**
 * HoloCard v2 (Skills, LOT 4, S2, direction A "access badge"): a thick card
 * that tilts under the pointer (the original tilt and spring), its layers in
 * depth, an iridescent film that slides with the angle, a glare under the
 * pointer; a press flips it; the button downloads the CV in under a second.
 */
export const holoEffects = {
    perspective: 1200,
    /** Tilt at the card edge (degrees) and its spring: the original card's */
    tilt: { max: 15, spring: { stiffness: 200, damping: 20 } },
    /** Idle sway while nobody points at the card (degrees, one elliptic loop in ms), in CSS */
    sway: { x: 3, y: 5, periodMs: 8000 },
    /** Film shift for a full tilt (share of the card), glare travel (share of the card) */
    film: { shift: 0.22, drift: 0.06 },
    glare: { travel: 0.5, rest: 0.03 },
    /** Depth of the layers (px): edge half-thickness, film, print, emblem, glare */
    depth: { half: 6, film: 1, print: 18, emblem: 34, glare: 44 },
    /** Edge slices between the two faces (the visible thickness; each is a composited layer) */
    slices: 3,
    /** Press, then the flip (a spring on rotateY) */
    press: 0.97,
    flip: { type: 'spring', stiffness: 120, damping: 17, mass: 1 } satisfies Transition,
    /** Download sequence (ms from the press): laser sweep, gauge, stamp, download, back to rest */
    download: { scanMs: 620, gaugeMs: 760, stampAtMs: 640, stampMs: 180, downloadAtMs: 800, restAtMs: 1700 },
    /** Name and role decode under the pointer or the focus, then rest before decoding again */
    decode: { seed: 2049, steps: 16, spread: 0.3, durationMs: 640, pauseMs: 1500 } satisfies DecodeSettings & Record<'durationMs' | 'pauseMs', number>,
    /** The card mounts at the first idle moment after the page paints (at the latest this late) */
    mountTimeoutMs: 400,
    /** Rotating neon border, one turn (ms): the original card's */
    borderTurnMs: 4000,
    /** QR canvas density: sharp on every screen, small anyway (~170 CSS px) */
    qrPixelRatio: { fine: 2, coarse: 2, maxPixels: 400_000 } satisfies PixelRatioCaps,
};

/** Skill badges and the projects rail (Skills, LOT 4, S3): CSS variables of the sections */
export const skillEffects = {
    /** Opacity of what is not linked to the pointed badge or project */
    dimOpacity: 0.32,
    /** Light-up of a badge or a project card (transform and opacity only) */
    transitionMs: 180,
    /** A lit badge rises by this many px */
    lift: 2,
    /** Minimum contrast of a brand colour on the badge background (readableTint) */
    iconContrast: 3,
    /** The logos chunk is requested at the first idle moment after iconsAfterMs (never in the
     *  first frames: bundled, it delayed the page's paint), at the latest iconsTimeoutMs later */
    iconsAfterMs: 700,
    iconsTimeoutMs: 1200,
    /** ...and only once the badges are this close to the screen */
    iconsMargin: '300px',
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
