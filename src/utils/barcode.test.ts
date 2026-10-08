import { describe, expect, it } from 'vitest';
import { barcodeSvg, code128Checksum, code128Values, code128Widths, symbolWidths } from './barcode';

describe('symbol table', () => {
    it('gives 11 modules to every symbol and 13 to the stop, all distinct', () => {
        // Arrange
        const values = Array.from({ length: 107 }, (_, value) => value);

        // Act
        const widths = values.map(symbolWidths);

        // Assert
        widths.forEach((w, value) => expect(w.reduce((a, b) => a + b, 0)).toBe(value === 106 ? 13 : 11));
        expect(new Set(widths.map((w) => w.join(''))).size).toBe(107);
    });
});

describe('code128Checksum', () => {
    it('weights each value by its position, the start code counting once (PJJ123C → 55)', () => {
        // Arrange: start B, P J J 1 2 3 C in code set B (computed by hand: 879 mod 103)
        const values = [104, 48, 42, 42, 17, 18, 19, 35];

        // Act
        const check = code128Checksum(values);

        // Assert
        expect(check).toBe(55);
    });
});

describe('code128Values', () => {
    it('frames the text with start B, the check value and stop', () => {
        // Arrange
        const text = 'PJJ123C';

        // Act
        const values = code128Values(text);

        // Assert
        expect(values).toEqual([104, 48, 42, 42, 17, 18, 19, 35, 55, 106]);
    });

    it('refuses a character outside code set B', () => {
        // Arrange
        const text = 'CF-é';

        // Act
        const encode = () => code128Values(text);

        // Assert
        expect(encode).toThrow(/é/);
    });
});

describe('code128Widths', () => {
    it('starts and ends with a bar and spans 11 modules per symbol plus 13 for the stop', () => {
        // Arrange
        const text = 'ID-CF-2026-FSK';

        // Act
        const widths = code128Widths(text);

        // Assert
        expect(widths.length % 2).toBe(1);
        expect(widths.reduce((a, b) => a + b, 0)).toBe(11 * (text.length + 2) + 13);
    });
});

describe('barcodeSvg', () => {
    it('draws one rectangle per bar, after a quiet zone', () => {
        // Arrange
        const widths = [2, 1, 3];

        // Act
        const svg = barcodeSvg(widths, 20, '#fff', 4);

        // Assert
        expect(svg).toContain('viewBox="0 0 14 20"');
        expect(svg.match(/<rect /g)).toHaveLength(2);
        expect(svg).toContain('<rect x="4" width="2" height="20"/><rect x="7" width="3" height="20"/>');
    });
});
