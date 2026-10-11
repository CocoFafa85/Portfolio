import { useSyncExternalStore } from 'react';

const lists = new Map<string, MediaQueryList>();
/** One MediaQueryList per query, shared by every component that reads it */
export function mediaList(query: string): MediaQueryList {
    let list = lists.get(query);
    if (!list) {
        list = window.matchMedia(query);
        lists.set(query, list);
    }
    return list;
}

/**
 * True while `query` matches (LOT 6, A3); the component renders again when it changes (a rotation,
 * a mouse plugged into a tablet). False before hydration, there is none here.
 */
export function useMediaQuery(query: string): boolean {
    return useSyncExternalStore(
        (onChange) => {
            const list = mediaList(query);
            list.addEventListener('change', onChange);
            return () => list.removeEventListener('change', onChange);
        },
        () => mediaList(query).matches,
        () => false,
    );
}
