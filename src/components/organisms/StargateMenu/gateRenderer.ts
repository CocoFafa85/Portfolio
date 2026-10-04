import type { GateGeometry } from '../../../utils/stargate/writer';
import type { FitSettings, GateView } from '../../../utils/stargate/view';
import { GATE_FRAGMENT_SHADER, GATE_VERTEX_SHADER } from './gateShaders';

/** Everything that changes from one frame to the next (written in place by the scene). */
export interface GateFrame {
    time: number;
    assemble: number;
    spin: number;
    vortex: number;
    dive: number;
    horizon: number;
    tiltX: number;
    tiltY: number;
    pointScale: number;
    lit: Float32Array;
}

export interface GateRenderer {
    draw(frame: GateFrame, view: GateView): void;
    dispose(): void;
}

const UNIFORMS = [
    'u_time', 'u_assemble', 'u_spin', 'u_vortex', 'u_dive', 'u_horizon', 'u_horizonIdle', 'u_focal', 'u_aspect',
    'u_camera', 'u_diveDepth', 'u_pointScale', 'u_shimmer', 'u_tilt', 'u_offset', 'u_lit', 'u_tones',
] as const;
type UniformName = (typeof UNIFORMS)[number];

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    gl.deleteShader(shader);
    return null;
}

/**
 * WebGL program of the particle gate: one static buffer per attribute,
 * one draw call per frame, additive blending. Returns null when the GPU
 * refuses the shaders (the menu then shows its CSS fallback).
 */
export function createGateRenderer(
    gl: WebGLRenderingContext,
    geometry: GateGeometry,
    tones: Float32Array,
    fit: FitSettings,
    settings: { horizonIdle: number; shimmer: number }
): GateRenderer | null {
    const vertex = compile(gl, gl.VERTEX_SHADER, GATE_VERTEX_SHADER);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, GATE_FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);

    const buffers: WebGLBuffer[] = [];
    const attributes: [string, Float32Array, number][] = [
        ['a_to', geometry.to, 3], ['a_from', geometry.from, 3], ['a_params', geometry.params, 4], ['a_tone', geometry.tones, 1],
    ];
    for (const [name, data, size] of attributes) {
        const buffer = gl.createBuffer();
        const location = gl.getAttribLocation(program, name);
        if (!buffer || location < 0) continue;
        buffers.push(buffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    }

    const u = {} as Record<UniformName, WebGLUniformLocation | null>;
    for (const name of UNIFORMS) u[name] = gl.getUniformLocation(program, name);
    gl.uniform3fv(u.u_tones, tones);
    gl.uniform1f(u.u_camera, fit.camera);
    gl.uniform1f(u.u_diveDepth, fit.diveDepth);
    gl.uniform1f(u.u_horizonIdle, settings.horizonIdle);
    gl.uniform1f(u.u_shimmer, settings.shimmer);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    return {
        draw(frame, view) {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniform1f(u.u_time, frame.time);
            gl.uniform1f(u.u_assemble, frame.assemble);
            gl.uniform1f(u.u_spin, frame.spin);
            gl.uniform1f(u.u_vortex, frame.vortex);
            gl.uniform1f(u.u_dive, frame.dive);
            gl.uniform1f(u.u_horizon, frame.horizon);
            gl.uniform1f(u.u_pointScale, frame.pointScale);
            gl.uniform2f(u.u_tilt, frame.tiltX, frame.tiltY);
            gl.uniform1fv(u.u_lit, frame.lit);
            gl.uniform1f(u.u_focal, view.focal);
            gl.uniform1f(u.u_aspect, view.aspect);
            gl.uniform2f(u.u_offset, view.offsetX, view.offsetY);
            gl.drawArrays(gl.POINTS, 0, geometry.count);
        },
        dispose() {
            buffers.forEach((buffer) => gl.deleteBuffer(buffer));
            gl.deleteProgram(program);
            gl.deleteShader(vertex);
            gl.deleteShader(fragment);
        },
    };
}
