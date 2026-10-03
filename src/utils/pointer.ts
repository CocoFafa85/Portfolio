export interface PointerPosition {
    x: number;
    y: number;
}

const clampHalf = (value: number): number => Math.min(0.5, Math.max(-0.5, value));

/**
 * Normalizes viewport coordinates to the range -0.5..0.5 (0 = viewport center).
 * Writes into `out` instead of allocating, so it can run on every pointer event.
 */
export function normalizePointer(
    out: PointerPosition,
    clientX: number,
    clientY: number,
    width: number,
    height: number
): PointerPosition {
    out.x = width > 0 ? clampHalf(clientX / width - 0.5) : 0;
    out.y = height > 0 ? clampHalf(clientY / height - 0.5) : 0;
    return out;
}
