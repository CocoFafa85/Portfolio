import { describe, expect, it } from 'vitest';
import { calmDensity, calmHalfWidth, type CalmBand } from './density';

const CALM: CalmBand = { ratio: 0.3, maxHalfWidth: 400, floor: 0.1, ramp: 100 };

describe('calmHalfWidth', () => {
    it('follows the screen width, then caps on wide screens', () => {
        // Arrange / Act
        const phone = calmHalfWidth(400, CALM);
        const wide = calmHalfWidth(2560, CALM);

        // Assert
        expect(phone).toBe(120);
        expect(wide).toBe(400);
    });
});

describe('calmDensity', () => {
    it('stays at the floor in the calm band and reaches 1 beyond the ramp', () => {
        // Arrange: width 1000 → band 200..800, ramp out to 100 and 900
        const width = 1000;

        // Act
        const center = calmDensity(500, width, CALM);
        const halfway = calmDensity(850, width, CALM);
        const edge = calmDensity(20, width, CALM);

        // Assert
        expect(center).toBe(0.1);
        expect(halfway).toBeCloseTo(0.55, 9);
        expect(edge).toBe(1);
    });
});
