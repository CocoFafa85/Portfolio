import { describe, expect, it } from 'vitest';
import { distanceToPolyline, pointAlong, polylineLength, routeBusTrace, type BusTrace, type Point } from './geometry';

const busTrace = (rank: number, y: number): BusTrace => ({
    x: 0, y, dirX: -1, dirY: 0, turn: -1, rank, pitch: 6, lead: 10, diagonal: 20, tail: 30,
});

// L-shaped polyline: (0,0) → (30,0) → (30,40), length 70
const L_SHAPE = [0, 0, 30, 0, 30, 40];

describe('routeBusTrace', () => {
    it('keeps parallel traces one pitch apart through the 45° bend', () => {
        // Arrange: two neighbour pins of a left-side bus turning up (rank 0 = top pin)
        const out: number[] = [];

        // Act
        routeBusTrace(out, busTrace(0, 0));
        routeBusTrace(out, busTrace(1, 6));

        // Assert: distance between the two parallel diagonals (normal of direction (-1,-1))
        const [nx, ny] = [Math.SQRT1_2, -Math.SQRT1_2];
        const gap = Math.abs((out[12] - out[4]) * nx + (out[13] - out[5]) * ny);
        expect(gap).toBeCloseTo(6, 9);
    });

    it('only draws horizontal, vertical or 45° segments', () => {
        // Arrange
        const out: number[] = [];

        // Act
        routeBusTrace(out, { ...busTrace(2, 0), dirX: 0, dirY: 1, turn: 1 });

        // Assert
        for (let i = 2; i < out.length; i += 2) {
            const dx = Math.abs(out[i] - out[i - 2]);
            const dy = Math.abs(out[i + 1] - out[i - 1]);
            expect(dx < 1e-9 || dy < 1e-9 || Math.abs(dx - dy) < 1e-9).toBe(true);
        }
    });
});

describe('polylineLength / pointAlong', () => {
    it('measures the polyline', () => {
        // Arrange / Act
        const length = polylineLength(L_SHAPE, 0, 3);

        // Assert
        expect(length).toBe(70);
    });

    it('finds the point after the corner', () => {
        // Arrange
        const out: Point = { x: 0, y: 0 };

        // Act
        pointAlong(L_SHAPE, 0, 3, 50, out);

        // Assert
        expect(out).toEqual({ x: 30, y: 20 });
    });

    it('clamps distances outside the polyline to its ends', () => {
        // Arrange
        const before: Point = { x: 9, y: 9 };
        const after: Point = { x: 9, y: 9 };

        // Act
        pointAlong(L_SHAPE, 0, 3, -5, before);
        pointAlong(L_SHAPE, 0, 3, 500, after);

        // Assert
        expect(before).toEqual({ x: 0, y: 0 });
        expect(after).toEqual({ x: 30, y: 40 });
    });
});

describe('distanceToPolyline', () => {
    it('returns the distance to the closest segment', () => {
        // Arrange / Act
        const nearFirst = distanceToPolyline(L_SHAPE, 0, 3, 10, 5);
        const nearSecond = distanceToPolyline(L_SHAPE, 0, 3, 40, 30);

        // Assert
        expect(nearFirst).toBe(5);
        expect(nearSecond).toBe(10);
    });
});
