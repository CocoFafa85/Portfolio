import React from 'react';
import styles from './Skills.module.scss';
import { content } from '../../data/content';
import SkillGroup from '../../components/molecules/SkillGroup/SkillGroup';
import HoloCard from '../../components/organisms/HoloCard/HoloCard';
import { motion } from 'motion/react';
import { usePageMeta } from '../../hooks/usePageMeta';

const Skills: React.FC = () => {
    usePageMeta('skills');
    return (
        <div className={styles.skillsPage}>
            <div className={styles.heroSection}>
                <motion.div
                    className={styles.intro}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="glitch-title" data-text={content.skills.title}>{content.skills.title}</h1>
                    {content.skills.intro.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </motion.div>

                <motion.div
                    className={styles.holoCardWrapper}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <HoloCard />
                </motion.div>
            </div>

            <div className={styles.grid}>
                {content.skills.categories.map((category, index) => (
                    <SkillGroup
                        key={category.id}
                        category={category}
                        delay={0.2 + (index * 0.2)}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
};

export default Skills;
