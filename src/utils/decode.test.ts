import { describe, expect, it } from 'vitest';
import { decodeFrame, frameLength, isLocked, lockTime, type DecodeSettings } from './decode';

const SETTINGS: DecodeSettings = { seed: 1985, steps: 22, spread: 0.28 };
const GLYPHS = '01<>/\\[]{}#$%&*+=?';
const TITLE = 'Corentin FANIC';

describe('lockTime', () => {
    it('locks from left to right, each character within its jitter window', () => {
        // Arrange
        const length = TITLE.length;

        // Act
        const times = Array.from({ length }, (_, i) => lockTime(i, length, SETTINGS));

        // Assert
        times.forEach((time, i) => {
            const base = (i / (length - 1)) * (1 - SETTINGS.spread);
            expect(time).toBeGreaterThanOrEqual(base);
            expect(time).toBeLessThan(base + SETTINGS.spread);
        });
        expect(times[0]).toBeLessThan(times[length - 1]);
    });
});

describe('decodeFrame', () => {
    it('starts as pure glyph noise of the same length, spaces kept', () => {
        // Arrange / Act
        const frame = decodeFrame(TITLE, 0, SETTINGS, GLYPHS);

        // Assert
        expect(frame).toHaveLength(TITLE.length);
        expect(frame[8]).toBe(' ');
        [...frame].filter((char) => char !== ' ').forEach((char) => expect(GLYPHS).toContain(char));
    });

    it('ends on the exact target text', () => {
        // Arrange / Act
        const frame = decodeFrame(TITLE, 1, SETTINGS, GLYPHS);

        // Assert
        expect(frame).toBe(TITLE);
    });

    it('replays the same frame for the same seed and differs with another seed', () => {
        // Arrange
        const other: DecodeSettings = { ...SETTINGS, seed: 7 };

        // Act
        const first = decodeFrame(TITLE, 0.4, SETTINGS, GLYPHS);
        const again = decodeFrame(TITLE, 0.4, SETTINGS, GLYPHS);
        const reseeded = decodeFrame(TITLE, 0.4, other, GLYPHS);

        // Assert
        expect(again).toBe(first);
        expect(reseeded).not.toBe(first);
    });

    it('shows the locked characters and keeps glyphs elsewhere mid-decode', () => {
        // Arrange
        const progress = 0.5;

        // Act
        const frame = decodeFrame(TITLE, progress, SETTINGS, GLYPHS);

        // Assert
        [...TITLE].forEach((char, i) => {
            if (isLocked(i, TITLE, progress, SETTINGS)) expect(frame[i]).toBe(char);
            else if (char !== ' ') expect(GLYPHS).toContain(frame[i]);
        });
    });

    it('changes the glyphs of a pending character from one step to the next', () => {
        // Arrange: the last character locks after 0.72, steps last 1/22
        const early = decodeFrame(TITLE, 0.05, SETTINGS, GLYPHS);
        const later = decodeFrame(TITLE, 0.3, SETTINGS, GLYPHS);

        // Act
        const last = TITLE.length - 1;

        // Assert
        expect(later.slice(last - 3)).not.toBe(early.slice(last - 3));
    });

    it('clamps the progress outside 0..1', () => {
        // Arrange / Act
        const before = decodeFrame(TITLE, -1, SETTINGS, GLYPHS);
        const after = decodeFrame(TITLE, 2, SETTINGS, GLYPHS);

        // Assert
        expect(before).toBe(decodeFrame(TITLE, 0, SETTINGS, GLYPHS));
        expect(after).toBe(TITLE);
    });
});

describe('word to word morph', () => {
    it('interpolates the length from the source word to the target word', () => {
        // Arrange
        const source = 'Développeur Full Stack';
        const target = 'Expert SI';

        // Act
        const lengths = [0, 0.5, 1].map((progress) => frameLength(target, progress, source));

        // Assert
        expect(lengths).toEqual([22, 16, 9]);
        expect(decodeFrame(target, 0, SETTINGS, GLYPHS, source)).toHaveLength(22);
    });

    it('ends on the target word', () => {
        // Arrange
        const source = 'Expert SI';
        const target = 'DevOps';

        // Act
        const start = decodeFrame(target, 0, SETTINGS, GLYPHS, source);
        const end = decodeFrame(target, 1, SETTINGS, GLYPHS, source);

        // Assert
        expect(start).toHaveLength(source.length);
        expect(end).toBe(target);
    });

    it('keeps a space both words share and scrambles a space only one has', () => {
        // Arrange
        const source = 'ab cd e';
        const target = 'wx yzuv';

        // Act
        const frame = decodeFrame(target, 0, SETTINGS, GLYPHS, source);

        // Assert
        expect(frame[2]).toBe(' ');
        expect(GLYPHS).toContain(frame[5]);
    });
});
