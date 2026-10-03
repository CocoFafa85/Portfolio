import React from 'react';
import styles from './ProjectCard.module.scss';
import { content } from '../../../data/content';
import { Project } from '../../../types/models';

const labels = content.projects.labels;

interface ProjectCardProps {
    project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const hasImage = Boolean(project.imageUrl);

    return (
        <div
            className={`${styles.card} ${project.featured ? styles.featured : ''} ${project.id === 'demineur' ? styles.workInProgress : ''}`}
            style={{ '--card-color': project.color || 'var(--neon-cyan)' } as React.CSSProperties}
            // Read by the CSS ribbon and badge (content: attr(...))
            data-ribbon={labels.wipRibbon}
            data-badge={labels.wipBadge}
        >
            {/* Background layer: image or cyberpunk placeholder */}
            <div className={styles.cardBackground}>
                {hasImage ? (
                    <img src={project.imageUrl} alt={project.title} loading="lazy" />
                ) : (
                    <div className={styles.placeholder} />
                )}
            </div>

            {/* Always-visible content */}
            <div className={styles.cardContent}>
                <h2 className={styles.title}>{project.title}</h2>
                <p className={styles.description}>{project.description}</p>
                <div className={styles.tags}>
                    {project.tags.map(tag => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                </div>
            </div>

            {/* Hover overlay with action buttons */}
            <div className={styles.overlay}>
                <div className={styles.links}>
                    {project.demoLink && (
                        <a
                            href={project.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.linkButton} ${styles.demo}`}
                        >
                            {labels.demo}
                        </a>
                    )}
                    {project.repoLink && (
                        <a
                            href={project.repoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.linkButton} ${styles.repo}`}
                        >
                            {labels.code}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
