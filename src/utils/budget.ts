/** The screen a page draws on, as the renderers read it once per resize. */
export interface DeviceTraits {
    /** Layout viewport, CSS px */
    width: number;
    height: number;
    /** window.devicePixelRatio (0 when unknown) */
    pixelRatio: number;
    /** A finger and no hover: a phone or a tablet */
    coarse: boolean;
    /** navigator.hardwareConcurrency (0 when unknown) */
    cores: number;
}

export type DeviceClass = 'mobile' | 'tablet' | 'desktop';

/** What a class of device may draw: its highest canvas pixel ratio, its share of the full density */
export interface ClassBudget {
    pixelRatio: number;
    /** Stars, circuit traces and gate particles drawn, as a share of the full count */
    density: number;
}

/** Values in effects.ts (deviceBudget); widths from data/breakpoints.ts */
export interface BudgetSettings {
    /** Shorter side (CSS px) from which a touch screen is a tablet */
    tabletFrom: number;
    /** Longer side (CSS px) up to which a touch screen is a tablet; beyond, a touch monitor */
    touchMax: number;
    classes: Record<DeviceClass, ClassBudget>;
    /** Up to this many cores, a device is slow */
    fewCores: number;
    /** A slow device: its pixel ratio cap, and the share of its class density it keeps */
    slow: ClassBudget;
}

export interface RenderBudget extends ClassBudget {
    deviceClass: DeviceClass;
}

/**
 * Class of a device: a mouse or a trackpad makes a desktop; a touch screen is a phone below the
 * tablet width, a tablet up to the touch maximum. Read on the shorter / longer side: turning the
 * device never changes its class.
 */
export function deviceClass(traits: DeviceTraits, settings: BudgetSettings): DeviceClass {
    if (!traits.coarse) return 'desktop';
    if (Math.min(traits.width, traits.height) < settings.tabletFrom) return 'mobile';
    return Math.max(traits.width, traits.height) <= settings.touchMax ? 'tablet' : 'desktop';
}

/**
 * Render budget of a device (LOT 6, B1): its class's pixel ratio cap (never above the screen's own
 * ratio, never below 1) and density, both lowered on a slow device. Computed once per resize; the
 * render loops only read the sizes and counts it fixed.
 */
export function renderBudget(traits: DeviceTraits, settings: BudgetSettings): RenderBudget {
    const kind = deviceClass(traits, settings);
    const base = settings.classes[kind];
    const slow = traits.cores > 0 && traits.cores <= settings.fewCores;
    const cap = slow ? Math.min(base.pixelRatio, settings.slow.pixelRatio) : base.pixelRatio;
    return {
        deviceClass: kind,
        pixelRatio: Math.max(1, Math.min(traits.pixelRatio || 1, cap)),
        density: slow ? base.density * settings.slow.density : base.density,
    };
}
