import React from 'react';
import visuals from '../../../data/projectVisuals.json';
import type { Project, ProjectLabels } from '../../../types/models';
import styles from './ProjectWindow.module.scss';

export interface ProjectWindowProps {
    project: Project;
    labels: ProjectLabels;
    /** The first card: its picture loads at once with a high priority, the others lazily */
    priority?: boolean;
    /** False until the picture may be requested (the size stays reserved by the 16:10 screen) */
    load?: boolean;
    /** Laid over the screen: the ribbon of a project in progress */
    overlay?: React.ReactNode;
    /** Over the bottom of the screen, or under it on a touch screen: the Demo / Code bar */
    children?: React.ReactNode;
}

/**
 * The visual of a card (decision A "demo window"): the project's screen in a neon browser window,
 * its address (or "project · platform") in the bar. A dark veil with scan lines lifts on hover and
 * keyboard focus, a light sweep crosses the screen. The window chrome is decorative. The picture's
 * size is reserved (width, height, 16:10 screen): nothing moves when it arrives.
 */
const ProjectWindow: React.FC<ProjectWindowProps> = ({ project, labels, priority = false, load = true, overlay, children }) => (
    <div className={styles.window}>
        <div className={styles.bar} aria-hidden="true">
            <span className={styles.dots}><i /><i /><i /></span>
            <span className={styles.frame}>{project.frame}</span>
            {project.demoLink && <span className={styles.online}><i className={styles.led} />{labels.online}</span>}
        </div>
        <div className={styles.screen}>
            {load && <img
                className={styles.picture}
                srcSet={project.visual.sources.map((source) => `${source.src} ${source.width}w`).join(', ')}
                sizes={visuals.sizes}
                src={project.visual.sources[project.visual.sources.length - 1].src}
                width={project.visual.width}
                height={project.visual.height}
                alt={project.visual.alt}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
            />}
            <span className={styles.veil} aria-hidden="true" />
            <span className={styles.sweep} aria-hidden="true" />
            <span className={styles.boot} aria-hidden="true" />
            {overlay}
        </div>
        {children}
    </div>
);

export default ProjectWindow;
