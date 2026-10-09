import { describe, expect, it } from 'vitest';
import { fitGate, gateDisc, projectGatePoint, type FitSettings, type GateView, type Rect } from './view';

const FIT: FitSettings = { extent: 1.4, sideExtent: 1.1, margin: 8, camera: 2.6, diveDepth: 2.95 };
const W = 1440;
const H = 900;
// Cell below a heading block: 1440 × 640 starting 260 px from the top
const CELL: Rect = { x: 0, y: 260, width: 1440, height: 640 };

const fitted = (cell: Rect = CELL): GateView => {
    const view: GateView = { focal: 0, aspect: 0, offsetX: 0, offsetY: 0 };
    fitGate(cell, W, H, FIT, view);
    return view;
};
const project = (x: number, y: number, view: GateView, tilt = [0, 0], dive = 0) => {
    const out = new Float32Array(2);
    const visible = projectGatePoint(x, y, 0, tilt[0], tilt[1], dive, view, FIT, W, H, out);
    return { visible, x: out[0], y: out[1] };
};

describe('fitGate', () => {
    it('centres the gate on its cell', () => {
        // Arrange
        const view = fitted();

        // Act
        const centre = project(0, 0, view);

        // Assert
        expect(centre.x).toBeCloseTo(720, 3);
        expect(centre.y).toBeCloseTo(580, 3);
    });

    it('keeps the whole extent inside the cell, margin included', () => {
        // Arrange
        const view = fitted();

        // Act
        const top = project(0, FIT.extent, view);
        const bottom = project(0, -FIT.extent, view);

        // Assert: 640 px tall cell → radius 312 px
        expect(top.y).toBeCloseTo(260 + 8, 3);
        expect(bottom.y).toBeCloseTo(900 - 8, 3);
    });

    it('keeps the chevrons, not the aura, within a narrow cell', () => {
        // Arrange: phone-like cell, 375 wide and 500 tall
        const narrow: Rect = { x: 0, y: 300, width: 375, height: 500 };
        const view: GateView = { focal: 0, aspect: 0, offsetX: 0, offsetY: 0 };
        fitGate(narrow, 375, 812, FIT, view);
        const out = new Float32Array(2);

        // Act
        projectGatePoint(FIT.sideExtent, 0, 0, 0, 0, 0, view, FIT, 375, 812, out);

        // Assert
        expect(out[0]).toBeCloseTo(375 - 8, 3);
    });
});

describe('projectGatePoint', () => {
    it('brings the near side closer when the gate tilts (yaw)', () => {
        // Arrange
        const view = fitted();
        const flat = project(1, 0, view);

        // Act: a positive yaw turns +x toward the camera
        const turned = project(1, 0, view, [0, 0.3]);

        // Assert: foreshortened by cos(0.3) but closer, so larger than flat
        expect(turned.x - 720).toBeGreaterThan(flat.x - 720);
    });

    it('moves the gate to the screen centre while diving, and skips points behind the camera', () => {
        // Arrange
        const view = fitted();

        // Act
        const halfway = project(0, 0, view, [0, 0], 0.5);
        const through = project(0, 0, view, [0, 0], 1);

        // Assert: halfway between the cell centre (580) and the screen centre (450)
        expect(halfway.visible).toBe(true);
        expect(halfway.y).toBeCloseTo(515, 3);
        expect(through.visible).toBe(false);
    });
});

describe('gateDisc', () => {
    it('matches the projected centre and the unit radius of the gate at rest', () => {
        // Arrange
        const view = fitted();
        const out = new Float32Array(3);
        const rim = project(1, 0, view);

        // Act
        gateDisc(view, FIT, W, H, 0, out);

        // Assert
        expect(out[0]).toBeCloseTo(720, 3);
        expect(out[1]).toBeCloseTo(580, 3);
        expect(out[2]).toBeCloseTo(rim.x - 720, 3);
    });

    it('follows the dive: centred on the screen and larger, then the whole screen once through', () => {
        // Arrange
        const view = fitted();
        const rest = new Float32Array(3);
        const halfway = new Float32Array(3);
        const through = new Float32Array(3);
        gateDisc(view, FIT, W, H, 0, rest);

        // Act
        gateDisc(view, FIT, W, H, 0.5, halfway);
        gateDisc(view, FIT, W, H, 1, through);

        // Assert
        expect(halfway[1]).toBeCloseTo(515, 3);
        expect(halfway[2]).toBeGreaterThan(rest[2]);
        expect(through[2]).toBeGreaterThanOrEqual(W + H);
    });
});
