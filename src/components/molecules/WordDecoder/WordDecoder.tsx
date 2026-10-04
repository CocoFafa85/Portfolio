import React, { useLayoutEffect, useRef } from 'react';
import { animate, useReducedMotion, type AnimationPlaybackControls } from 'motion/react';
import { content } from '../../../data/content';
import { heroEffects } from '../../../data/effects';
import { decodeCharAt, frameLength, isLocked } from '../../../utils/decode';
import styles from './WordDecoder.module.scss';

export interface WordDecoderProps {
    words: readonly string[];
    /** Joins the words when they are all shown at once (reduced motion) */
    separator: string;
    className?: string;
}

const fx = heroEffects.roles;
const GLYPHS = content.decor.decodeGlyphs;

/**
 * Home subtitle (LOT 2, H2): the roles follow one another, each decoding
 * into the next. The width is reserved for the longest role (no shift).
 * Screen readers get every role once, as static text (no aria-live).
 * Reduced motion: all roles shown together, still.
 */
const WordDecoder: React.FC<WordDecoderProps> = ({ words, separator, className }) => {
    const reducedMotion = useReducedMotion();
    const liveRef = useRef<HTMLSpanElement>(null);

    // Before the first paint; the live span holds no React children, only these cells
    useLayoutEffect(() => {
        const live = liveRef.current;
        if (reducedMotion || !live || words.length === 0) return;
        const longest = Math.max(...words.map((word) => word.length));
        const cells = Array.from({ length: longest }, () => live.appendChild(document.createElement('span')));

        const paint = (target: string, progress: number, source?: string) => {
            const length = frameLength(target, progress, source);
            cells.forEach((cell, i) => {
                cell.textContent = i < length ? decodeCharAt(i, target, progress, fx, GLYPHS, source) : '';
                cell.className = i < length && !isLocked(i, target, progress, fx, source) ? styles.glyph : '';
            });
        };

        let controls: AnimationPlaybackControls | undefined;
        const decode = (index: number, source: string | undefined, durationMs: number) => {
            const target = words[index];
            paint(target, 0, source);
            controls = animate(0, 1, {
                duration: durationMs / 1000,
                ease: 'linear',
                onUpdate: (progress) => paint(target, progress, source),
                onComplete: () => hold(index),
            });
        };
        // The word stays readable, then decodes into the next one
        const hold = (index: number) => {
            controls = animate(0, 1, {
                duration: fx.holdMs / 1000,
                onComplete: () => decode((index + 1) % words.length, words[index], fx.morphMs),
            });
        };

        decode(0, undefined, fx.introMs);
        return () => {
            controls?.stop();
            cells.forEach((cell) => cell.remove());
        };
    }, [words, reducedMotion]);

    const classes = [styles.roles, className ?? ''].filter(Boolean).join(' ');
    if (reducedMotion) return <p className={classes}>{words.join(separator)}</p>;

    return (
        <p className={classes}>
            <span className={styles.spoken}>{words.join(', ')}</span>
            <span className={styles.slot} aria-hidden="true">
                {words.map((word) => <span key={word} className={styles.sizer}>{word}</span>)}
                <span ref={liveRef} />
            </span>
        </p>
    );
};

export default WordDecoder;
