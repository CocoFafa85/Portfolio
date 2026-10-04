/** WebGL constant of KHR_parallel_shader_compile (not in the TypeScript DOM typings). */
const COMPLETION_STATUS_KHR = 0x91b1;

type Gl = WebGLRenderingContext | WebGL2RenderingContext;

/** A program whose shaders are compiling and linking in the GPU process. */
export interface PendingProgram {
    gl: Gl;
    program: WebGLProgram;
    shaders: WebGLShader[];
    /** The browser compiles in parallel: readiness can be polled without blocking */
    parallel: boolean;
}

/**
 * Starts compiling and linking a program without waiting for it: the status
 * queries that would block the main thread (tens of ms per shader on a weak
 * or software GPU) are left to `finishProgram`, called once ready.
 */
export function startProgram(gl: Gl, vertexSource: string, fragmentSource: string): PendingProgram | null {
    const parallel = gl.getExtension('KHR_parallel_shader_compile') !== null;
    const program = gl.createProgram();
    if (!program) return null;
    const shaders: WebGLShader[] = [];
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        gl.attachShader(program, shader);
        shaders.push(shader);
    }
    gl.linkProgram(program);
    return { gl, program, shaders, parallel };
}

/** True when the link is done (always true without the parallel extension: finishing then waits). */
export function isProgramReady(pending: PendingProgram): boolean {
    return !pending.parallel || pending.gl.getProgramParameter(pending.program, COMPLETION_STATUS_KHR) === true;
}

/** Checks the link (instant once ready), frees the shaders; null when the GPU refused the program. */
export function finishProgram(pending: PendingProgram): WebGLProgram | null {
    const { gl, program, shaders } = pending;
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS) === true;
    for (const shader of shaders) {
        gl.detachShader(program, shader);
        gl.deleteShader(shader);
    }
    if (linked) return program;
    gl.deleteProgram(program);
    return null;
}

/**
 * Raises float precision when `mediump` is below 23 bits (some mobile GPUs),
 * so noise-based shaders keep their look. Same rule and expressions as
 * `createProgram` of Paper Shaders (@paper-design/shaders, Apache License 2.0).
 */
export function withPrecision(gl: Gl, source: string): string {
    const format = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
    if (!format || format.precision >= 23) return source;
    return source
        .replace(/precision\s+(lowp|mediump)\s+float/g, 'precision highp float')
        .replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g, '$1 highp $3');
}
