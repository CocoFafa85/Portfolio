import { useEffect, useState } from 'react';

/**
 * Runs `callback` at the first idle moment (or after `timeoutMs`); returns a
 * cancel function.
 */
export function onIdle(callback: () => void, timeoutMs: number): () => void {
    if (typeof window.requestIdleCallback === 'function') {
        const handle = window.requestIdleCallback(callback, { timeout: timeoutMs });
        return () => window.cancelIdleCallback(handle);
    }
    const timer = window.setTimeout(callback, timeoutMs);
    return () => window.clearTimeout(timer);
}

/**
 * Runs `callback` at the first idle moment once `earliestMs` have passed since
 * the page started (performance.now()). Defers heavy, decorative work — a
 * lazy chunk, a WebGL setup — past the first frames: during them the GPU
 * process is still drawing the page, and a first WebGL context created then
 * blocks the main thread for its whole duration (235–290 ms measured with a
 * software GPU, 7–10 ms once it is through). Returns a cancel function.
 */
export function onIdleAfter(earliestMs: number, timeoutMs: number, callback: () => void): () => void {
    let cancelIdle = () => {};
    const timer = window.setTimeout(() => {
        cancelIdle = onIdle(callback, timeoutMs);
    }, Math.max(0, earliestMs - performance.now()));
    return () => {
        window.clearTimeout(timer);
        cancelIdle();
    };
}

/** Becomes true at the first idle moment after mount, `earliestMs` after the page started at the soonest. */
export function useIdleReady(timeoutMs: number, earliestMs = 0): boolean {
    const [ready, setReady] = useState(false);
    useEffect(() => onIdleAfter(earliestMs, timeoutMs, () => setReady(true)), [timeoutMs, earliestMs]);
    return ready;
}
