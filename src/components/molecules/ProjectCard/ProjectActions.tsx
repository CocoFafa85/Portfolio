import React from 'react';
import type { Project, ProjectLabels } from '../../../types/models';
import { fillTemplate } from '../../../utils/format';
import styles from './ProjectActions.module.scss';

export interface ProjectActionsProps {
    project: Project;
    labels: ProjectLabels;
}

const PLAY = <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>;
const CODE = (
    <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M5.5 4 1.5 8l4 4M10.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Demo / Code links of a card (P2): a bar that rises over the bottom of the screen on hover and
 * keyboard focus, always shown under it on a touch screen (no hover there). Nothing without a link
 * (F5: SoulSweeper). Accessible name = visible text first, then "de <projet> (nouvel onglet)".
 */
const ProjectActions: React.FC<ProjectActionsProps> = ({ project, labels }) => {
    if (!project.demoLink && !project.repoLink) return null;
    const suffix = <span className={styles.hidden}>{fillTemplate(labels.linkSuffix, { title: project.title })}</span>;
    return (
        <div className={styles.actions}>
            {project.demoLink && (
                <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${styles.demo}`}>
                    {PLAY}{labels.demo}{suffix}
                </a>
            )}
            {project.repoLink && (
                <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${styles.code}`}>
                    {CODE}{labels.code}{suffix}
                </a>
            )}
        </div>
    );
};

export default ProjectActions;
