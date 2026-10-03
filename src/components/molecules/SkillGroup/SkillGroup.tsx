import React from 'react';
import styles from './SkillGroup.module.scss';
import { SkillCategory } from '../../../types/models';
import { motion } from 'motion/react';

interface SkillGroupProps {
    category: SkillCategory;
    delay?: number;
    index: number;
}

const SkillGroup: React.FC<SkillGroupProps> = ({ category, delay = 0, index }) => {
    return (
        <motion.div
            className={styles.skillGroup}
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 1,
                y: 0,
                borderColor: ["rgba(255, 0, 128, 0.2)", "rgba(255, 0, 128, 0.8)", "rgba(255, 0, 128, 0.2)"],
                boxShadow: ["0 0 0px rgba(255, 0, 128, 0)", "0 0 15px rgba(255, 0, 128, 0.3)", "0 0 0px rgba(255, 0, 128, 0)"]
            }}
            transition={{
                opacity: { duration: 0.5, delay },
                y: { duration: 0.5, delay },
                borderColor: { duration: 2, repeat: Infinity, delay: index * 0.5 },
                boxShadow: { duration: 2, repeat: Infinity, delay: index * 0.5 }
            }}
        >
            <h3 className={styles.categoryTitle}>{category.title}</h3>
            <div className={styles.skillList}>
                {category.skills.map((skill, index) => (
                    <div key={skill.name} className={styles.skillItem}>
                        <div className={styles.skillHeader}>
                            <span>{skill.name}</span>
                            <span className={styles.skillLevel}>{skill.level}%</span>
                        </div>
                        <div className={styles.progressBarContainer}>
                            <motion.div
                                className={styles.progressBarFill}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${skill.level}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: delay + index * 0.1 }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default SkillGroup;
