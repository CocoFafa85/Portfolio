import { describe, expect, it } from 'vitest';
import { createRandom } from '../random';
import { boltPath, createBolts } from './bolts';

/** Points of an SVG path made of M / L commands */
const pointsOf = (path: string): number[][] =>
    path.split(/[ML]/).map((s) => s.trim()).filter(Boolean).map((pair) => pair.split(' ').map(Number));

describe('boltPath', () => {
    it('runs from the start to the end through 2^depth segments', () => {
        // Arrange / Act
        const points = pointsOf(boltPath(createRandom(1), 10, 20, 200, 80, 4, 0.4));

        // Assert
        expect(points).toHaveLength(2 ** 4 + 1);
        expect(points[0]).toEqual([10, 20]);
        expect(points[points.length - 1]).toEqual([200, 80]);
    });

    it('is a straight line without jitter, jagged with it', () => {
        // Arrange / Act
        const straight = pointsOf(boltPath(createRandom(1), 0, 0, 100, 0, 3, 0));
        const jagged = pointsOf(boltPath(createRandom(1), 0, 0, 100, 0, 3, 0.4));

        // Assert
        expect(straight.every(([, y]) => y === 0)).toBe(true);
        expect(jagged.some(([, y]) => Math.abs(y) > 1)).toBe(true);
    });

    it('replays the same bolt for a seed', () => {
        // Arrange / Act
        const first = boltPath(createRandom(1955), 0, 0, 300, 120, 5, 0.42);
        const again = boltPath(createRandom(1955), 0, 0, 300, 120, 5, 0.42);
        const other = boltPath(createRandom(1985), 0, 0, 300, 120, 5, 0.42);

        // Assert
        expect(again).toBe(first);
        expect(other).not.toBe(first);
    });
});

describe('createBolts', () => {
    it('shoots every bolt from the capacitor to the edge of the console', () => {
        // Arrange
        const width = 600;
        const height = 320;

        // Act
        const bolts = createBolts(createRandom(88), 520, 90, width, height, { count: 6, depth: 4, jitter: 0.4 });

        // Assert
        expect(bolts).toHaveLength(6);
        for (const bolt of bolts) {
            const points = pointsOf(bolt);
            const [x, y] = points[points.length - 1];
            expect(points[0]).toEqual([520, 90]);
            expect(x === 0 || x === width || y === 0 || y === height).toBe(true);
        }
    });
});
