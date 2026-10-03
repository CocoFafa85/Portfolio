import { describe, expect, it } from 'vitest';
import { formatNavIndex } from './format';

describe('formatNavIndex', () => {
    it('numbers the first entry 01', () => {
        // Arrange
        const index = 0;

        // Act
        const label = formatNavIndex(index);

        // Assert
        expect(label).toBe('01');
    });

    it('keeps two digits from the tenth entry on', () => {
        // Arrange
        const tenth = 9;

        // Act
        const label = formatNavIndex(tenth);

        // Assert
        expect(label).toBe('10');
    });

    it('never truncates a longer number', () => {
        // Arrange
        const hundredth = 99;

        // Act
        const label = formatNavIndex(hundredth);

        // Assert
        expect(label).toBe('100');
    });
});
