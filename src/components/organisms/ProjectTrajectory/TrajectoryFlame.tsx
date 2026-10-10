import React, { type RefObject } from 'react';
import TrajectoryAxis from './TrajectoryAxis';
import { useTrajectory } from './useTrajectory';

export interface TrajectoryFlameProps {
    /** The trajectory (its `[data-node]` points, inside MainLayout's scrolling <main>) */
    rootRef: RefObject<HTMLElement | null>;
    count: number;
    /** How many points the flame has passed: they ignite */
    onLit(lit: number): void;
}

/**
 * The scroll-linked engine of the trajectory (the fire trail, its flame, the ignition count), in its
 * own chunk: loaded when the decor powers on, never on the path of the page's first paint (a bigger page
 * chunk ready before React's first render put its download on the simulated FCP path, +150 ms).
 */
const TrajectoryFlame: React.FC<TrajectoryFlameProps> = ({ rootRef, count, onLit }) => {
    const { axisRef, progress, still } = useTrajectory(rootRef, count, onLit);
    return <TrajectoryAxis axisRef={axisRef} progress={progress} still={still} />;
};

export default TrajectoryFlame;
