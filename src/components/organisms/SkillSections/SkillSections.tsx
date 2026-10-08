import React from 'react';
import type { ProjectRef } from '../../../types/models';
import type { LinkedGroup } from '../../../utils/skills';
import SkillSection from './SkillSection';
import styles from './SkillSections.module.scss';

export interface SkillSectionsProps {
    /** Groups of the CV, each skill linked to its projects (linkSkills) */
    groups: LinkedGroup[];
    /** Projects F4, in rail order */
    projects: ProjectRef[];
}

/**
 * The skills of the Skills page (LOT 4, layout B "merged sections"): each
 * group under its own short intro, in the author's voice.
 */
const SkillSections: React.FC<SkillSectionsProps> = ({ groups }) => (
    <div className={styles.sections}>
        {groups.map((group) => <SkillSection key={group.id} group={group} />)}
    </div>
);

export default SkillSections;
