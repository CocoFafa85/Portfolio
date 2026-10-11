import { describe, expect, it } from 'vitest';
import { restPose, screenTilt, type DeviceTiltSettings } from './deviceTilt';

const SETTINGS: DeviceTiltSettings = { gain: 0.5, max: 8, recenter: 0.1 };

describe('screenTilt (D4)', () => {
    it('reads left / right and forward / back straight from the device held upright', () => {
        // Arrange
        const out = new Float32Array(2);

        // Act
        screenTilt(60, 10, 0, out);

        // Assert
        expect([...out]).toEqual([10, 60]);
    });

    it('turns the axes with the screen: on its side, forward / back becomes left / right', () => {
        // Arrange
        const out = new Float32Array(2);

        // Act
        const quarter = [...screenTilt(60, 10, 90, out)].map(Math.round);
        const other = [...screenTilt(60, 10, 270, out)].map(Math.round);
        const upsideDown = [...screenTilt(60, 10, 180, out)].map(Math.round);

        // Assert
        expect(quarter).toEqual([60, -10]);
        expect(other).toEqual([-60, 10]);
        expect(upsideDown).toEqual([-10, -60]);
    });
});

describe('restPose (D4)', () => {
    it('starts at rest: the first reading is the way the tablet is held', () => {
        // Arrange
        const base = Float32Array.from([Number.NaN, Number.NaN]);
        const out = new Float32Array(2);

        // Act
        restPose(10, 60, base, SETTINGS, out);

        // Assert
        expect([...out]).toEqual([0, 0]);
        expect([...base]).toEqual([10, 60]);
    });

    it('tilts the card with the device from there (gain), a forward tilt raising its top edge', () => {
        // Arrange
        const base = Float32Array.from([10, 60]);
        const out = new Float32Array(2);

        // Act
        restPose(14, 56, base, { ...SETTINGS, recenter: 0 }, out);

        // Assert
        expect(out[0]).toBeCloseTo(2);
        expect(out[1]).toBeCloseTo(2);
    });

    it('never tilts the card beyond its limit', () => {
        // Arrange
        const base = Float32Array.from([0, 60]);
        const out = new Float32Array(2);

        // Act
        restPose(60, 0, base, { ...SETTINGS, recenter: 0 }, out);

        // Assert
        expect([...out]).toEqual([8, 8]);
    });

    it('slowly takes a new way of holding the tablet as its rest', () => {
        // Arrange
        const base = Float32Array.from([0, 60]);
        const out = new Float32Array(2);

        // Act
        for (let i = 0; i < 200; i++) restPose(6, 60, base, SETTINGS, out);

        // Assert
        expect(base[0]).toBeCloseTo(6);
        expect(Math.abs(out[1])).toBeLessThan(0.01);
    });
});
