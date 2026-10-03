export interface PixelRatioCaps {
    /** Cap with a mouse or trackpad (desktop) */
    fine: number;
    /** Cap with a touch screen (phones, tablets) */
    coarse: number;
    /** Cap on the canvas backing store, in device pixels */
    maxPixels: number;
}

/**
 * Pixel ratio of a full-screen canvas: the device ratio, capped per pointer
 * type and by the total pixel count (a 1440p screen at ratio 2 would need a
 * 15-megapixel backing store per canvas). Never below 1.
 */
export function capPixelRatio(
    devicePixelRatio: number,
    width: number,
    height: number,
    coarsePointer: boolean,
    caps: PixelRatioCaps
): number {
    const cap = coarsePointer ? caps.coarse : caps.fine;
    const byArea = width > 0 && height > 0 ? Math.sqrt(caps.maxPixels / (width * height)) : cap;
    return Math.max(1, Math.min(devicePixelRatio || 1, cap, byArea));
}
