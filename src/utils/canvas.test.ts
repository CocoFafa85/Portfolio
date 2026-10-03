import { describe, expect, it } from 'vitest';
import { capPixelRatio } from './canvas';

const CAPS = { fine: 2, coarse: 1.5, maxPixels: 8_000_000 };

describe('capPixelRatio', () => {
    it('keeps the device ratio under the desktop cap', () => {
        // Arrange / Act
        const ratio = capPixelRatio(2, 1440, 900, false, CAPS);

        // Assert
        expect(ratio).toBe(2);
    });

    it('caps touch screens lower', () => {
        // Arrange / Act
        const ratio = capPixelRatio(3, 375, 812, true, CAPS);

        // Assert
        expect(ratio).toBe(1.5);
    });

    it('limits the backing store of very large screens', () => {
        // Arrange / Act
        const ratio = capPixelRatio(2, 2560, 1440, false, CAPS);

        // Assert
        expect(2560 * 1440 * ratio * ratio).toBeLessThanOrEqual(8_000_000 + 1);
        expect(ratio).toBeLessThan(2);
    });

    it('never goes below 1, even without a device ratio', () => {
        // Arrange / Act
        const ratio = capPixelRatio(0, 3840, 2160, false, CAPS);

        // Assert
        expect(ratio).toBe(1);
    });
});
