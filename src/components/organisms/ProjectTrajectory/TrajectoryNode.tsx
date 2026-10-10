import React, { type CSSProperties } from 'react';
import { trajectoryEffects as fx } from '../../../data/effects';
import { sparkPaths } from '../../../utils/trajectory';
import { FULL_DIGIT } from '../TimeConvector/dseg';
import styles from './TrajectoryNode.module.scss';

export interface TrajectoryNodeProps {
    /** Four digits for the display, or null: only its unlit segments (a year still to provide) */
    year: string | null;
}

const GHOST = FULL_DIGIT.repeat(4);
const SPARKS = sparkPaths(fx.sparks.count, fx.sparks.reach);

/**
 * A point of the trajectory (decision T1): a dot on the axis and, beside it, the project's year on a
 * small time-circuit display (7 segments, neon green, no plate). Dark until the flame passes it (its
 * item gets data-ignited): the dot ignites (shock waves, sparks), the year lights up at once with a
 * flash. Decorative: the card says the year. `data-node` is its box for the flame's thresholds. The
 * unlit segments are generated content and the year stays hidden until lit: no faint text for a
 * contrast checker to flag.
 */
const TrajectoryNode: React.FC<TrajectoryNodeProps> = ({ year }) => (
    <span className={styles.node} data-node="" aria-hidden="true">
        <span className={styles.dot}>
            <span className={styles.core} />
            <span className={styles.wave} />
            <span className={styles.wave} />
            {SPARKS.map(({ x, y }) => (
                <i key={`${x},${y}`} className={styles.spark} style={{ '--sx': `${x}px`, '--sy': `${y}px` } as CSSProperties} />
            ))}
        </span>
        <span className={styles.display}>
            <span className={styles.bloom} />
            <span className={styles.digits} data-ghost={GHOST}>
                {year && <span className={styles.value}>{year}</span>}
                {year && <span className={styles.flash}>{year}</span>}
            </span>
        </span>
    </span>
);

export default TrajectoryNode;
