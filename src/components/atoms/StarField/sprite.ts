/** An offscreen canvas for a sprite drawn once at setup, and its context (null if 2D is unavailable). */
export function canvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D | null] {
    const element = document.createElement('canvas');
    element.width = width;
    element.height = height;
    return [element, element.getContext('2d')];
}
