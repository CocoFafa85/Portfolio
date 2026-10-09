import React from 'react';
import { FULL_DIGIT } from '../TimeConvector/dseg';
import styles from './TrajectoryNode.module.scss';

export interface TrajectoryNodeProps {
    /** Four digits for the display, or null: only its unlit segments (a year still to provide) */
    year: string | null;
}

const GHOST = FULL_DIGIT.repeat(4);

/**
 * A point of the trajectory (decision T1): a dot on the axis and, beside it, the project's year on a
 * small time-circuit display (7 segments, neon green, no plate). Decorative: the card says the year.
 */
const TrajectoryNode: React.FC<TrajectoryNodeProps> = ({ year }) => (
    <span className={styles.node} aria-hidden="true">
        <span className={styles.dot}>
            <span className={styles.core} />
        </span>
        <span className={styles.display}>
            <span className={styles.digits}>
                <span className={styles.ghost}>{GHOST}</span>
                {year && <span className={styles.value}>{year}</span>}
            </span>
        </span>
    </span>
);

export default TrajectoryNode;
