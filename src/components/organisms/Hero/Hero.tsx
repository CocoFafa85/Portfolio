import React from 'react';
import { motion, Variants } from 'motion/react';
import DecodeTitle from '../../molecules/DecodeTitle/DecodeTitle';
import styles from './Hero.module.scss';

export interface HeroProps {
    title: string;
    subtitle: string;
}

const subtitleVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { delay: 1.5, duration: 0.8 }
    }
};

/** Home heading block: decoded neon title (H1) and subtitle. */
const Hero: React.FC<HeroProps> = ({ title, subtitle }) => {
    return (
        <section className={styles.heroContainer}>
            <DecodeTitle text={title} className={styles.title} />

            <motion.p
                className={styles.subtitle}
                variants={subtitleVariants}
                initial="hidden"
                animate="visible"
            >
                {subtitle}
            </motion.p>
        </section>
    );
};

export default Hero;
