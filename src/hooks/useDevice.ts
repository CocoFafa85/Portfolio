import { useSyncExternalStore } from 'react';
import { mediaQueries } from '../data/breakpoints';
import { deviceBudget } from '../data/effects';
import { deviceClass, renderBudget, type DeviceClass, type DeviceTraits, type RenderBudget } from '../utils/budget';
import { mediaList, useMediaQuery } from './useMediaQuery';

/** The screen as it is now (layout viewport, pointer, cores) */
export function readDeviceTraits(): DeviceTraits {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio,
        coarse: mediaList(mediaQueries.touch).matches,
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
    deviceClass: DeviceClass;
}

/**
 * The device as React components see it (LOT 6, A3): touch, orientation and class. A component
 * renders again only when one of them changes (a rotation changes `portrait`, never the class).
 */
export function useDevice(): Device {
    const touch = useMediaQuery(mediaQueries.touch);
    const portrait = useMediaQuery(mediaQueries.portrait);
    const kind = useSyncExternalStore(subscribe, currentClass, () => 'desktop' as const);
    return { touch, portrait, deviceClass: kind };
}
