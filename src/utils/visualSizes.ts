/** Widths of the trajectory that decide how wide a card's visual shows (CSS px; projectVisuals.json). */
export interface VisualLayout {
    /** Widest visual (two columns at full width) and the screen width from which it shows */
    widest: number;
    widestFrom: number;
    /** Two columns: what half the screen loses to the axis gap, paddings and the card's frame */
    columnChrome: number;
    /** One column: what the screen loses to the axis lane, paddings and frame, on a phone and above */
    mobileChrome: number;
    narrowChrome: number;
}

/** The device widths the layout switches at (data/breakpoints.ts) */
export interface VisualBreakpoints {
    tablet: number;
    wide: number;
}

/**
 * The `sizes` attribute of a project visual, from the breakpoints and the trajectory's widths: the
 * browser picks the smallest source wide enough before the layout is known.
 */
export function visualSizes(bp: VisualBreakpoints, layout: VisualLayout): string {
    return [
        `(min-width: ${layout.widestFrom}px) ${layout.widest}px`,
        `(min-width: ${bp.wide}px) calc(50vw - ${layout.columnChrome}px)`,
        `(max-width: ${bp.tablet - 0.02}px) calc(100vw - ${layout.mobileChrome}px)`,
        `calc(100vw - ${layout.narrowChrome}px)`,
    ].join(', ');
}
