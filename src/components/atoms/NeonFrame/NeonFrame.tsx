import React, { useEffect, useRef, type CSSProperties } from 'react';
import { neonFrameEffects as fx } from '../../../data/effects';
import { useIdleReady } from '../../../hooks/useIdleReady';
import { paintNeonTurn } from './paintNeonTurn';
import styles from './NeonFrame.module.scss';

export interface NeonFrameProps {
    /** Powered on by its block (About: the convector); by default at the first idle moment after the first frames */
    lit?: boolean;
}

const FRAME_VARS = { '--neon-turn': `${fx.turnMs}ms` } as CSSProperties;

/**
 * The default border of every block (review of 2026-10-09): the HoloCard's
 * rotating neon border, cyan → violet → pink, two and a half times slower.
 * A small canvas painted once turns on the compositor (no repaint, the same
 * memory whatever the block size); a mask keeps only its 2 px ring. Never in
 * the first paint: the block's plain border shows until it powers on. The
 * parent is `position: relative` and sets `--neon-radius`. Reduced motion: a
 * still ring.
 */
const NeonFrame: React.FC<NeonFrameProps> = ({ lit }) => {
    const idle = useIdleReady(fx.powerOnTimeoutMs, fx.powerOnAfterMs);
    const on = lit ?? idle;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (on && canvasRef.current) paintNeonTurn(canvasRef.current);
    }, [on]);

    return (
        <span className={styles.frame} data-lit={on ? '' : undefined} style={FRAME_VARS} aria-hidden="true">
            <canvas ref={canvasRef} className={styles.turn} width={fx.texture} height={fx.texture} />
        </span>
    );
};

export default NeonFrame;
