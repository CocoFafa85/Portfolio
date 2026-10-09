import React from 'react';
import styles from './ProjectCard.module.scss';
import wip from './WorkInProgress.module.scss';
import { content } from '../../../data/content';
import { Project } from '../../../types/models';
import NeonFrame from '../../atoms/NeonFrame/NeonFrame';
import ProjectActions from './ProjectActions';

const labels = content.projects.labels;

export interface ProjectCardProps {
    project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => (
    <div
        className={`${styles.card} ${project.featured ? styles.featured : ''} ${project.id === 'demineur' ? wip.workInProgress : ''}`}
        style={{ '--card-color': project.color || 'var(--neon-cyan)' } as React.CSSProperties}
        // Read by the CSS ribbon and badge (content: attr(...))
        data-ribbon={labels.wipRibbon}
        data-badge={labels.wipBadge}
    >
        <NeonFrame />
        {/* Background layer: image or cyberpunk placeholder */}
        <div className={styles.cardBackground}>
            {project.imageUrl ? <img src={project.imageUrl} alt={project.title} loading="lazy" /> : <div className={styles.placeholder} />}
        </div>

        {/* Always-visible content */}
        <div className={styles.cardContent}>
            <h2 className={styles.title}>{project.title}</h2>
            <p className={styles.description}>{project.description}</p>
            <div className={styles.tags}>
                {project.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                ))}
            </div>
        </div>

        <ProjectActions project={project} labels={labels} />
    </div>
);

export default ProjectCard;
