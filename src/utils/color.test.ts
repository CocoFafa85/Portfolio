import { describe, expect, it } from 'vitest';
import { contrastRatio, hexToRgb01, readableTint, relativeLuminance } from './color';

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

describe('contrastRatio', () => {
    it('matches the WCAG values (white on black 21:1, a colour with itself 1:1)', () => {
        // Arrange
        const pairs: [string, string][] = [['#ffffff', '#000000'], ['#ff0080', '#ff0080']];

        // Act
        const ratios = pairs.map(([a, b]) => contrastRatio(a, b));

        // Assert
        expect(ratios[0]).toBeCloseTo(21, 5);
        expect(ratios[1]).toBe(1);
    });
});

describe('readableTint', () => {
    it('keeps a brand colour that already reads on the background', () => {
        // Arrange
        const react = '#61dafb';

        // Act
        const tint = readableTint(react, '#0d0d18');

        // Assert
        expect(tint).toBe('#61dafb');
    });

    it('lightens a too dark brand colour just enough to reach the ratio', () => {
        // Arrange
        const angular = '#0f0f11';
        const background = '#0d0d18';

        // Act
        const tint = readableTint(angular, background, 3);

        // Assert
        expect(contrastRatio(tint, background)).toBeGreaterThanOrEqual(3);
        expect(contrastRatio(tint, background)).toBeLessThan(3.6);
        expect(relativeLuminance(tint)).toBeGreaterThan(relativeLuminance(angular));
    });
});
