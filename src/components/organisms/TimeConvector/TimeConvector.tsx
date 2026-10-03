import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { content } from '../../../data/content';
import { TimeState } from '../../../types/models';
import styles from './TimeConvector.module.scss';

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
                    >
                        {match[1]}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <div className={styles.convectorContainer}>
            <nav className={styles.timelineNav}>
                {content.about.timeline.map((step) => (
                    <button
                        key={step.id}
                        className={`${styles.navButton} ${activeState === step.id ? styles.active : ''}`}
                        onClick={() => handleSwitch(step.id)}
                    >
                        {step.label.toUpperCase()}
                    </button>
                ))}
            </nav>

            <div
                className={styles.contentDisplay}
                style={{ '--title-color': currentData?.accent } as React.CSSProperties}
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
