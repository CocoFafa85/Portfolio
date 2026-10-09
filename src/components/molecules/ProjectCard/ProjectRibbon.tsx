import React from 'react';
import styles from './ProjectRibbon.module.scss';

export interface ProjectRibbonProps {
    /** Its text: "En développement — sortie prévue en 2026" (content.projects.labels.inProgress) */
    label: string;
}

/**
 * Construction tape across the screen of a project in progress (P4, decision B): lifted off the
 * screen (drop shadow, light edge, folds shaded at both ends), hazard stripes, a beacon blinking
 * softly (still in reduced motion). Inside the screen, it never reaches the tags. Real text.
 */
const ProjectRibbon: React.FC<ProjectRibbonProps> = ({ label }) => (
    <p className={styles.tape}>
        <span className={styles.band}>
            <i className={styles.beacon} aria-hidden="true" />
            {label}
        </span>
    </p>
);

export default ProjectRibbon;
