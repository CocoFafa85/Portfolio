import React, { type CSSProperties, type RefObject } from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { trajectoryEffects as fx } from '../../../data/effects';
import { emberPaths } from '../../../utils/trajectory';
import styles from './TrajectoryAxis.module.scss';

const EMBERS = emberPaths(fx.embers);

export interface TrajectoryAxisProps {
    axisRef: RefObject<HTMLSpanElement | null>;
    progress: MotionValue<number>;
    powered: boolean;
    still: boolean;
}

/**
 * The axis of the trajectory (decision T1): a twin fire trail (orange → pink, the 88 mph trails) burnt
 * down to the flame, whose white-hot head throws embers. The trail scales and the head travels with the
 * scroll progress (transform only, scroll-linked by motion). The axis box is always there (useScroll's
 * target), drawn only once powered; reduced motion: the whole trail, no head.
 */
const TrajectoryAxis: React.FC<TrajectoryAxisProps> = ({ axisRef, progress, powered, still }) => {
    // The carriage is as tall as the axis: from -100 % to 0 %, its bottom edge (the head) goes from top to end
    const carriageY = useTransform(progress, [0, 1], ['-100%', '0%']);
    return (
        <span ref={axisRef} className={styles.axis} aria-hidden="true">
            {powered && (
                <>
                    <span className={styles.rail} />
                    <motion.span className={styles.trail} style={still ? undefined : { scaleY: progress }}>
                        <span className={styles.glow} />
                    </motion.span>
                    {!still && (
                        <motion.span className={styles.carriage} style={{ y: carriageY }}>
                            <span className={styles.head}>
                                <span className={styles.halo} />
                                <span className={styles.flare} />
                                <span className={styles.core} />
                                {EMBERS.map(({ x, y, durationMs, delayMs }) => (
                                    <i key={`${x},${y}`} className={styles.ember}
                                        style={{ '--x': `${x}px`, '--y': `${y}px`, '--d': `${durationMs}ms`, '--dl': `${delayMs}ms` } as CSSProperties} />
                                ))}
                            </span>
                        </motion.span>
                    )}
                </>
            )}
        </span>
    );
};

export default TrajectoryAxis;
