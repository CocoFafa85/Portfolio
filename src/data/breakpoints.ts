/**
 * Device classes (LOT 6, A1): the scripts' copy of src/styles/_breakpoints.scss, kept equal by
 * breakpoints.test.ts. Widths in CSS px: mobile below `tablet`; one column below `wide` (and an
 * upright tablet up to `touchMax`); two columns from `wide`; the widest layouts from `large`.
 */
export const breakpoints = {
    tablet: 600,
    wide: 1024,
    large: 1280,
    touchMax: 1366,
} as const;

export type Breakpoints = typeof breakpoints;

/** Capability queries read by the scripts (the touch one equals $q-touch, checked by the test) */
export const mediaQueries = {
    touch: '(hover: none) and (pointer: coarse)',
    portrait: '(orientation: portrait)',
} as const;
