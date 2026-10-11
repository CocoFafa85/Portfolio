/**
 * Pixel ratio of a canvas: the ratio its device class may draw at (renderBudget: the screen's own
 * ratio under the class cap), then capped by the canvas's pixel count (a 1440p screen at ratio 2
 * would need a 15-megapixel backing store per canvas). Never below 1.
 */
export function capPixelRatio(ratio: number, width: number, height: number, maxPixels: number): number {
    const byArea = width > 0 && height > 0 ? Math.sqrt(maxPixels / (width * height)) : ratio;
    return Math.max(1, Math.min(ratio || 1, byArea));
}
