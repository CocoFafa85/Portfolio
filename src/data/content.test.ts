import { describe, expect, it } from 'vitest';
import { parseLocalDateTime } from '../utils/timeCircuits/time';
import { content } from './content';

describe('content.about (LOT 3, data F1)', () => {
    it('gives each row of the time circuits one era, each era once', () => {
        // Arrange
        const eras = content.about.timeline.map((step) => step.id);

        // Act
        const rows = [...content.about.rowOrder].sort();

        // Assert
        expect(rows).toEqual([...eras].sort());
        expect(new Set(rows).size).toBe(3);
    });

    it('holds valid dates: past and future fixed, the present on the clock, a valid fallback', () => {
        // Arrange
        const dates = Object.fromEntries(content.about.timeline.map((step) => [step.id, step.date]));

        // Act
        const past = parseLocalDateTime(dates.past ?? '');
        const future = parseLocalDateTime(dates.future ?? '');
        const fallback = parseLocalDateTime(content.about.presentFallback);

        // Assert
        expect(past?.getFullYear()).toBe(2015);
        expect(future?.getFullYear()).toBe(2035);
        expect(dates.present).toBeNull();
        expect(fallback?.getFullYear()).toBe(2026);
    });

    it('names the twelve months for the month display, three letters each', () => {
        // Arrange / Act
        const { months } = content.decor.timeCircuits;

        // Assert
        expect(months).toHaveLength(12);
        expect(months.every((month) => /^[A-Z]{3}$/.test(month))).toBe(true);
    });
});
