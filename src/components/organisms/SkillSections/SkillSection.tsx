import React from 'react';
import type { LinkedGroup } from '../../../utils/skills';
import { parseEmphasis } from '../../../utils/story';
import styles from './SkillSections.module.scss';

export interface SkillSectionProps {
    group: LinkedGroup;
}

/** One group of skills: its title, its intro (keywords highlighted), its skills. */
const SkillSection: React.FC<SkillSectionProps> = ({ group }) => {
    const titleId = `skills-${group.id}`;
    return (
        <section className={styles.section} aria-labelledby={titleId}>
            <h2 id={titleId} className={styles.title}>{group.title}</h2>
            {group.intro && (
                <p className={styles.intro}>
                    {parseEmphasis(group.intro).map((segment, index) => (segment.kind === 'keyword'
                        ? <strong key={index} className={styles.keyword}>{segment.text}</strong>
                        : <React.Fragment key={index}>{segment.text}</React.Fragment>))}
                </p>
            )}
            <ul className={styles.badges}>
                {group.skills.map((skill) => <li key={skill.name} className={styles.badge}>{skill.name}</li>)}
            </ul>
        </section>
    );
};

export default SkillSection;
