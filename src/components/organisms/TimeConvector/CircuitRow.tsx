import React, { type KeyboardEvent, type Ref } from 'react';
import { content } from '../../../data/content';
import type { TimeState } from '../../../types/models';
import type { CircuitTime } from '../../../utils/timeCircuits/time';
import SegmentDisplay from './SegmentDisplay';
import styles from './CircuitRow.module.scss';

/** LED colour of a row, by its place in the film: red, green, amber */
export type RowTone = 'destination' | 'present' | 'departed';

export interface CircuitRowProps {
    era: TimeState;
    tone: RowTone;
    time: CircuitTime;
    /** Visible era name (Passé) and the date in words, read with it by screen readers */
    label: string;
    spoken: string;
    selected: boolean;
    /** Clock unavailable: a reset 12:00 blinks, as after a power cut */
    reset?: boolean;
    tabId: string;
    panelId: string;
    buttonRef?: Ref<HTMLButtonElement>;
    onSelect: (era: TimeState) => void;
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

const labels = content.decor.timeCircuits;

const Field: React.FC<{ name: string; children: React.ReactNode }> = ({ name, children }) => (
    <span className={styles.field}>
        <span className={styles.strip}>{name}</span>
        {children}
    </span>
);

/**
 * One row of the DeLorean time circuits (LOT 3, A2, direction B): the whole
 * row is an era tab. Colour strips (MONTH… MIN), LED displays, AM/PM lamps,
 * blinking colon and the engraved plate, all decorative (aria-hidden); the
 * tab is named by its visible era and the date in words ("Futur, 14 juin 2035").
 */
const CircuitRow: React.FC<CircuitRowProps> = ({
    era, tone, time, label, spoken, selected, reset = false, tabId, panelId, buttonRef, onSelect, onKeyDown,
}) => {
    const { fields } = labels;
    const classes = [styles.row, styles[tone], selected ? styles.selected : ''];
    return (
        <button
            ref={buttonRef}
            type="button"
            role="tab"
            id={tabId}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            className={classes.filter(Boolean).join(' ')}
            onClick={() => onSelect(era)}
            onKeyDown={onKeyDown}
        >
            <span className={styles.fields} aria-hidden="true">
                <Field name={fields.month}><SegmentDisplay value={time.month} cells={3} alpha /></Field>
                <Field name={fields.day}><SegmentDisplay value={time.day} cells={2} /></Field>
                <Field name={fields.year}><SegmentDisplay value={time.year} cells={4} /></Field>
                <span className={styles.meridiem}>
                    <span>{fields.am}</span><i className={time.pm ? styles.lamp : `${styles.lamp} ${styles.on}`} />
                    <span>{fields.pm}</span><i className={time.pm ? `${styles.lamp} ${styles.on}` : styles.lamp} />
                </span>
                <Field name={fields.hour}><SegmentDisplay value={time.hour} cells={2} blink={reset} /></Field>
                <span className={styles.colon}><i /><i /></span>
                <Field name={fields.minute}><SegmentDisplay value={time.minute} cells={2} blink={reset} /></Field>
            </span>
            <span className={styles.footer}>
                <span className={styles.tag}>{label}</span>
                <span className={styles.spoken}>, {spoken}</span>
                <span className={styles.plate} aria-hidden="true">{labels.plates[era]}</span>
            </span>
        </button>
    );
};

export default CircuitRow;
