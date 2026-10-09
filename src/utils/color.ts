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

const channels = (hex: string): number[] => {
    const out = new Float32Array(3);
    hexToRgb01(hex, out);
    return [...out];
};

const toHex = (rgb: number[]): string =>
    `#${rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, '0')).join('')}`;

/**
 * A CSS colour as `#rrggbb`: hex (`#rgb`, `#rrggbb`) or `rgb()` / `rgba()` with fractional
 * channels (how Sass writes a mixed token such as $block-bg), alpha ignored; null otherwise.
 */
export function cssColorToHex(value: string): string | null {
    const text = value.trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text)) return toHex(channels(text));
    const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
    return rgb ? toHex(rgb.slice(1, 4).map((channel) => Number(channel) / 255)) : null;
}

/** WCAG relative luminance of a `#rrggbb` colour. */
export function relativeLuminance(hex: string): number {
    const [r, g, b] = channels(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two `#rrggbb` colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
    const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
    return (light + 0.05) / (dark + 0.05);
}

/**
 * A brand colour readable on `background` (LOT 4, badges): kept as is when its
 * contrast reaches `minRatio`, otherwise mixed with white by the smallest step
 * that reaches it (Angular's near-black #0f0f11 on the dark badges).
 */
export function readableTint(hex: string, background: string, minRatio = 3): string {
    const base = channels(hex);
    for (let step = 0; step <= 20; step++) {
        const t = step / 20;
        const tint = toHex(base.map((c) => c + (1 - c) * t));
        if (contrastRatio(tint, background) >= minRatio) return tint;
    }
    return '#ffffff';
}
