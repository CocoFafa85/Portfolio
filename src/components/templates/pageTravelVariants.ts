import type { Transition, Variants } from 'motion/react';
import { travelEffects as fx } from '../../data/effects';

const HALF_TRIP_S = fx.durationMs / 2 / 1000;
const leaving: Transition = { duration: HALF_TRIP_S, ease: [...fx.ease.leave] };
const arriving: Transition = { duration: HALF_TRIP_S, ease: [...fx.ease.arrive] };
const fading: Transition = { duration: fx.reducedFadeMs / 2 / 1000 };

/**
 * Page motion during a trip, chosen by the travel style received as `custom`
 * (AnimatePresence passes the latest one to the leaving page). The page leaves
 * in the first half of the trip and arrives in the second: the overlay fully
 * covers the swap in between. Transforms and opacity only.
 */
export const pageTravelVariants: Variants = {
    arrive: (style: unknown) => {
        if (style === 'hyperspace') return { scale: fx.page.zoomIn, opacity: 0 };
        if (style === 'timeTravel') return { x: `${fx.page.shift}%`, skewX: fx.page.skew, opacity: 0 };
        return { opacity: 0 };
    },
    present: { scale: 1, x: '0%', skewX: 0, opacity: 1, transition: arriving },
    leave: (style: unknown) => {
        if (style === 'hyperspace') return { scale: fx.page.zoomOut, opacity: 0, transition: leaving };
        if (style === 'timeTravel') return { x: `-${fx.page.shift}%`, skewX: fx.page.skew, opacity: 0, transition: leaving };
        return { opacity: 0, transition: { duration: 0 } };
    },
};

/** Reduced motion: 150 ms cross-fade (75 ms out, 75 ms in), no movement. */
export const pageFadeVariants: Variants = {
    arrive: { opacity: 0 },
    present: { opacity: 1, transition: fading },
    leave: { opacity: 0, transition: fading },
};
