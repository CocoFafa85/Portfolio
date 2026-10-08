import { describe, expect, it } from 'vitest';
import { pageRoute } from './route';

describe('pageRoute', () => {
    it('keeps a route of a site served at the root', () => {
        // Arrange
        const pathname = '/about';

        // Act
        const route = pageRoute(pathname, '/');

        // Assert
        expect(route).toBe('/about');
    });

    it('drops the app base and a trailing slash', () => {
        // Arrange
        const pathname = '/Portfolio/skills/';

        // Act
        const route = pageRoute(pathname, '/Portfolio/');

        // Assert
        expect(route).toBe('/skills');
    });

    it('maps the base itself to the home route', () => {
        // Arrange
        const pathnames = ['/', '/Portfolio', '/Portfolio/'];

        // Act
        const routes = [pageRoute(pathnames[0], '/'), pageRoute(pathnames[1], '/Portfolio/'), pageRoute(pathnames[2], '/Portfolio/')];

        // Assert
        expect(routes).toEqual(['/', '/', '/']);
    });
});
