import React from 'react';
import TimeConvector from '../../components/organisms/TimeConvector/TimeConvector';
import { motion } from 'motion/react';
import styles from './About.module.scss';

const About: React.FC = () => {
    return (
        <motion.div
            className={styles.aboutPage}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h1 className="glitch-title" data-text="Evolution">
                Evolution
            </h1>
            <TimeConvector />
        </motion.div>
    );
};

export default About;
