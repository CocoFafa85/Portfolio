import { describe, expect, it } from 'vitest';
import { getTravelStyle, isHomePath, isTimeTravel, isTravelStyle, normalizePath } from './travel';

const ORDER = ['/about', '/skills', '/projects'];

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

    it('travels forward (left to right) when moving down the bar order', () => {
        // Arrange / Act
        const styles = [
            getTravelStyle('/about', '/skills', ORDER),
            getTravelStyle('/about', '/projects', ORDER),
            getTravelStyle('/skills', '/projects', ORDER),
        ];

        // Assert
        expect(styles).toEqual(['timeTravel', 'timeTravel', 'timeTravel']);
    });

    it('travels back (right to left) when moving up the bar order', () => {
        // Arrange / Act
        const styles = [
            getTravelStyle('/projects', '/skills', ORDER),
            getTravelStyle('/projects', '/about', ORDER),
            getTravelStyle('/skills/', '/about', ORDER),
        ];

        // Assert
        expect(styles).toEqual(['timeTravelBack', 'timeTravelBack', 'timeTravelBack']);
    });

    it('travels forward to or from a page outside the bar (404)', () => {
        // Arrange / Act
        const styles = [
            getTravelStyle('/page-inconnue', '/about', ORDER),
            getTravelStyle('/projects', '/page-inconnue', ORDER),
        ];

        // Assert
        expect(styles).toEqual(['timeTravel', 'timeTravel']);
    });

    it('keeps hyperspace for the home page whatever the order', () => {
        // Arrange / Act
        const styles = [getTravelStyle('/projects', '/', ORDER), getTravelStyle('/', '/about', ORDER)];

        // Assert
        expect(styles).toEqual(['hyperspace', 'hyperspace']);
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
        const candidates: unknown[] = ['hyperspace', 'timeTravel', 'timeTravelBack', 'none', 'kawoosh', undefined, 3];

        // Act
        const accepted = candidates.map(isTravelStyle);

        // Assert
        expect(accepted).toEqual([true, true, true, true, false, false, false]);
    });
});

describe('isTimeTravel', () => {
    it('groups both directions of the 88 mph trip', () => {
        // Arrange / Act
        const results = (['timeTravel', 'timeTravelBack', 'hyperspace', 'none'] as const).map(isTimeTravel);

        // Assert
        expect(results).toEqual([true, true, false, false]);
    });
});
