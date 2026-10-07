import React from 'react';
import styles from './FluxCapacitor.module.scss';

export interface FluxCapacitorProps {
    /** Engraved name plate (content.ts) */
    label: string;
    /** Powered on: its glass tubes and light show (after the first frames, see TimeConvector) */
    powered: boolean;
}

const TUBES = [styles.left, styles.right, styles.down];

/**
 * The flux capacitor (LOT 3, A2): a metal box with a window, three glass
 * tubes in a Y whose light runs towards the centre. It powers on once the
 * page has painted (its gradients and glows are the costliest part of the
 * console to draw), fading in. At rest the light crawls; during a jump
 * (console marked data-jumping) a fast layer and a glow charge up, then cool
 * down (CSS keyframes, transform and opacity only). Decorative.
 */
const FluxCapacitor: React.FC<FluxCapacitorProps> = ({ label, powered }) => (
    <span className={styles.box} data-label={label} data-power={powered ? 'on' : 'off'} aria-hidden="true">
        <i className={styles.screw} />
        <i className={styles.screw} />
        <span className={styles.window}>
            {powered && (
                <span className={styles.core}>
                    <span className={styles.glow} />
                    {TUBES.map((direction) => (
                        <span key={direction} className={`${styles.tube} ${direction}`}>
                            <span className={styles.chase} />
                            <span className={`${styles.chase} ${styles.fast}`} />
                        </span>
                    ))}
                    <span className={styles.hub} />
                </span>
            )}
        </span>
    </span>
);

export default FluxCapacitor;
