import { describe, expect, it } from 'vitest';
import { fillTemplate, formatNavIndex } from './format';

describe('fillTemplate', () => {
    it('replaces every placeholder by its value', () => {
        // Arrange
        const template = '{action} de {title} ({title})';

        // Act
        const text = fillTemplate(template, { action: 'Démo', title: 'SolarSystem' });

        // Assert
        expect(text).toBe('Démo de SolarSystem (SolarSystem)');
    });

    it('leaves an unknown placeholder as written', () => {
        // Arrange
        const template = 'Sortie prévue en {year}';

        // Act
        const text = fillTemplate(template, { title: 'X' });

        // Assert
        expect(text).toBe('Sortie prévue en {year}');
    });
});

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
