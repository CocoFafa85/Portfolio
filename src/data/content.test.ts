import { describe, expect, it } from 'vitest';
import { parseLocalDateTime } from '../utils/timeCircuits/time';
import { content } from './content';
import { skillIcons } from './generated/skillIcons';
import { linkSkills, normalizeTag, withProfessional } from '../utils/skills';
import { isInProgress, withDetails } from '../utils/projects';
import { projectDetails } from './projectDetails';

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

describe('projects (F4, F5, LOT 5)', () => {
    it('lists the five projects once, in the validated order, without Site IFTO nor Démineur 2.0', () => {
        // Arrange / Act
        const titles = content.projects.list.map((project) => project.title);

        // Assert
        expect(titles).toEqual(['MemoryGame', 'First Portfolio', 'SolarSystem', 'SoulSweeper', 'PouceStop']);
        expect(new Set(content.projects.list.map((project) => project.id)).size).toBe(5);
    });

    it('gives every project of the list its details, and no details to another', () => {
        // Arrange
        const ids = content.projects.list.map((project) => project.id);

        // Act
        const detailed = Object.keys(projectDetails);

        // Assert
        expect(detailed).toEqual(ids);
    });

    it('marks SoulSweeper alone in progress, released in 2026, in C# and Unity', () => {
        // Arrange / Act
        const inProgress = content.projects.list.filter(isInProgress);

        // Assert
        expect(inProgress.map((project) => [project.title, project.year, project.tags])).toEqual([['SoulSweeper', '2026', ['C#', 'Unity']]]);
    });

    it('links a demo and a repository for the finished web projects only (F5: none for SoulSweeper)', () => {
        // Arrange
        const cards = withDetails(content.projects.list, projectDetails);

        // Act
        const linked = cards.filter((card) => 'demoLink' in card && 'repoLink' in card).map((card) => card.id);

        // Assert
        expect(linked).toEqual(['memory', 'first-portfolio', 'solar']);
    });

    it('keeps the validated polish: one pitch and at least one goal per project, pitches as sentences', () => {
        // Arrange
        const cards = withDetails(content.projects.list, projectDetails);

        // Act
        const written = cards.filter((card) => !card.pitch.startsWith('['));

        // Assert
        expect(cards.every((card) => card.goals.length > 0 && card.team.length > 0)).toBe(true);
        expect(written.every((card) => card.pitch.endsWith('.'))).toBe(true);
    });
});

describe('projects rail of Skills (review of 2026-10-09)', () => {
    it('reads the list of the Projects page: same ids, same titles, same order, then "Professionnel" (CÂBLAGE, LOT 5)', () => {
        // Arrange
        const { groups, labels } = content.skills;
        const cards = withDetails(content.projects.list, projectDetails);

        // Act
        const rail = withProfessional(groups, content.projects.list, labels.professional);

        // Assert
        expect(rail.slice(0, -1).map((entry) => [entry.id, entry.title])).toEqual(cards.map((card) => [card.id, card.title]));
        expect(rail.map((entry) => entry.title)).toEqual(['MemoryGame', 'First Portfolio', 'SolarSystem', 'SoulSweeper', 'PouceStop', labels.professional]);
    });

    it('resolves every alias to a project tag, never to another skill name', () => {
        // Arrange
        const skills = content.skills.groups.flatMap((group) => group.skills);
        const names = new Set(skills.map((skill) => normalizeTag(skill.name)));
        const tags = new Set(content.projects.list.flatMap((project) => project.tags).map(normalizeTag));

        // Act
        const aliases = skills.flatMap((skill) => skill.aliases ?? []).map(normalizeTag);

        // Assert
        expect(aliases).toEqual(['android studio']);
        aliases.forEach((alias) => { expect(tags.has(alias)).toBe(true); expect(names.has(alias)).toBe(false); });
    });

    it('lights at least one rail entry from every badge once "Professionnel" closes the rail', () => {
        // Arrange
        const { groups, labels } = content.skills;
        const projects = content.projects.list;

        // Act
        const linked = linkSkills(groups, withProfessional(groups, projects, labels.professional)).flatMap((group) => group.skills);

        // Assert
        expect(linked.filter((skill) => skill.projects.length === 0)).toEqual([]);
        expect(linked.find((skill) => skill.name === 'Kotlin')?.projects.map((p) => p.title)).toEqual(['PouceStop']);
        expect(linked.find((skill) => skill.name === 'IDE classiques & agentiques')?.projects.map((p) => p.title)).toEqual(['PouceStop']);
        expect(linked.find((skill) => skill.name === 'React')?.projects.map((p) => p.title)).toEqual([labels.professional]);
    });
});
