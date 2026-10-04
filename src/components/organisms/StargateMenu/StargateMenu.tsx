import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { content } from '../../../data/content';
import { gateEffects as fx } from '../../../data/effects';
import { formatNavIndex } from '../../../utils/format';
import { useGateScene } from './useGateScene';
import styles from './StargateMenu.module.scss';

/**
 * Home orbital menu (LOT 2, H3): a stargate of ~16 000 particles (WebGL,
 * no 3D library) that assembles on arrival and follows the pointer. The three
 * destinations are real links, numbered 01, 02, 03 on their chevron; hover or
 * focus lights the chevron and shows the page name at the centre. The gate is
 * fitted to its own cell: it never covers the title. Render it as a child of
 * the full-screen home: its canvas covers that parent, for the dive.
 */
const StargateMenu: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cellRef = useRef<HTMLElement>(null);
    const linksRef = useRef<(HTMLElement | null)[]>([]);
    const [shown, setShown] = useState<number | null>(null);
    const gate = useGateScene(canvasRef, cellRef, linksRef);

    const show = (index: number | null) => {
        setShown(index);
        gate.hover(index === null ? -1 : fx.destinations[index]);
    };

    return (
        <>
            <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
            <nav ref={cellRef} className={styles.gate} aria-label={content.ui.orbitNavLabel}>
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
