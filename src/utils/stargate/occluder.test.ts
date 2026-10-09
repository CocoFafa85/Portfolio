import { describe, expect, it, vi } from 'vitest';
import { createGateOccluder, releaseGateOccluder, watchGateOccluder } from './occluder';

describe('gate occluder', () => {
    it('starts transparent: nothing is erased before the gate shows', () => {
        // Arrange / Act
        const occluder = createGateOccluder();

        // Assert
        expect([...occluder.disc]).toEqual([0, 0, 0, 0]);
        expect(occluder.onChange).toBeNull();
    });

    it('tells its listener when the gate goes, until it stops listening', () => {
        // Arrange
        const occluder = createGateOccluder();
        const listener = vi.fn();
        occluder.disc.set([720, 533, 266, 1]);
        const unwatch = watchGateOccluder(occluder, listener);

        // Act
        releaseGateOccluder(occluder);
        unwatch();
        releaseGateOccluder(occluder);

        // Assert
        expect(occluder.disc[3]).toBe(0);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(occluder.onChange).toBeNull();
    });

    it('keeps a newer listener when an older one stops listening', () => {
        // Arrange
        const occluder = createGateOccluder();
        const older = watchGateOccluder(occluder, () => {});
        const newer = vi.fn();
        watchGateOccluder(occluder, newer);

        // Act
        older();
        releaseGateOccluder(occluder);

        // Assert
        expect(newer).toHaveBeenCalledTimes(1);
    });
});
