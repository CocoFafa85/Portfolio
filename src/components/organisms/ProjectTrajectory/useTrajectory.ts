import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useMotionValueEvent, useReducedMotion, useScroll, type MotionValue } from 'motion/react';
import { trajectoryEffects as fx } from '../../../data/effects';
import { litCount, nodeThresholds } from '../../../utils/trajectory';

export interface Trajectory {
    rootRef: RefObject<HTMLDivElement | null>;
    axisRef: RefObject<HTMLSpanElement | null>;
    /** 0 → 1 as the trigger line of the viewport travels the axis: where the flame is */
    progress: MotionValue<number>;
    /** How many points the flame has passed (all of them in reduced motion) */
    lit: number;
    /** Reduced motion: no flame, everything lit and still */
    still: boolean;
}

/**
 * The flame of the trajectory (decision T1). Its progress comes from the scroll (motion useScroll on the
 * axis, from its start to its end crossing the trigger line), so the trail and the ignitions stay in
 * step whatever the scrolling speed: a point lights up once the progress passes its threshold (measured
 * on each resize, from the `[data-node]` boxes). Nothing lights up before the decor is powered. The
 * pages scroll inside MainLayout's <main>, not the window: found on mount, before useScroll reads it.
 */
export function useTrajectory(count: number, powered: boolean): Trajectory {
    const rootRef = useRef<HTMLDivElement>(null);
    const axisRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLElement>(null);
    useLayoutEffect(() => {
        containerRef.current = rootRef.current?.closest('main') ?? null;
    }, []);
    const still = useReducedMotion() ?? false;
    const line = fx.triggerLine;
    const { scrollYProgress } = useScroll({ container: containerRef, target: axisRef, offset: [`start ${line}`, `end ${line}`] });
    const thresholds = useRef<number[]>([]);
    const [lit, setLit] = useState(0);
    const update = useCallback((progress: number) => setLit(litCount(thresholds.current, progress)), []);
    useMotionValueEvent(scrollYProgress, 'change', update);

    useEffect(() => {
        const root = rootRef.current;
        const axis = axisRef.current;
        if (!powered || still || !root || !axis) return;
        // Fires once on observe, then on every resize (fonts, visuals, viewport)
        const observer = new ResizeObserver(() => {
            const box = axis.getBoundingClientRect();
            const offsets = [...root.querySelectorAll('[data-node]')].map((node) => node.getBoundingClientRect().top + 1 - box.top);
            thresholds.current = nodeThresholds(offsets, box.height);
            update(scrollYProgress.get());
        });
        observer.observe(root);
        return () => observer.disconnect();
    }, [powered, still, scrollYProgress, update]);

    return { rootRef, axisRef, progress: scrollYProgress, lit: still ? count : powered ? lit : 0, still };
}
