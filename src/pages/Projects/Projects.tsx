import React, { useRef } from 'react';
import styles from './Projects.module.scss';
import { content } from '../../data/content';
import ProjectCard from '../../components/molecules/ProjectCard/ProjectCard';
import { motion, useInView } from 'motion/react';
import { usePageMeta } from '../../hooks/usePageMeta';

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
                <h1 className="glitch-title" data-text={content.projects.title}>{content.projects.title}</h1>
            </motion.div>

            <div className={styles.grid}>
                {content.projects.list.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
};

export default Projects;
