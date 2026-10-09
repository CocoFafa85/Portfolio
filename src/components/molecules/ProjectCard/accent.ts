import { projectEffects as fx } from '../../../data/effects';
import { cssColorToHex, readableTint } from '../../../utils/color';

let panel: string | null | undefined;
const tints = new Map<string, string>();

/**
 * A card's accent made readable as text on the block panel (AA, small text): the panel colour is
 * read once from --block-bg (Sass writes it as a fractional rgb()), each tint computed once.
 * Without the variable, the colour as is.
 */
export function accentOf(color: string): string {
    if (panel === undefined) panel = cssColorToHex(getComputedStyle(document.documentElement).getPropertyValue('--block-bg'));
    if (!panel) return color;
    let tint = tints.get(color);
    if (!tint) {
        tint = readableTint(color, panel, fx.accentContrast);
        tints.set(color, tint);
    }
    return tint;
}
