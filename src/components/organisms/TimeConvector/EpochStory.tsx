import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, stagger } from 'motion/react';
import { convectorEffects as fx } from '../../../data/effects';
import type { TimelineStep, TimeState } from '../../../types/models';
import { parseInlineLinks, splitParagraphs } from '../../../utils/story';
import styles from './EpochStory.module.scss';

export interface EpochStoryProps {
    steps: TimelineStep[];
    selected: TimeState;
    panelId: (era: TimeState) => string;
    tabId: (era: TimeState) => string;
    /** False while a jump travels: the chosen era's text waits for the landing */
    revealed: boolean;
    /** Reveals the text line after line; false on first display (painted at once, LCP) and in reduced motion */
    animate: boolean;
}

/** One era's text, rendered once: its lines are laid out at load, never on a jump */
const EraText: React.FC<{ step: TimelineStep }> = React.memo(({ step }) => (
    <>
        <h1 className={styles.title} data-line="">{step.title}</h1>
        {splitParagraphs(step.content).map((paragraph, index) => (
            <p key={index} className={styles.paragraph} data-line="">
                {parseInlineLinks(paragraph).map((segment, part) => (segment.kind === 'link'
                    ? <a key={part} href={segment.href} target="_blank" rel="noopener noreferrer">{segment.text}</a>
                    : <React.Fragment key={part}>{segment.text}</React.Fragment>))}
            </p>
        ))}
    </>
));

/**
 * Texts of the eras (LOT 3, A3), the tab panels of the convector; the era
 * title is the page's h1 (only the chosen panel is exposed). All three
 * are laid out from the start; only the chosen one is in the flow, the
 * others wait hidden (invisible to screen readers and to the keyboard): a
 * jump never lays text out (on a slow phone, shaping a new text took a whole
 * frame). The chosen panel switches at once for screen readers; on screen
 * its text waits for the landing, then rises in line after line (motion).
 */
const EpochStory: React.FC<EpochStoryProps> = ({ steps, selected, panelId, tabId, revealed, animate: reveal }) => {
    const panels = useRef<Partial<Record<TimeState, HTMLDivElement | null>>>({});
    const [heights, setHeights] = useState<Partial<Record<TimeState, number>>>({});

    // Height of every panel (after the first paint, and when a font swaps): once known,
    // the chosen panel leaves the flow too and the stack takes its height
    useEffect(() => {
        const measure = () => setHeights(Object.fromEntries(steps.map((step) => [step.id, panels.current[step.id]?.offsetHeight ?? 0])));
        const observer = new ResizeObserver(measure);
        steps.forEach((step) => { const panel = panels.current[step.id]; if (panel) observer.observe(panel); });
        return () => observer.disconnect();
    }, [steps]);
    const height = heights[selected];

    // Before the paint: hide the chosen text while the jump travels, then reveal it
    useLayoutEffect(() => {
        const panel = panels.current[selected];
        if (!panel) return;
        const lines = panel.querySelectorAll<HTMLElement>('[data-line]');
        if (!reveal || !revealed) {
            const opacity = reveal ? '0' : '';
            lines.forEach((line) => { line.style.opacity = opacity; });
            return;
        }
        const controls = animate(lines, { opacity: [0, 1], y: [fx.reveal.rise, 0] },
            { duration: fx.reveal.durationS, ease: 'easeOut', delay: stagger(fx.reveal.staggerS) });
        return () => controls.stop();
    }, [selected, revealed, reveal]);

    return (
        <div className={styles.stack} data-measured={height ? '' : undefined} style={height ? { height } : undefined}>
            {steps.map((step) => {
                const active = step.id === selected;
                return (
                    <div
                        key={step.id}
                        ref={(panel) => { panels.current[step.id] = panel; }}
                        role="tabpanel"
                        id={panelId(step.id)}
                        aria-labelledby={tabId(step.id)}
                        tabIndex={active ? 0 : -1}
                        className={active ? styles.panel : `${styles.panel} ${styles.idle}`}
                        style={{ '--accent': step.accent } as React.CSSProperties}
                    >
                        <EraText step={step} />
                    </div>
                );
            })}
        </div>
    );
};

export default EpochStory;
