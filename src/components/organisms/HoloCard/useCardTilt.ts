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
    /** True while a fine pointer is over the card */
    hover: MotionValue<number>;
    onPointerMove(event: PointerEvent<HTMLElement>): void;
    onPointerLeave(event: PointerEvent<HTMLElement>): void;
}

const percent = (value: number) => `${(value * 100).toFixed(2)}%`;

/**
 * Tilt of the HoloCard (LOT 4, S2): a fine pointer tilts it up to ±15° with
 * the original card's spring; the film slides with the angle, the glare
 * follows the pointer: transforms only, and no JavaScript at rest (the idle
 * sway is a CSS animation on the compositor). Touch never tilts (finger tilt
 * is LOT 6): a tap flips the card instead.
 */
export function useCardTilt(sceneRef: RefObject<HTMLElement | null>): CardTilt {
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

    const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
        if (event.pointerType === 'touch' || reducedMotion) return;
        bounds.current ??= sceneRef.current?.getBoundingClientRect() ?? null;
        const box = bounds.current;
        if (!box) return;
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        pointerX.set(x);
        pointerY.set(y);
        targetX.set(-y * 2 * fx.tilt.max);
        targetY.set(x * 2 * fx.tilt.max);
        hover.set(1);
    }, [reducedMotion, sceneRef, pointerX, pointerY, targetX, targetY, hover]);

    const onPointerLeave = useCallback(() => {
        bounds.current = null;
        pointerX.set(Number.NaN);
        pointerY.set(0);
        targetX.set(0);
        targetY.set(0);
        hover.set(0);
    }, [pointerX, pointerY, targetX, targetY, hover]);

    // One stable object: the faces are memoised and only re-render when their own state changes
    return useMemo(() => ({ rotateX, rotateY, filmX, filmY, glareX, glareY, hover, onPointerMove, onPointerLeave }),
        [rotateX, rotateY, filmX, filmY, glareX, glareY, hover, onPointerMove, onPointerLeave]);
}
