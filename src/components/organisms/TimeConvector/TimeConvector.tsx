import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { useReducedMotion } from 'motion/react';
import { content } from '../../../data/content';
import { convectorEffects as fx } from '../../../data/effects';
import { useIdleReady } from '../../../hooks/useIdleReady';
import type { TimelineStep, TimeState } from '../../../types/models';
import { nextTabIndex } from '../../../utils/tabs';
import { describeDate, formatCircuitTime, parseLocalDateTime } from '../../../utils/timeCircuits/time';
import CircuitRow, { type RowTone } from './CircuitRow';
import EpochStory from './EpochStory';
import FluxCapacitor from './FluxCapacitor';
import JumpEffects from './JumpEffects';
import { useBoltField } from './jumpBolts';
import Speedometer from './Speedometer';
import { usePresentClock } from './usePresentClock';
import { useTimeJump } from './useTimeJump';
import styles from './TimeConvector.module.scss';

const { about, decor, ui } = content;
const labels = decor.timeCircuits;
/** Row colours top to bottom, as in the film: destination, present, last departed */
const TONES: RowTone[] = ['destination', 'present', 'departed'];
const tabId = (era: TimeState) => `about-era-${era}`;
const panelId = (era: TimeState) => `about-era-panel-${era}`;

// Read once: content.test.ts guarantees every era and every date is valid
const STEPS = Object.fromEntries(about.timeline.map((step) => [step.id, step])) as Record<TimeState, TimelineStep>;
const FIXED_DATES = Object.fromEntries(about.timeline.map((step) =>
    [step.id, step.date ? parseLocalDateTime(step.date) : null])) as Record<TimeState, Date | null>;
const FALLBACK = parseLocalDateTime(about.presentFallback) ?? new Date(0);

/** Each jump flips the cycle: its keyframes restart even when it interrupts another jump */
const JUMP_CYCLES = ['a', 'b'];
/** Timings of the jump's CSS layers, read by the console's keyframes */
const LAYER_VARS = {
    '--jump-accel': `${fx.jump.accelMs}ms`, '--jump-arm': `${fx.layers.armMs}ms`,
    '--bolts-at': `${fx.layers.boltsAt}ms`, '--bolts-ms': `${fx.layers.boltsMs}ms`,
    '--flash-at': `${fx.layers.flashAt}ms`, '--flash-ms': `${fx.layers.flashMs}ms`,
    '--fire-at': `${fx.layers.fireAt}ms`, '--fire-ms': `${fx.layers.fireMs}ms`,
    '--cool-at': `${fx.layers.coolAt}ms`, '--cool-ms': `${fx.layers.coolMs}ms`,
};

/**
 * The DeLorean convector of the About page (LOT 3, A2, direction B): three
 * rows of time circuits, each an era tab (DESTINATION TIME = future, PRESENT
 * TIME = now, LAST TIME DEPARTED = past), the flux capacitor and the
 * speedometer; the chosen era's text in the tab panel. Choosing an era plays
 * the time jump (A2 bis), never in reduced motion. Arrow keys, Home and End
 * move and select (automatic activation); no animation holds the focus.
 */
const TimeConvector: React.FC = () => {
    const [selected, setSelected] = useState<TimeState>('present');
    const present = usePresentClock(FALLBACK);
    const powered = useIdleReady(fx.powerOnTimeoutMs, fx.powerOnAfterMs);
    const reducedMotion = useReducedMotion() ?? false;
    const digitsRef = useRef<HTMLSpanElement>(null);
    const consoleRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const bolts = useBoltField(consoleRef, powered && !reducedMotion);
    const jump = useTimeJump(digitsRef);
    // The text panel follows one render later: its switch never shares a frame with the jump start
    const shownEra = useDeferredValue(selected);

    // Stable handlers (the rows are memoised): they call the latest select
    const select = (era: TimeState) => {
        if (era === selected && !jump.jumping) return;
        setSelected(era);
        if (!reducedMotion) jump.start();
    };
    const selectRef = useRef(select);
    useEffect(() => { selectRef.current = select; });
    const onSelect = useCallback((era: TimeState) => selectRef.current(era), []);
    const onKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
        const next = nextTabIndex(event.key, tabRefs.current.indexOf(event.currentTarget), about.rowOrder.length);
        if (next < 0) return;
        event.preventDefault();
        tabRefs.current[next]?.focus();
        selectRef.current(about.rowOrder[next]);
    }, []);
    const buttonRefs = useMemo(() => about.rowOrder.map((_, index) =>
        (button: HTMLButtonElement | null) => { tabRefs.current[index] = button; }), []);
    // Displays of each row: recomputed once a minute (the present), not on a jump
    const rows = useMemo(() => about.rowOrder.map((era) => {
        const date = FIXED_DATES[era] ?? present.date;
        return { era, time: formatCircuitTime(date, labels.months), spoken: describeDate(date, ui.locale), reset: !FIXED_DATES[era] && !present.live };
    }), [present]);
    const consoleStyle = { ...LAYER_VARS, '--jump-offset': `${-Math.round(jump.offsetMs)}ms` } as CSSProperties;

    return (
        <div className={styles.cockpit}>
            <div className={styles.consoleColumn}>
                <div
                    ref={consoleRef}
                    className={styles.console}
                    data-power={powered ? 'on' : 'off'}
                    data-jumping={jump.jumping}
                    data-jump-cycle={jump.jumping ? JUMP_CYCLES[jump.id % 2] : undefined}
                    style={consoleStyle}
                >
                    <i className={styles.screw} /><i className={styles.screw} /><i className={styles.screw} /><i className={styles.screw} />
                    <div className={styles.rows} role="tablist" aria-label={about.erasLabel} aria-orientation="vertical">
                        {rows.map(({ era, time, spoken, reset }, index) => (
                            <CircuitRow
                                key={era}
                                era={era}
                                tone={TONES[index]}
                                time={time}
                                label={STEPS[era].label}
                                spoken={spoken}
                                selected={era === selected}
                                reset={reset}
                                tabId={tabId(era)}
                                panelId={panelId(era)}
                                buttonRef={buttonRefs[index]}
                                onSelect={onSelect}
                                onKeyDown={onKeyDown}
                            />
                        ))}
                    </div>
                    <div className={styles.side}>
                        <FluxCapacitor label={labels.capacitor} powered={powered} />
                        <Speedometer unit={labels.speedUnit} digitsRef={digitsRef} />
                    </div>
                    {bolts && <JumpEffects bolts={bolts} />}
                </div>
            </div>
            <EpochStory
                steps={about.timeline}
                selected={shownEra}
                panelId={panelId}
                tabId={tabId}
                revealed={jump.revealed}
                animate={jump.id > 0 && !reducedMotion}
            />
        </div>
    );
};

export default TimeConvector;
