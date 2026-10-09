import { describe, expect, it } from 'vitest';
import { sideOf, sparkPaths, yearDigits } from './trajectory';

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
