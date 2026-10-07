import React from 'react';
import TimeConvector from '../../components/organisms/TimeConvector/TimeConvector';
import { content } from '../../data/content';
import { usePageMeta } from '../../hooks/usePageMeta';
import styles from './About.module.scss';

/**
 * About page, « Qui suis-je ? » (LOT 3). The title keeps the global glitch;
 * its frame is a wrapper, so the glitch slices (pseudo-elements laid over the
 * heading box) line up with the letters. No entrance fade here: PageTravel
 * plays the trips, and the text paints at once on first load (LCP).
 */
const About: React.FC = () => {
    usePageMeta('about');
    return (
        <div className={styles.aboutPage}>
            <div className={styles.titleFrame}>
                <h1 className="glitch-title" data-text={content.about.title}>
                    {content.about.title}
                </h1>
            </div>
            <TimeConvector />
        </div>
    );
};

export default About;
