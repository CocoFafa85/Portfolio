import { describe, expect, it } from 'vitest';
import { collectPreloads, preloadTags } from './preloads.mjs';

const manifest = {
    'index.html': { file: 'assets/index-a.js', css: ['assets/index-a.css'], isEntry: true, dynamicImports: ['src/pages/About/About.tsx'] },
    'src/pages/About/About.tsx': { file: 'assets/About-b.js', css: ['assets/About-b.css'], imports: ['index.html', '_shared-c.js'] },
    '_shared-c.js': { file: 'assets/shared-c.js', css: ['assets/shared-c.css', 'assets/About-b.css'], imports: ['index.html'] },
    'src/pages/Projects/Projects.tsx': { file: 'assets/Projects-d.js', imports: ['index.html'] },
};

describe('collectPreloads', () => {
    it('lists the page chunk, its imported chunks and their stylesheets, never the entry', () => {
        // Arrange
        const source = 'src/pages/About/About.tsx';

        // Act
        const preloads = collectPreloads(manifest, source);

        // Assert
        expect(preloads.scripts).toEqual(['assets/About-b.js', 'assets/shared-c.js']);
        expect(preloads.styles).toEqual(['assets/About-b.css', 'assets/shared-c.css']);
    });

    it('handles a page without stylesheet', () => {
        // Arrange
        const source = 'src/pages/Projects/Projects.tsx';

        // Act
        const preloads = collectPreloads(manifest, source);

        // Assert
        expect(preloads).toEqual({ scripts: ['assets/Projects-d.js'], styles: [] });
    });

    it('fails loudly when the page is missing from the manifest (a renamed page must not ship without preloads)', () => {
        // Arrange
        const source = 'src/pages/Skills/Skills.tsx';

        // Act
        const run = () => collectPreloads(manifest, source);

        // Assert
        expect(run).toThrow(/Skills/);
    });
});

describe('preloadTags', () => {
    it('writes stylesheets first, then module preloads, under the base path', () => {
        // Arrange
        const preloads = { scripts: ['assets/About-b.js'], styles: ['assets/About-b.css'] };

        // Act
        const tags = preloadTags(preloads, '/');

        // Assert
        expect(tags).toEqual([
            '<link rel="stylesheet" crossorigin href="/assets/About-b.css">',
            '<link rel="modulepreload" crossorigin href="/assets/About-b.js">',
        ]);
    });
});
