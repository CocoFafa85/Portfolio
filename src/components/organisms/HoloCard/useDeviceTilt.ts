import { useEffect, type RefObject } from 'react';
import { holoEffects as fx } from '../../../data/effects';
import { restPose, screenTilt } from '../../../utils/deviceTilt';

/**
 * The HoloCard follows the device (LOT 6, D4, gyroscope): its rest pose tilts a little with the
 * tablet, and a new way of holding it slowly becomes the rest. Android only (decision of
 * 2026-10-10): the page listens and never asks for a permission; Chrome sends the readings, Safari
 * on iPadOS sends none without a permission (requestPermission is never called), so there the
 * finger alone tilts the card. Readings without values (no sensor) are ignored. Off while the card
 * is off screen; at most one update per frame, nothing allocated per reading. `enabled`: a touch
 * screen, motion accepted.
 */
export function useDeviceTilt(enabled: boolean, targetRef: RefObject<Element | null>, onRest: (x: number, y: number) => void): void {
    useEffect(() => {
        const target = targetRef.current;
        if (!enabled || !('DeviceOrientationEvent' in window) || !target) return;
        const tilt = new Float32Array(2);
        const base = Float32Array.from([Number.NaN, Number.NaN]);
        const pose = new Float32Array(2);
        let beta = 0;
        let gamma = 0;
        let frame = 0;
        let onScreen = true;

        const apply = () => {
            frame = 0;
            screenTilt(beta, gamma, screen.orientation?.angle ?? 0, tilt);
            restPose(tilt[0], tilt[1], base, fx.gyro, pose);
            onRest(pose[0], pose[1]);
        };
        const onOrientation = (event: DeviceOrientationEvent) => {
            if (event.beta === null || event.gamma === null || !onScreen) return;
            beta = event.beta;
            gamma = event.gamma;
            if (frame === 0) frame = requestAnimationFrame(apply);
        };
        // A turned screen changes the axes: the next reading is the new rest
        const onTurn = () => { base[0] = Number.NaN; };
        const observer = new IntersectionObserver((entries) => {
            onScreen = entries[entries.length - 1].isIntersecting;
            if (!onScreen) onRest(0, 0);
        });
        observer.observe(target);
        window.addEventListener('deviceorientation', onOrientation);
        screen.orientation?.addEventListener('change', onTurn);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            window.removeEventListener('deviceorientation', onOrientation);
            screen.orientation?.removeEventListener('change', onTurn);
            onRest(0, 0);
        };
    }, [enabled, targetRef, onRest]);
}
