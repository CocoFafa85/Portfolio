import { describe, expect, it } from 'vitest';
import { createRandom } from './random';
import { createRadialStreaks, createSpeedStreaks } from './travelFx';

const RADIAL = { count: 48, start: [8, 70], length: [40, 170], delayMs: [0, 140] } as const;
const SPEED = { count: 20, top: [2, 98], width: [80, 260], delayMs: [60, 380], durationMs: [240, 460] } as const;

describe('createRadialStreaks', () => {
    it('spreads the star lines around the whole circle', () => {
        // Arrange / Act
        const streaks = createRadialStreaks(RADIAL, createRandom(88));
        const sectors = new Set(streaks.map((s) => Math.floor(s.angle / 45)));

        // Assert
        expect(streaks).toHaveLength(48);
        expect(sectors.size).toBe(8);
    });

    it('keeps every value within its range and is reproducible', () => {
        // Arrange / Act
        const first = createRadialStreaks(RADIAL, createRandom(88));
        const second = createRadialStreaks(RADIAL, createRandom(88));

        // Assert
        expect(second).toEqual(first);
        expect(first.every((s) => s.start >= 8 && s.start <= 70 && s.length >= 40 && s.length <= 170)).toBe(true);
        expect(first.every((s) => s.angle >= 0 && s.angle <= 360 && s.delay >= 0 && s.delay <= 140)).toBe(true);
    });
});

describe('createSpeedStreaks', () => {
    it('keeps every value within its range', () => {
        // Arrange / Act
        const streaks = createSpeedStreaks(SPEED, createRandom(88));

        // Assert
        expect(streaks).toHaveLength(20);
        expect(streaks.every((s) => s.top >= 2 && s.top <= 98 && s.width >= 80 && s.width <= 260)).toBe(true);
        expect(streaks.every((s) => s.delay >= 60 && s.delay <= 380 && s.duration >= 240 && s.duration <= 460)).toBe(true);
    });
});
