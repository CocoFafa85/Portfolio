import React from 'react';
import type { Project, ProjectLabels } from '../../../types/models';
import styles from './ProjectWindow.module.scss';

export interface ProjectWindowProps {
    project: Project;
    labels: ProjectLabels;
    /** Laid over the screen: the ribbon of a project in progress, the Demo / Code bar */
    children?: React.ReactNode;
}

/**
 * The visual of a card (decision A "demo window"): the project's screen in a neon browser window,
 * its address (or "project · platform") in the bar. A dark veil with scan lines lifts on hover and
 * keyboard focus, a light sweep crosses the screen. The window chrome is decorative.
 */
const ProjectWindow: React.FC<ProjectWindowProps> = ({ project, labels, children }) => (
    <div className={styles.window}>
        <div className={styles.bar} aria-hidden="true">
            <span className={styles.dots}><i /><i /><i /></span>
            <span className={styles.frame}>{project.frame}</span>
            {project.demoLink && <span className={styles.online}><i className={styles.led} />{labels.online}</span>}
        </div>
        <div className={styles.screen}>
            <div className={styles.placeholder} />
            <span className={styles.veil} aria-hidden="true" />
            <span className={styles.sweep} aria-hidden="true" />
            {children}
        </div>
    </div>
);

export default ProjectWindow;
