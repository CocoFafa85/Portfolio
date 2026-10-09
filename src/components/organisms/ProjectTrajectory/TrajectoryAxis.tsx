import React, { useCallback, useEffect, useRef, type CSSProperties, type RefObject } from 'react';
import { motion, useMotionValueEvent, type MotionValue } from 'motion/react';
import { trajectoryEffects as fx } from '../../../data/effects';
import { emberPaths } from '../../../utils/flame';
import styles from './TrajectoryAxis.module.scss';

const EMBERS = emberPaths(fx.embers);

export interface TrajectoryAxisProps {
    axisRef: RefObject<HTMLSpanElement | null>;
    progress: MotionValue<number>;
    still: boolean;
}

/**
 * The axis of the trajectory (decision T1): a twin fire trail (orange → pink, the 88 mph trails) burnt
 * down to the flame, whose white-hot head throws embers. The trail scales with the scroll progress
 * (motion value bound to scaleY); the head's carriage is moved from the progress events the ignitions
 * already listen to (no useTransform here: shared with the HoloCard, it became a 7th request of Skills).
 * Transform only. Mounted with its engine (TrajectoryFlame) once the decor powers on; reduced motion: the
 * whole trail, no head.
 */
const TrajectoryAxis: React.FC<TrajectoryAxisProps> = ({ axisRef, progress, still }) => {
    // The carriage is as tall as the axis: from -100 % to 0 %, its bottom edge (the head) goes from top to end
    const carriageRef = useRef<HTMLSpanElement>(null);
    const place = useCallback((value: number) => {
        if (carriageRef.current) carriageRef.current.style.transform = `translateY(${(value - 1) * 100}%)`;
    }, []);
    useMotionValueEvent(progress, 'change', place);
    useEffect(() => {
        if (!still) place(progress.get());
    }, [still, progress, place]);
    return (
        <span ref={axisRef} className={styles.axis} aria-hidden="true">
            <span className={styles.rail} />
            <motion.span className={styles.trail} style={still ? undefined : { scaleY: progress }}>
                <span className={styles.glow} />
            </motion.span>
            {!still && (
                <span ref={carriageRef} className={styles.carriage}>
                    <span className={styles.head}>
                        <span className={styles.halo} />
                        <span className={styles.flare} />
                        <span className={styles.core} />
                        {EMBERS.map(({ x, y, durationMs, delayMs }) => (
                            <i key={`${x},${y}`} className={styles.ember}
                                style={{ '--x': `${x}px`, '--y': `${y}px`, '--d': `${durationMs}ms`, '--dl': `${delayMs}ms` } as CSSProperties} />
                        ))}
                    </span>
                </span>
            )}
        </span>
    );
};

export default TrajectoryAxis;
