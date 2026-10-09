import React, { useRef } from 'react';
import styles from './Projects.module.scss';
import { content } from '../../data/content';
import { projectDetails } from '../../data/projectDetails';
import { withDetails } from '../../utils/projects';
import ProjectCard from '../../components/molecules/ProjectCard/ProjectCard';
import NeonFrame from '../../components/atoms/NeonFrame/NeonFrame';
import { motion, useInView } from 'motion/react';
import { usePageMeta } from '../../hooks/usePageMeta';

// The cards: the single list of the projects (also read by Skills) with what only this page shows
const PROJECTS = withDetails(content.projects.list, projectDetails);

const Projects: React.FC = () => {
    usePageMeta('projects');
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

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
                {PROJECTS.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
};

export default Projects;
