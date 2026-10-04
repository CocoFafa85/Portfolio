/**
 * Shaders of the particle gate (LOT 2, H3). The vertex shader does all the
 * motion: assembly from the cloud, glyph ring spin, horizon vortex, chevron
 * light, camera tilt and dive, perspective (same maths as utils/stargate/view.ts,
 * used to place the DOM links). The CPU only sets ~20 uniforms per frame.
 */
export const GATE_VERTEX_SHADER = `
attribute vec3 a_to;
attribute vec3 a_from;
attribute vec4 a_params;
attribute float a_tone;
uniform float u_time, u_assemble, u_spin, u_vortex, u_dive, u_horizon, u_horizonIdle;
uniform float u_focal, u_aspect, u_camera, u_diveDepth, u_pointScale, u_shimmer;
uniform vec2 u_tilt, u_offset;
uniform float u_lit[9];
uniform vec3 u_tones[7];
varying vec3 v_color;
varying float v_alpha;

vec2 rot(vec2 v, float a) {
    float c = cos(a), s = sin(a);
    return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

void main() {
    vec3 p = a_to;
    float group = a_params.y;
    float boost = 1.0;
    float alpha = 1.0;
    if (group > 0.5 && group < 1.5) p.xy = rot(p.xy, u_spin);
    if (group > 1.5 && group < 2.5) {
        float light = u_lit[int(a_params.w + 0.5)];
        boost = 1.0 + light * 1.4;
        alpha = 0.5 + 0.5 * min(light, 1.0);
    }
    if (group > 2.5) {
        float r = length(p.xy);
        p.xy = rot(p.xy, u_time * (0.06 + u_vortex * 3.0) / (0.25 + r));
        p.z -= u_vortex * 0.6 * (0.62 - r);
        alpha = mix(u_horizonIdle, 1.0, u_horizon);
        boost = 1.0 + u_vortex * 0.8;
    }
    float k = clamp((u_assemble - a_params.z * 0.45) / 0.55, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    p = mix(a_from, p, k);
    p.xy += u_shimmer * vec2(sin(u_time * 1.3 + a_params.w * 40.0), cos(u_time * 1.1 + a_params.z * 30.0));

    vec3 q = p;
    q.xz = rot(q.xz, u_tilt.y);
    q.yz = rot(q.yz, u_tilt.x);
    float depth = u_camera - u_dive * u_diveDepth - q.z;
    if (depth < 0.03) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        gl_PointSize = 0.0;
        return;
    }
    gl_Position = vec4(
        q.x * u_focal / (depth * u_aspect) + u_offset.x * (1.0 - u_dive),
        q.y * u_focal / depth + u_offset.y * (1.0 - u_dive),
        0.0, 1.0);
    gl_PointSize = clamp(a_params.x * u_pointScale * boost / depth, 1.0, 48.0);
    v_color = u_tones[int(a_tone + 0.5)] * min(boost, 1.8);
    v_alpha = alpha * clamp(1.5 - depth * 0.3, 0.25, 1.0) * (0.25 + 0.75 * k);
}`;

/** Soft round particle, added up on screen (additive blending). */
export const GATE_FRAGMENT_SHADER = `
precision mediump float;
varying vec3 v_color;
varying float v_alpha;

void main() {
    vec2 d = gl_PointCoord - 0.5;
    float a = exp(-dot(d, d) * 14.0) * v_alpha;
    gl_FragColor = vec4(v_color * a, a);
}`;
