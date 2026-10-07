import React, { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { content } from '../../../data/content';
import { convectorEffects as fx } from '../../../data/effects';
import { useIdleReady } from '../../../hooks/useIdleReady';
import type { TimelineStep, TimeState } from '../../../types/models';
import { nextTabIndex } from '../../../utils/tabs';
import { describeDate, formatCircuitTime, parseLocalDateTime } from '../../../utils/timeCircuits/time';
import CircuitRow, { type RowTone } from './CircuitRow';
import EpochStory from './EpochStory';
import FluxCapacitor from './FluxCapacitor';
import Speedometer from './Speedometer';
import { usePresentClock } from './usePresentClock';
import styles from './TimeConvector.module.scss';

const { about, decor, ui } = content;
const labels = decor.timeCircuits;
/** Row colours top to bottom, as in the film: destination, present, last departed */
const TONES: RowTone[] = ['destination', 'present', 'departed'];
const PANEL_ID = 'about-era-panel';
const tabId = (era: TimeState) => `about-era-${era}`;

// Read once: content.test.ts guarantees every era and every date is valid
const STEPS = Object.fromEntries(about.timeline.map((step) => [step.id, step])) as Record<TimeState, TimelineStep>;
const FIXED_DATES = Object.fromEntries(about.timeline.map((step) =>
    [step.id, step.date ? parseLocalDateTime(step.date) : null])) as Record<TimeState, Date | null>;
const FALLBACK = parseLocalDateTime(about.presentFallback) ?? new Date(0);

/**
 * The DeLorean convector of the About page (LOT 3, A2, direction B): three
 * rows of time circuits, each an era tab (DESTINATION TIME = future, PRESENT
 * TIME = now, LAST TIME DEPARTED = past), the flux capacitor and the
 * speedometer; the chosen era's text in the tab panel. Arrow keys, Home and
 * End move and select (automatic activation).
 */
const TimeConvector: React.FC = () => {
    const [selected, setSelected] = useState<TimeState>('present');
    const present = usePresentClock(FALLBACK);
    const powered = useIdleReady(fx.powerOnTimeoutMs, fx.powerOnAfterMs);
    const digitsRef = useRef<HTMLSpanElement>(null);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const select = useCallback((era: TimeState) => setSelected(era), []);
    const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        const next = nextTabIndex(event.key, tabRefs.current.indexOf(event.currentTarget), about.rowOrder.length);
        if (next < 0) return;
        event.preventDefault();
        tabRefs.current[next]?.focus();
        select(about.rowOrder[next]);
    };

    return (
        <div className={styles.cockpit}>
            <div className={styles.consoleColumn}>
                <div className={styles.console} data-power={powered ? 'on' : 'off'}>
                    <i className={styles.screw} /><i className={styles.screw} /><i className={styles.screw} /><i className={styles.screw} />
                    <div className={styles.rows} role="tablist" aria-label={about.erasLabel} aria-orientation="vertical">
                        {about.rowOrder.map((era, index) => {
                            const date = FIXED_DATES[era] ?? present.date;
                            return (
                                <CircuitRow
                                    key={era}
                                    era={era}
                                    tone={TONES[index]}
                                    time={formatCircuitTime(date, labels.months)}
                                    label={STEPS[era].label}
                                    spoken={describeDate(date, ui.locale)}
                                    selected={era === selected}
                                    reset={!FIXED_DATES[era] && !present.live}
                                    tabId={tabId(era)}
                                    panelId={PANEL_ID}
                                    buttonRef={(button) => { tabRefs.current[index] = button; }}
                                    onSelect={select}
                                    onKeyDown={onKeyDown}
                                />
                            );
                        })}
                    </div>
                    <div className={styles.side}>
                        <FluxCapacitor label={labels.capacitor} powered={powered} />
                        <Speedometer unit={labels.speedUnit} digitsRef={digitsRef} />
                    </div>
                </div>
            </div>
            <EpochStory step={STEPS[selected]} panelId={PANEL_ID} tabId={tabId(selected)} revealed animate={false} />
        </div>
    );
};

export default TimeConvector;
