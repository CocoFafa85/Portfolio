import { describe, expect, it } from 'vitest';
import { createJumpState, formatSpeed, jumpState, resumeAt, type JumpTimeline } from './jump';

const TIMELINE: JumpTimeline = {
    accelMs: 900, topSpeed: 88, speedCurve: 2, arriveMs: 1035, revealMs: 1160, decayAtMs: 1150, decayMs: 600, endMs: 1750,
};

describe('jumpState', () => {
    it('starts at rest, nothing reached yet', () => {
        // Arrange
        const state = createJumpState();

        // Act
        jumpState(0, TIMELINE, state);

        // Assert
        expect(state).toEqual({ speed: 0, arrived: false, revealed: false, done: false });
    });

    it('accelerates faster and faster up to 88 mph', () => {
        // Arrange
        const state = createJumpState();
        const speeds: number[] = [];

        // Act
        for (const at of [225, 450, 675, 900]) speeds.push(jumpState(at, TIMELINE, state).speed);

        // Assert: each step gains more than the previous one, and the top is exactly 88
        const gains = speeds.map((speed, i) => speed - (i === 0 ? 0 : speeds[i - 1]));
        expect(gains[1]).toBeGreaterThan(gains[0]);
        expect(gains[2]).toBeGreaterThan(gains[1]);
        expect(speeds[3]).toBe(88);
    });

    it('lands, then reveals the text, then falls back to zero and ends', () => {
        // Arrange
        const state = createJumpState();

        // Act
        const beforeLanding = { ...jumpState(1034, TIMELINE, state) };
        const landed = { ...jumpState(1035, TIMELINE, state) };
        const revealed = { ...jumpState(1160, TIMELINE, state) };
        const ended = { ...jumpState(1750, TIMELINE, state) };

        // Assert
        expect(beforeLanding.arrived).toBe(false);
        expect(landed).toMatchObject({ speed: 88, arrived: true, revealed: false });
        expect(revealed.revealed).toBe(true);
        expect(revealed.speed).toBeLessThan(88);
        expect(ended).toEqual({ speed: 0, arrived: true, revealed: true, done: true });
    });

    it('writes into the given state (no allocation per frame)', () => {
        // Arrange
        const state = createJumpState();

        // Act
        const result = jumpState(500, TIMELINE, state);

        // Assert
        expect(result).toBe(state);
    });
});

describe('resumeAt', () => {
    it('restarts a jump at the time the acceleration reaches the current speed', () => {
        // Arrange
        const state = createJumpState();
        const speed = jumpState(600, TIMELINE, state).speed;

        // Act
        const resume = resumeAt(speed, TIMELINE);

        // Assert
        expect(resume).toBeCloseTo(600, 6);
    });

    it('stays within the acceleration, from rest to full speed', () => {
        // Arrange / Act / Assert
        expect(resumeAt(0, TIMELINE)).toBe(0);
        expect(resumeAt(88, TIMELINE)).toBe(900);
        expect(resumeAt(120, TIMELINE)).toBe(900);
    });
});

describe('formatSpeed', () => {
    it('shows two digits, a blank cell instead of a leading zero', () => {
        // Arrange / Act / Assert
        expect(formatSpeed(0, '!')).toBe('!0');
        expect(formatSpeed(7.9, '!')).toBe('!7');
        expect(formatSpeed(42.5, '!')).toBe('42');
        expect(formatSpeed(88, '!')).toBe('88');
    });

    it('never leaves the two-digit display', () => {
        // Arrange / Act / Assert
        expect(formatSpeed(-3, '!')).toBe('!0');
        expect(formatSpeed(140, '!')).toBe('99');
    });
});
