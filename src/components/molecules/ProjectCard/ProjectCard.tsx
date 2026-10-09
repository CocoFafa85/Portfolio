import React from 'react';
import styles from './ProjectCard.module.scss';
import { content } from '../../../data/content';
import type { Project } from '../../../types/models';
import NeonFrame from '../../atoms/NeonFrame/NeonFrame';
import { fillTemplate } from '../../../utils/format';
import { isInProgress } from '../../../utils/projects';
import { accentOf } from './accent';
import ProjectActions from './ProjectActions';
import ProjectBody from './ProjectBody';
import ProjectRibbon from './ProjectRibbon';
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
        className={`project-card ${styles.card}`}
        style={{ '--accent': accentOf(project.color) } as React.CSSProperties}
    >
        <NeonFrame />
        <ProjectWindow
            project={project}
            labels={labels}
            overlay={isInProgress(project) && <ProjectRibbon label={fillTemplate(labels.inProgress, { year: project.year })} />}
        >
            <ProjectActions project={project} labels={labels} />
        </ProjectWindow>
        <ProjectBody project={project} labels={labels} />
    </article>
);

export default ProjectCard;
