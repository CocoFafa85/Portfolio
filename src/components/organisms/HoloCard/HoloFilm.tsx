import React from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { holoEffects as fx } from '../../../data/effects';
import type { CardTilt } from './useCardTilt';
import styles from './HoloFilm.module.scss';

export interface HoloFilmProps {
    tilt: CardTilt;
    /** 'hex': the security pattern of the front; 'stripe': the lower band of the back */
    pattern: 'hex' | 'stripe';
}

/**
 * Holographic film and glare of a face (LOT 4, S2), written for this card
 * (pokemon-cards-css is GPL: not used). An oversized iridescent gradient,
 * painted once, slides under a fixed pattern mask as the card tilts, so the
 * colours shift with the angle; a soft white glare follows the pointer and
 * fades in on hover. Only transforms and opacity change.
 */
const HoloFilm: React.FC<HoloFilmProps> = React.memo(({ tilt, pattern }) => {
    // Never fully off once powered: the blended glare is composited from power-on, so the
    // first hover never pays for it (a 33–50 ms frame measured when it started from 0)
    const spring = useSpring(tilt.hover, { stiffness: 140, damping: 22 });
    const glow = useTransform(spring, (value) => fx.glare.rest + (1 - fx.glare.rest) * value);
    return (
        <>
            <span className={`${styles.film} ${styles[pattern]}`} aria-hidden="true">
                <span className={styles.drift}>
                    <motion.span className={styles.rainbow} style={{ x: tilt.filmX, y: tilt.filmY }} />
                </span>
            </span>
            <span className={styles.glareLayer} aria-hidden="true">
                <motion.span className={styles.glare} style={{ x: tilt.glareX, y: tilt.glareY, opacity: glow }} />
            </span>
        </>
    );
});

export default HoloFilm;
