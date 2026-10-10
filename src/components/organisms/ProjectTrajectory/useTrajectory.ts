import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useMotionValueEvent, useReducedMotion, useScroll, type MotionValue } from 'motion/react';
import { trajectoryEffects as fx } from '../../../data/effects';
import { litCount, nodeThresholds } from '../../../utils/flame';

export interface Trajectory {
    axisRef: RefObject<HTMLSpanElement | null>;
    /** 0 → 1 as the trigger line of the viewport travels the axis: where the flame is */
    progress: MotionValue<number>;
    /** Reduced motion: no flame, everything lit and still */
    still: boolean;
}

/**
 * The flame of the trajectory (decision T1). Its progress comes from the scroll (motion useScroll on the
 * axis, from its start to its end crossing the trigger line), so the trail and the ignitions stay in
 * step whatever the scrolling speed: a point lights up once the progress passes its threshold (measured
 * on each resize, from the `[data-node]` boxes of `rootRef`), reported through `onLit`. The pages scroll
 * inside MainLayout's <main>, not the window: found on mount, before useScroll reads it.
 */
export function useTrajectory(rootRef: RefObject<HTMLElement | null>, count: number, onLit: (lit: number) => void): Trajectory {
    const axisRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLElement>(null);
    useLayoutEffect(() => {
        containerRef.current = rootRef.current?.closest('main') ?? null;
    }, [rootRef]);
    const still = useReducedMotion() ?? false;
    const line = fx.triggerLine;
    const { scrollYProgress } = useScroll({ container: containerRef, target: axisRef, offset: [`start ${line}`, `end ${line}`] });
    const thresholds = useRef<number[]>([]);
    const update = useCallback((progress: number) => onLit(litCount(thresholds.current, progress)), [onLit]);
    useMotionValueEvent(scrollYProgress, 'change', (progress) => {
        if (!still) update(progress);
    });

    useEffect(() => {
        const root = rootRef.current;
        const axis = axisRef.current;
        if (!root || !axis) return;
        // Fires once on observe, then on every resize (fonts, visuals, viewport)
        const observer = new ResizeObserver(() => {
            if (still) return onLit(count);
            const box = axis.getBoundingClientRect();
            const offsets = [...root.querySelectorAll('[data-node]')].map((node) => node.getBoundingClientRect().top + 1 - box.top);
            thresholds.current = nodeThresholds(offsets, box.height);
            update(scrollYProgress.get());
        });
        observer.observe(root);
        return () => observer.disconnect();
    }, [rootRef, count, still, scrollYProgress, update, onLit]);

    return { axisRef, progress: scrollYProgress, still };
}
