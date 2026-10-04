import { describe, expect, it } from 'vitest';
import { hexToRgb01 } from './color';

describe('hexToRgb01', () => {
    it('converts a six-digit token to 0..1 channels at the given offset', () => {
        // Arrange
        const out = new Float32Array(6);

        // Act
        hexToRgb01('#ff0080', out, 3);

        // Assert
        expect([...out.slice(0, 3)]).toEqual([0, 0, 0]);
        expect(out[3]).toBe(1);
        expect(out[4]).toBe(0);
        expect(out[5]).toBeCloseTo(128 / 255, 6);
    });

    it('accepts the short form and surrounding spaces (as read from a CSS variable)', () => {
        // Arrange
        const out = new Float32Array(3);

        // Act
        hexToRgb01(' #0fc', out);

        // Assert
        expect([...out]).toEqual([0, 1, 0.800000011920929]);
    });

    it('writes black for a value that is not a hex colour', () => {
        // Arrange
        const out = Float32Array.from([1, 1, 1]);

        // Act
        hexToRgb01('rgb(1, 2, 3)', out);

        // Assert
        expect([...out]).toEqual([0, 0, 0]);
    });
});
