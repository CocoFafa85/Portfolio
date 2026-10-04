import React, { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { content } from '../../../data/content';
import { heroEffects as fx } from '../../../data/effects';
import { decodeCharAt, isLocked } from '../../../utils/decode';
import styles from './DecodeTitle.module.scss';

export interface DecodeTitleProps {
    text: string;
    className?: string;
}

type CssVars = CSSProperties & Record<`--${string}`, string>;
const IGNITE_VARS: CssVars = { '--ignite-ms': `${fx.igniteMs}ms` };
const GLYPHS = content.decor.decodeGlyphs;

/**
 * Home title (LOT 2, H1): the name decodes from terminal glyphs, then the
 * neon tube lights up with a short flicker. Each letter keeps the width of
 * its final character (no layout shift); the glyph noise is real text painted
 * from the first frame. Screen readers get the whole title from aria-label.
 * Reduced motion: the final, lit title straight away.
 */
const DecodeTitle: React.FC<DecodeTitleProps> = ({ text, className }) => {
    const reducedMotion = useReducedMotion();
    const noiseRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const [ignited, setIgnited] = useState(false);
    const lit = Boolean(reducedMotion) || ignited;
    const chars = [...text];

    // Before the first paint: the noise spans hold no React text, only what this effect writes
    useLayoutEffect(() => {
        if (reducedMotion) return;
        const paint = (progress: number) => {
            noiseRefs.current.forEach((noise, i) => {
                if (!noise) return;
                const locked = isLocked(i, text, progress, fx.decode);
                noise.textContent = locked ? '' : decodeCharAt(i, text, progress, fx.decode, GLYPHS);
                noise.parentElement?.classList.toggle(styles.pending, !locked);
            });
        };
        paint(0);
        const controls = animate(0, 1, {
            duration: fx.decode.durationMs / 1000,
            ease: 'linear',
            onUpdate: paint,
            onComplete: () => setIgnited(true),
        });
        return () => controls.stop();
    }, [text, reducedMotion]);

    const classes = [styles.title, lit ? styles.lit : '', className ?? ''].filter(Boolean).join(' ');
    return (
        <h1 className={classes} aria-label={text} style={IGNITE_VARS}>
            {chars.map((char, i) => (
                <span key={i} className={lit ? styles.char : `${styles.char} ${styles.pending}`} aria-hidden="true">
                    {char}
                    <span
                        ref={(node) => { noiseRefs.current[i] = node; }}
                        className={styles.noise}
                    />
                </span>
            ))}
        </h1>
    );
};

export default DecodeTitle;
