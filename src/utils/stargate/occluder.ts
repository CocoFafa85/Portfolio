/**
 * What the particle gate tells the starfield behind it (home, review of
 * 2026-10-09: the gate stands in front of the sky). Created by the home page,
 * written by the gate scene every frame, read by the starfield every frame.
 */
export interface GateOccluder {
    /** Centre x, y and unit radius of the gate on screen (CSS px), then how solid it stands: 0 not drawn, 1 assembled */
    disc: Float32Array;
    /** Called by the gate when its disc changes outside a frame loop (layout, boot): the still sky of reduced motion redraws */
    onChange: (() => void) | null;
}

export function createGateOccluder(): GateOccluder {
    return { disc: new Float32Array(4), onChange: null };
}

/** Listens to the gate's changes outside a frame loop; returns the function that stops listening. */
export function watchGateOccluder(occluder: GateOccluder, listener: () => void): () => void {
    occluder.onChange = listener;
    return () => {
        if (occluder.onChange === listener) occluder.onChange = null;
    };
}

/** The gate is gone (unmounted, lost context): the sky shows through again. */
export function releaseGateOccluder(occluder: GateOccluder): void {
    occluder.disc[3] = 0;
    occluder.onChange?.();
}
