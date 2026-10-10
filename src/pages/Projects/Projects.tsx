import React from 'react';
import styles from './Projects.module.scss';
import { content } from '../../data/content';
import { projectDetails } from '../../data/projectDetails';
import { withDetails } from '../../utils/projects';
import NeonFrame from '../../components/atoms/NeonFrame/NeonFrame';
import ProjectTrajectory from '../../components/organisms/ProjectTrajectory/ProjectTrajectory';
import { usePageMeta } from '../../hooks/usePageMeta';

// The cards: the single list of the projects (also read by Skills) with what only this page shows
const PROJECTS = withDetails(content.projects.list, projectDetails);

/**
 * Projects page (LOT 5): the title, then the trajectory of the projects. No entrance fade: PageTravel
 * plays the trips and the title paints at once (LCP).
 */
const Projects: React.FC = () => {
    usePageMeta('projects');
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <NeonFrame />
                <h1 className="glitch-title" data-text={content.projects.title}>{content.projects.title}</h1>
            </header>
            <ProjectTrajectory projects={PROJECTS} />
        </div>
    );
};

export default Projects;
