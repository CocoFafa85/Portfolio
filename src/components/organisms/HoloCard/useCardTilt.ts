import { useCallback, useMemo, useRef, type PointerEvent, type RefObject } from 'react';
import { useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react';
import { holoEffects as fx } from '../../../data/effects';

export interface CardTilt {
    rotateX: MotionValue<number>;
    rotateY: MotionValue<number>;
    /** Film slide (transform) following the angle */
    filmX: MotionValue<string>;
    filmY: MotionValue<string>;
    /** Glare position (transform) following the pointer */
    glareX: MotionValue<string>;
    glareY: MotionValue<string>;
    /** True while a pointer (a mouse over the card, a finger dragging it) drives the card */
    hover: MotionValue<number>;
    onPointerMove(event: PointerEvent<HTMLElement>): void;
    onPointerLeave(event: PointerEvent<HTMLElement>): void;
    /** Holds the card still while a button of it is pressed: it never slides away under the pointer */
    hold(on: boolean): void;
    /** A finger presses the card (LOT 6, D4): a sideways drag will tilt it */
    press(event: PointerEvent<HTMLElement>): void;
    /** The finger leaves the card; true when it dragged (that tap must not flip the card) */
    release(event: PointerEvent<HTMLElement>): boolean;
    /** Rest pose (the device tilt, Android): where the card goes back when nothing drives it */
    rest(x: number, y: number): void;
}

const percent = (value: number) => `${(value * 100).toFixed(2)}%`;
const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));

/**
 * Tilt of the HoloCard (LOT 4, S2): a fine pointer tilts it up to ±15° with the original card's
 * spring; a finger drags it sideways (LOT 6, D4, decision A: the vertical scroll stays the page's,
 * `touch-action: pan-y`), the card following the finger and springing back on release; the rest
 * pose follows the device on Android (useDeviceTilt). The film slides with the angle, the glare
 * follows the pointer: transforms only, and no JavaScript at rest (the idle sway is a CSS animation
 * on the compositor). `onDrag`: a finger starts or ends a drag (the name decodes, as on hover).
 */
export function useCardTilt(sceneRef: RefObject<HTMLElement | null>, onDrag?: (dragging: boolean) => void): CardTilt {
    const reducedMotion = useReducedMotion();
    // Pointer on the card, -0.5..0.5 (0 at rest); NaN while nobody points at it
    const pointerX = useMotionValue(Number.NaN);
    const pointerY = useMotionValue(0);
    const targetX = useMotionValue(0);
    const targetY = useMotionValue(0);
    const hover = useMotionValue(0);
    const rotateX = useSpring(targetX, fx.tilt.spring);
    const rotateY = useSpring(targetY, fx.tilt.spring);
    const filmX = useTransform(rotateY, (deg) => percent((deg / fx.tilt.max) * fx.film.shift));
    const filmY = useTransform(rotateX, (deg) => percent((-deg / fx.tilt.max) * fx.film.shift));
    const glareX = useTransform(pointerX, (x) => percent((Number.isNaN(x) ? 0 : x) * fx.glare.travel));
    const glareY = useTransform(pointerY, (y) => percent(y * fx.glare.travel));
    const bounds = useRef<DOMRect | null>(null);
    const held = useRef(false);
    // Rest pose, and whether a pointer drives the card (the rest then waits)
    const pose = useRef({ x: 0, y: 0, busy: false });
    const drag = useRef({ id: -1, x0: 0, moved: false });

    const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
        const touch = event.pointerType === 'touch';
        if (reducedMotion || held.current || (touch && drag.current.id !== event.pointerId)) return;
        bounds.current ??= sceneRef.current?.getBoundingClientRect() ?? null;
        const box = bounds.current;
        if (!box) return;
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        if (touch) {
            // Sideways: the card follows the finger; its height only pitches it a little
            const shift = event.clientX - drag.current.x0;
            if (!drag.current.moved) {
                if (Math.abs(shift) < fx.touch.slop) return;
                drag.current.moved = true;
                onDrag?.(true);
            }
            targetX.set(-y * 2 * fx.touch.pitch);
            targetY.set(clamp((shift / (box.width / 2)) * fx.tilt.max * fx.touch.reach, fx.tilt.max));
        } else {
            targetX.set(-y * 2 * fx.tilt.max);
            targetY.set(x * 2 * fx.tilt.max);
        }
        pose.current.busy = true;
        pointerX.set(x);
        pointerY.set(y);
        hover.set(1);
    }, [reducedMotion, sceneRef, onDrag, pointerX, pointerY, targetX, targetY, hover]);

    // Back to the rest pose (a spring)
    const settle = useCallback(() => {
        bounds.current = null;
        pose.current.busy = false;
        pointerX.set(Number.NaN);
        pointerY.set(0);
        targetX.set(pose.current.x);
        targetY.set(pose.current.y);
        hover.set(0);
    }, [pointerX, pointerY, targetX, targetY, hover]);

    // A finger leaves through release (pointerleave follows every lifted finger)
    const onPointerLeave = useCallback((event: PointerEvent<HTMLElement>) => {
        if (event.pointerType !== 'touch') settle();
    }, [settle]);

    const press = useCallback((event: PointerEvent<HTMLElement>) => {
        if (event.pointerType !== 'touch' || reducedMotion) return;
        drag.current = { id: event.pointerId, x0: event.clientX, moved: false };
        bounds.current = null;
    }, [reducedMotion]);

    const release = useCallback((event: PointerEvent<HTMLElement>) => {
        if (event.pointerType !== 'touch' || drag.current.id !== event.pointerId) return false;
        const { moved } = drag.current;
        drag.current = { id: -1, x0: 0, moved: false };
        if (moved) onDrag?.(false);
        settle();
        return moved;
    }, [settle, onDrag]);

    const rest = useCallback((x: number, y: number) => {
        pose.current.x = x;
        pose.current.y = y;
        if (pose.current.busy) return;
        targetX.set(x);
        targetY.set(y);
    }, [targetX, targetY]);

    const hold = useCallback((on: boolean) => {
        held.current = on;
        if (!on) return;
        rotateX.jump(rotateX.get());
        rotateY.jump(rotateY.get());
    }, [rotateX, rotateY]);

    // One stable object: the faces are memoised and only re-render when their own state changes
    return useMemo(() => ({ rotateX, rotateY, filmX, filmY, glareX, glareY, hover, onPointerMove, onPointerLeave, hold, press, release, rest }),
        [rotateX, rotateY, filmX, filmY, glareX, glareY, hover, onPointerMove, onPointerLeave, hold, press, release, rest]);
}
