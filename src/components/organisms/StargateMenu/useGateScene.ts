import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { gateEffects as fx } from '../../../data/effects';
import { useAnimationLoop } from '../../../hooks/useAnimationLoop';
import { readRenderBudget } from '../../../hooks/useDevice';
import { capPixelRatio } from '../../../utils/canvas';
import { releaseGateOccluder, type GateOccluder } from '../../../utils/stargate/occluder';
import { startGateBoot } from './gateBoot';
import { createGateScene, layoutGateScene, stepGateScene, type GateScene } from './gateScene';

export interface GateControls {
    /** Lights a chevron (hover or focus of its destination), -1 for none */
    hover(chevron: number): void;
    /** Starts the dial sequence; returns the delay before navigating, or -1 when it cannot play */
    startDial(chevron: number): number;
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Drives the particle gate: places the links at once, boots WebGL at the first
 * idle moment and compiles without blocking (it never delays the title nor
 * makes a long task), fits the gate to its cell on every resize (no pointer
 * parallax since the review of 2026-10-07: only an idle sway), survives a
 * WebGL context loss, and runs it in useAnimationLoop
 * (paused when hidden or off screen). Reduced motion: one still frame.
 * Every frame it tells `occluder` the disc it covers (the starfield erases the
 * sky behind it), and calls its onChange after a layout or a boot.
 */
export function useGateScene(
    canvasRef: RefObject<HTMLCanvasElement | null>,
    cellRef: RefObject<HTMLElement | null>,
    linksRef: RefObject<(HTMLElement | null)[]>,
    occluder: GateOccluder,
    /** An upright tablet: the gate fills the height under the title (LOT 6, D1) */
    upright: boolean
): GateControls {
    const sceneRef = useRef<GateScene | null>(null);
    const uprightRef = useRef(upright);
    const relayout = useRef(() => {});

    useEffect(() => {
        const canvas = canvasRef.current;
        const cell = cellRef.current;
        const root = canvas?.parentElement;
        if (!canvas || !cell || !root) return;
        const scene = createGateScene(canvas, linksRef.current, occluder);
        sceneRef.current = scene;

        const layout = () => {
            const width = root.clientWidth;
            const height = root.clientHeight;
            const ratio = capPixelRatio(readRenderBudget().pixelRatio, width, height, fx.maxPixels);
            const rect = { x: cell.offsetLeft, y: cell.offsetTop, width: cell.offsetWidth, height: cell.offsetHeight };
            layoutGateScene(scene, rect, width, height, ratio, uprightRef.current ? fx.fitUpright : fx.fit);
            stepGateScene(scene, performance.now(), reducedMotion());
            cell.dataset.placed = 'true';
            occluder.onChange?.();
        };
        layout();
        relayout.current = layout;

        let cancelBoot = () => {};
        const boot = () => {
            cell.dataset.gl = 'pending';
            cancelBoot = startGateBoot(canvas, (renderer) => {
                scene.renderer = renderer;
                // The gate assembles from the moment it first shows
                scene.start = performance.now();
                cell.dataset.gl = renderer ? 'on' : 'off';
                stepGateScene(scene, performance.now(), reducedMotion());
                occluder.onChange?.();
            });
        };
        boot();

        let resizeTimer = 0;
        const observer = new ResizeObserver(() => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(layout, fx.resizeDebounceMs);
        });
        observer.observe(root);
        observer.observe(cell);
        const onLost = (event: Event) => {
            event.preventDefault();
            cancelBoot();
            scene.renderer = null;
            cell.dataset.gl = 'off';
            releaseGateOccluder(occluder);
        };
        canvas.addEventListener('webglcontextlost', onLost);
        canvas.addEventListener('webglcontextrestored', boot);
        return () => {
            window.clearTimeout(resizeTimer);
            observer.disconnect();
            canvas.removeEventListener('webglcontextlost', onLost);
            canvas.removeEventListener('webglcontextrestored', boot);
            cancelBoot();
            scene.renderer?.dispose();
            sceneRef.current = null;
            releaseGateOccluder(occluder);
        };
    }, [canvasRef, cellRef, linksRef, occluder]);

    // A rotation turns an upright tablet into a tablet on its side: the gate refits at once
    useEffect(() => {
        if (uprightRef.current === upright) return;
        uprightRef.current = upright;
        relayout.current();
    }, [upright]);

    const onFrame = useCallback((_delta: number, time: number) => {
        const scene = sceneRef.current;
        if (scene) stepGateScene(scene, time, false);
    }, []);
    useAnimationLoop(onFrame, { target: canvasRef });

    const hover = useCallback((chevron: number) => {
        const scene = sceneRef.current;
        if (!scene || scene.dialStart >= 0) return;
        scene.hot = chevron;
        if (reducedMotion()) stepGateScene(scene, performance.now(), true);
    }, []);

    const startDial = useCallback((chevron: number) => {
        const scene = sceneRef.current;
        if (!scene?.renderer || scene.dialStart >= 0 || reducedMotion()) return -1;
        scene.chosen = chevron;
        scene.dialStart = performance.now();
        return fx.dial.navigateAtMs;
    }, []);

    return { hover, startDial };
}
