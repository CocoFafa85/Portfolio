import React from 'react';
import HoloCard from '../../components/organisms/HoloCard/HoloCard';
import SkillIntro from '../../components/organisms/SkillSections/SkillIntro';
import SkillSections from '../../components/organisms/SkillSections/SkillSections';
import { content } from '../../data/content';
import { usePageMeta } from '../../hooks/usePageMeta';
import { linkSkills } from '../../utils/skills';
import styles from './Skills.module.scss';

const { skills } = content;
// Static data: linked once, at load (skills of the CV ↔ projects F4)
const GROUPS = linkSkills(skills.groups, skills.projects);

/**
 * Skills page (LOT 4; two blocks since the review of 2026-10-09): the first
 * holds the title, the lead and the intro of each family, beside the
 * HoloCard; the second holds the projects rail and the badges of each
 * family. No entrance fade: PageTravel plays the trips and the text paints at
 * once (LCP).
 */
const Skills: React.FC = () => {
    usePageMeta('skills');
    return (
        <div className={styles.page}>
            <div className={styles.top}>
                <header className={styles.intro}>
                    <h1 className="glitch-title" data-text={skills.title}>{skills.title}</h1>
                    <SkillIntro lead={skills.lead} groups={skills.groups} />
                </header>
                <div className={styles.card}>
                    <HoloCard />
                </div>
            </div>
            <SkillSections groups={GROUPS} projects={skills.projects} labels={skills.labels} />
        </div>
    );
};

export default Skills;
