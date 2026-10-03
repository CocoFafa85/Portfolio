import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { content } from '../../../data/content';
import styles from './TimeConvector.module.scss';

// Assuming AboutContent interface is accessible via content.ts types, 
// but we just need to access content.about.timeline.

type TimeState = 'past' | 'present' | 'future';

const TimeConvector: React.FC = () => {
    const [activeState, setActiveState] = useState<TimeState>('present');

    // Find the data for the current state
    const currentData = content.about.timeline.find(item => item.id === activeState);

    const handleSwitch = (state: TimeState) => {
        if (state !== activeState) {
            setActiveState(state);
        }
    };

    const glitchVariants = {
        initial: { x: -100, opacity: 0, skewX: 20 },
        animate: { x: 0, opacity: 1, skewX: 0 },
        exit: { x: 100, opacity: 0, skewX: -20 },
        glitch: {
            x: [0, -5, 5, -5, 0],
            textShadow: [
                "2px 0 0 red, -2px 0 0 blue",
                "-2px 0 0 red, 2px 0 0 blue",
                "0 0 0 red, 0 0 0 blue"
            ],
            transition: { duration: 0.2 }
        }
    };

    const parseContent = (text: string | undefined) => {
        if (!text) return null;

        // Regex to find [text](url)
        const parts = text.split(/(\[.*?\]\(.*?\))/g);

        return parts.map((part, index) => {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
                return (
                    <a
                        key={index}
                        href={match[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#00f3ff', textDecoration: 'underline' }}
                    >
                        {match[1]}
                    </a>
                );
            }
            return part;
        });
    };

    const titleColorMap: Record<TimeState, string> = {
        past: '#39ff14',    // Lime Green
        present: '#bc13fe', // Violet
        future: '#ff00ff',  // Neon Pink
    };

    return (
        <div className={styles.convectorContainer}>
            <nav className={styles.timelineNav}>
                {(['past', 'present', 'future'] as TimeState[]).map((state) => {
                    const labels: Record<TimeState, string> = {
                        past: 'passé',
                        present: 'présent',
                        future: 'futur',
                    };
                    return (
                        <button
                            key={state}
                            className={`${styles.navButton} ${activeState === state ? styles.active : ''}`}
                            onClick={() => handleSwitch(state)}
                        >
                            {labels[state].toUpperCase()}
                        </button>
                    );
                })}
            </nav>

            <div
                className={styles.contentDisplay}
                style={{ '--title-color': titleColorMap[activeState] } as React.CSSProperties}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeState}
                        variants={glitchVariants}
                        initial="initial"
                        animate={["animate", "glitch"]}
                        exit="exit"
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                        <h2>{currentData?.title}</h2>
                        <p>{parseContent(currentData?.content)}</p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TimeConvector;
