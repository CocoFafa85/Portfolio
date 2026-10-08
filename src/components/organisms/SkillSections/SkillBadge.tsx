import React from 'react';
import TechIcon from '../../atoms/TechIcon/TechIcon';
import type { SkillLabels } from '../../../types/models';
import type { LinkedSkill } from '../../../utils/skills';
import styles from './SkillBadge.module.scss';

/** Light of a badge: lit (pointed, or used by the pointed project), dimmed (something else is), or at rest. */
export type BadgeLight = 'lit' | 'dim' | 'rest';

export interface SkillBadgeProps {
    skill: LinkedSkill;
    light: BadgeLight;
    /** The badge is pinned (pressed): its projects stay lit */
    pinned: boolean;
    labels: SkillLabels;
    /** Unique id of the hidden description (the same skill sits in two groups) */
    describedId: string;
    onPoint(key: string | null): void;
    onPin(key: string): void;
}

/**
 * A technology (LOT 4, S3): a real button whose name is its visible text,
 * described by the projects that use it (read by screen readers). Pointing at
 * it, or focusing it, lights those projects; pressing it pins them (touch).
 */
const SkillBadge: React.FC<SkillBadgeProps> = React.memo(({ skill, light, pinned, labels, describedId, onPoint, onPin }) => (
    <li className={styles.item}>
        <button
            type="button"
            className={styles.badge}
            data-light={light}
            aria-pressed={pinned}
            aria-describedby={describedId}
            onPointerEnter={(event) => { if (event.pointerType !== 'touch') onPoint(skill.key); }}
            onPointerLeave={(event) => { if (event.pointerType !== 'touch') onPoint(null); }}
            onFocus={() => onPoint(skill.key)}
            onBlur={() => onPoint(null)}
            onClick={() => onPin(skill.key)}
        >
            <TechIcon slug={skill.icon} />
            <span>{skill.name}</span>
            {skill.projects.length > 0 && (
                <span className={styles.leds} aria-hidden="true">
                    {skill.projects.map((project) => <i key={project.id} className={styles.led} />)}
                </span>
            )}
        </button>
        <span id={describedId} className={styles.description}>
            {skill.projects.length > 0 ? `${labels.usedIn} ${skill.projects.map((project) => project.title).join(', ')}` : labels.noProject}
        </span>
    </li>
));

export default SkillBadge;
