import { describe, expect, it } from 'vitest';
import scss from '../styles/_breakpoints.scss?raw';
import { breakpoints } from './breakpoints';

describe('breakpoints (A1)', () => {
    it('keeps the scripts\' copy equal to the SCSS tokens', () => {
        // Arrange
        const camel = (name: string) => name.replace(/-([a-z])/g, (_: string, letter: string) => letter.toUpperCase());

        // Act
        const tokens = Object.fromEntries([...scss.matchAll(/^\$bp-([a-z-]+): (\d+)px;/gm)].map(([, name, value]) => [camel(name), Number(value)]));

        // Assert
        expect(tokens).toEqual({ ...breakpoints });
    });
});
