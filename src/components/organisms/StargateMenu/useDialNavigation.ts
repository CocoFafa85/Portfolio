import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { content } from '../../../data/content';
import { gateEffects as fx } from '../../../data/effects';
import type { GateControls } from './useGateScene';

export interface DialNavigation {
    /** Destination being dialled (index in content.nav), null at rest */
    dialing: number | null;
    /** Click handler of a destination link (also fired by Enter) */
    activate(event: MouseEvent<HTMLAnchorElement>, index: number): void;
}

/** A click the browser should handle itself: new tab, new window, download, middle button. */
const isModified = (event: MouseEvent) =>
    event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

/**
 * Wiring of the orbital menu to the trip channel (LOT 2, A2): a plain click
 * (or Enter) on a destination plays the dial sequence — chevrons lock, the
 * horizon forms, the camera dives — then navigates; useTravel turns that
 * route change into the LOT 1 hyperspace. Modified clicks, reduced motion
 * and a gate without WebGL keep the link's own, immediate navigation.
 */
export function useDialNavigation(gate: GateControls): DialNavigation {
    const navigate = useNavigate();
    const [dialing, setDialing] = useState<number | null>(null);
    const timer = useRef(0);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const activate = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
        if (event.defaultPrevented || isModified(event)) return;
        // One trip at a time: further clicks during the sequence are ignored
        if (dialing !== null) {
            event.preventDefault();
            return;
        }
        const delay = gate.startDial(fx.destinations[index]);
        if (delay < 0) return;
        event.preventDefault();
        setDialing(index);
        timer.current = window.setTimeout(() => navigate(content.nav[index].path), delay);
    };

    return { dialing, activate };
}
