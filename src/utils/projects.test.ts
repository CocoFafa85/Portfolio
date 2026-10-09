import { describe, expect, it } from 'vitest';
import { isInProgress, withDetails, yearLabel } from './projects';

type Id = 'a' | 'b';
const list = [
    { id: 'b' as Id, title: 'B', status: 'done' as const, year: '2025' },
    { id: 'a' as Id, title: 'A', status: 'in-progress' as const, year: '2026' },
];
const details: Record<Id, { pitch: string }> = { a: { pitch: 'Pitch A' }, b: { pitch: 'Pitch B' } };

describe('withDetails', () => {
    it('gives each entry its details, in the order of the list', () => {
        // Arrange / Act
        const cards = withDetails(list, details);

        // Assert
        expect(cards.map((card) => [card.id, card.title, card.pitch])).toEqual([['b', 'B', 'Pitch B'], ['a', 'A', 'Pitch A']]);
    });

    it('keeps every field of the entry', () => {
        // Arrange / Act
        const [first] = withDetails(list, details);

        // Assert
        expect(first).toEqual({ id: 'b', title: 'B', status: 'done', year: '2025', pitch: 'Pitch B' });
    });
});

describe('isInProgress', () => {
    it('reads the status, never the id', () => {
        // Arrange
        const statuses = list.map((entry) => entry.status);

        // Act
        const progress = list.map(isInProgress);

        // Assert
        expect(statuses).toEqual(['done', 'in-progress']);
        expect(progress).toEqual([false, true]);
    });
});

describe('yearLabel', () => {
    it('shows the year of a finished project as is', () => {
        // Arrange
        const done = list[0];

        // Act
        const label = yearLabel(done, 'Sortie prévue en {year}');

        // Assert
        expect(label).toBe('2025');
    });

    it('announces the planned release of a project in progress', () => {
        // Arrange
        const inProgress = list[1];

        // Act
        const label = yearLabel(inProgress, 'Sortie prévue en {year}');

        // Assert
        expect(label).toBe('Sortie prévue en 2026');
    });
});
