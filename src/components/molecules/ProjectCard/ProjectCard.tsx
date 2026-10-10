import React from 'react';
import styles from './ProjectCard.module.scss';
import { content } from '../../../data/content';
import type { Project } from '../../../types/models';
import NeonFrame from '../../atoms/NeonFrame/NeonFrame';
import { isInProgress, ribbonLabel } from '../../../utils/projects';
import { accentOf } from './accent';
import ProjectActions from './ProjectActions';
import ProjectBody from './ProjectBody';
import ProjectRibbon from './ProjectRibbon';
import ProjectWindow from './ProjectWindow';

const labels = content.projects.labels;

export interface ProjectCardProps {
    project: Project;
    /** The first card of the page: its picture is fetched at once */
    priority?: boolean;
    /** False until the card's picture may be requested */
    load?: boolean;
    /** Powers its neon border on (the trajectory's flame reached it); by default at the first idle moment */
    lit?: boolean;
}

/**
 * A project card (LOT 5, decision A "demo window"): the demo window, then the text. The default
 * neon border of every block turns over it. `project-card` is the global hook the window's hover
 * and focus effects read (a CSS module cannot name another module's classes).
 */
const ProjectCard: React.FC<ProjectCardProps> = ({ project, priority, load, lit }) => (
    <article
        className={`project-card ${styles.card}`}
        style={{ '--accent': accentOf(project.color) } as React.CSSProperties}
    >
        <NeonFrame lit={lit} />
        <ProjectWindow
            project={project}
            labels={labels}
            priority={priority}
            load={load}
            overlay={isInProgress(project) && <ProjectRibbon label={ribbonLabel(project, labels)} />}
        >
            <ProjectActions project={project} labels={labels} />
        </ProjectWindow>
        <ProjectBody project={project} labels={labels} />
    </article>
);

export default ProjectCard;
