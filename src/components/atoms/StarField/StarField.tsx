import React, { useCallback, useEffect, useRef } from 'react';
import { starEffects as fx } from '../../../data/effects';
import { useAnimationLoop } from '../../../hooks/useAnimationLoop';
import { capPixelRatio } from '../../../utils/canvas';
import { createRandom, inRange, type Random } from '../../../utils/random';
import { createStarLayer, driftStars, type StarLayer } from '../../../utils/starfield/layers';
import { advanceMeteors, createMeteorPool, spawnMeteor, type MeteorPool } from '../../../utils/starfield/meteors';
import { createStarSprites, drawLayer, drawMeteors, type StarSprites } from './drawStars';
import { readStarPalette } from './palette';
import styles from './StarField.module.scss';

/** Everything the animation loop touches, rebuilt on resize only. */
interface Scene {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    ratio: number;
    layers: StarLayer[];
    /** Sprite picker of each layer, made once (no closure per frame) */
    images: ((tint: number) => HTMLCanvasElement)[];
    pool: MeteorPool;
    random: Random;
    nextMeteor: number;
    /** Pointer target and smoothed parallax position (-0.5..0.5) */
    pointer: { x: number; y: number; tx: number; ty: number };
    pose: Float32Array;
    sprites: StarSprites;
}

/**
 * Home starfield (LOT 2, H4), over the nebula: twinkling mid stars and a
 * few large out-of-focus near ones (no far layer since the review of
 * 2026-10-07: a more even background), each layer shifted by its
 * own parallax with a fine pointer; rare shooting stars with a tapered tail.
 * Typed arrays, sprites drawn once, no allocation per frame; paused when the
 * tab is hidden or the canvas off screen; reduced motion: one still frame.
 */
const StarField: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<Scene | null>(null);

    const draw = useCallback((scene: Scene, time: number) => {
        const { ctx, width, height, ratio, pointer } = scene;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < scene.layers.length; i++) {
            const spec = fx.layers[i];
            drawLayer(ctx, scene.layers[i], scene.images[i], width, height,
                -pointer.x * spec.parallax, -pointer.y * spec.parallax, spec.twinkle, time);
        }
        drawMeteors(ctx, scene.pool, scene.sprites, ratio, scene.pose);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const sprites = createStarSprites(readStarPalette());
        const tinted = (tint: number) => sprites.tints[tint];
        const soft = () => sprites.soft;
        const images = fx.layers.map((_, i) => (i === fx.blurredLayer ? soft : tinted));
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
                ctx, width, height, ratio, random, pointer, sprites, images,
                layers: fx.layers.map((spec) => createStarLayer(spec, width, height, random)),
                pool: createMeteorPool(fx.meteor.max),
                nextMeteor: performance.now() + fx.firstMeteorMs,
                pose: new Float32Array(5),
            };
            sceneRef.current = scene;
            draw(scene, 0);
        };
        build();

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
            sceneRef.current = null;
        };
    }, [draw]);

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
        advanceMeteors(scene.pool, deltaMs);
        draw(scene, time);
    }, [draw]);

    useAnimationLoop(onFrame, { target: canvasRef });

    return <canvas ref={canvasRef} className={styles.stars} aria-hidden="true" />;
};

export default StarField;
