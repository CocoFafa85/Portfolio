import { gateEffects as fx } from '../../../data/effects';
import { assembleProgress, createDialState, dialState, type DialState } from '../../../utils/stargate/dial';
import { fitGate, projectGatePoint, type GateView, type Rect } from '../../../utils/stargate/view';
import { onGate } from '../../../utils/stargate/writer';
import type { GateFrame, GateRenderer } from './gateRenderer';

/** State of the particle gate, built once; nothing here is allocated per frame. */
export interface GateScene {
    canvas: HTMLCanvasElement;
    /** Null until the program is ready (gateBoot.ts), or without WebGL: the links are placed anyway */
    renderer: GateRenderer | null;
    view: GateView;
    frame: GateFrame;
    dial: DialState;
    cell: Rect;
    width: number;
    height: number;
    /** Assembly start, then the dial start (-1 when idle) and its chevron */
    start: number;
    dialStart: number;
    chosen: number;
    hot: number;
    /** Pointer target (-0.5..0.5) and the smoothed tilt */
    pointer: { x: number; y: number };
    tilt: { x: number; y: number };
    links: (HTMLElement | null)[];
    /** Model x, y of each link anchor, inside its chevron */
    anchors: Float32Array;
    /** Last tilt and dive the links were placed for */
    placed: Float32Array;
    scratch: Float32Array;
}

const IDLE_SPIN = (Math.PI * 2) / 120_000;

/** Scene of the gate; its renderer is attached once the program is ready. */
export function createGateScene(canvas: HTMLCanvasElement, links: (HTMLElement | null)[]): GateScene {
    return {
        canvas, renderer: null, links,
        view: { focal: 0, aspect: 1, offsetX: 0, offsetY: 0 },
        frame: { time: 0, assemble: 0, spin: 0, vortex: 0, dive: 0, horizon: 0, tiltX: 0, tiltY: 0, pointScale: 1, lit: new Float32Array(9) },
        dial: createDialState(fx.shape.chevrons.count),
        cell: { x: 0, y: 0, width: 0, height: 0 },
        width: 0, height: 0, start: performance.now(), dialStart: -1, chosen: 0, hot: -1,
        pointer: { x: 0, y: 0 }, tilt: { x: 0, y: 0 },
        placed: Float32Array.from([NaN, NaN, NaN]), scratch: new Float32Array(2),
        anchors: Float32Array.from(fx.destinations.flatMap((chevron) =>
            onGate((chevron / fx.shape.chevrons.count) * Math.PI * 2, fx.labelRadius))),
    };
}

/** Resizes the canvas and fits the gate to its cell (the gate never leaves it). */
export function layoutGateScene(scene: GateScene, cell: Rect, width: number, height: number, ratio: number): void {
    scene.canvas.width = Math.round(width * ratio);
    scene.canvas.height = Math.round(height * ratio);
    scene.cell = cell;
    scene.width = width;
    scene.height = height;
    fitGate(cell, width, height, fx.fit, scene.view);
    const ringRadius = (scene.view.focal / fx.fit.camera) * (height / 2);
    scene.frame.pointScale = ratio * fx.pointSize.scale * Math.max(fx.pointSize.min, ringRadius / fx.pointSize.referenceRadius);
    scene.placed[0] = NaN;
}

/**
 * Places the destination links on the tilted gate. They follow the pointer
 * tilt, not the idle sway (a 3 px drift at most): at rest nothing is
 * rewritten, so the frame loop stays free of string allocations.
 */
function placeLinks(scene: GateScene): void {
    const { tilt, frame, placed, scratch, anchors } = scene;
    const moved = Math.abs(tilt.x - placed[0]) + Math.abs(tilt.y - placed[1]) + Math.abs(frame.dive - placed[2]);
    // NaN (never placed, or a new layout) never compares as small: it forces a placement
    if (moved * scene.height <= fx.linkEpsilon) return;
    placed[0] = tilt.x;
    placed[1] = tilt.y;
    placed[2] = frame.dive;
    for (let i = 0; i < scene.links.length; i++) {
        const link = scene.links[i];
        if (!link || !projectGatePoint(anchors[2 * i], anchors[2 * i + 1], 0, tilt.x, tilt.y, frame.dive,
            scene.view, fx.fit, scene.width, scene.height, scratch)) continue;
        link.style.transform = `translate3d(${scratch[0] - scene.cell.x}px, ${scratch[1] - scene.cell.y}px, 0) translate(-50%, -50%)`;
    }
}

/** Computes and draws one frame. `still`: reduced motion (assembled, no tilt, no time). */
export function stepGateScene(scene: GateScene, now: number, still: boolean): void {
    const { frame, tilt, pointer } = scene;
    frame.time = still ? 0 : (now / 1000) % 3600;
    frame.assemble = still ? 1 : assembleProgress(now - scene.start, fx.introMs);
    if (!still) {
        tilt.x += (pointer.y * fx.tilt.x - tilt.x) * fx.tilt.smoothing;
        tilt.y += (pointer.x * fx.tilt.y - tilt.y) * fx.tilt.smoothing;
    }
    frame.tiltX = still ? 0 : tilt.x + Math.sin(now / fx.tilt.swayPeriodX) * fx.tilt.swayX;
    frame.tiltY = still ? 0 : tilt.y + Math.sin(now / fx.tilt.swayPeriodY) * fx.tilt.swayY;
    const idleSpin = still ? 0 : now * IDLE_SPIN;
    if (scene.dialStart >= 0) {
        dialState(now - scene.dialStart, scene.chosen, fx.dial, scene.dial);
        frame.lit.set(scene.dial.lit);
        frame.spin = idleSpin + scene.dial.spin;
        frame.vortex = scene.dial.vortex;
        frame.horizon = scene.dial.horizon;
        frame.dive = scene.dial.dive;
    } else {
        for (let k = 0; k < frame.lit.length; k++) {
            const target = k === scene.hot ? 1 : 0;
            frame.lit[k] = still ? target : frame.lit[k] + (target - frame.lit[k]) * fx.hoverSmoothing;
        }
        frame.spin = idleSpin;
    }
    scene.renderer?.draw(frame, scene.view);
    placeLinks(scene);
}
