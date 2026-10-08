import type { ProjectRef, SkillEntry, SkillGroup } from '../types/models';

/** A skill with the projects that use it (no level, no percentage: LOT 4). */
export interface LinkedSkill extends SkillEntry {
    /** Normalised name: the same technology in two groups (C#) shares it */
    key: string;
    projects: ProjectRef[];
}

export interface LinkedGroup extends Omit<SkillGroup, 'skills'> {
    skills: LinkedSkill[];
}

/** Matching key of a skill name or a project tag: case, accents and spacing ignored. */
export function normalizeTag(tag: string): string {
    return tag
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Links every skill to the projects whose tags name it, keeping the order of
 * the groups, of their skills and of the projects. Pure: the data stays in
 * content.ts (skills from the CV, projects from F4).
 */
export function linkSkills(groups: readonly SkillGroup[], projects: readonly ProjectRef[]): LinkedGroup[] {
    const byTag = new Map<string, ProjectRef[]>();
    for (const project of projects) {
        for (const tag of project.tags) {
            const key = normalizeTag(tag);
            const list = byTag.get(key) ?? [];
            if (!list.includes(project)) list.push(project);
            byTag.set(key, list);
        }
    }
    return groups.map(({ skills, ...group }) => ({
        ...group,
        skills: skills.map((skill) => {
            const key = normalizeTag(skill.name);
            return { ...skill, key, projects: byTag.get(key) ?? [] };
        }),
    }));
}

/** Keys of the skills a project uses (lights its badges when the project is pointed at). */
export function skillKeysOf(project: ProjectRef): Set<string> {
    return new Set(project.tags.map(normalizeTag));
}
