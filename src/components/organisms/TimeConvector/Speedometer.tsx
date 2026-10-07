import React, { type Ref } from 'react';
import { BLANK_CELL } from './dseg';
import SegmentDisplay from './SegmentDisplay';
import styles from './Speedometer.module.scss';

export interface SpeedometerProps {
    unit: string;
    /** The digits, written during a jump without re-rendering (useTimeJump) */
    digitsRef: Ref<HTMLSpanElement>;
}

/** The DeLorean's digital speedometer (LOT 3, A2): red LEDs, 0 at rest. Decorative. */
const Speedometer: React.FC<SpeedometerProps> = ({ unit, digitsRef }) => (
    <span className={styles.speedometer} aria-hidden="true">
        <SegmentDisplay value={`${BLANK_CELL}0`} cells={2} litRef={digitsRef} />
        <span className={styles.unit}>{unit}</span>
    </span>
);

export default Speedometer;
