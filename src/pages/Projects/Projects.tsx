import React, { useRef } from 'react';
import styles from './Projects.module.scss';
import { content } from '../../data/content';
import { projectDetails } from '../../data/projectDetails';
import { withDetails } from '../../utils/projects';
import ProjectCard from '../../components/molecules/ProjectCard/ProjectCard';
import NeonFrame from '../../components/atoms/NeonFrame/NeonFrame';
import { motion, useInView } from 'motion/react';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useIdleReady } from '../../hooks/useIdleReady';
import { projectEffects as fx } from '../../data/effects';

// The cards: the single list of the projects (also read by Skills) with what only this page shows
const PROJECTS = withDetails(content.projects.list, projectDetails);

const Projects: React.FC = () => {
    usePageMeta('projects');
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    // The first card's visual is the page's LCP: the others wait for the first idle moment after it
    const visualsReady = useIdleReady(fx.visualsTimeoutMs, fx.visualsAfterMs);

    return (
        <div className={styles.projectsPage} ref={ref}>
            <motion.div
                className={styles.header}
                initial={{ opacity: 0, y: -50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                <NeonFrame />
                <h1 className="glitch-title" data-text={content.projects.title}>{content.projects.title}</h1>
            </motion.div>

            <div className={styles.grid}>
                {PROJECTS.map((project, index) => (
                    <ProjectCard key={project.id} project={project} priority={index === 0} load={index === 0 || visualsReady} />
                ))}
            </div>
        </div>
    );
};

export default Projects;
