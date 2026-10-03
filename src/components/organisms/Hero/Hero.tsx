import React from 'react';
import { motion, Variants } from 'motion/react';
import styles from './Hero.module.scss';

interface HeroProps {
    title: string;
    subtitle: string;
}

const letterVariants: Variants = {
    hidden: {
        opacity: 0,
        z: 500, // Come from "screen"
        scale: 3,
        filter: "blur(10px)"
    },
    visible: {
        opacity: 1,
        z: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { type: "spring", stiffness: 100, damping: 20 }
    }
};

const subtitleVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { delay: 1.5, duration: 0.8 }
    }
};

const Hero: React.FC<HeroProps> = ({ title, subtitle }) => {
    // Split title into characters for individual animation
    const letters = title.split('');

    return (
        <section className={styles.heroContainer}>
            <motion.h1
                className={styles.title}
                aria-label={title}
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.08, delayChildren: 0.5 }}
            >
                {/* Letters are visual only: screen readers get the whole title via aria-label */}
                {letters.map((char, index) => (
                    <motion.span key={index} aria-hidden="true" variants={letterVariants} style={{ display: 'inline-block', minWidth: char === ' ' ? '0.5em' : 'auto' }}>
                        {char}
                    </motion.span>
                ))}
            </motion.h1>

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
