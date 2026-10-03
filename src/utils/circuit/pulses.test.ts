import { describe, expect, it } from 'vitest';
import { advancePulses, createPulsePool, pulseDistance, pulseTrace, spawnPulse } from './pulses';

const LENGTHS = Float32Array.from([10, 200, 300]);
const always = (value: number) => () => value;

describe('spawnPulse', () => {
    it('fills the pool up to its capacity, then refuses', () => {
        // Arrange
        const pool = createPulsePool(2);

        // Act
        const results = [1, 2, 3].map(() => spawnPulse(pool, LENGTHS, 50, 100, always(0.5)));

        // Assert
        expect(results).toEqual([true, true, false]);
    });

    it('skips traces too short to show a pulse', () => {
        // Arrange: the source always points at the 10 px trace
        const pool = createPulsePool(1);

        // Act
        const started = spawnPulse(pool, LENGTHS, 50, 100, always(0));

        // Assert
        expect(started).toBe(false);
        expect(pulseTrace(pool, 0)).toBe(-1);
    });
});

describe('advancePulses', () => {
    it('moves a pulse by speed × time', () => {
        // Arrange
        const pool = createPulsePool(1);
        spawnPulse(pool, LENGTHS, 50, 100, always(0.5));

        // Act
        const alive = advancePulses(pool, LENGTHS, 500, 40);

        // Assert
        expect(alive).toBe(1);
        expect(pulseDistance(pool, 0)).toBe(50);
    });

    it('frees the slot once the trail has left the trace, for reuse', () => {
        // Arrange: trace 1 is 200 px long, trail 40 px
        const pool = createPulsePool(1);
        spawnPulse(pool, LENGTHS, 50, 100, always(0.5));

        // Act
        const alive = advancePulses(pool, LENGTHS, 2500, 40);
        const reused = spawnPulse(pool, LENGTHS, 50, 100, always(0.9));

        // Assert
        expect(alive).toBe(0);
        expect(reused).toBe(true);
        expect(pulseTrace(pool, 0)).toBe(2);
    });
});
