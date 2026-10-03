import { describe, expect, it } from 'vitest';
import { normalizePointer, type PointerPosition } from './pointer';

describe('normalizePointer', () => {
    it('returns 0,0 at the viewport center', () => {
        // Arrange
        const out: PointerPosition = { x: 1, y: 1 };

        // Act
        normalizePointer(out, 500, 300, 1000, 600);

        // Assert
        expect(out).toEqual({ x: 0, y: 0 });
    });

    it('maps the corners to -0.5 and 0.5', () => {
        // Arrange
        const topLeft: PointerPosition = { x: 0, y: 0 };
        const bottomRight: PointerPosition = { x: 0, y: 0 };

        // Act
        normalizePointer(topLeft, 0, 0, 1000, 600);
        normalizePointer(bottomRight, 1000, 600, 1000, 600);

        // Assert
        expect(topLeft).toEqual({ x: -0.5, y: -0.5 });
        expect(bottomRight).toEqual({ x: 0.5, y: 0.5 });
    });

    it('clamps coordinates outside the viewport', () => {
        // Arrange
        const out: PointerPosition = { x: 0, y: 0 };

        // Act
        normalizePointer(out, -200, 5000, 1000, 600);

        // Assert
        expect(out).toEqual({ x: -0.5, y: 0.5 });
    });

    it('returns 0 for an empty viewport instead of NaN', () => {
        // Arrange
        const out: PointerPosition = { x: 0.3, y: 0.3 };

        // Act
        normalizePointer(out, 10, 10, 0, 0);

        // Assert
        expect(out).toEqual({ x: 0, y: 0 });
    });

    it('writes into the given object without allocating a new one', () => {
        // Arrange
        const out: PointerPosition = { x: 0, y: 0 };

        // Act
        const result = normalizePointer(out, 250, 150, 1000, 600);

        // Assert
        expect(result).toBe(out);
    });
});
