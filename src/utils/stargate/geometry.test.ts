import { describe, expect, it } from 'vitest';
import { createRandom } from '../random';
import { buildGateGeometry, gateParticleCount, type GateConfig } from './geometry';
import { GROUP, TONE } from './writer';

const CONFIG: GateConfig = {
    ring: { inner: 0.8, outer: 1, depth: 0.13, rimShare: 0.2, rimWidth: 0.012, points: 400, bodySize: [1.9, 3.4], rimSize: 2.6, delay: [0, 0.3] },
    aura: { inner: 0.95, reach: 0.32, depth: 0.3, points: 100, size: [2.6, 4.6], delay: [0, 0.4] },
    glyphs: {
        count: 39, radius: 0.7, rim: 0.62, width: 0.075, height: 0.09, vertices: [3, 5],
        rimPoints: 50, pointsPerGlyph: 10, rimSize: 1.8, glyphSize: 2.1, delay: [0.2, 0.5],
    },
    chevrons: {
        count: 9, outer: 1.08, inner: 0.93, outerHalf: 0.065, innerHalf: 0.03,
        core: { outer: 1.045, inner: 0.965, outerHalf: 0.03, innerHalf: 0.015 },
        depth: 0.08, bodyPoints: 20, corePoints: 10, bodySize: 2.2, coreSize: 2.6, delay: [0.45, 0.7],
    },
    horizon: { radius: 0.6, depth: 0.05, points: 200, size: [1.4, 3.2], delay: [0.55, 0.9] },
    scatter: { radius: [2.4, 6.4], widen: 1.6, depth: -3 },
};

const radiusOf = (to: Float32Array, i: number) => Math.hypot(to[3 * i], to[3 * i + 1]);

describe('buildGateGeometry', () => {
    it('fills exactly the expected number of particles', () => {
        // Arrange / Act
        const gate = buildGateGeometry(CONFIG, createRandom(1));

        // Assert
        expect(gateParticleCount(CONFIG)).toBe(100 + 400 + 50 + 390 + 270 + 200);
        expect(gate.count).toBe(1410);
        expect(gate.to).toHaveLength(1410 * 3);
        expect(gate.params[(gate.count - 1) * 4]).toBeGreaterThan(0);
    });

    it('replays the same gate for a seed', () => {
        // Arrange / Act
        const first = buildGateGeometry(CONFIG, createRandom(2026));
        const again = buildGateGeometry(CONFIG, createRandom(2026));

        // Assert
        expect(again.to).toEqual(first.to);
        expect(again.from).toEqual(first.from);
    });

    it('keeps each part at its radius: ring and rims, horizon inside, chevrons on the edge', () => {
        // Arrange
        const gate = buildGateGeometry(CONFIG, createRandom(3));

        // Act
        const parts = { ring: [] as number[], horizon: [] as number[], cores: [] as number[] };
        for (let i = 0; i < gate.count; i++) {
            const tone = gate.tones[i];
            if (tone === TONE.body || tone === TONE.rim) parts.ring.push(radiusOf(gate.to, i));
            if (tone === TONE.horizon) parts.horizon.push(radiusOf(gate.to, i));
            if (tone === TONE.chevronCore) parts.cores.push(radiusOf(gate.to, i));
        }

        // Assert
        parts.ring.forEach((r) => { expect(r).toBeGreaterThanOrEqual(0.8 - 1e-6); expect(r).toBeLessThanOrEqual(1 + 1e-6); });
        parts.horizon.forEach((r) => expect(r).toBeLessThanOrEqual(0.6 + 1e-6));
        parts.cores.forEach((r) => expect(r).toBeGreaterThan(0.93));
    });

    it('gives each chevron core its chevron index and the right motion group', () => {
        // Arrange
        const gate = buildGateGeometry(CONFIG, createRandom(4));

        // Act
        const perChevron = new Array(9).fill(0);
        for (let i = 0; i < gate.count; i++) {
            if (gate.tones[i] !== TONE.chevronCore) continue;
            expect(gate.params[4 * i + 1]).toBe(GROUP.chevron);
            perChevron[gate.params[4 * i + 3]]++;
        }

        // Assert
        expect(perChevron).toEqual(new Array(9).fill(10));
    });

    it('starts every particle far away, behind the gate', () => {
        // Arrange
        const gate = buildGateGeometry(CONFIG, createRandom(5));

        // Act
        let meanZ = 0;
        let nearest = Infinity;
        for (let i = 0; i < gate.count; i++) {
            const [x, y, z] = [gate.from[3 * i], gate.from[3 * i + 1], gate.from[3 * i + 2]];
            nearest = Math.min(nearest, Math.hypot(x / 1.6, y, z + 3));
            meanZ += z / gate.count;
        }

        // Assert
        expect(nearest).toBeGreaterThanOrEqual(2.4 - 1e-6);
        expect(meanZ).toBeLessThan(-2);
    });
});
