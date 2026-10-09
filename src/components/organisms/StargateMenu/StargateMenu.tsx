import React, { useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { content } from '../../../data/content';
import { gateEffects as fx } from '../../../data/effects';
import { formatNavIndex } from '../../../utils/format';
import type { GateOccluder } from '../../../utils/stargate/occluder';
import { useDialNavigation } from './useDialNavigation';
import { useGateScene } from './useGateScene';
import styles from './StargateMenu.module.scss';

type CssVars = CSSProperties & Record<`--${string}`, string>;
// The links fade out when the camera starts its dive
const DIVE_VARS: CssVars = { '--dive-at': `${fx.dial.diveAtMs}ms` };

export interface StargateMenuProps {
    /** Shared with the starfield: the gate tells it the disc it covers (it stands in front of the sky) */
    occluder: GateOccluder;
}

/**
 * Home orbital menu (LOT 2, H3): a stargate of ~27 000 particles (WebGL,
 * no 3D library) that assembles on arrival and sways gently (no pointer
 * parallax since the review of 2026-10-07). The three
 * destinations are real links, numbered 01, 02, 03 on their chevron; hover or
 * focus lights the chevron and shows the page name at the centre. The gate is
 * fitted to its own cell: it never covers the title. Render it as a child of
 * the full-screen home: its canvas covers that parent, for the dive.
 * A click plays the dial sequence, then the hyperspace (useDialNavigation).
 */
const StargateMenu: React.FC<StargateMenuProps> = ({ occluder }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cellRef = useRef<HTMLElement>(null);
    const linksRef = useRef<(HTMLElement | null)[]>([]);
    const [shown, setShown] = useState<number | null>(null);
    const gate = useGateScene(canvasRef, cellRef, linksRef, occluder);
    const { dialing, activate } = useDialNavigation(gate);

    const show = (index: number | null) => {
        if (dialing !== null) return;
        setShown(index);
        gate.hover(index === null ? -1 : fx.destinations[index]);
    };

    return (
        <>
            <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
            <nav
                ref={cellRef}
                className={styles.gate}
                aria-label={content.ui.orbitNavLabel}
                data-dialing={dialing === null ? undefined : true}
                style={DIVE_VARS}
            >
                <ul className={styles.list}>
                    {content.nav.map((item, index) => (
                        <li key={item.id}>
                            <Link
                                ref={(node) => { linksRef.current[index] = node; }}
                                to={item.path}
                                className={styles.destination}
                                onPointerEnter={() => show(index)}
                                onPointerLeave={() => show(null)}
                                onFocus={() => show(index)}
                                onBlur={() => show(null)}
                                onClick={(event) => activate(event, index)}
                            >
                                {formatNavIndex(index)}{' '}
                                <span className={styles.name}>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <span className={styles.readout} aria-hidden="true">
                    {shown === null ? '' : content.nav[shown].label}
                </span>
            </nav>
        </>
    );
};

export default StargateMenu;
