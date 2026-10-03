import { useCallback, useEffect, useRef, useState } from 'react';
import { content } from '../data/content';
import { getTravelStyle, type TravelStyle } from '../utils/travel';

/** Inner pages in navigation bar order: decides forward or back 88 mph trips */
const NAV_ORDER = content.nav.map((item) => item.path);

export interface Travel {
    /** Effect of the latest trip ('none' before the first navigation) */
    style: TravelStyle;
    /** Increments on every trip: key of the overlay, so each trip replays it */
    id: number;
    /** Page actually on screen: lags behind the URL until the swap under cover */
    shownPath: string;
    /** To pass to AnimatePresence: the leaving page is gone, the new one shows */
    onExitComplete: () => void;
}

/**
 * Emitter of the trip channel (LOT 1, C2): turns each URL change into a trip
 * (origin → destination → style). Consumers: the page variants (via
 * AnimatePresence `custom`), the overlay, and the layout's background switch.
 */
export function useTravel(pathname: string): Travel {
    const [trip, setTrip] = useState({ path: pathname, style: 'none' as TravelStyle, id: 0 });
    // Derived from the URL during render (React's recommended pattern, no extra commit)
    if (trip.path !== pathname) {
        setTrip({ path: pathname, style: getTravelStyle(trip.path, pathname, NAV_ORDER), id: trip.id + 1 });
    }

    const [shownPath, setShownPath] = useState(pathname);
    const latestPath = useRef(pathname);
    useEffect(() => {
        latestPath.current = pathname;
    }, [pathname]);
    const onExitComplete = useCallback(() => setShownPath(latestPath.current), []);

    return { style: trip.style, id: trip.id, shownPath, onExitComplete };
}
