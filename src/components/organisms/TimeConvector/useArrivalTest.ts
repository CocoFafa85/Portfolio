import { useEffect, useState } from 'react';
import { convectorEffects as fx } from '../../../data/effects';
import { useArrivalStyle } from '../../templates/arrival';

/**
 * Consumer of the trip channel (LOT 3, CÂBLAGE): when the visitor reaches
 * About through a page trip (88 mph or hyperspace), the time circuits greet
 * the arrival with a lamp test, every segment lit (88:88), for
 * arrivalTestMs once powered, then show their dates. Never on first load
 * nor in reduced motion. Read once: the trip a page arrived with.
 */
export function useArrivalTest(powered: boolean, reducedMotion: boolean): boolean {
    const arrival = useArrivalStyle();
    const [byTrip] = useState(() => arrival !== 'none');
    const [done, setDone] = useState(false);
    const testing = powered && byTrip && !reducedMotion && !done;

    useEffect(() => {
        if (!testing) return;
        const timer = window.setTimeout(() => setDone(true), fx.arrivalTestMs);
        return () => window.clearTimeout(timer);
    }, [testing]);

    return testing;
}
