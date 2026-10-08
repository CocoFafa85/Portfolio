import { describe, expect, it } from 'vitest';
import type { ProjectRef, SkillGroup } from '../types/models';
import { linkSkills, normalizeTag, skillKeysOf } from './skills';

const memory: ProjectRef = { id: 'memory', title: 'MemoryGame', tags: ['JavaScript', 'CSS'] };
const solar: ProjectRef = { id: 'solar', title: 'SolarSystem', tags: ['JavaScript', 'Three.js', 'CSS'] };
const soul: ProjectRef = { id: 'soulsweeper', title: 'SoulSweeper', tags: ['C#', 'Unity'] };

const groups: SkillGroup[] = [
    { id: 'front', title: 'Front-end', intro: 'Texte', skills: [{ name: 'JavaScript', icon: 'javascript' }, { name: 'React', icon: 'react' }] },
    { id: 'back', title: 'Back-end', skills: [{ name: 'C#', icon: null }] },
    { id: 'game', title: 'Jeu vidéo', skills: [{ name: 'c#', icon: null }, { name: 'Unity', icon: 'unity' }] },
];

describe('normalizeTag', () => {
    it('ignores case, accents and extra spaces', () => {
        // Arrange
        const tags = ['  Three.JS ', 'Cycle  en V', 'Méthode'];

        // Act
        const keys = tags.map(normalizeTag);

        // Assert
        expect(keys).toEqual(['three.js', 'cycle en v', 'methode']);
    });
});

describe('linkSkills', () => {
    it('links each skill to the projects tagged with it, in project order', () => {
        // Arrange
        const projects = [memory, solar, soul];

        // Act
        const linked = linkSkills(groups, projects);

        // Assert
        expect(linked[0].skills[0].projects.map((p) => p.title)).toEqual(['MemoryGame', 'SolarSystem']);
        expect(linked[0].skills[1].projects).toEqual([]);
    });

    it('gives the same key and projects to one technology listed in two groups', () => {
        // Arrange
        const projects = [memory, solar, soul];

        // Act
        const [, back, game] = linkSkills(groups, projects);

        // Assert
        expect(back.skills[0].key).toBe(game.skills[0].key);
        expect(game.skills[0].projects).toEqual([soul]);
    });

    it('keeps groups, their texts and skill order, without any level', () => {
        // Arrange
        const projects = [memory];

        // Act
        const linked = linkSkills(groups, projects);

        // Assert
        expect(linked.map((g) => [g.id, g.title, g.intro])).toEqual([['front', 'Front-end', 'Texte'], ['back', 'Back-end', undefined], ['game', 'Jeu vidéo', undefined]]);
        expect(Object.keys(linked[0].skills[0]).sort()).toEqual(['icon', 'key', 'name', 'projects']);
    });

    it('lists a project once even when a tag repeats', () => {
        // Arrange
        const twice: ProjectRef = { id: 'x', title: 'X', tags: ['Unity', 'unity'] };

        // Act
        const linked = linkSkills(groups, [twice]);

        // Assert
        expect(linked[2].skills[1].projects).toEqual([twice]);
    });
});

describe('skillKeysOf', () => {
    it('returns the normalised keys of a project tags', () => {
        // Arrange
        const project = solar;

        // Act
        const keys = skillKeysOf(project);

        // Assert
        expect([...keys]).toEqual(['javascript', 'three.js', 'css']);
    });
});
