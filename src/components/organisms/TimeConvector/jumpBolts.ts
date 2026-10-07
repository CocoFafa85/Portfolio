import { useEffect, useState, type RefObject } from 'react';
import { convectorEffects as fx } from '../../../data/effects';
import { createRandom } from '../../../utils/random';
import { createBolts } from '../../../utils/timeCircuits/bolts';

/** Lightning of a jump, in the console's own pixels. */
export interface BoltField {
    width: number;
    height: number;
    /** The flux capacitor's centre, where every bolt starts and the flash glows */
    originX: number;
    originY: number;
    paths: string[];
}

/**
 * Measures the console and its flux capacitor, then draws the bolts from
 * the capacitor to the console's edges (seeded: the same lightning for a
 * given layout).
 */
export function measureBolts(console: HTMLElement, capacitor: HTMLElement | null): BoltField {
    const frame = console.getBoundingClientRect();
    const box = capacitor?.getBoundingClientRect() ?? frame;
    const originX = box.left + box.width / 2 - frame.left;
    const originY = box.top + box.height * 0.45 - frame.top;
    const paths = createBolts(createRandom(fx.boltSeed), originX, originY, frame.width, frame.height, fx.bolts);
    return { width: frame.width, height: frame.height, originX, originY, paths };
}

/**
 * The bolt field of the console once it is powered, measured again after
 * each resize (debounced): never while a jump plays. The capacitor is found
 * by its engraved label (data-label).
 */
export function useBoltField(consoleRef: RefObject<HTMLElement | null>, enabled: boolean): BoltField | null {
    const [field, setField] = useState<BoltField | null>(null);

    useEffect(() => {
        const frame = consoleRef.current;
        if (!enabled || !frame) return;
        let timer = 0;
        const measure = () => setField(measureBolts(frame, frame.querySelector<HTMLElement>('[data-label]')));
        // Fires once on observe(), then on every size change
        const observer = new ResizeObserver(() => {
            window.clearTimeout(timer);
            timer = window.setTimeout(measure, fx.resizeDebounceMs);
        });
        observer.observe(frame);
        return () => {
            window.clearTimeout(timer);
            observer.disconnect();
        };
    }, [consoleRef, enabled]);

    return field;
}
