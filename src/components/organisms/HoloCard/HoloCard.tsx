import React, { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { content } from '../../../data/content';
import { holoEffects as fx } from '../../../data/effects';
import { useIdleReady } from '../../../hooks/useIdleReady';
import CardBack from './CardBack';
import CardFront from './CardFront';
import { useCardTilt } from './useCardTilt';
import { useCvDownload } from './useCvDownload';
import styles from './HoloCard.module.scss';

const { depth } = fx;
const SCENE_VARS = {
    '--perspective': `${fx.perspective}px`,
    '--d-half': `${depth.half}px`, '--d-film': `${depth.film}px`, '--d-print': `${depth.print}px`,
    '--d-emblem': `${depth.emblem}px`, '--d-glare': `${depth.glare}px`, '--border-turn': `${fx.borderTurnMs}ms`,
    '--press': fx.press,
    '--sway-x': `${fx.sway.x}deg`, '--sway-y': `${fx.sway.y}deg`, '--sway-ms': `${fx.sway.periodMs}ms`,
    '--drift': `${fx.film.drift * 100}%`,
} as CSSProperties;
// Edge slices between the faces, painted once: the thickness seen when the card tilts or turns
const SLICE_Z = Array.from({ length: fx.slices }, (_, i) => (depth.half - 1) * (1 - (2 * i) / (fx.slices - 1)));

/**
 * HoloCard v2 (LOT 4, S2, direction A "access badge"): a thick holographic ID
 * card. A fine pointer tilts it (the original spring) and shows its depth;
 * a click or a tap on it flips it (back: QR code to LinkedIn); its buttons
 * download the CV and flip it from the keyboard. The hidden face is inert and
 * the focus follows the flip (never lost, never trapped). Reduced motion: no
 * tilt, sway nor sequence.
 */
const Card: React.FC = () => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const reducedMotion = Boolean(useReducedMotion());
    const tilt = useCardTilt(sceneRef);
    const download = useCvDownload(sceneRef);
    const [flipped, setFlipped] = useState(false);
    const [active, setActive] = useState(false);
    const toBack = useRef<HTMLButtonElement>(null);
    const toFront = useRef<HTMLButtonElement>(null);
    const moveFocus = useRef(false);

    const flip = useCallback(() => {
        // The focus was on the face that turns away (soon inert): take it to the other face
        moveFocus.current = Boolean(sceneRef.current?.contains(document.activeElement));
        setFlipped((side) => !side);
    }, []);
    useEffect(() => {
        if (!moveFocus.current) return;
        moveFocus.current = false;
        (flipped ? toFront : toBack).current?.focus({ preventScroll: true });
    }, [flipped]);

    const onCardClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target instanceof Element && event.target.closest('button, a')) return;
        flip();
    };

    return (
        <div
            ref={sceneRef}
            className={styles.scene}
            style={SCENE_VARS}
            // Mounted after the page painted (below): the rich decor is on from the start
            data-power="on"
            onPointerMove={tilt.onPointerMove}
            onPointerEnter={(event) => { if (event.pointerType !== 'touch') setActive(true); }}
            onPointerLeave={(event) => { tilt.onPointerLeave(event); setActive(false); }}
            onFocus={() => setActive(true)}
            onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActive(false); }}
        >
            {/* Press feedback in CSS (:active): motion's whileTap would make the card a tab stop */}
            <div className={styles.press} onClick={onCardClick}>
                <div className={styles.sway}>
                <motion.div className={styles.card} style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}>
                    <motion.div className={styles.flipper} initial={false} animate={{ rotateY: flipped ? 180 : 0 }}
                        transition={reducedMotion ? { duration: 0 } : fx.flip}>
                        {SLICE_Z.map((z, i) => (
                            <span key={i} className={styles.slice} style={{ transform: `translateZ(${z}px)` }} aria-hidden="true" />
                        ))}
                        <CardFront tilt={tilt} download={download} active={active && !reducedMotion} hidden={flipped}
                            flipRef={toBack} onFlip={flip} />
                        <CardBack tilt={tilt} hidden={!flipped} flipRef={toFront} onFlip={flip} />
                    </motion.div>
                </motion.div>
                </div>
            </div>
            <span className={styles.status} role="status">{download.started ? content.skills.holoCard.started : ''}</span>
        </div>
    );
};

/**
 * The card mounts at the first idle moment after the page paints: its 3D
 * layers are not in the same task as the page text (the LCP). Until then a
 * slot of the same size and background holds its place (no layout shift).
 */
const HoloCard: React.FC = () => {
    const ready = useIdleReady(fx.mountTimeoutMs);
    return ready ? <Card /> : <div className={`${styles.scene} ${styles.slot}`} style={SCENE_VARS} aria-hidden="true" />;
};

export default HoloCard;
