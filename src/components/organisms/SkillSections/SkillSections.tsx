import React, { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react';
import { skillEffects as fx } from '../../../data/effects';
import type { ProjectRef, SkillLabels } from '../../../types/models';
import { skillAliases, skillKeysOf, type LinkedGroup } from '../../../utils/skills';
import NeonFrame from '../../atoms/NeonFrame/NeonFrame';
import { SkillIconsContext, useSkillIcons } from '../../atoms/TechIcon/skillIconsStore';
import type { BadgeLight } from './SkillBadge';
import ProjectRail from './ProjectRail';
import SkillSection from './SkillSection';
import styles from './SkillSections.module.scss';

export interface SkillSectionsProps {
    /** Groups of the CV, each skill linked to its projects (linkSkills) */
    groups: LinkedGroup[];
    /** Projects F4 then "Professionnel", in rail order */
    projects: ProjectRef[];
    labels: SkillLabels;
}

type Pointed = { skill: string } | { project: string } | null;

const VARS = { '--skill-dim': fx.dimOpacity, '--skill-ms': `${fx.transitionMs}ms`, '--skill-lift': `${fx.lift}px` } as CSSProperties;

/**
 * The skills of the Skills page (LOT 4, badges B "projects lit"; the second
 * block since the review of 2026-10-09): the projects rail, then the badges
 * of each family (their intros are in the first block, SkillIntro).
 * Pointing at (or focusing) a badge lights the projects that use it;
 * pointing at a project lights its badges; pressing a badge pins its
 * projects (the touch path). Everything else dims.
 */
const SkillSections: React.FC<SkillSectionsProps> = ({ groups, projects, labels }) => {
    const [pointed, setPointed] = useState<Pointed>(null);
    const [pinned, setPinned] = useState<string | null>(null);
    const badgesRef = useRef<HTMLDivElement>(null);
    const icons = useSkillIcons(badgesRef);
    const onPointSkill = useCallback((key: string | null) => setPointed(key ? { skill: key } : null), []);
    const onPointProject = useCallback((id: string | null) => setPointed(id ? { project: id } : null), []);
    const onPin = useCallback((key: string) => setPinned((current) => (current === key ? null : key)), []);

    const skills = useMemo(() => new Map(groups.flatMap((group) => group.skills).map((skill) => [skill.key, skill])), [groups]);
    const aliases = useMemo(() => skillAliases(groups), [groups]);
    const skillKey = pointed && 'skill' in pointed ? pointed.skill : pointed ? null : pinned;
    const project = pointed && 'project' in pointed ? projects.find((p) => p.id === pointed.project) ?? null : null;

    const { litProjects, litSkills, note } = useMemo(() => {
        if (project) {
            return { litProjects: new Set([project.id]), litSkills: skillKeysOf(project, aliases), note: project.title };
        }
        const skill = skillKey ? skills.get(skillKey) : undefined;
        if (!skill) return { litProjects: null, litSkills: null, note: null };
        const used = skill.projects.map((p) => p.title).join(' · ');
        return {
            litProjects: new Set(skill.projects.map((p) => p.id)),
            litSkills: new Set([skill.key]),
            note: `${skill.name} — ${used ? `${labels.usedIn} ${used}` : labels.noProject}`,
        };
    }, [project, skillKey, skills, aliases, labels]);

    const lightOf = useCallback((key: string): BadgeLight => (litSkills ? (litSkills.has(key) ? 'lit' : 'dim') : 'rest'), [litSkills]);

    return (
        <SkillIconsContext.Provider value={icons}>
            <div ref={badgesRef} className={styles.sections} style={VARS}>
                <NeonFrame />
                <ProjectRail projects={projects} labels={labels} lit={litProjects} note={note} onPoint={onPointProject} />
                {groups.map((group) => (
                    <SkillSection key={group.id} group={group} labels={labels} lightOf={lightOf} pinned={pinned}
                        onPoint={onPointSkill} onPin={onPin} />
                ))}
            </div>
        </SkillIconsContext.Provider>
    );
};

export default SkillSections;
