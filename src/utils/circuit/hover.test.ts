import { describe, expect, it } from 'vitest';
import type { Board } from './board';
import { createGlowState, createHoverIndex, updateGlow, type Pointer } from './hover';

// Two horizontal traces: y = 50 (x 0..300) and y = 250 (x 0..300)
const BOARD: Board = {
    width: 400,
    height: 300,
    points: Float32Array.from([0, 50, 300, 50, 0, 250, 300, 250]),
    traceStart: Uint32Array.from([0, 2, 4]),
    traceLength: Float32Array.from([300, 300]),
    traceCount: 2,
    vias: new Float32Array(4),
    pins: new Float32Array(0),
    chips: [],
    parts: [],
    partSize: 22,
};
const SETTINGS = { radius: 60, rise: 0.5, decay: 0.5 };

describe('createHoverIndex', () => {
    it('lists each trace in the cells it crosses', () => {
        // Arrange / Act
        const index = createHoverIndex(BOARD, 100);
        const cellAt = (x: number, y: number) => {
            const c = Math.floor(y / 100) * index.cols + Math.floor(x / 100);
            return Array.from(index.items.subarray(index.start[c], index.start[c + 1]));
        };

        // Assert
        expect(cellAt(150, 50)).toEqual([0]);
        expect(cellAt(150, 250)).toEqual([1]);
        expect(cellAt(350, 150)).toEqual([]);
    });
});

describe('updateGlow', () => {
    it('lights only the trace near the pointer', () => {
        // Arrange
        const index = createHoverIndex(BOARD, 100);
        const state = createGlowState(2);
        // 20 px from the first trace, which crosses the 3 cells around the pointer
        const pointer: Pointer = { x: 120, y: 70, active: true };

        // Act
        const lit = updateGlow(state, BOARD, index, pointer, SETTINGS);

        // Assert: target 2/3, half the gap closed once (not once per cell)
        expect(lit).toBe(true);
        expect(state.glow[0]).toBeCloseTo(1 / 3, 5);
        expect(state.glow[1]).toBe(0);
    });

    it('fades the glow out once the pointer is gone', () => {
        // Arrange
        const index = createHoverIndex(BOARD, 100);
        const state = createGlowState(2);
        state.glow[0] = 0.4;
        const pointer: Pointer = { x: 0, y: 0, active: false };

        // Act
        const frames = [1, 2, 3, 4, 5, 6].map(() => updateGlow(state, BOARD, index, pointer, SETTINGS));

        // Assert
        expect(frames.at(-1)).toBe(false);
        expect(state.glow[0]).toBe(0);
    });
});
