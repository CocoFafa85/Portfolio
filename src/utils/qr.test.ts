import { describe, expect, it } from 'vitest';
import { content } from '../data/content';
import { linkedinQr } from '../data/generated/linkedinQr';
import { hasFinderAt } from './qr';

describe('generated LinkedIn QR code', () => {
    it('encodes the LinkedIn profile of content.ts (regenerate with npm run gen:assets)', () => {
        // Arrange
        const expected = content.profiles.linkedin;

        // Act
        const source = linkedinQr.source;

        // Assert
        expect(source).toBe(expected);
    });

    it('is a square QR matrix with its three finder patterns', () => {
        // Arrange
        const { rows } = linkedinQr;
        const size = rows.length;

        // Act
        const corners = [hasFinderAt(rows, 0, 0), hasFinderAt(rows, 0, size - 7), hasFinderAt(rows, size - 7, 0)];

        // Assert
        expect(rows.every((row) => row.length === size)).toBe(true);
        expect((size - 17) % 4).toBe(0);
        expect(corners).toEqual([true, true, true]);
    });
});
