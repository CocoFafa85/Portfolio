/** Colours of the circuit canvas, read from the design tokens (main.scss :root). */
export interface CircuitPalette {
    mask: string;
    copper: string;
    copperLight: string;
    gold: string;
    silk: string;
    chip: string;
    chipEdge: string;
    pin: string;
    pulse: string;
    pulseCore: string;
}

const TOKENS: Record<keyof CircuitPalette, string> = {
    mask: '--pcb-mask',
    copper: '--pcb-copper',
    copperLight: '--pcb-copper-light',
    gold: '--pcb-gold',
    silk: '--pcb-silk',
    chip: '--pcb-chip',
    chipEdge: '--pcb-chip-edge',
    pin: '--pcb-pin',
    pulse: '--neon-cyan',
    pulseCore: '--text-primary',
};

/** Resolves every token once (canvas colours are plain strings, read at setup, never per frame). */
export function readPalette(): CircuitPalette {
    const style = getComputedStyle(document.documentElement);
    const palette = {} as CircuitPalette;
    for (const key of Object.keys(TOKENS) as (keyof CircuitPalette)[]) {
        palette[key] = style.getPropertyValue(TOKENS[key]).trim();
    }
    return palette;
}
