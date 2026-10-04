import { describe, expect, it } from 'vitest';
import { assembleProgress, createDialState, dialState, type DialTimeline } from './dial';

const TIMELINE: DialTimeline = {
    chevronStepMs: 40, flare: 1.6, flareMs: 180, spin: 3.8, spinMs: 460,
    horizonAtMs: 320, vortexMs: 320, brightenMs: 220, diveAtMs: 520, diveMs: 420, navigateAtMs: 760,
};

describe('dialState', () => {
    it('locks the chevrons clockwise starting from the chosen one', () => {
        // Arrange: chevron 3 chosen; at 90 ms, chevrons 3, 4 and 5 have locked
        const state = createDialState(9);

        // Act
        dialState(90, 3, TIMELINE, state);

        // Assert
        expect([...state.lit].map((v) => v > 0)).toEqual([false, false, false, true, true, true, false, false, false]);
        expect(state.lit[3]).toBeLessThan(state.lit[5]);
    });

    it('wraps past the last chevron and lights them all after nine steps', () => {
        // Arrange
        const state = createDialState(9);

        // Act
        dialState(8 * 40 + 1, 6, TIMELINE, state);
        const allOn = [...state.lit].every((v) => v >= 1);
        dialState(8 * 40 + 1 + 180, 6, TIMELINE, state);

        // Assert
        expect(allOn).toBe(true);
        expect([...state.lit].every((v) => v === 1)).toBe(true);
    });

    it('flares a chevron as it locks, then settles at 1', () => {
        // Arrange
        const state = createDialState(9);

        // Act
        dialState(0, 0, TIMELINE, state);
        const flare = state.lit[0];
        dialState(180, 0, TIMELINE, state);

        // Assert
        expect(flare).toBeCloseTo(1.6, 6);
        expect(state.lit[0]).toBe(1);
    });

    it('spins, forms the horizon, then dives, in that order', () => {
        // Arrange
        const state = createDialState(9);

        // Act
        dialState(300, 0, TIMELINE, state);
        const before = { ...state };
        dialState(TIMELINE.navigateAtMs, 0, TIMELINE, state);
        const atNavigation = { ...state };
        dialState(2000, 0, TIMELINE, state);

        // Assert
        expect(before.vortex).toBe(0);
        expect(before.dive).toBe(0);
        expect(before.spin).toBeGreaterThan(0);
        expect(atNavigation.horizon).toBe(1);
        expect(atNavigation.dive).toBeGreaterThan(0);
        expect(atNavigation.dive).toBeLessThan(1);
        expect(state.spin).toBeCloseTo(3.8, 6);
        expect(state.dive).toBe(1);
    });
});

describe('assembleProgress', () => {
    it('eases from 0 to 1 over the duration and stays at 1', () => {
        // Arrange / Act
        const values = [0, 700, 1400, 3000].map((t) => assembleProgress(t, 1400));

        // Assert
        expect(values[0]).toBe(0);
        expect(values[1]).toBeCloseTo(0.875, 6);
        expect(values[2]).toBe(1);
        expect(values[3]).toBe(1);
    });
});
