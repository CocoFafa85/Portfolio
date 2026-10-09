import { describe, expect, it } from 'vitest';
import { emberPaths, litCount, nodeThresholds, sideOf, sparkPaths, yearDigits } from './trajectory';

describe('yearDigits', () => {
    it('keeps a four-digit year for the display', () => {
        // Arrange
        const years = ['2024', '2026'];

        // Act
        const digits = years.map(yearDigits);

        // Assert
        expect(digits).toEqual(['2024', '2026']);
    });

    it('shows nothing but the unlit segments for a year still to provide', () => {
        // Arrange
        const years = ['[À FOURNIR : année]', '', '25', '2025a'];

        // Act
        const digits = years.map(yearDigits);

        // Assert
        expect(digits).toEqual([null, null, null, null]);
    });
});

describe('sideOf', () => {
    it('alternates the cards left and right of the axis, starting left', () => {
        // Arrange
        const indexes = [0, 1, 2, 3, 4];

        // Act
        const sides = indexes.map(sideOf);

        // Assert
        expect(sides).toEqual(['left', 'right', 'left', 'right', 'left']);
    });
});

describe('nodeThresholds', () => {
    it('turns each point offset into a share of the axis length', () => {
        // Arrange
        const offsets = [0, 500, 1000];

        // Act
        const thresholds = nodeThresholds(offsets, 2000);

        // Assert
        expect(thresholds).toEqual([0, 0.25, 0.5]);
    });

    it('keeps the thresholds within the axis, and at 0 for an axis not laid out yet', () => {
        // Arrange
        const offsets = [-20, 2100];

        // Act
        const clamped = nodeThresholds(offsets, 2000);
        const unmeasured = nodeThresholds(offsets, 0);

        // Assert
        expect(clamped).toEqual([0, 1]);
        expect(unmeasured).toEqual([0, 0]);
    });
});

describe('litCount', () => {
    it('lights every point the flame has reached, a point exactly under it included', () => {
        // Arrange
        const thresholds = [0.1, 0.3, 0.6, 0.9];

        // Act
        const counts = [0, 0.1, 0.45, 0.6, 1].map((progress) => litCount(thresholds, progress));

        // Assert
        expect(counts).toEqual([0, 1, 2, 3, 4]);
    });

    it('lights them all at once at the end of a jump (End key, fast scroll)', () => {
        // Arrange
        const thresholds = [0.1, 0.3, 0.6, 0.9];

        // Act
        const count = litCount(thresholds, 1);

        // Assert
        expect(count).toBe(thresholds.length);
    });
});

describe('sparkPaths', () => {
    it('throws the sparks evenly all around the point, at the reach', () => {
        // Arrange / Act
        const sparks = sparkPaths(6, 32);

        // Assert
        expect(sparks).toHaveLength(6);
        sparks.forEach((spark) => expect(Math.hypot(spark.x, spark.y)).toBeCloseTo(32, -0.5));
        expect(new Set(sparks.map((spark) => Math.sign(spark.x))).size).toBe(2);
        expect(new Set(sparks.map((spark) => Math.sign(spark.y))).size).toBe(2);
    });
});

describe('emberPaths', () => {
    it('sends the embers up, left and right in turn, within the drift, rise and duration ranges', () => {
        // Arrange
        const settings = { count: 6, drift: [6, 18], rise: [30, 62], durationMs: [1200, 2050] };

        // Act
        const embers = emberPaths(settings);

        // Assert
        expect(embers.map((ember) => Math.sign(ember.x))).toEqual([-1, 1, -1, 1, -1, 1]);
        embers.forEach((ember) => {
            expect(Math.abs(ember.x)).toBeGreaterThanOrEqual(6);
            expect(Math.abs(ember.x)).toBeLessThanOrEqual(18);
            expect(-ember.y).toBeGreaterThanOrEqual(30);
            expect(-ember.y).toBeLessThanOrEqual(62);
        });
        expect(embers[0].durationMs).toBe(1200);
        expect(embers[5].durationMs).toBe(2050);
    });

    it('spreads their starts over the first rise, already under way', () => {
        // Arrange
        const settings = { count: 4, drift: [6, 18], rise: [30, 62], durationMs: [1200, 2000] };

        // Act
        const delays = emberPaths(settings).map((ember) => ember.delayMs);

        // Assert
        expect(delays).toEqual([0, -300, -600, -900]);
    });
});
