import { useEffect, useState } from 'react';

/**
 * Becomes true at the first idle moment after mount (or after `timeoutMs`):
 * defers heavy, decorative work (a lazy chunk, a WebGL setup) past the
 * first paint so it never competes with the page's main content.
 */
export function useIdleReady(timeoutMs: number): boolean {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (typeof window.requestIdleCallback === 'function') {
            const handle = window.requestIdleCallback(() => setReady(true), { timeout: timeoutMs });
            return () => window.cancelIdleCallback(handle);
        }
        const timer = window.setTimeout(() => setReady(true), timeoutMs);
        return () => window.clearTimeout(timer);
    }, [timeoutMs]);

    return ready;
}
