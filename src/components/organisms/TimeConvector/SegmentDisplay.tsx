import React, { type Ref } from 'react';
import { FULL_DIGIT, FULL_LETTER } from './dseg';
import styles from './SegmentDisplay.module.scss';

export interface SegmentDisplayProps {
    /** Characters lit on the display (BLANK_CELL leaves a cell dark) */
    value: string;
    /** Number of cells: every segment of each is drawn faintly behind (the unlit "88") */
    cells: number;
    /** Letters need the 14-segment font (month); digits use the 7-segment one */
    alpha?: boolean;
    /** The lit text, for a display written outside React (the speedometer) */
    litRef?: Ref<HTMLSpanElement>;
    /** Blinks, like a clock reset by a power cut */
    blink?: boolean;
}

/**
 * One LED display window of the time circuits (LOT 3, A2): black tinted
 * glass, unlit segments as faint ghosts, lit ones glowing in the colour set
 * by the parent (--seg-* variables). Decorative: the parent is aria-hidden.
 * Its width depends on the cell count only, never on the font loading.
 */
const SegmentDisplay: React.FC<SegmentDisplayProps> = ({ value, cells, alpha = false, litRef, blink = false }) => (
    <span
        className={alpha ? `${styles.window} ${styles.alpha}` : styles.window}
        data-ghost={(alpha ? FULL_LETTER : FULL_DIGIT).repeat(cells)}
        style={{ '--cells': cells } as React.CSSProperties}
    >
        <span ref={litRef} className={blink ? `${styles.lit} ${styles.blink}` : styles.lit}>{value}</span>
    </span>
);

export default SegmentDisplay;
