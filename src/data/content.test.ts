import { describe, expect, it } from 'vitest';
import { parseLocalDateTime } from '../utils/timeCircuits/time';
import { content } from './content';
import { skillIcons } from './generated/skillIcons';
import { linkSkills, normalizeTag, withProfessional } from '../utils/skills';

describe('content.about (LOT 3, data F1)', () => {
    it('gives each row of the time circuits one era, each era once', () => {
        // Arrange
        const eras = content.about.timeline.map((step) => step.id);

        // Act
        const rows = [...content.about.rowOrder].sort();

        // Assert
        expect(rows).toEqual([...eras].sort());
        expect(new Set(rows).size).toBe(3);
    });

    it('holds valid dates: past and future fixed, the present on the clock, a valid fallback', () => {
        // Arrange
        const dates = Object.fromEntries(content.about.timeline.map((step) => [step.id, step.date]));

        // Act
        const past = parseLocalDateTime(dates.past ?? '');
        const future = parseLocalDateTime(dates.future ?? '');
        const fallback = parseLocalDateTime(content.about.presentFallback);

        // Assert
        expect(past?.getFullYear()).toBe(2015);
        expect(future?.getFullYear()).toBe(2035);
        expect(dates.present).toBeNull();
        expect(fallback?.getFullYear()).toBe(2026);
    });

    it('names the twelve months for the month display, three letters each', () => {
        // Arrange / Act
        const { months } = content.decor.timeCircuits;

        // Assert
        expect(months).toHaveLength(12);
        expect(months.every((month) => /^[A-Z]{3}$/.test(month))).toBe(true);
    });
});

describe('skills of the CV (F3, LOT 4)', () => {
    it('lists the 54 entries of the CV in 6 groups, without any level', () => {
        // Arrange
        const { groups } = content.skills;

        // Act
        const entries = groups.flatMap((group) => group.skills);

        // Assert
        expect(groups.map((group) => group.id)).toEqual(['front', 'back', 'game', 'data', 'devops', 'tools']);
        expect(entries).toHaveLength(54);
        entries.forEach((entry) => expect(Object.keys(entry).filter((key) => key !== 'aliases').sort()).toEqual(['icon', 'name']));
    });

    it('has a generated Simple Icons logo for every icon slug it names', () => {
        // Arrange
        const slugs = content.skills.groups.flatMap((group) => group.skills).map((skill) => skill.icon).filter((icon) => icon !== null);

        // Act
        const missing = slugs.filter((slug) => !skillIcons[slug]);

        // Assert
        expect(missing).toEqual([]);
    });

    it('never names a skill twice in one group', () => {
        // Arrange
        const { groups } = content.skills;

        // Act
        const duplicates = groups.filter((group) => new Set(group.skills.map((skill) => skill.name)).size !== group.skills.length);

        // Assert
        expect(duplicates).toEqual([]);
    });
});

describe('projects rail of Skills (review of 2026-10-09)', () => {
    it('lists the projects in the reviewed order, PouceStop fifth', () => {
        // Arrange / Act
        const titles = content.skills.projects.map((project) => project.title);

        // Assert
        expect(titles).toEqual(['MemoryGame', 'First Portfolio', 'SolarSystem', 'SoulSweeper', 'PouceStop']);
    });

    it('resolves every alias to a project tag, never to another skill name', () => {
        // Arrange
        const skills = content.skills.groups.flatMap((group) => group.skills);
        const names = new Set(skills.map((skill) => normalizeTag(skill.name)));
        const tags = new Set(content.skills.projects.flatMap((project) => project.tags).map(normalizeTag));

        // Act
        const aliases = skills.flatMap((skill) => skill.aliases ?? []).map(normalizeTag);

        // Assert
        expect(aliases).toEqual(['android studio']);
        aliases.forEach((alias) => { expect(tags.has(alias)).toBe(true); expect(names.has(alias)).toBe(false); });
    });

    it('lights at least one rail entry from every badge once "Professionnel" closes the rail', () => {
        // Arrange
        const { groups, projects, labels } = content.skills;

        // Act
        const linked = linkSkills(groups, withProfessional(groups, projects, labels.professional)).flatMap((group) => group.skills);

        // Assert
        expect(linked.filter((skill) => skill.projects.length === 0)).toEqual([]);
        expect(linked.find((skill) => skill.name === 'Kotlin')?.projects.map((p) => p.title)).toEqual(['PouceStop']);
        expect(linked.find((skill) => skill.name === 'IDE classiques & agentiques')?.projects.map((p) => p.title)).toEqual(['PouceStop']);
        expect(linked.find((skill) => skill.name === 'React')?.projects.map((p) => p.title)).toEqual([labels.professional]);
    });
});
