import { describe, expect, it } from 'vitest';
import { circuitEffects } from '../../data/effects';
import { createRandom } from '../random';
import { generateBoard, type Board } from './board';
import { calmHalfWidth } from './density';

const DESIGNATORS = { chip: 'U', resistor: 'R', capacitor: 'C' };
const build = (width: number, height: number, seed = 1955): Board =>
    generateBoard(width, height, circuitEffects.board, DESIGNATORS, createRandom(seed));

describe('generateBoard', () => {
    it('is reproducible for the same seed and screen', () => {
        // Arrange / Act
        const first = build(1440, 900);
        const second = build(1440, 900);

        // Assert
        expect(second.points).toEqual(first.points);
        expect(second.chips).toEqual(first.chips);
    });

    it('routes every trace horizontally, vertically or at 45°', () => {
        // Arrange
        const board = build(1440, 900);
        const { points } = board;
        let offAxis = 0;

        // Act
        for (let t = 0; t < board.traceCount; t++) {
            for (let i = board.traceStart[t] + 1; i < board.traceStart[t + 1]; i++) {
                const dx = Math.abs(points[2 * i] - points[2 * i - 2]);
                const dy = Math.abs(points[2 * i + 1] - points[2 * i - 1]);
                if (dx > 1e-3 && dy > 1e-3 && Math.abs(dx - dy) > 1e-3) offAxis++;
            }
        }

        // Assert
        expect(board.traceCount).toBeGreaterThan(100);
        expect(offAxis).toBe(0);
    });

    it('packs consistent arrays: one via per trace, positive lengths, no NaN', () => {
        // Arrange / Act
        const board = build(1440, 900);

        // Assert
        expect(board.traceStart[board.traceCount]).toBe(board.points.length / 2);
        expect(board.vias.length).toBe(board.traceCount * 2);
        expect(board.traceLength.every((length) => length > 0)).toBe(true);
        expect(board.points.every((value) => Number.isFinite(value))).toBe(true);
    });

    it('keeps the middle of the screen calmer than its sides', () => {
        // Arrange
        const width = 1440;
        const board = build(width, 900);
        const half = calmHalfWidth(width, circuitEffects.board.calm);
        let center = 0;
        let sides = 0;

        // Act: count trace vertices per pixel of width in each zone
        for (let i = 0; i < board.points.length; i += 2) {
            if (Math.abs(board.points[i] - width / 2) < half) center++;
            else sides++;
        }

        // Assert
        expect(center / (2 * half)).toBeLessThan((sides / (width - 2 * half)) * 0.5);
    });

    it('still produces a valid, sparser board on a phone', () => {
        // Arrange / Act
        const phone = build(375, 812);
        const desktop = build(1440, 900);

        // Assert
        expect(phone.traceCount).toBeGreaterThan(0);
        expect(phone.traceCount).toBeLessThan(desktop.traceCount);
        expect(phone.points.every((value) => Number.isFinite(value))).toBe(true);
    });

    it('labels chips and passives with the silkscreen prefixes', () => {
        // Arrange / Act
        const board = build(1440, 900);

        // Assert
        expect(board.chips.every((chip) => /^U\d+$/.test(chip.label))).toBe(true);
        expect(board.parts.every((part) => /^[RC]\d+$/.test(part.label))).toBe(true);
    });
});
