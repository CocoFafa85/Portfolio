import React from 'react';
import type { Project, ProjectLabels } from '../../../types/models';
import { yearLabel } from '../../../utils/projects';
import styles from './ProjectBody.module.scss';

export interface ProjectBodyProps {
    project: Project;
    labels: ProjectLabels;
}

/**
 * The text of a card (P3, F4): title, then the year · team line (shown above it), the pitch, the
 * learning goals one per line, the technologies. The title comes first for screen readers.
 */
const ProjectBody: React.FC<ProjectBodyProps> = ({ project, labels }) => {
    const year = yearLabel(project, labels);
    return (
        <div className={styles.body}>
            <h2 className={styles.title}>{project.title}</h2>
            <dl className={styles.meta}>
                {year && <dt className={styles.term}>{labels.year}</dt>}
                {year && <dd className={styles.year}>{year}</dd>}
                <dt className={styles.term}>{labels.team}</dt>
                <dd className={styles.team}>{project.team}</dd>
            </dl>
            <p className={styles.pitch}>{project.pitch}</p>
            <h3 className={styles.label}>{labels.goals}</h3>
            <ul className={styles.goals}>
                {project.goals.map((goal) => <li key={goal}>{goal}</li>)}
            </ul>
            <ul className={styles.tags}>
                {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
        </div>
    );
};

export default ProjectBody;
