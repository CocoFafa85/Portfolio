import React, { type CSSProperties } from 'react';
import { neonFrameEffects as fx } from '../../../data/effects';
import styles from './NeonFrame.module.scss';

export interface NeonFrameProps {
    /** False until the decor powers on: the blurred glows are never part of the first paint */
    lit: boolean;
}

const FRAME_VARS = { '--neon-cycle': `${fx.cycleMs}ms` } as CSSProperties;

/**
 * One neon tube along the whole border of its parent (About, review of
 * 2026-10-08): it pulses and turns violet → pink → cyan. Three tubes, one per
 * colour, painted once; only their opacity moves (keyframes), so the cycle
 * never repaints. The parent is `position: relative` and sets `--neon-radius`.
 * Reduced motion: a steady violet tube.
 */
const NeonFrame: React.FC<NeonFrameProps> = ({ lit }) => (
    <span className={styles.frame} data-lit={lit ? '' : undefined} style={FRAME_VARS} aria-hidden="true">
        <i className={`${styles.tube} ${styles.violet}`} />
        <i className={`${styles.tube} ${styles.pink}`} />
        <i className={`${styles.tube} ${styles.cyan}`} />
    </span>
);

export default NeonFrame;
