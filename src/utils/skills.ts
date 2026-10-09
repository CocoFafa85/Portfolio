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

/** Id of the rail entry gathering the skills no public project uses (review of 2026-10-09) */
export const PROFESSIONAL_ID = 'professional';

/** Matching key of a skill name or a project tag: case, accents and spacing ignored. */
export function normalizeTag(tag: string): string {
    return tag
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

/** Keys a project tag may use for a skill: its own name, then its aliases (Android Studio → IDE). */
function namesOf(skill: SkillEntry): Set<string> {
    return new Set([skill.name, ...(skill.aliases ?? [])].map(normalizeTag));
}

/**
 * Links every skill to the projects whose tags name it (or one of its
 * aliases), keeping the order of the groups, of their skills and of the
 * projects. Pure: the data stays in content.ts (skills from the CV, projects
 * from F4).
 */
export function linkSkills(groups: readonly SkillGroup[], projects: readonly ProjectRef[]): LinkedGroup[] {
    const tagged = projects.map((project) => ({ project, tags: new Set(project.tags.map(normalizeTag)) }));
    return groups.map(({ skills, ...group }) => ({
        ...group,
        skills: skills.map((skill) => {
            const names = [...namesOf(skill)];
            const used = tagged.filter(({ tags }) => names.some((name) => tags.has(name))).map(({ project }) => project);
            return { ...skill, key: normalizeTag(skill.name), projects: used };
        }),
    }));
}

/** Alias tag → key of its skill, for every skill that has aliases. */
export function skillAliases(groups: readonly SkillGroup[]): Map<string, string> {
    const aliases = new Map<string, string>();
    for (const skill of groups.flatMap((group) => group.skills)) {
        for (const alias of skill.aliases ?? []) aliases.set(normalizeTag(alias), normalizeTag(skill.name));
    }
    return aliases;
}

/** Keys of the skills a project uses (lights its badges when the project is pointed at). */
export function skillKeysOf(project: ProjectRef, aliases: ReadonlyMap<string, string> = new Map()): Set<string> {
    return new Set(project.tags.map(normalizeTag).map((tag) => aliases.get(tag) ?? tag));
}

/**
 * The rail of the Skills page (review of 2026-10-09): the projects, then a
 * "Professionnel" entry tagged with every skill none of them uses, once each,
 * in group order — every badge then lights at least one entry.
 */
export function withProfessional(groups: readonly SkillGroup[], projects: readonly ProjectRef[], title: string): ProjectRef[] {
    const unused = new Map<string, string>();
    for (const skill of linkSkills(groups, projects).flatMap((group) => group.skills)) {
        if (skill.projects.length === 0 && !unused.has(skill.key)) unused.set(skill.key, skill.name);
    }
    return [...projects, { id: PROFESSIONAL_ID, title, tags: [...unused.values()] }];
}
