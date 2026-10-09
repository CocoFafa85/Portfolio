import React from 'react';
import styles from './ProjectActions.module.scss';
import type { Project, ProjectLabels } from '../../../types/models';

export interface ProjectActionsProps {
    project: Project;
    labels: ProjectLabels;
}

/** Demo / Code links of a card, revealed by its hover or keyboard focus (--reveal set by the card). */
const ProjectActions: React.FC<ProjectActionsProps> = ({ project, labels }) => (
    <div className={styles.overlay}>
        <div className={styles.links}>
            {project.demoLink && (
                <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className={`${styles.linkButton} ${styles.demo}`}>
                    {labels.demo}
                </a>
            )}
            {project.repoLink && (
                <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className={`${styles.linkButton} ${styles.repo}`}>
                    {labels.code}
                </a>
            )}
        </div>
    </div>
);

export default ProjectActions;
