import { useEffect, useState } from 'react';
import { msUntilNextMinute, resolvePresent } from '../../../utils/timeCircuits/time';

/**
 * The present of the time circuits (LOT 3, data F1): the visitor's clock,
 * redrawn once each new minute starts; `fallback` (live: false) when the
 * clock is unavailable, and then it stays still.
 */
export function usePresentClock(fallback: Date): { date: Date; live: boolean } {
    const [present, setPresent] = useState(() => resolvePresent(new Date(), fallback));

    useEffect(() => {
        if (!present.live) return;
        const timer = window.setTimeout(
            () => setPresent(resolvePresent(new Date(), fallback)),
            msUntilNextMinute(new Date()),
        );
        return () => window.clearTimeout(timer);
    }, [present, fallback]);

    return present;
}
