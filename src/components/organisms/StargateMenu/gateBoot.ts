import { gateEffects as fx } from '../../../data/effects';
import { onIdleAfter } from '../../../hooks/useIdleReady';
import { createRandom } from '../../../utils/random';
import { gateGeometrySteps } from '../../../utils/stargate/geometry';
import type { GateGeometry } from '../../../utils/stargate/writer';
import { finishProgram, isProgramReady, startProgram, type PendingProgram } from '../../../webgl/program';
import { createGateRenderer, type GateRenderer } from './gateRenderer';
import { readGateTones } from './gatePalette';
import { GATE_FRAGMENT_SHADER, GATE_VERTEX_SHADER } from './gateShaders';

/** A gate being prepared: its program compiles, then its geometry is built part by part. */
export interface GateBoot {
    gl: WebGLRenderingContext;
    pending: PendingProgram;
    program: WebGLProgram | null;
    steps: Generator<void, GateGeometry> | null;
}

/**
 * Gets the WebGL context and starts compiling the gate program, without
 * waiting for it (a blocking compile is a long task on a weak GPU).
 * Null without WebGL.
 */
export function bootGate(canvas: HTMLCanvasElement): GateBoot | null {
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, depth: false, stencil: false });
    if (!gl || gl.isContextLost()) return null;
    const pending = startProgram(gl, GATE_VERTEX_SHADER, GATE_FRAGMENT_SHADER);
    return pending ? { gl, pending, program: null, steps: null } : null;
}

/**
 * Polled once per frame, one small unit of work per call (never a long
 * task): 'waiting' while the program compiles, then while the geometry is
 * built part by part; then the renderer, or null when the GPU refused the
 * program.
 */
export function finishGate(boot: GateBoot): GateRenderer | null | 'waiting' {
    if (!boot.program || !boot.steps) {
        if (!isProgramReady(boot.pending)) return 'waiting';
        boot.program = finishProgram(boot.pending);
        if (!boot.program) return null;
        boot.steps = gateGeometrySteps(fx.shape, createRandom(fx.seed));
        return 'waiting';
    }
    const step = boot.steps.next();
    if (!step.done) return 'waiting';
    return createGateRenderer(boot.gl, boot.program, step.value, readGateTones(), fx.fit, fx);
}

/**
 * Boots the gate at the first idle moment once the first frames are through
 * (see onIdleAfter: a first WebGL context created earlier blocks), then polls the compile once per frame; `onReady` gets
 * the renderer, or null without WebGL. Returns a cancel function.
 */
export function startGateBoot(canvas: HTMLCanvasElement, onReady: (renderer: GateRenderer | null) => void): () => void {
    let frame = 0;
    let cancelled = false;
    const cancelIdle = onIdleAfter(fx.bootAfterMs, fx.bootTimeoutMs, () => {
        const boot = bootGate(canvas);
        if (!boot) {
            onReady(null);
            return;
        }
        const poll = () => {
            frame = 0;
            if (cancelled) return;
            const result = finishGate(boot);
            if (result === 'waiting') frame = requestAnimationFrame(poll);
            else onReady(result);
        };
        frame = requestAnimationFrame(poll);
    });
    return () => {
        cancelled = true;
        cancelIdle();
        cancelAnimationFrame(frame);
    };
}
