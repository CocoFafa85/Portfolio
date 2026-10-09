import React from 'react';
import type { SkillGroup } from '../../../types/models';
import { parseEmphasis } from '../../../utils/story';
import styles from './SkillIntro.module.scss';

export interface SkillIntroProps {
    lead: string;
    /** The groups of the CV: those with an intro give a paragraph, in group order */
    groups: readonly SkillGroup[];
}

/**
 * The text of the Skills page (review of 2026-10-09: one block): the lead,
 * then the intro of each family of technologies, keywords highlighted. The
 * badges of each family sit in the second block (SkillSections).
 */
const SkillIntro: React.FC<SkillIntroProps> = ({ lead, groups }) => (
    <>
        <p className={styles.lead}>{lead}</p>
        {groups.filter((group) => group.intro).map((group) => (
            <p key={group.id} className={styles.paragraph}>
                {parseEmphasis(group.intro ?? '').map((segment, index) => (segment.kind === 'keyword'
                    ? <strong key={index} className={styles.keyword}>{segment.text}</strong>
                    : <React.Fragment key={index}>{segment.text}</React.Fragment>))}
            </p>
        ))}
    </>
);

export default SkillIntro;
