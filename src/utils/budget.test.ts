import { describe, expect, it } from 'vitest';
import { deviceClass, renderBudget, type BudgetSettings, type DeviceTraits } from './budget';

const SETTINGS: BudgetSettings = {
    tabletFrom: 600,
    touchMax: 1366,
    classes: {
        mobile: { pixelRatio: 1.5, density: 0.9 },
        tablet: { pixelRatio: 1.75, density: 1 },
        desktop: { pixelRatio: 2, density: 1 },
    },
    fewCores: 4,
    slow: { pixelRatio: 1.25, density: 0.7 },
};
const device = (traits: Partial<DeviceTraits>): DeviceTraits => ({ width: 1440, height: 900, pixelRatio: 2, coarse: false, cores: 8, ...traits });

describe('deviceClass (B1)', () => {
    it('makes every screen with a mouse or a trackpad a desktop, whatever its width', () => {
        // Arrange
        const narrow = device({ width: 375, height: 812 });

        // Act
        const result = deviceClass(narrow, SETTINGS);

        // Assert
        expect(result).toBe('desktop');
    });

    it('makes a touch screen a phone below the tablet width, on its shorter side (a rotation keeps the class)', () => {
        // Arrange
        const upright = device({ width: 375, height: 812, coarse: true });
        const onItsSide = device({ width: 812, height: 375, coarse: true });

        // Act
        const classes = [deviceClass(upright, SETTINGS), deviceClass(onItsSide, SETTINGS)];

        // Assert
        expect(classes).toEqual(['mobile', 'mobile']);
    });

    it('makes a touch screen up to the touch maximum a tablet, in both orientations', () => {
        // Arrange
        const screens = [[768, 1024], [1024, 768], [1024, 1366], [1366, 1024], [800, 1280]].map(([width, height]) => device({ width, height, coarse: true }));

        // Act
        const classes = screens.map((screen) => deviceClass(screen, SETTINGS));

        // Assert
        expect(classes).toEqual(['tablet', 'tablet', 'tablet', 'tablet', 'tablet']);
    });

    it('makes a touch screen longer than the touch maximum a desktop (a touch monitor)', () => {
        // Arrange
        const monitor = device({ width: 1920, height: 1080, coarse: true });

        // Act
        const result = deviceClass(monitor, SETTINGS);

        // Assert
        expect(result).toBe('desktop');
    });
});

describe('renderBudget (B1)', () => {
    it('gives the class budget, its pixel ratio capped by the screen\'s own', () => {
        // Arrange
        const tablet = device({ width: 820, height: 1180, coarse: true, pixelRatio: 2 });

        // Act
        const budget = renderBudget(tablet, SETTINGS);

        // Assert
        expect(budget).toEqual({ deviceClass: 'tablet', pixelRatio: 1.75, density: 1 });
    });

    it('never goes above the screen\'s pixel ratio nor below 1', () => {
        // Arrange
        const lowDensity = device({ pixelRatio: 1 });
        const unknown = device({ pixelRatio: 0 });

        // Act
        const ratios = [renderBudget(lowDensity, SETTINGS).pixelRatio, renderBudget(unknown, SETTINGS).pixelRatio];

        // Assert
        expect(ratios).toEqual([1, 1]);
    });

    it('lowers the pixel ratio and the density of a slow device (few cores)', () => {
        // Arrange
        const slowPhone = device({ width: 390, height: 844, coarse: true, pixelRatio: 3, cores: 4 });

        // Act
        const budget = renderBudget(slowPhone, SETTINGS);

        // Assert
        expect(budget.deviceClass).toBe('mobile');
        expect(budget.pixelRatio).toBe(1.25);
        expect(budget.density).toBeCloseTo(0.63);
    });

    it('keeps the full budget when the number of cores is unknown', () => {
        // Arrange
        const unknownCores = device({ cores: 0 });

        // Act
        const budget = renderBudget(unknownCores, SETTINGS);

        // Assert
        expect(budget).toEqual({ deviceClass: 'desktop', pixelRatio: 2, density: 1 });
    });
});
