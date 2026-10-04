import { describe, expect, it } from 'vitest';
import { createRandom } from '../random';
import { STAR_STRIDE, createStarLayer, driftStars, starAlpha, type StarLayerSpec } from './layers';

const SPEC: StarLayerSpec = {
    perMegapixel: 100, min: 20, radius: [1, 2], alpha: [0.2, 0.6], speed: [4, 8], parallax: 10, twinkle: 0.3, tints: [0, 2],
};

describe('createStarLayer', () => {
    it('scales the star count with the screen area, never below the minimum', () => {
        // Arrange / Act
        const large = createStarLayer(SPEC, 2000, 1000, createRandom(1));
        const small = createStarLayer(SPEC, 100, 100, createRandom(1));

        // Assert
        expect(large.count).toBe(200);
        expect(small.count).toBe(20);
        expect(large.data).toHaveLength(200 * STAR_STRIDE);
    });

    it('keeps every value within its settings and replays the same sky for a seed', () => {
        // Arrange / Act
        const layer = createStarLayer(SPEC, 1000, 1000, createRandom(5));
        const again = createStarLayer(SPEC, 1000, 1000, createRandom(5));

        // Assert
        expect(again.data).toEqual(layer.data);
        for (let i = 0; i < layer.count; i++) {
            const base = i * STAR_STRIDE;
            expect(layer.data[base]).toBeLessThan(1);
            expect(layer.data[base + 2]).toBeGreaterThanOrEqual(1);
            expect(layer.data[base + 2]).toBeLessThan(2);
            expect(Math.abs(layer.data[base + 4])).toBeGreaterThanOrEqual(4);
            expect(SPEC.tints).toContain(layer.data[base + 5]);
        }
    });
});

describe('driftStars', () => {
    it('moves a star by its speed and wraps it to the other side', () => {
        // Arrange: one star at the right edge moving right at 100 px/s on a 1000 px screen
        const layer = { count: 2, data: new Float32Array(2 * STAR_STRIDE) };
        layer.data.set([0.5, 0.5, 1, 1, 100, 0, 0], 0);
        layer.data.set([1.049, 0.5, 1, 1, 100, 0, 0], STAR_STRIDE);

        // Act
        driftStars(layer, 1000, 1000);

        // Assert
        expect(layer.data[0]).toBeCloseTo(0.6, 5);
        expect(layer.data[STAR_STRIDE]).toBeCloseTo(0.049, 5);
    });
});

describe('starAlpha', () => {
    it('stays steady without twinkle and stays within its range with it', () => {
        // Arrange
        const layer = createStarLayer(SPEC, 1000, 1000, createRandom(9));
        const own = layer.data[3];

        // Act
        const steady = starAlpha(layer, 0, 0, 1234);
        const samples = Array.from({ length: 50 }, (_, i) => starAlpha(layer, 0, 0.3, i * 97));

        // Assert
        expect(steady).toBe(own);
        samples.forEach((alpha) => {
            expect(alpha).toBeGreaterThanOrEqual(own * 0.7 - 1e-6);
            expect(alpha).toBeLessThanOrEqual(own + 1e-6);
        });
    });
});
