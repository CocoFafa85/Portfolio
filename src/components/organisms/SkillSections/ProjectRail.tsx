import React from 'react';
import type { ProjectRef, SkillLabels } from '../../../types/models';
import { useDevice } from '../../../hooks/useDevice';
import { PROFESSIONAL_ID } from '../../../utils/skills';
import styles from './ProjectRail.module.scss';

export interface ProjectRailProps {
    projects: ProjectRef[];
    labels: SkillLabels;
    /** Ids of the projects to light up; null while no badge is pointed */
    lit: ReadonlySet<string> | null;
    /** Name and projects of the pointed badge, shown above the cards (null: the hint) */
    note: string | null;
    /** Id of the pinned project, if any */
    pinned: string | null;
    onPoint(projectId: string | null): void;
    onPin(projectId: string): void;
}

/**
 * The F4 projects (LOT 4, S3, decision B "projects lit"), then
 * "Professionnel" for the skills no public project uses (review of
 * 2026-10-09, drawn apart): name only, big enough to invite the pointer. A pointed badge lights its projects and dims
 * the others; pointing at a project (mouse) or focusing it (keyboard) lights its badges, pressing it
 * pins them (the finger, LOT 6, D5): each entry is a real button.
 */
const ProjectRail: React.FC<ProjectRailProps> = ({ projects, labels, lit, note, pinned, onPoint, onPin }) => {
    const { touch } = useDevice();
    return (
    <div className={styles.rail}>
        <div className={styles.head}>
            <h2 className={styles.title}>{labels.railTitle}</h2>
            <p className={styles.note} aria-hidden="true">{note ?? (touch ? labels.railHintTouch : labels.railHint)}</p>
        </div>
        <ul className={styles.cards}>
            {projects.map((project) => (
                <li key={project.id}>
                    <button
                        type="button"
                        className={styles.card}
                        data-light={lit ? (lit.has(project.id) ? 'lit' : 'dim') : 'rest'}
                        data-kind={project.id === PROFESSIONAL_ID ? 'professional' : undefined}
                        aria-pressed={pinned === project.id}
                        onPointerEnter={(event) => { if (event.pointerType !== 'touch') onPoint(project.id); }}
                        onPointerLeave={(event) => { if (event.pointerType !== 'touch') onPoint(null); }}
                        // Keyboard focus only: a tapped button keeps the focus, which would hold its light after a second tap unpins it
                        onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) onPoint(project.id); }}
                        onBlur={() => onPoint(null)}
                        onClick={() => onPin(project.id)}
                    >
                        {project.title}
                    </button>
                </li>
            ))}
        </ul>
    </div>
    );
};

export default ProjectRail;
