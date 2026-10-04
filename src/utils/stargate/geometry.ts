import { inRange, type Random, type Range } from '../random';
import { addChevrons, addGlyphBand, chevronCount, glyphBandCount, type ChevronSettings, type GlyphBandSettings } from './features';
import { GROUP, TONE, createWriter, onGate, type GateGeometry, type ScatterSettings } from './writer';

/** Shape and density of the particle gate (values in effects.ts; model units, gate radius 1). */
export interface GateConfig {
    ring: {
        inner: number;
        outer: number;
        depth: number;
        /** Share of the ring particles packed on each luminous rim */
        rimShare: number;
        rimWidth: number;
        points: number;
        bodySize: Range;
        rimSize: number;
        delay: Range;
    };
    /** Faint glow around the gate */
    aura: { inner: number; reach: number; depth: number; points: number; size: Range; delay: Range };
    glyphs: GlyphBandSettings;
    chevrons: ChevronSettings;
    /** Stardust inside the gate, the future event horizon */
    horizon: { radius: number; depth: number; points: number; size: Range; delay: Range };
    scatter: ScatterSettings;
}

export function gateParticleCount(cfg: GateConfig): number {
    return cfg.aura.points + cfg.ring.points + glyphBandCount(cfg.glyphs) + chevronCount(cfg.chevrons) + cfg.horizon.points;
}

/**
 * Generates the particle gate: aura, ring body with two bright rims, glyph
 * band, nine chevrons and the horizon dust, each particle with its start in
 * a scattered cloud (the gate assembles from it). Deterministic for `random`.
 * A generator: it pauses after each part, so a caller can spread the work
 * over several frames (no long task); it returns the finished geometry.
 */
export function* gateGeometrySteps(cfg: GateConfig, random: Random): Generator<void, GateGeometry> {
    const writer = createWriter(gateParticleCount(cfg), cfg.scatter, random);
    const { aura, ring, horizon } = cfg;

    for (let i = 0; i < aura.points; i++) {
        // Density falls off away from the ring
        const [x, y] = onGate(random() * Math.PI * 2, aura.inner + random() ** 2 * aura.reach);
        writer.push(x, y, (random() - 0.5) * aura.depth, inRange(random, aura.size), GROUP.static, inRange(random, aura.delay), random(), TONE.aura);
    }
    yield;

    for (let i = 0; i < ring.points; i++) {
        const pick = random();
        const angle = random() * Math.PI * 2;
        let radius: number;
        let size: number;
        let tone: number;
        if (pick < ring.rimShare * 2) {
            const outerRim = pick >= ring.rimShare;
            radius = outerRim ? ring.outer - random() * ring.rimWidth : ring.inner + random() * ring.rimWidth;
            size = ring.rimSize;
            tone = TONE.rim;
        } else {
            // Uniform over the annulus area
            radius = Math.sqrt(ring.inner ** 2 + random() * (ring.outer ** 2 - ring.inner ** 2));
            size = inRange(random, ring.bodySize);
            tone = TONE.body;
        }
        const [x, y] = onGate(angle, radius);
        writer.push(x, y, (random() - 0.5) * ring.depth, size, GROUP.static, inRange(random, ring.delay), random(), tone);
    }
    yield;
    addGlyphBand(writer, cfg.glyphs);
    yield;
    addChevrons(writer, cfg.chevrons);
    yield;

    for (let i = 0; i < horizon.points; i++) {
        const [x, y] = onGate(random() * Math.PI * 2, horizon.radius * Math.sqrt(random()));
        writer.push(x, y, (random() - 0.5) * horizon.depth, inRange(random, horizon.size), GROUP.horizon, inRange(random, horizon.delay), random(), TONE.horizon);
    }

    return writer.geometry;
}

/** The whole gate at once (same result as running gateGeometrySteps to the end). */
export function buildGateGeometry(cfg: GateConfig, random: Random): GateGeometry {
    const steps = gateGeometrySteps(cfg, random);
    let step = steps.next();
    while (!step.done) step = steps.next();
    return step.value;
}
