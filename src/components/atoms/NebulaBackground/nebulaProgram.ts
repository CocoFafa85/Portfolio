/*
 * Home nebula program (LOT 2, H4).
 * Fragment shader: `meshGradientFragmentShader` of Paper Shaders
 * (@paper-design/shaders 0.0.81, https://github.com/paper-design/shaders),
 * Apache License 2.0, used unchanged.
 * Vertex shader: derived from Paper Shaders' vertex shader (Apache License 2.0).
 * Change: its object sizing reduced to the case used here (fit = cover,
 * centred, scale 1, no rotation), which only outputs v_objectUV.
 * Why our own mount: Paper's ShaderMount compiles synchronously (a 100+ ms
 * long task on a weak or software GPU); this one compiles in parallel.
 */
import { getShaderColorFromString, meshGradientFragmentShader } from '@paper-design/shaders';
import { finishProgram, isProgramReady, startProgram, withPrecision, type PendingProgram } from '../../../webgl/program';

const VERTEX_SHADER = `#version 300 es
precision mediump float;
layout(location = 0) in vec4 a_position;
uniform vec2 u_resolution;
out vec2 v_objectUV;
void main() {
    gl_Position = a_position;
    v_objectUV = a_position.xy * 0.5 * u_resolution / max(u_resolution.x, u_resolution.y);
}`;

/** Mesh settings (values in effects.ts) and its colour spots (CSS colours from the tokens). */
export interface NebulaLook {
    colors: string[];
    distortion: number;
    swirl: number;
    grainMixer: number;
    grainOverlay: number;
}

export interface NebulaRenderer {
    /** `time` in seconds of animation (speed already applied) */
    draw(time: number): void;
    dispose(): void;
}

export function startNebulaProgram(gl: WebGL2RenderingContext): PendingProgram | null {
    return startProgram(gl, VERTEX_SHADER, withPrecision(gl, meshGradientFragmentShader));
}

/** 'waiting' while compiling, then the renderer (or null when the GPU refused it). */
export function finishNebula(pending: PendingProgram, look: NebulaLook): NebulaRenderer | null | 'waiting' {
    if (!isProgramReady(pending)) return 'waiting';
    const program = finishProgram(pending);
    const gl = pending.gl as WebGL2RenderingContext;
    if (!program) return null;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const at = (name: string) => gl.getUniformLocation(program, name);
    gl.uniform4fv(at('u_colors'), look.colors.flatMap((colour) => getShaderColorFromString(colour)));
    gl.uniform1f(at('u_colorsCount'), look.colors.length);
    gl.uniform1f(at('u_distortion'), look.distortion);
    gl.uniform1f(at('u_swirl'), look.swirl);
    gl.uniform1f(at('u_grainMixer'), look.grainMixer);
    gl.uniform1f(at('u_grainOverlay'), look.grainOverlay);
    const time = at('u_time');
    const resolution = at('u_resolution');

    return {
        draw(seconds) {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.uniform2f(resolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.uniform1f(time, seconds);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        },
        dispose() {
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
        },
    };
}
