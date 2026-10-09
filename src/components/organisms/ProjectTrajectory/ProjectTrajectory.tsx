import React, { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import { trajectoryEffects as fx } from '../../../data/effects';
import { useIdleReady } from '../../../hooks/useIdleReady';
import type { Project } from '../../../types/models';
import { sideOf, yearDigits } from '../../../utils/trajectory';
import ProjectCard from '../../molecules/ProjectCard/ProjectCard';
import type { TrajectoryFlameProps } from './TrajectoryFlame';
import TrajectoryNode from './TrajectoryNode';
import styles from './ProjectTrajectory.module.scss';

export interface ProjectTrajectoryProps {
    projects: Project[];
}

const { ignition } = fx;
// Read by the ignition animations of the points, links and cards (data-ignited)
const IGNITION_VARS = {
    '--flash-ms': `${ignition.flashMs}ms`, '--bloom-ms': `${ignition.bloomMs}ms`, '--core-ms': `${ignition.coreMs}ms`,
    '--wave-ms': `${ignition.waveMs}ms`, '--spark-ms': `${ignition.sparkMs}ms`, '--link-ms': `${ignition.linkMs}ms`,
    '--boot-ms': `${ignition.bootMs}ms`, '--boot-delay': `${ignition.bootDelayMs}ms`,
} as CSSProperties;

/**
 * The Projects page's timeline (decisions B "trajectory" and T1 "time trajectory"): the cards in the
 * validated order, staggered around a central axis from 1024 px, beside an axis on the left below. A
 * fire trail burns down the axis with the scroll; as its flame passes a point, the point ignites, its
 * year lights up at once, its link runs to the card and the card powers on (its neon border). The decor
 * powers on at the first idle moment after the first frames, never in the first paint: its points and
 * links then, its scroll engine (TrajectoryFlame, its own chunk) right after; the visuals of the cards
 * below the first wait for it too (the first one is the page's LCP).
 */
const ProjectTrajectory: React.FC<ProjectTrajectoryProps> = ({ projects }) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const powered = useIdleReady(fx.powerOnTimeoutMs, fx.powerOnAfterMs);
    const [Flame, setFlame] = useState<ComponentType<TrajectoryFlameProps> | null>(null);
    const [lit, setLit] = useState(0);
    useEffect(() => {
        if (!powered) return;
        let live = true;
        import('./TrajectoryFlame').then(
            (module) => { if (live) setFlame(() => module.default); },
            // Engine unavailable (offline chunk): the points and cards simply show lit
            () => { if (live) setLit(projects.length); }
        );
        return () => { live = false; };
    }, [powered, projects.length]);

    return (
        <div ref={rootRef} className={styles.trajectory} style={IGNITION_VARS}>
            {Flame && <Flame rootRef={rootRef} count={projects.length} onLit={setLit} />}
            <ol className={styles.items}>
                {projects.map((project, index) => {
                    const ignited = powered && index < lit;
                    return (
                        <li key={project.id} className={styles.item} data-side={sideOf(index)} data-ignited={ignited ? '' : undefined}
                            style={{ '--row': index + 1 } as CSSProperties}>
                            {powered && <TrajectoryNode year={yearDigits(project.year)} />}
                            {powered && <span className={styles.link} aria-hidden="true" />}
                            <ProjectCard project={project} priority={index === 0} load={index === 0 || powered} lit={ignited} />
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default ProjectTrajectory;
