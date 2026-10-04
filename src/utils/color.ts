/**
 * Writes a `#rrggbb` (or `#rgb`) design token as red, green, blue in 0..1
 * into `out` at `offset` (WebGL colour uniforms). Anything else writes black.
 */
export function hexToRgb01(hex: string, out: Float32Array, offset = 0): void {
    const value = hex.trim().replace(/^#/, '');
    const full = value.length === 3 ? value.split('').map((digit) => digit + digit).join('') : value;
    const valid = /^[0-9a-f]{6}$/i.test(full);
    for (let channel = 0; channel < 3; channel++) {
        out[offset + channel] = valid ? parseInt(full.slice(channel * 2, channel * 2 + 2), 16) / 255 : 0;
    }
}
