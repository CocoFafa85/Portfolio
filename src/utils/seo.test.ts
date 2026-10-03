import { describe, expect, it } from 'vitest';
import { buildPageMeta, type SeoConfig } from './seo';
import seo from '../data/seo.json';

const config: SeoConfig = {
    siteUrl: 'https://example.dev',
    siteName: 'Example',
    image: '/share.jpg',
    pages: [
        { id: 'home', path: '/', title: 'Home', description: 'Home page' },
        { id: 'about', path: '/about', title: 'About', description: 'About page' },
    ],
    notFound: { id: 'notFound', path: '/404', title: 'Lost', description: 'Nothing here' },
};

describe('buildPageMeta', () => {
    it('uses the site root as canonical for the home page', () => {
        // Arrange / Act
        const meta = buildPageMeta(config, 'home');

        // Assert
        expect(meta.canonical).toBe('https://example.dev/');
        expect(meta.title).toBe('Home');
        expect(meta.robots).toBeNull();
    });

    it('builds an absolute canonical URL for an inner page', () => {
        // Arrange / Act
        const meta = buildPageMeta(config, 'about');

        // Assert
        expect(meta.canonical).toBe('https://example.dev/about');
        expect(meta.description).toBe('About page');
    });

    it('returns the 404 metadata, without canonical and with noindex, for an unknown id', () => {
        // Arrange / Act
        const meta = buildPageMeta(config, 'notFound');

        // Assert
        expect(meta).toMatchObject({ title: 'Lost', canonical: null, robots: 'noindex' });
    });

    it('builds an absolute share-image URL', () => {
        // Arrange / Act
        const meta = buildPageMeta(config, 'home');

        // Assert
        expect(meta.image).toBe('https://example.dev/share.jpg');
    });

    it('has a unique path and non-empty texts for every page of the real config', () => {
        // Arrange
        const paths = seo.pages.map((p) => p.path);

        // Act
        const metas = seo.pages.map((p) => buildPageMeta(seo, p.id));

        // Assert
        expect(new Set(paths).size).toBe(paths.length);
        metas.forEach((m) => {
            expect(m.title.length).toBeGreaterThan(0);
            expect(m.description.length).toBeGreaterThan(0);
            expect(m.canonical).toMatch(/^https:\/\/corentinfanic\.dev\//);
        });
    });
});
