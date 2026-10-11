import { useSyncExternalStore } from 'react';
import { mediaQueries } from '../data/breakpoints';
import { deviceBudget } from '../data/effects';
import { deviceClass, renderBudget, type DeviceClass, type DeviceTraits, type RenderBudget } from '../utils/budget';
import { mediaList, useMediaQuery } from './useMediaQuery';

/** A finger and no hover, right now: a media query, it never forces a layout */
export function readTouch(): boolean {
    return mediaList(mediaQueries.touch).matches;
}

/**
 * The screen as it is now (layout viewport, pointer, cores). Reading the viewport's size forces a
 * layout when the page has just changed: never in a render nor right after a commit (LOT 6, C2).
 */
export function readDeviceTraits(): DeviceTraits {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio,
        coarse: readTouch(),
        cores: navigator.hardwareConcurrency || 0,
    };
}

/**
 * Render budget of the screen right now (LOT 6, B1): read by each canvas when it sizes itself (on
 * mount and on every resize), never in a frame loop and without a React render.
 */
export function readRenderBudget(): RenderBudget {
    return renderBudget(readDeviceTraits(), deviceBudget);
}

const subscribe = (onChange: () => void) => {
    const touch = mediaList(mediaQueries.touch);
    window.addEventListener('resize', onChange);
    touch.addEventListener('change', onChange);
    return () => {
        window.removeEventListener('resize', onChange);
        touch.removeEventListener('change', onChange);
    };
};
const currentClass = () => deviceClass(readDeviceTraits(), deviceBudget);

export interface Device {
    /** A finger and no hover */
    touch: boolean;
    portrait: boolean;
}

/**
 * The device as React components see it (LOT 6, A3): touch and orientation, two media queries (no
 * layout is ever forced). A component renders again only when one of them changes.
 */
export function useDevice(): Device {
    const touch = useMediaQuery(mediaQueries.touch);
    const portrait = useMediaQuery(mediaQueries.portrait);
    return { touch, portrait };
}

/**
 * The device's class (LOT 6, A3), from the viewport's size: only where it is needed (the gate), since
 * React reads it again after each commit of the component, and that read forced a whole layout of
 * Skills when the HoloCard mounted (60 ms on a tablet, LOT 6 C2). A rotation never changes it.
 */
export function useDeviceClass(): DeviceClass {
    return useSyncExternalStore(subscribe, currentClass, () => 'desktop' as const);
}
