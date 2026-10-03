import React, { useCallback, useEffect, useRef } from 'react';
import { content } from '../../../data/content';
import { circuitEffects as fx } from '../../../data/effects';
import { useAnimationLoop } from '../../../hooks/useAnimationLoop';
import { capPixelRatio } from '../../../utils/canvas';
import { generateBoard, type Board } from '../../../utils/circuit/board';
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
 * Reduced motion: the static board alone (the loop never starts).
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

        const palette = readPalette();
        const grain = boardCtx.createPattern(createGrainTile(fx.style.grainSize, createRandom(fx.seed)), 'repeat');
        const pointer: Pointer = { x: 0, y: 0, active: false };
        const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

        const build = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const ratio = capPixelRatio(window.devicePixelRatio, width, height, coarsePointer, fx.pixelRatio);
            fitCanvas(boardCanvas, boardCtx, width, height, ratio);
            fitCanvas(liveCanvas, liveCtx, width, height, ratio);
            const board = generateBoard(width, height, fx.board, content.decor.circuit, createRandom(fx.seed));
            drawBoard(boardCtx, board, palette, grain, fx.style);
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
        build();

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
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerout', onPointerOut);
        return () => {
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
            <canvas ref={boardRef} className={styles.layer} />
            <canvas ref={liveRef} className={styles.layer} />
        </div>
    );
};

export default CircuitBackground;
