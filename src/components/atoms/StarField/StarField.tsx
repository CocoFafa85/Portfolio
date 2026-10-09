import React, { useCallback, useEffect, useRef } from 'react';
import { starEffects as fx } from '../../../data/effects';
import { useAnimationLoop } from '../../../hooks/useAnimationLoop';
import { capPixelRatio } from '../../../utils/canvas';
import { createRandom, inRange, type Random } from '../../../utils/random';
import { createStarLayer, driftStars, type StarLayer } from '../../../utils/starfield/layers';
import { advanceMeteors, createMeteorPool, spawnMeteor, type MeteorPool } from '../../../utils/starfield/meteors';
import { watchGateOccluder, type GateOccluder } from '../../../utils/stargate/occluder';
import { drawComets } from './drawComet';
import { cometSprites, createStarSprites, drawLayer, drawMeteors, eraseBehindGate, type StarSprites } from './drawStars';
import { readStarPalette } from './palette';
import styles from './StarField.module.scss';

/** Everything the animation loop touches, rebuilt on resize only. */
interface Scene {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    ratio: number;
    layers: StarLayer[];
    /** Sprite picker, made once (no closure per frame) */
    image: (tint: number) => HTMLCanvasElement;
    pool: MeteorPool;
    random: Random;
    nextMeteor: number;
    /** A comet every 10 s (review of 2026-10-09), same engine as the shooting stars */
    comets: MeteorPool;
    nextComet: number;
    /** Pointer target and smoothed parallax position (-0.5..0.5) */
    pointer: { x: number; y: number; tx: number; ty: number };
    pose: Float32Array;
    sprites: StarSprites;
    occluder: GateOccluder;
}

export interface StarFieldProps {
    /** Disc of the gate in front of the sky (written by the gate scene): the stars pass behind it */
    occluder: GateOccluder;
}

/**
 * Home starfield (LOT 2, H4), over the nebula: three layers of the same
 * twinkling coloured stars drifting at three speeds (review of 2026-10-08:
 * no far layer, no grey out-of-focus layer, an even background), each
 * shifted by its own parallax with a fine pointer; rare shooting stars with a tapered tail,
 * and a slow comet every 10 s.
 * Everything passes behind the gate (review of 2026-10-09): its disc is erased.
 * Typed arrays, sprites drawn once, no allocation per frame; paused when the
 * tab is hidden or the canvas off screen; reduced motion: one still frame.
 */
const StarField: React.FC<StarFieldProps> = ({ occluder }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<Scene | null>(null);

    const draw = useCallback((scene: Scene, time: number) => {
        const { ctx, width, height, ratio, pointer } = scene;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < scene.layers.length; i++) {
            const spec = fx.layers[i];
            drawLayer(ctx, scene.layers[i], scene.image, width, height,
                -pointer.x * spec.parallax, -pointer.y * spec.parallax, spec.twinkle, time);
        }
        drawMeteors(ctx, scene.pool, scene.sprites, ratio, scene.pose);
        if (scene.sprites.comet) drawComets(ctx, scene.comets, scene.sprites.comet, ratio, scene.pose);
        eraseBehindGate(ctx, scene.sprites, scene.occluder);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const sprites = createStarSprites(readStarPalette());
        const image = (tint: number) => sprites.tints[tint];
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

        const build = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const ratio = capPixelRatio(window.devicePixelRatio, width, height, coarse, fx.pixelRatio);
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            const random = createRandom(fx.seed);
            const scene: Scene = {
                ctx, width, height, ratio, random, pointer, sprites, image, occluder,
                layers: fx.layers.map((spec) => createStarLayer(spec, width, height, random)),
                pool: createMeteorPool(fx.meteor.max),
                nextMeteor: performance.now() + fx.firstMeteorMs,
                comets: createMeteorPool(fx.comet.max),
                nextComet: performance.now() + fx.firstCometMs,
                pose: new Float32Array(5),
            };
            sceneRef.current = scene;
            draw(scene, 0);
        };
        build();
        // Reduced motion: no loop, the still sky redraws once the gate shows (or moves)
        const still = window.matchMedia('(prefers-reduced-motion: reduce)');
        const unwatch = watchGateOccluder(occluder, () => { if (still.matches && sceneRef.current) draw(sceneRef.current, 0); });

        let resizeTimer = 0;
        const onResize = () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(build, fx.resizeDebounceMs);
        };
        const onPointerMove = (event: PointerEvent) => {
            if (event.pointerType === 'touch') return;
            pointer.tx = event.clientX / window.innerWidth - 0.5;
            pointer.ty = event.clientY / window.innerHeight - 0.5;
        };
        window.addEventListener('resize', onResize);
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        return () => {
            window.clearTimeout(resizeTimer);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('pointermove', onPointerMove);
            unwatch();
            sceneRef.current = null;
        };
    }, [draw, occluder]);

    const onFrame = useCallback((deltaMs: number, time: number) => {
        const scene = sceneRef.current;
        if (!scene) return;
        const { pointer } = scene;
        pointer.x += (pointer.tx - pointer.x) * fx.pointerSmoothing;
        pointer.y += (pointer.ty - pointer.y) * fx.pointerSmoothing;
        for (let i = 0; i < scene.layers.length; i++) driftStars(scene.layers[i], deltaMs, scene.width);
        if (time >= scene.nextMeteor) {
            spawnMeteor(scene.pool, scene.width, scene.height, fx.meteor, scene.random);
            scene.nextMeteor = time + inRange(scene.random, fx.meteor.intervalMs);
        }
        if (time >= scene.nextComet) {
            cometSprites(scene.sprites);
            spawnMeteor(scene.comets, scene.width, scene.height, fx.comet, scene.random);
            scene.nextComet = time + inRange(scene.random, fx.comet.intervalMs);
        }
        advanceMeteors(scene.pool, deltaMs);
        advanceMeteors(scene.comets, deltaMs);
        draw(scene, time);
    }, [draw]);

    useAnimationLoop(onFrame, { target: canvasRef });

    return <canvas ref={canvasRef} className={styles.stars} aria-hidden="true" />;
};

export default StarField;
