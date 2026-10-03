import React from 'react';
import TimeConvector from '../../components/organisms/TimeConvector/TimeConvector';
import { content } from '../../data/content';
import { motion } from 'motion/react';
import styles from './About.module.scss';
import { usePageMeta } from '../../hooks/usePageMeta';

const About: React.FC = () => {
    usePageMeta('about');
    return (
        <motion.div
            className={styles.aboutPage}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h1 className="glitch-title" data-text={content.about.title}>
                {content.about.title}
            </h1>
            <TimeConvector />
        </motion.div>
    );
};

export default About;
