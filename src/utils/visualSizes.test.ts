import { describe, expect, it } from 'vitest';
import { visualSizes } from './visualSizes';

describe('visualSizes (A1)', () => {
    it('writes the widest, two-column, phone and one-column widths in that order', () => {
        // Arrange
        const bp = { tablet: 600, wide: 1024 };
        const layout = { widest: 488, widestFrom: 1324, columnChrome: 174, mobileChrome: 100, narrowChrome: 132 };

        // Act
        const sizes = visualSizes(bp, layout);

        // Assert
        expect(sizes).toBe('(min-width: 1324px) 488px, (min-width: 1024px) calc(50vw - 174px), (max-width: 599.98px) calc(100vw - 100px), calc(100vw - 132px)');
    });
});
