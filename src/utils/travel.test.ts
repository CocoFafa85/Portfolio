import { describe, expect, it } from 'vitest';
import { getTravelStyle, isHomePath, isTravelStyle, normalizePath } from './travel';

describe('getTravelStyle', () => {
    it('jumps to hyperspace from the home page to an inner page', () => {
        // Arrange / Act
        const styles = ['/about', '/skills', '/projects'].map((to) => getTravelStyle('/', to));

        // Assert
        expect(styles).toEqual(['hyperspace', 'hyperspace', 'hyperspace']);
    });

    it('jumps to hyperspace back to the home page', () => {
        // Arrange / Act
        const style = getTravelStyle('/projects', '/');

        // Assert
        expect(style).toBe('hyperspace');
    });

    it('travels at 88 mph between inner pages, the 404 included', () => {
        // Arrange / Act
        const styles = [
            getTravelStyle('/about', '/skills'),
            getTravelStyle('/skills', '/projects'),
            getTravelStyle('/page-inconnue', '/about'),
        ];

        // Assert
        expect(styles).toEqual(['timeTravel', 'timeTravel', 'timeTravel']);
    });

    it('does not travel when the page stays the same, trailing slash or not', () => {
        // Arrange / Act
        const style = getTravelStyle('/about/', '/about');

        // Assert
        expect(style).toBe('none');
    });
});

describe('normalizePath / isHomePath', () => {
    it('drops trailing slashes but keeps the home page', () => {
        // Arrange / Act / Assert
        expect(normalizePath('/skills//')).toBe('/skills');
        expect(normalizePath('/')).toBe('/');
        expect(isHomePath('')).toBe(true);
        expect(isHomePath('/about')).toBe(false);
    });
});

describe('isTravelStyle', () => {
    it('accepts only the known styles', () => {
        // Arrange
        const candidates: unknown[] = ['hyperspace', 'timeTravel', 'none', 'kawoosh', undefined, 3];

        // Act
        const accepted = candidates.map(isTravelStyle);

        // Assert
        expect(accepted).toEqual([true, true, true, false, false, false]);
    });
});
