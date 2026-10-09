import { describe, expect, it } from 'vitest';
import { advanceMeteors, createMeteorPool, meteorAlpha, meteorPose, spawnMeteor, type MeteorSettings } from './meteors';

const SETTINGS: MeteorSettings = {
    intervalMs: [3000, 6000], speed: [1000, 1000], length: [150, 150], lifeMs: [1000, 1000], angle: [0.5, 0.5], startBand: 0.3,
};
const always = (value: number) => () => value;

describe('spawnMeteor', () => {
    it('fills the pool up to its capacity, then refuses', () => {
        // Arrange
        const pool = createMeteorPool(2);

        // Act
        const results = [1, 2, 3].map(() => spawnMeteor(pool, 1000, 800, SETTINGS, always(0.7)));

        // Assert
        expect(results).toEqual([true, true, false]);
    });

    it('starts in the top band of the screen, heading down', () => {
        // Arrange
        const pool = createMeteorPool(1);
        const pose = new Float32Array(5);

        // Act
        spawnMeteor(pool, 1000, 800, SETTINGS, always(0.99));
        meteorPose(pool, 0, pose);

        // Assert
        expect(pose[1]).toBeLessThanOrEqual(800 * 0.3);
        expect(pose[3]).toBeGreaterThan(0);
        expect(Math.hypot(pose[2], pose[3])).toBeCloseTo(1, 5);
        expect(pose[4]).toBe(150);
    });

    it('enters from the side it comes from when an entry span is set (the comet crosses the screen)', () => {
        // Arrange: draws below 0.5 head left, from 0.5 right
        const comet: MeteorSettings = { ...SETTINGS, entrySpan: [0.1, 0.3] };
        const leftward = createMeteorPool(1);
        const rightward = createMeteorPool(1);
        const left = new Float32Array(5);
        const right = new Float32Array(5);

        // Act
        spawnMeteor(leftward, 1000, 800, comet, always(0.25));
        spawnMeteor(rightward, 1000, 800, comet, always(0.75));
        meteorPose(leftward, 0, left);
        meteorPose(rightward, 0, right);

        // Assert: heading left it starts in the right part, heading right in the left part
        expect(left[2]).toBeLessThan(0);
        expect(left[0]).toBeCloseTo(1000 * (1 - 0.15), 3);
        expect(right[2]).toBeGreaterThan(0);
        expect(right[0]).toBeCloseTo(1000 * 0.25, 3);
    });
});

describe('advanceMeteors', () => {
    it('moves a meteor by speed × time and frees it at the end of its life', () => {
        // Arrange: 1000 px/s at 0.5 rad below the horizontal, heading right (draw 0.7 ≥ 0.5)
        const pool = createMeteorPool(1);
        spawnMeteor(pool, 1000, 800, SETTINGS, always(0.7));
        const start = new Float32Array(5);
        const after = new Float32Array(5);
        meteorPose(pool, 0, start);

        // Act
        const alive = advanceMeteors(pool, 100);
        meteorPose(pool, 0, after);
        const finished = advanceMeteors(pool, 1000);

        // Assert
        expect(alive).toBe(1);
        expect(after[0] - start[0]).toBeCloseTo(Math.cos(0.5) * 100, 3);
        expect(after[1] - start[1]).toBeCloseTo(Math.sin(0.5) * 100, 3);
        expect(finished).toBe(0);
        expect(meteorAlpha(pool, 0)).toBe(0);
    });
});

describe('meteorAlpha', () => {
    it('fades in quickly, holds, then fades out', () => {
        // Arrange
        const pool = createMeteorPool(1);
        spawnMeteor(pool, 1000, 800, SETTINGS, always(0.7));

        // Act
        advanceMeteors(pool, 60);
        const rising = meteorAlpha(pool, 0);
        advanceMeteors(pool, 340);
        const steady = meteorAlpha(pool, 0);
        advanceMeteors(pool, 425);
        const fading = meteorAlpha(pool, 0);

        // Assert
        expect(rising).toBeCloseTo(0.5, 5);
        expect(steady).toBe(1);
        expect(fading).toBeCloseTo(0.5, 5);
    });
});
