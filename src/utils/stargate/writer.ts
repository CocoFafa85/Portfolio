import { inRange, type Random, type Range } from '../random';

/** How a particle moves: static, turns with the glyph ring, lit with its chevron, swirls in the horizon */
export const GROUP = { static: 0, glyph: 1, chevron: 2, horizon: 3 } as const;

/** Colour of a particle, as an index into the palette uniform (read from the design tokens) */
export const TONE = { aura: 0, body: 1, rim: 2, glyph: 3, chevronBody: 4, chevronCore: 5, horizon: 6 } as const;
export const TONE_COUNT = 7;

/** Where the particles start before the gate assembles: a wide, deep cloud */
export interface ScatterSettings {
    radius: Range;
    /** Horizontal stretch of the cloud */
    widen: number;
    /** The cloud sits behind the gate (negative z) */
    depth: number;
}

/** Every particle of the gate, packed for one WebGL draw call. */
export interface GateGeometry {
    count: number;
    /** x, y, z of the assembled gate (model units, gate radius 1) */
    to: Float32Array;
    /** x, y, z in the scattered cloud */
    from: Float32Array;
    /** size, group, assembly delay (0..1), chevron index or random phase */
    params: Float32Array;
    tones: Float32Array;
}

export interface ParticleWriter {
    geometry: GateGeometry;
    random: Random;
    /** Adds a particle; its scattered start is drawn here */
    push(x: number, y: number, z: number, size: number, group: number, delay: number, phase: number, tone: number): void;
}

export function createWriter(count: number, scatter: ScatterSettings, random: Random): ParticleWriter {
    const geometry: GateGeometry = {
        count,
        to: new Float32Array(count * 3),
        from: new Float32Array(count * 3),
        params: new Float32Array(count * 4),
        tones: new Float32Array(count),
    };
    let next = 0;
    const push: ParticleWriter['push'] = (x, y, z, size, group, delay, phase, tone) => {
        if (next >= count) return;
        const p3 = next * 3;
        const p4 = next * 4;
        geometry.to[p3] = x;
        geometry.to[p3 + 1] = y;
        geometry.to[p3 + 2] = z;
        // Uniform direction on a sphere, then stretched and pushed back
        const theta = random() * Math.PI * 2;
        const phi = Math.acos(2 * random() - 1);
        const reach = inRange(random, scatter.radius);
        geometry.from[p3] = Math.sin(phi) * Math.cos(theta) * reach * scatter.widen;
        geometry.from[p3 + 1] = Math.sin(phi) * Math.sin(theta) * reach;
        geometry.from[p3 + 2] = Math.cos(phi) * reach + scatter.depth;
        geometry.params[p4] = size;
        geometry.params[p4 + 1] = group;
        geometry.params[p4 + 2] = delay;
        geometry.params[p4 + 3] = phase;
        geometry.tones[next] = tone;
        next++;
    };
    return { geometry, random, push };
}

/** Point on the gate plane at `radius`, angle measured clockwise from the top, plus a tangent shift. */
export function onGate(angle: number, radius: number, tangent = 0): [number, number] {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    return [sin * radius + cos * tangent, cos * radius - sin * tangent];
}
