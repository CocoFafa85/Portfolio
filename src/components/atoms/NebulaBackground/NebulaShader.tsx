/*
 * Home nebula shader (LOT 2, H4), loaded in its own chunk.
 * Paper Shaders mesh gradient (@paper-design/shaders 0.0.81, Apache License
 * 2.0, https://github.com/paper-design/shaders), mounted by nebulaProgram.ts.
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { nebulaEffects as fx } from '../../../data/effects';
import { useAnimationLoop } from '../../../hooks/useAnimationLoop';
import { capPixelRatio } from '../../../utils/canvas';
import { finishNebula, startNebulaProgram, type NebulaRenderer } from './nebulaProgram';
import styles from './NebulaBackground.module.scss';

/** Colour spots of the mesh, resolved once from the design tokens. */
function readColors(): string[] {
    const style = getComputedStyle(document.documentElement);
    return fx.tokens.map((token) => style.getPropertyValue(token).trim());
}

/**
 * Slow, very dark mesh gradient: compiled without blocking, drawn at a capped
 * pixel count (a soft nebula looks the same at a lower resolution), driven by
 * useAnimationLoop (paused when the tab is hidden or the canvas off screen).
 * It fades in over the CSS gradient once its first frame is drawn.
 */
const NebulaShader: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<NebulaRenderer | null>(null);
    const timeRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas?.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false });
        const pending = gl ? startNebulaProgram(gl) : null;
        if (!canvas || !gl || !pending) return;
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        const caps = { fine: fx.minPixelRatio, coarse: fx.minPixelRatio, maxPixels: coarse ? fx.maxPixelCount.coarse : fx.maxPixelCount.fine };
        const fit = () => {
            const ratio = capPixelRatio(window.devicePixelRatio, canvas.clientWidth, canvas.clientHeight, coarse, caps);
            canvas.width = Math.round(canvas.clientWidth * ratio);
            canvas.height = Math.round(canvas.clientHeight * ratio);
            rendererRef.current?.draw(timeRef.current);
        };
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(canvas);

        let frame = 0;
        const poll = () => {
            const result = finishNebula(pending, { ...fx, colors: readColors() });
            if (result === 'waiting') {
                frame = requestAnimationFrame(poll);
                return;
            }
            rendererRef.current = result;
            result?.draw(timeRef.current);
            if (result) canvas.dataset.ready = 'true';
        };
        frame = requestAnimationFrame(poll);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            rendererRef.current?.dispose();
            rendererRef.current = null;
        };
    }, []);

    const onFrame = useCallback((deltaMs: number) => {
        const renderer = rendererRef.current;
        if (!renderer) return;
        timeRef.current += (deltaMs / 1000) * fx.speed;
        renderer.draw(timeRef.current);
    }, []);
    useAnimationLoop(onFrame, { target: canvasRef });

    return <canvas ref={canvasRef} className={styles.shader} aria-hidden="true" />;
};

export default NebulaShader;
