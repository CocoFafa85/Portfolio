import { describe, expect, it } from 'vitest';
import { between, createRandom, hashUnit, inRange } from './random';

const take = (seed: number, count: number): number[] => {
    const random = createRandom(seed);
    return Array.from({ length: count }, () => random());
};

describe('createRandom', () => {
    it('replays the same sequence for the same seed', () => {
        // Arrange
        const seed = 88;

        // Act
        const first = take(seed, 5);
        const second = take(seed, 5);

        // Assert
        expect(second).toEqual(first);
    });

    it('produces a different sequence for another seed', () => {
        // Arrange / Act
        const a = take(1, 5);
        const b = take(2, 5);

        // Assert
        expect(b).not.toEqual(a);
    });

    it('stays within [0, 1)', () => {
        // Arrange / Act
        const values = take(7, 1000);

        // Assert
        expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...values)).toBeLessThan(1);
    });
});

describe('between / inRange', () => {
    it('maps the source onto the requested bounds', () => {
        // Arrange
        const random = createRandom(3);

        // Act
        const values = Array.from({ length: 200 }, (_, i) =>
            i % 2 ? between(random, 10, 20) : inRange(random, [10, 20]));

        // Assert
        expect(values.every((v) => v >= 10 && v < 20)).toBe(true);
    });
});

describe('hashUnit', () => {
    it('returns the same draw for the same triple and another for a neighbour', () => {
        // Arrange / Act
        const first = hashUnit(1985, 3, 7);
        const again = hashUnit(1985, 3, 7);
        const neighbour = hashUnit(1985, 3, 8);

        // Assert
        expect(again).toBe(first);
        expect(neighbour).not.toBe(first);
    });

    it('spreads its draws evenly over [0, 1)', () => {
        // Arrange
        const draws: number[] = [];

        // Act
        for (let a = 0; a < 100; a++) for (let b = 0; b < 100; b++) draws.push(hashUnit(42, a, b));
        const mean = draws.reduce((sum, value) => sum + value, 0) / draws.length;

        // Assert
        expect(Math.min(...draws)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...draws)).toBeLessThan(1);
        expect(mean).toBeCloseTo(0.5, 1);
    });
});
