import React from 'react';
import type { ProjectRef, SkillLabels } from '../../../types/models';
import styles from './ProjectRail.module.scss';

export interface ProjectRailProps {
    projects: ProjectRef[];
    labels: SkillLabels;
    /** Ids of the projects to light up; null while no badge is pointed */
    lit: ReadonlySet<string> | null;
    /** Name and projects of the pointed badge, shown above the cards (null: the hint) */
    note: string | null;
    onPoint(projectId: string | null): void;
}

/**
 * The F4 projects (LOT 4, S3, decision B "projects lit"): name only, big
 * enough to invite the pointer. A pointed badge lights its projects and dims
 * the others; pointing at a project lights its badges (mouse only: keyboard
 * and screen reader users get the same link from each badge's description).
 */
const ProjectRail: React.FC<ProjectRailProps> = ({ projects, labels, lit, note, onPoint }) => (
    <div className={styles.rail}>
        <div className={styles.head}>
            <h2 className={styles.title}>{labels.railTitle}</h2>
            <p className={styles.note} aria-hidden="true">{note ?? labels.railHint}</p>
        </div>
        <ul className={styles.cards}>
            {projects.map((project) => (
                <li
                    key={project.id}
                    className={styles.card}
                    data-light={lit ? (lit.has(project.id) ? 'lit' : 'dim') : 'rest'}
                    onPointerEnter={(event) => { if (event.pointerType !== 'touch') onPoint(project.id); }}
                    onPointerLeave={(event) => { if (event.pointerType !== 'touch') onPoint(null); }}
                >
                    {project.title}
                </li>
            ))}
        </ul>
    </div>
);

export default ProjectRail;
