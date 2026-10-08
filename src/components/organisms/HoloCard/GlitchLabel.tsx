import React, { useEffect, useRef } from 'react';
import { animate } from 'motion/react';
import { content } from '../../../data/content';
import { holoEffects as fx } from '../../../data/effects';
import { decodeCharAt, isLocked } from '../../../utils/decode';
import styles from './CardFront.module.scss';

export interface GlitchLabelProps {
    text: string;
    /** Decodes in a loop while true (pointer or focus on the card) */
    active: boolean;
    className?: string;
}

const GLYPHS = content.decor.decodeGlyphs;

/**
 * A printed line of the card that decodes like a terminal while the card is
 * pointed at or focused (the original card's glitch, on the home title's
 * engine: decodeCharAt + motion, no timer per character). Each letter keeps
 * its width (the glyph is laid over it): nothing moves around it. Read once
 * by screen readers (the glyphs are hidden from them).
 */
const GlitchLabel: React.FC<GlitchLabelProps> = React.memo(({ text, active, className }) => {
    const noise = useRef<(HTMLSpanElement | null)[]>([]);
    const chars = [...text];

    useEffect(() => {
        if (!active) return undefined;
        const paint = (progress: number) => noise.current.forEach((span, i) => {
            if (!span) return;
            const locked = isLocked(i, text, progress, fx.decode);
            span.textContent = locked ? '' : decodeCharAt(i, text, progress, fx.decode, GLYPHS);
            span.parentElement?.classList.toggle(styles.pending, !locked);
        });
        let stopped = false;
        let pause = 0;
        let controls = { stop: () => {} };
        const run = () => {
            controls = animate(0, 1, {
                duration: fx.decode.durationMs / 1000, ease: 'linear', onUpdate: paint,
                onComplete: () => { if (!stopped) pause = window.setTimeout(run, fx.decode.pauseMs); },
            });
        };
        run();
        return () => {
            stopped = true;
            controls.stop();
            window.clearTimeout(pause);
            paint(1);
        };
    }, [active, text]);

    return (
        <span className={className}>
            <span className={styles.srOnly}>{text}</span>
            {chars.map((char, i) => (
                <span key={i} className={styles.char} aria-hidden="true">
                    {char}
                    <span ref={(span) => { noise.current[i] = span; }} className={styles.noise} />
                </span>
            ))}
        </span>
    );
});

export default GlitchLabel;
