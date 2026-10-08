import React from 'react';
import type { SkillLabels } from '../../../types/models';
import type { LinkedGroup } from '../../../utils/skills';
import { parseEmphasis } from '../../../utils/story';
import SkillBadge, { type BadgeLight } from './SkillBadge';
import styles from './SkillSections.module.scss';

export interface SkillSectionProps {
    group: LinkedGroup;
    labels: SkillLabels;
    lightOf(key: string): BadgeLight;
    /** Key of the pinned badge, if any */
    pinned: string | null;
    onPoint(key: string | null): void;
    onPin(key: string): void;
}

/** One group of skills: its title, its intro (keywords highlighted), its badges. */
const SkillSection: React.FC<SkillSectionProps> = ({ group, labels, lightOf, pinned, onPoint, onPin }) => {
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
                {group.skills.map((skill, index) => (
                    <SkillBadge
                        key={skill.name}
                        skill={skill}
                        light={lightOf(skill.key)}
                        pinned={pinned === skill.key}
                        labels={labels}
                        describedId={`${titleId}-${index}`}
                        onPoint={onPoint}
                        onPin={onPin}
                    />
                ))}
            </ul>
        </section>
    );
};

export default SkillSection;
