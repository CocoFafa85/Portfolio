import React, { useState, type CSSProperties } from 'react';
import { useReducedMotion } from 'motion/react';
import { travelEffects as fx } from '../../../data/effects';
import { createRandom } from '../../../utils/random';
import type { TravelStyle } from '../../../utils/travel';
import { createRadialStreaks, createSpeedStreaks } from '../../../utils/travelFx';
import styles from './TravelOverlay.module.scss';

export interface TravelOverlayProps {
    /** Effect of the current trip (remount the overlay with a new key to replay it) */
    style: TravelStyle;
    /** The new page is on screen: the cover may clear (it holds until then) */
    arrived: boolean;
}

type CssVars = CSSProperties & Record<`--${string}`, string>;

// Computed once at load: nothing is generated while navigating
const random = createRandom(fx.seed);
const ROOT_VARS: CssVars = { '--travel-ms': `${fx.durationMs}ms` };
const RADIAL_VARS: CssVars[] = createRadialStreaks(fx.hyperspace, random).map((s) => ({
    '--angle': `${s.angle}deg`, '--start': `${s.start}px`, '--length': `${s.length}px`, '--delay': `${s.delay}ms`,
}));
const SPEED_VARS: CssVars[] = createSpeedStreaks(fx.timeTravel, random).map((s) => ({
    '--top': `${s.top}%`, '--width': `${s.width}px`, '--delay': `${s.delay}ms`, '--duration': `${s.duration}ms`,
}));

/**
 * Full-screen "sas" of a trip (LOT 1, C2): darkness covers the screen, holds
 * until the new page is actually mounted (even on a slow device), then clears.
 * Hyperspace star lines (home ↔ inner page) or 88 mph light streaks, flash and
 * fire trails (between inner pages). CSS keyframes on transform and opacity
 * only; never intercepts the pointer, stays under the navigation bar, unmounts
 * at the end. Not rendered in reduced motion.
 */
const TravelOverlay: React.FC<TravelOverlayProps> = ({ style, arrived }) => {
    const reducedMotion = useReducedMotion();
    const [done, setDone] = useState(false);
    if (style === 'none' || reducedMotion || done) return null;

    return (
        <div
            className={`${styles.overlay} ${styles[style]} ${arrived ? styles.arrived : ''}`}
            style={ROOT_VARS}
            aria-hidden="true"
        >
            <div className={styles.cover} onAnimationEnd={() => arrived && setDone(true)} />
            {style === 'hyperspace'
                ? RADIAL_VARS.map((vars, i) => <span key={i} className={styles.radial} style={vars} />)
                : SPEED_VARS.map((vars, i) => <span key={i} className={styles.speed} style={vars} />)}
            <div className={styles.flash} />
            {style === 'timeTravel' && (
                <>
                    <span className={`${styles.fire} ${styles.fireHigh}`} />
                    <span className={`${styles.fire} ${styles.fireLow}`} />
                </>
            )}
        </div>
    );
};

export default TravelOverlay;
