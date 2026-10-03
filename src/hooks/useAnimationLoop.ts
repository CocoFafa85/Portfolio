import { useEffect, useRef, type RefObject } from 'react';

/** Longest step handed to a frame after a stall or a resume, in ms */
const MAX_DELTA_MS = 50;
const FIRST_DELTA_MS = 16;

export type FrameCallback = (deltaMs: number, time: number) => void;

export interface AnimationLoopOptions {
    /** Element whose presence on screen gates the loop */
    target: RefObject<Element | null>;
    /** Called each time the loop stops (hidden tab, off screen, reduced motion) */
    onPause?: () => void;
}

/**
 * Runs `onFrame` on every animation frame, only while the tab is visible, the
 * target is on screen and the user accepts motion (`prefers-reduced-motion`);
 * resumes by itself when these change. The latest callbacks are used without
 * restarting the loop, which allocates nothing per frame.
 */
export function useAnimationLoop(onFrame: FrameCallback, { target, onPause }: AnimationLoopOptions): void {
    const frameRef = useRef(onFrame);
    const pauseRef = useRef(onPause);
    useEffect(() => {
        frameRef.current = onFrame;
        pauseRef.current = onPause;
    });

    useEffect(() => {
        const element = target.current;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let handle = 0;
        let last = 0;
        let onScreen = true;

        const tick = (time: number) => {
            const delta = last === 0 ? FIRST_DELTA_MS : Math.min(time - last, MAX_DELTA_MS);
            last = time;
            frameRef.current(delta, time);
            handle = requestAnimationFrame(tick);
        };

        const sync = () => {
            const run = onScreen && document.visibilityState === 'visible' && !reducedMotion.matches;
            if (run && handle === 0) {
                last = 0;
                handle = requestAnimationFrame(tick);
            } else if (!run && handle !== 0) {
                cancelAnimationFrame(handle);
                handle = 0;
                pauseRef.current?.();
            }
        };

        const observer = element
            ? new IntersectionObserver((entries) => {
                onScreen = entries[entries.length - 1].isIntersecting;
                sync();
            })
            : null;
        if (element) observer?.observe(element);
        document.addEventListener('visibilitychange', sync);
        reducedMotion.addEventListener('change', sync);
        sync();

        return () => {
            cancelAnimationFrame(handle);
            observer?.disconnect();
            document.removeEventListener('visibilitychange', sync);
            reducedMotion.removeEventListener('change', sync);
        };
    }, [target]);
}
