/** A rectangle in CSS pixels, relative to the full-screen gate canvas. */
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** How the gate fits its cell (values in effects.ts). */
export interface FitSettings {
    /** Farthest drawn radius in model units (aura included), with a margin for the tilt */
    extent: number;
    /** Free space kept inside the cell, in CSS pixels */
    margin: number;
    /** Distance of the camera to the gate plane at rest */
    camera: number;
    /** How far the camera travels through the gate during the dive */
    diveDepth: number;
}

/** Projection of the gate on the canvas; shared by the vertex shader and the DOM links. */
export interface GateView {
    focal: number;
    aspect: number;
    /** Cell centre in clip space: the gate is drawn there, and moves to the screen centre while diving */
    offsetX: number;
    offsetY: number;
}

/** Closest the camera may come to a particle before it is skipped */
const NEAR = 0.03;

/**
 * Sizes and centres the gate in `cell` so that its whole extent (aura and
 * tilt included) stays inside: the gate never covers the content above it.
 */
export function fitGate(cell: Rect, viewportWidth: number, viewportHeight: number, fit: FitSettings, out: GateView): void {
    const radius = Math.max(0, Math.min(cell.width, cell.height) / 2 - fit.margin);
    out.aspect = viewportWidth / viewportHeight;
    // Projected radius in pixels = extent × focal / camera × (height / 2)
    out.focal = ((radius / (viewportHeight / 2)) * fit.camera) / fit.extent;
    out.offsetX = ((cell.x + cell.width / 2) / viewportWidth) * 2 - 1;
    out.offsetY = 1 - ((cell.y + cell.height / 2) / viewportHeight) * 2;
}

/**
 * CSS pixel position of a model point, after the camera tilt (yaw then
 * pitch) and the dive, exactly like the vertex shader. Writes x, y into
 * `out` and returns false when the point is behind the camera.
 */
export function projectGatePoint(
    x: number,
    y: number,
    z: number,
    tiltX: number,
    tiltY: number,
    dive: number,
    view: GateView,
    fit: FitSettings,
    viewportWidth: number,
    viewportHeight: number,
    out: Float32Array
): boolean {
    const cy = Math.cos(tiltY);
    const sy = Math.sin(tiltY);
    const x1 = cy * x - sy * z;
    const z1 = sy * x + cy * z;
    const cx = Math.cos(tiltX);
    const sx = Math.sin(tiltX);
    const y2 = cx * y - sx * z1;
    const z2 = sx * y + cx * z1;
    const depth = fit.camera - dive * fit.diveDepth - z2;
    if (depth < NEAR) return false;
    const ndcX = (x1 * view.focal) / (depth * view.aspect) + view.offsetX * (1 - dive);
    const ndcY = (y2 * view.focal) / depth + view.offsetY * (1 - dive);
    out[0] = ((ndcX + 1) / 2) * viewportWidth;
    out[1] = ((1 - ndcY) / 2) * viewportHeight;
    return true;
}
