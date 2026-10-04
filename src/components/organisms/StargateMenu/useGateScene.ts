import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { gateEffects as fx } from '../../../data/effects';
import { useAnimationLoop } from '../../../hooks/useAnimationLoop';
import { capPixelRatio } from '../../../utils/canvas';
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
 * makes a long task), fits the gate to its cell on every resize, tilts it with a fine
 * pointer, survives a WebGL context loss, and runs it in useAnimationLoop
 * (paused when hidden or off screen). Reduced motion: one still frame.
 */
export function useGateScene(
    canvasRef: RefObject<HTMLCanvasElement | null>,
    cellRef: RefObject<HTMLElement | null>,
    linksRef: RefObject<(HTMLElement | null)[]>
): GateControls {
    const sceneRef = useRef<GateScene | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const cell = cellRef.current;
        const root = canvas?.parentElement;
        if (!canvas || !cell || !root) return;
        const scene = createGateScene(canvas, linksRef.current);
        sceneRef.current = scene;
        const coarse = window.matchMedia('(pointer: coarse)').matches;

        const layout = () => {
            const width = root.clientWidth;
            const height = root.clientHeight;
            const ratio = capPixelRatio(window.devicePixelRatio, width, height, coarse, fx.pixelRatio);
            const rect = { x: cell.offsetLeft, y: cell.offsetTop, width: cell.offsetWidth, height: cell.offsetHeight };
            layoutGateScene(scene, rect, width, height, ratio);
            stepGateScene(scene, performance.now(), reducedMotion());
            cell.dataset.placed = 'true';
        };
        layout();

        let cancelBoot = () => {};
        const boot = () => {
            cell.dataset.gl = 'pending';
            cancelBoot = startGateBoot(canvas, (renderer) => {
                scene.renderer = renderer;
                // The gate assembles from the moment it first shows
                scene.start = performance.now();
                cell.dataset.gl = renderer ? 'on' : 'off';
                stepGateScene(scene, performance.now(), reducedMotion());
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
        const onPointerMove = (event: PointerEvent) => {
            if (event.pointerType === 'touch') return;
            scene.pointer.x = event.clientX / window.innerWidth - 0.5;
            scene.pointer.y = event.clientY / window.innerHeight - 0.5;
        };
        const onLost = (event: Event) => {
            event.preventDefault();
            cancelBoot();
            scene.renderer = null;
            cell.dataset.gl = 'off';
        };
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        canvas.addEventListener('webglcontextlost', onLost);
        canvas.addEventListener('webglcontextrestored', boot);
        return () => {
            window.clearTimeout(resizeTimer);
            observer.disconnect();
            window.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('webglcontextlost', onLost);
            canvas.removeEventListener('webglcontextrestored', boot);
            cancelBoot();
            scene.renderer?.dispose();
            sceneRef.current = null;
        };
    }, [canvasRef, cellRef, linksRef]);

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
