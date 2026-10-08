import React from 'react';
import HoloCard from '../../components/organisms/HoloCard/HoloCard';
import SkillSections from '../../components/organisms/SkillSections/SkillSections';
import { content } from '../../data/content';
import { usePageMeta } from '../../hooks/usePageMeta';
import { linkSkills } from '../../utils/skills';
import styles from './Skills.module.scss';

const { skills } = content;
// Static data: linked once, at load (skills of the CV ↔ projects F4)
const GROUPS = linkSkills(skills.groups, skills.projects);

/**
 * Skills page (LOT 4), layout B "merged sections": the title, the lead and
 * the HoloCard, then each group of skills under its own short intro. No
 * entrance fade: PageTravel plays the trips and the text paints at once (LCP).
 */
const Skills: React.FC = () => {
    usePageMeta('skills');
    return (
        <div className={styles.page}>
            <header className={styles.hero}>
                <div className={styles.heading}>
                    <div className={styles.titleFrame}>
                        <h1 className="glitch-title" data-text={skills.title}>{skills.title}</h1>
                    </div>
                    <p className={styles.lead}>{skills.lead}</p>
                </div>
                <div className={styles.card}>
                    <HoloCard />
                </div>
            </header>
            <SkillSections groups={GROUPS} projects={skills.projects} />
        </div>
    );
};

export default Skills;
