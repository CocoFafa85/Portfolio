import React from 'react';
import DecodeTitle from '../../molecules/DecodeTitle/DecodeTitle';
import WordDecoder from '../../molecules/WordDecoder/WordDecoder';
import styles from './Hero.module.scss';

export interface HeroProps {
    title: string;
    /** Subtitle roles, decoded one into the next */
    roles: readonly string[];
    rolesSeparator: string;
}

/** Home heading block: decoded neon title (H1) and rotating roles (H2). */
const Hero: React.FC<HeroProps> = ({ title, roles, rolesSeparator }) => {
    return (
        <section className={styles.heroContainer}>
            <DecodeTitle text={title} className={styles.title} />
            <WordDecoder words={roles} separator={rolesSeparator} />
        </section>
    );
};

export default Hero;
