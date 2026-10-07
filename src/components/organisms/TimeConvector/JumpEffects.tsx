import React, { useEffect, useRef } from 'react';
import { convectorEffects as fx } from '../../../data/effects';
import { capPixelRatio } from '../../../utils/canvas';
import type { BoltField } from './jumpBolts';
import styles from './JumpEffects.module.scss';

export interface JumpEffectsProps {
    bolts: BoltField;
}

/** Two groups of bolts that flicker in turn, one canvas each */
const GROUPS = [0, 1];

/**
 * Draws one group of bolts once (for a console size): a wide translucent
 * halo, then the white core. Colours come from the canvas's own styles
 * (design tokens), read once per drawing.
 */
function drawBolts(canvas: HTMLCanvasElement, bolts: BoltField, group: number): void {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const ratio = capPixelRatio(window.devicePixelRatio, bolts.width, bolts.height, coarse, fx.pixelRatio);
    canvas.width = Math.round(bolts.width * ratio);
    canvas.height = Math.round(bolts.height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const style = getComputedStyle(canvas);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const paths = bolts.paths.filter((_, index) => index % GROUPS.length === group).map((path) => new Path2D(path));
    for (const [colour, width] of [[style.getPropertyValue('--halo'), fx.boltStroke.halo], [style.color, fx.boltStroke.core]] as const) {
        ctx.strokeStyle = colour;
        ctx.lineWidth = width;
        for (const path of paths) ctx.stroke(path);
    }
}

const BoltCanvas: React.FC<{ bolts: BoltField; group: number }> = ({ bolts, group }) => {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (ref.current) drawBolts(ref.current, bolts, group);
    }, [bolts, group]);
    return <canvas ref={ref} className={styles.bolts} />;
};

/**
 * The jump seen from inside the car (LOT 3, A2 bis): lightning crackles
 * from the flux capacitor over the console, a white-blue flash, then the
 * fire trails of the landing, small, under the console: the same scenery as
 * the 88 mph page trip, at the scale of the dashboard. Mounted once the
 * console is powered and drawn once per console size: a jump only plays
 * opacity and transform keyframes (started by the console's data-jump-cycle,
 * timed by its CSS variables). Lightning as SVG paths re-rasterised on every
 * jump stalled its first frames.
 */
const JumpEffects: React.FC<JumpEffectsProps> = ({ bolts }) => (
    <span className={styles.effects} aria-hidden="true">
        {GROUPS.map((group) => <BoltCanvas key={group} bolts={bolts} group={group} />)}
        <span
            className={styles.flash}
            style={{ '--origin-x': `${bolts.originX}px`, '--origin-y': `${bolts.originY}px` } as React.CSSProperties}
        />
        <span className={`${styles.fire} ${styles.high}`} />
        <span className={`${styles.fire} ${styles.low}`} />
    </span>
);

export default JumpEffects;
