import React from 'react';
import styles from './ProjectCard.module.scss';
import wip from './WorkInProgress.module.scss';
import { content } from '../../../data/content';
import type { Project } from '../../../types/models';
import NeonFrame from '../../atoms/NeonFrame/NeonFrame';
import { isInProgress } from '../../../utils/projects';
import { accentOf } from './accent';
import ProjectActions from './ProjectActions';
import ProjectBody from './ProjectBody';
import ProjectWindow from './ProjectWindow';

const labels = content.projects.labels;

export interface ProjectCardProps {
    project: Project;
}

/**
 * A project card (LOT 5, decision A "demo window"): the demo window, then the text. The default
 * neon border of every block turns over it. `project-card` is the global hook the window's hover
 * and focus effects read (a CSS module cannot name another module's classes).
 */
const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => (
    <article
        className={`project-card ${styles.card} ${isInProgress(project) ? wip.workInProgress : ''}`}
        style={{ '--accent': accentOf(project.color) } as React.CSSProperties}
        // Read by the CSS ribbon and badge (content: attr(...))
        data-ribbon={labels.wipRibbon}
        data-badge={labels.wipBadge}
    >
        <NeonFrame />
        <ProjectWindow project={project} labels={labels} />
        <ProjectBody project={project} labels={labels} />
        <ProjectActions project={project} labels={labels} />
    </article>
);

export default ProjectCard;
