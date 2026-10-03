/** Calm vertical band in the middle of the screen, behind the text blocks. */
export interface CalmBand {
    /** Half width as a share of the screen width */
    ratio: number;
    /** Half width cap in pixels (wide screens) */
    maxHalfWidth: number;
    /** Density inside the band (0..1) */
    floor: number;
    /** Distance over which the density climbs back to 1 */
    ramp: number;
}

/** Half width of the calm band for a screen width. */
export function calmHalfWidth(width: number, calm: CalmBand): number {
    return Math.min(width * calm.ratio, calm.maxHalfWidth);
}

/** Component density at abscissa x: `floor` inside the calm band, 1 beyond its ramp. */
export function calmDensity(x: number, width: number, calm: CalmBand): number {
    const outside = Math.abs(x - width / 2) - calmHalfWidth(width, calm);
    if (outside <= 0) return calm.floor;
    if (outside >= calm.ramp) return 1;
    return calm.floor + (1 - calm.floor) * (outside / calm.ramp);
}
