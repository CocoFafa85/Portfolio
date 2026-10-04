/*
 * Home nebula shader (LOT 2, H4), loaded in its own chunk.
 * Uses Paper Shaders — @paper-design/shaders-react 0.0.81 — Apache License 2.0,
 * https://github.com/paper-design/shaders (no visible attribution required).
 */
import React, { useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import { nebulaEffects as fx } from '../../../data/effects';
import styles from './NebulaBackground.module.scss';

/** Colour spots of the mesh, resolved once from the design tokens. */
function readColors(): string[] {
    const style = getComputedStyle(document.documentElement);
    return fx.tokens.map((token) => style.getPropertyValue(token).trim());
}

/**
 * Slow, very dark mesh gradient. Paper Shaders pauses it by itself while the
 * tab is hidden or the canvas is off screen; the pixel count is capped (a
 * soft nebula looks the same at a lower resolution).
 */
const NebulaShader: React.FC = () => {
    const [colors] = useState(readColors);
    const [coarse] = useState(() => window.matchMedia('(pointer: coarse)').matches);

    return (
        <MeshGradient
            className={styles.shader}
            colors={colors}
            distortion={fx.distortion}
            swirl={fx.swirl}
            grainMixer={fx.grainMixer}
            grainOverlay={fx.grainOverlay}
            speed={fx.speed}
            fit="cover"
            minPixelRatio={fx.minPixelRatio}
            maxPixelCount={coarse ? fx.maxPixelCount.coarse : fx.maxPixelCount.fine}
        />
    );
};

export default NebulaShader;
