import { inRange, type Range } from '../random';
import { GROUP, TONE, onGate, type ParticleWriter } from './writer';

/** Ring of glyphs inside the gate (it turns as a whole). */
export interface GlyphBandSettings {
    count: number;
    /** Radius of the glyph centres and of the inner rim */
    radius: number;
    rim: number;
    /** Size of one glyph (tangent, radial) */
    width: number;
    height: number;
    /** Strokes per glyph: vertices drawn in [min, max) */
    vertices: Range;
    rimPoints: number;
    pointsPerGlyph: number;
    rimSize: number;
    glyphSize: number;
    delay: Range;
}

/** Nine chevrons around the gate; each one has a body and a light core that turns on. */
export interface ChevronSettings {
    count: number;
    /** Trapezoid from the outer edge (wide) to the inner edge (narrow) */
    outer: number;
    inner: number;
    outerHalf: number;
    innerHalf: number;
    core: { outer: number; inner: number; outerHalf: number; innerHalf: number };
    depth: number;
    bodyPoints: number;
    corePoints: number;
    bodySize: number;
    coreSize: number;
    delay: Range;
}

/** One random point inside a trapezoid laid along the radius at `angle`. */
function trapezoidPoint(writer: ParticleWriter, angle: number, outer: number, inner: number, outerHalf: number, innerHalf: number): [number, number] {
    const along = writer.random();
    const half = outerHalf + (innerHalf - outerHalf) * along;
    return onGate(angle, outer + (inner - outer) * along, half * (writer.random() * 2 - 1));
}

/** Glyphs: short random polylines (seeded), sampled into luminous points, plus the inner rim. */
export function addGlyphBand(writer: ParticleWriter, band: GlyphBandSettings): void {
    const { random } = writer;
    for (let i = 0; i < band.rimPoints; i++) {
        const [x, y] = onGate(random() * Math.PI * 2, band.rim + random() * 0.008);
        writer.push(x, y, (random() - 0.5) * 0.05, band.rimSize, GROUP.glyph, inRange(random, band.delay), random(), TONE.glyph);
    }
    const vertices = new Float32Array(Math.ceil(band.vertices[1]) * 2);
    for (let g = 0; g < band.count; g++) {
        const angle = (g / band.count) * Math.PI * 2;
        const count = Math.floor(inRange(random, band.vertices));
        for (let v = 0; v < count; v++) {
            vertices[2 * v] = (random() - 0.5) * band.width;
            vertices[2 * v + 1] = (random() - 0.5) * band.height;
        }
        for (let p = 0; p < band.pointsPerGlyph; p++) {
            const along = random() * (count - 1);
            const a = Math.floor(along);
            const b = Math.min(count - 1, a + 1);
            const t = along - a;
            const tangent = vertices[2 * a] + (vertices[2 * b] - vertices[2 * a]) * t;
            const radial = vertices[2 * a + 1] + (vertices[2 * b + 1] - vertices[2 * a + 1]) * t;
            const [x, y] = onGate(angle, band.radius + radial, tangent);
            writer.push(x, y, 0.02, band.glyphSize, GROUP.glyph, inRange(random, band.delay), random(), TONE.glyph);
        }
    }
}

/** Chevron bodies (static metal) and their light cores (chevron index kept for lighting). */
export function addChevrons(writer: ParticleWriter, chevron: ChevronSettings): void {
    const { random } = writer;
    for (let k = 0; k < chevron.count; k++) {
        const angle = (k / chevron.count) * Math.PI * 2;
        for (let i = 0; i < chevron.bodyPoints; i++) {
            const [x, y] = trapezoidPoint(writer, angle, chevron.outer, chevron.inner, chevron.outerHalf, chevron.innerHalf);
            writer.push(x, y, chevron.depth + (random() - 0.5) * 0.04, chevron.bodySize, GROUP.static, inRange(random, chevron.delay), random(), TONE.chevronBody);
        }
        const { core } = chevron;
        for (let i = 0; i < chevron.corePoints; i++) {
            const [x, y] = trapezoidPoint(writer, angle, core.outer, core.inner, core.outerHalf, core.innerHalf);
            writer.push(x, y, chevron.depth + 0.03, chevron.coreSize, GROUP.chevron, inRange(random, chevron.delay), k, TONE.chevronCore);
        }
    }
}

/** Particles a glyph band and its chevrons need, for the buffer size. */
export const glyphBandCount = (band: GlyphBandSettings): number => band.rimPoints + band.count * band.pointsPerGlyph;
export const chevronCount = (chevron: ChevronSettings): number => chevron.count * (chevron.bodyPoints + chevron.corePoints);
