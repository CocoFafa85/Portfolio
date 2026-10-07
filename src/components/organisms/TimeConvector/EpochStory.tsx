import React from 'react';
import { motion, type Variants } from 'motion/react';
import { convectorEffects as fx } from '../../../data/effects';
import type { TimelineStep } from '../../../types/models';
import { parseInlineLinks, splitParagraphs } from '../../../utils/story';
import styles from './EpochStory.module.scss';

export interface EpochStoryProps {
    step: TimelineStep;
    panelId: string;
    tabId: string;
    /** False while a jump travels: the text waits for the landing */
    revealed: boolean;
    /** Reveals the text line after line; false on first display (painted at once, LCP) and in reduced motion */
    animate: boolean;
}

const container: Variants = { hidden: {}, shown: { transition: { staggerChildren: fx.reveal.staggerS } } };
const line: Variants = {
    hidden: { opacity: 0, y: fx.reveal.rise },
    shown: { opacity: 1, y: 0, transition: { duration: fx.reveal.durationS, ease: 'easeOut' } },
};

/**
 * Text of the chosen era (LOT 3, A3), the tab panel of the convector: its
 * title and real paragraphs, links opened in a new tab. The DOM switches at
 * once (screen readers read the new era right away); on screen the text
 * waits for the landing of the jump, then rises in line after line.
 */
const EpochStory: React.FC<EpochStoryProps> = ({ step, panelId, tabId, revealed, animate }) => (
    <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId}
        tabIndex={0}
        className={styles.panel}
        style={{ '--accent': step.accent } as React.CSSProperties}
    >
        <motion.div
            key={step.id}
            variants={container}
            initial={animate ? 'hidden' : false}
            animate={revealed ? 'shown' : 'hidden'}
        >
            <motion.h2 className={styles.title} variants={line}>{step.title}</motion.h2>
            {splitParagraphs(step.content).map((paragraph, index) => (
                <motion.p key={index} className={styles.paragraph} variants={line}>
                    {parseInlineLinks(paragraph).map((segment, part) => (segment.kind === 'link'
                        ? <a key={part} href={segment.href} target="_blank" rel="noopener noreferrer">{segment.text}</a>
                        : <React.Fragment key={part}>{segment.text}</React.Fragment>))}
                </motion.p>
            ))}
        </motion.div>
    </div>
);

export default EpochStory;
