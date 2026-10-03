import type { Transition } from 'motion/react';

/**
 * Tuning constants of the visual effects (durations, springs, densities).
 * Kept apart from the components so a feel change never touches their logic.
 */

/** Navigation bar (LOT 1, C1) */
export const navEffects = {
    /** Glide of the active-page indicator along the luminous line */
    indicator: { type: 'spring', visualDuration: 0.4, bounce: 0.15 } satisfies Transition,
};
