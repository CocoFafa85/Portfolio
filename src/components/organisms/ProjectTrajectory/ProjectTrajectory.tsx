import React, { type CSSProperties } from 'react';
import { trajectoryEffects as fx } from '../../../data/effects';
import { useIdleReady } from '../../../hooks/useIdleReady';
import type { Project } from '../../../types/models';
import { sideOf, yearDigits } from '../../../utils/trajectory';
import ProjectCard from '../../molecules/ProjectCard/ProjectCard';
import TrajectoryNode from './TrajectoryNode';
import styles from './ProjectTrajectory.module.scss';

export interface ProjectTrajectoryProps {
    projects: Project[];
}

/**
 * The Projects page's timeline (decision B "trajectory"): the cards in the validated order, staggered
 * left and right of a central axis from 1024 px, beside an axis on the left below. Each card has its
 * point on the axis and its year on a time-circuit display. The decor (axis, points, years, links)
 * powers on at the first idle moment after the first frames, never in the first paint; the cards'
 * visuals below the first wait for it too (the first one is the page's LCP).
 */
const ProjectTrajectory: React.FC<ProjectTrajectoryProps> = ({ projects }) => {
    const powered = useIdleReady(fx.powerOnTimeoutMs, fx.powerOnAfterMs);
    return (
        <div className={styles.trajectory}>
            {powered && <span className={styles.axis} aria-hidden="true" />}
            <ol className={styles.items}>
                {projects.map((project, index) => (
                    <li key={project.id} className={styles.item} data-side={sideOf(index)} style={{ '--row': index + 1 } as CSSProperties}>
                        {powered && <TrajectoryNode year={yearDigits(project.year)} />}
                        {powered && <span className={styles.link} aria-hidden="true" />}
                        <ProjectCard project={project} priority={index === 0} load={index === 0 || powered} />
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default ProjectTrajectory;
