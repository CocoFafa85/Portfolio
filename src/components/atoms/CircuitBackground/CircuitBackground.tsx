import React, { useCallback, useEffect, useRef } from 'react';
import { content } from '../../../data/content';
import { circuitEffects as fx } from '../../../data/effects';
import { useAnimationLoop } from '../../../hooks/useAnimationLoop';
import { readRenderBudget, readTouch } from '../../../hooks/useDevice';
import { onIdleAfter } from '../../../hooks/useIdleReady';
import { capPixelRatio } from '../../../utils/canvas';
import { boardAtDensity, generateBoard, type Board } from '../../../utils/circuit/board';
import {
    createGlowState, createHoverIndex, updateGlow, type GlowState, type HoverIndex, type Pointer,
} from '../../../utils/circuit/hover';
import { advancePulses, createPulsePool, spawnPulse, type PulsePool } from '../../../utils/circuit/pulses';
import { createRandom, inRange, type Random } from '../../../utils/random';
import { createGrainTile, drawBoard } from './drawBoard';
import { drawLive } from './drawLive';
import { readPalette, type CircuitPalette } from './palette';
import styles from './CircuitBackground.module.scss';

/** Everything the animation loop touches, rebuilt on resize only. */
interface Scene {
    board: Board;
    index: HoverIndex;
    glow: GlowState;
    pool: PulsePool;
    live: CanvasRenderingContext2D;
    palette: CircuitPalette;
    random: Random;
    pointer: Pointer;
    nextPulse: number;
    /** The live layer holds pixels that must be cleared once idle */
    drawn: boolean;
}

function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, height: number, ratio: number) {
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

/**
 * Inner pages background (LOT 1, C3): a realistic printed circuit board drawn
 * once per screen size on a static canvas; a second canvas only carries the
 * rare data pulses and the discreet glow of the traces near the cursor.
 * The solder mask is a CSS background, there from the first paint; on a page load
 * the board is drawn at the first idle moment once the first frames are through
 * (LOT 6, C1). Reduced motion: the static board alone (the loop never starts).
 */
const CircuitBackground: React.FC = () => {
    const boardRef = useRef<HTMLCanvasElement>(null);
    const liveRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<Scene | null>(null);

    useEffect(() => {
        const boardCanvas = boardRef.current;
        const liveCanvas = liveRef.current;
        const boardCtx = boardCanvas?.getContext('2d');
        const liveCtx = liveCanvas?.getContext('2d');
        if (!boardCanvas || !liveCanvas || !boardCtx || !liveCtx) return;

        const pointer: Pointer = { x: 0, y: 0, active: false };
        let palette: CircuitPalette | undefined;
        let grain: CanvasPattern | null = null;

        const build = () => {
            palette ??= readPalette();
            grain ??= boardCtx.createPattern(createGrainTile(fx.style.grainSize, createRandom(fx.seed)), 'repeat');
            const width = window.innerWidth;
            const height = window.innerHeight;
            // The device's render budget (LOT 6): its pixel ratio cap and its share of the traces
            const budget = readRenderBudget();
            const ratio = capPixelRatio(budget.pixelRatio, width, height, fx.maxPixels);
            fitCanvas(boardCanvas, boardCtx, width, height, ratio);
            fitCanvas(liveCanvas, liveCtx, width, height, ratio);
            const board = generateBoard(width, height, boardAtDensity(fx.board, budget.density), content.decor.circuit, createRandom(fx.seed));
            drawBoard(boardCtx, board, palette, grain, fx.style);
            boardCanvas.dataset.drawn = '';
            sceneRef.current = {
                board,
                index: createHoverIndex(board, fx.hoverCell),
                glow: createGlowState(board.traceCount),
                pool: createPulsePool(fx.pulse.max),
                live: liveCtx,
                palette,
                random: createRandom(fx.seed + 1),
                pointer,
                nextPulse: 0,
                drawn: false,
            };
        };
        // During the first frames the GPU is still drawing the page: the canvas's first write then
        // waited for it, up to 120 ms on a tablet (Lighthouse, LOT 6 C1). Later (a trip from another
        // page), the board is drawn at once, under the trip's cover
        let cancelDraw = () => {};
        if (performance.now() < fx.drawAfterMs) cancelDraw = onIdleAfter(fx.drawAfterMs, fx.drawTimeoutMs, build);
        else build();

        let resizeTimer = 0;
        const onResize = () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(build, fx.resizeDebounceMs);
        };
        const onPointerMove = (event: PointerEvent) => {
            pointer.x = event.clientX;
            pointer.y = event.clientY;
            pointer.active = event.pointerType === 'mouse' || event.pointerType === 'pen';
        };
        const onPointerOut = (event: PointerEvent) => {
            if (!event.relatedTarget) pointer.active = false;
        };
        window.addEventListener('resize', onResize);
        // The traces light up near a mouse only: no pointer listener on a touch screen
        const mouse = !readTouch();
        if (mouse) {
            window.addEventListener('pointermove', onPointerMove, { passive: true });
            window.addEventListener('pointerout', onPointerOut);
        }
        return () => {
            cancelDraw();
            window.clearTimeout(resizeTimer);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerout', onPointerOut);
            sceneRef.current = null;
        };
    }, []);

    const onFrame = useCallback((deltaMs: number, time: number) => {
        const scene = sceneRef.current;
        if (!scene) return;
        const { board, pool } = scene;
        if (time >= scene.nextPulse) {
            spawnPulse(pool, board.traceLength, fx.pulse.minTraceLength, fx.pulse.speed, scene.random);
            scene.nextPulse = time + inRange(scene.random, fx.pulse.intervalMs);
        }
        const pulses = advancePulses(pool, board.traceLength, deltaMs, fx.pulse.trail);
        const lit = updateGlow(scene.glow, board, scene.index, scene.pointer, fx.hover);
        if (pulses === 0 && !lit) {
            if (scene.drawn) {
                scene.live.clearRect(0, 0, board.width, board.height);
                scene.drawn = false;
            }
            return;
        }
        drawLive(scene.live, board, scene.glow.glow, pool, scene.palette, fx);
        scene.drawn = true;
    }, []);

    const clearLive = useCallback(() => {
        const scene = sceneRef.current;
        if (!scene) return;
        scene.live.clearRect(0, 0, scene.board.width, scene.board.height);
        scene.drawn = false;
    }, []);

    useAnimationLoop(onFrame, { target: liveRef, onPause: clearLive });

    return (
        <div className={styles.circuit} aria-hidden="true">
            <canvas ref={boardRef} className={`${styles.layer} ${styles.board}`} />
            <canvas ref={liveRef} className={styles.layer} />
        </div>
    );
};

export default CircuitBackground;
