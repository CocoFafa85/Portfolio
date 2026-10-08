import React from 'react';
import TimeConvector from '../../components/organisms/TimeConvector/TimeConvector';
import { usePageMeta } from '../../hooks/usePageMeta';
import styles from './About.module.scss';

/**
 * About page (LOT 3). No page title since the review of 2026-10-08: the
 * chosen era's title is the page's h1, and the console and the text take
 * the room. No entrance fade here: PageTravel plays the trips, and the text
 * paints at once on first load (LCP).
 */
const About: React.FC = () => {
    usePageMeta('about');
    return (
        <div className={styles.aboutPage}>
            <TimeConvector />
        </div>
    );
};

export default About;
