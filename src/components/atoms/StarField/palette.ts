/** Colours of the starfield canvas, read from the design tokens (main.scss :root). */
export interface StarPalette {
    /** Sprite tints, by index: white, cyan, violet, pink */
    tints: string[];
    trail: string;
}

const TINT_TOKENS = ['--star-white', '--star-cyan', '--star-violet', '--star-pink'];

/** Resolves every token once (canvas colours are plain strings, read at setup, never per frame). */
export function readStarPalette(): StarPalette {
    const style = getComputedStyle(document.documentElement);
    const read = (token: string) => style.getPropertyValue(token).trim();
    return { tints: TINT_TOKENS.map(read), trail: read('--star-trail') };
}
