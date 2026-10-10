import { describe, expect, it } from 'vitest';
import { capPixelRatio } from './canvas';

const MAX_PIXELS = 8_000_000;

describe('capPixelRatio', () => {
    it('keeps the budget ratio when the canvas fits the pixel cap', () => {
        // Arrange / Act
        const ratio = capPixelRatio(2, 1440, 900, MAX_PIXELS);

        // Assert
        expect(ratio).toBe(2);
    });

    it('limits the backing store of very large screens', () => {
        // Arrange / Act
        const ratio = capPixelRatio(2, 2560, 1440, MAX_PIXELS);

        // Assert
        expect(2560 * 1440 * ratio * ratio).toBeLessThanOrEqual(MAX_PIXELS + 1);
        expect(ratio).toBeLessThan(2);
    });

    it('never goes below 1, even without a ratio', () => {
        // Arrange / Act
        const ratio = capPixelRatio(0, 3840, 2160, MAX_PIXELS);

        // Assert
        expect(ratio).toBe(1);
    });
});
