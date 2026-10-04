import { hexToRgb01 } from '../../../utils/color';
import { TONE_COUNT } from '../../../utils/stargate/writer';

/** Design tokens of the gate tones, in TONE order (main.scss :root). */
const TOKENS = ['--gate-aura', '--gate-body', '--gate-rim', '--gate-glyph', '--gate-chevron', '--gate-chevron-core', '--gate-horizon'];

/** RGB (0..1) of every tone, read once at setup for the `u_tones` uniform. */
export function readGateTones(): Float32Array {
    const style = getComputedStyle(document.documentElement);
    const tones = new Float32Array(TONE_COUNT * 3);
    TOKENS.forEach((token, tone) => hexToRgb01(style.getPropertyValue(token), tones, tone * 3));
    return tones;
}
