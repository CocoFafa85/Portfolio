/** How the HoloCard follows the device (effects.ts, holoEffects.gyro) */
export interface DeviceTiltSettings {
    /** Card degrees per degree the device turns */
    gain: number;
    /** Largest tilt of the card, in degrees */
    max: number;
    /** Share of the way the rest moves to the current hold at each reading: a new way of holding
     *  the tablet slowly becomes the rest */
    recenter: number;
}

const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));

/**
 * Device tilt as the screen sees it (DeviceOrientationEvent `beta` front / back and `gamma` left /
 * right, in degrees), for the screen's rotation (`screen.orientation.angle`): writes left / right
 * then forward / back into `out` (no allocation, it runs on every reading).
 */
export function screenTilt(beta: number, gamma: number, angle: number, out: Float32Array): Float32Array {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    out[0] = gamma * cos + beta * sin;
    out[1] = beta * cos - gamma * sin;
    return out;
}

/**
 * Rest pose of the card from the device tilt seen on the screen (left / right, forward / back):
 * the first reading (`base` still NaN) is the way the tablet is held, the card then follows the
 * device from there, within its limit, while `base` slowly follows a new hold. Writes the card's
 * rotateX then rotateY (degrees) into `out`; `base` is updated in place.
 */
export function restPose(leftRight: number, forwardBack: number, base: Float32Array, settings: DeviceTiltSettings, out: Float32Array): Float32Array {
    if (Number.isNaN(base[0])) {
        base[0] = leftRight;
        base[1] = forwardBack;
    }
    out[0] = clamp((forwardBack - base[1]) * -settings.gain, settings.max) + 0;
    out[1] = clamp((leftRight - base[0]) * settings.gain, settings.max) + 0;
    base[0] += (leftRight - base[0]) * settings.recenter;
    base[1] += (forwardBack - base[1]) * settings.recenter;
    return out;
}
