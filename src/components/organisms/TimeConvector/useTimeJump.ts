import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { animate, type AnimationPlaybackControls } from 'motion/react';
import { convectorEffects as fx } from '../../../data/effects';
import { createJumpState, formatSpeed, jumpState, resumeAt } from '../../../utils/timeCircuits/jump';
import { BLANK_CELL } from './dseg';

export interface TimeJump {
    /** Increments on every jump: key of the effect layers, so their keyframes replay */
    id: number;
    /** A jump is on its way (the console is marked data-jumping) */
    jumping: boolean;
    /** The era text may show: false from a jump's start until its reveal time */
    revealed: boolean;
    /** Where the running jump started in its timeline (ms): a jump picked mid-way resumes */
    offsetMs: number;
    start: () => void;
}

/**
 * Time jump of the convector (LOT 3, A2 bis). One linear progress driven by
 * motion's animate(); each update reads the pure timeline (jumpState): the
 * speedometer digits are written straight into the DOM, only when they
 * change, and React state changes only at the start, the reveal and the end.
 * A new jump during a jump resumes from the speed reached. The caller skips
 * it in reduced motion.
 */
export function useTimeJump(digitsRef: RefObject<HTMLSpanElement | null>): TimeJump {
    const [run, setRun] = useState({ id: 0, jumping: false, revealed: true, offsetMs: 0 });
    const controls = useRef<AnimationPlaybackControls | null>(null);
    const state = useRef(createJumpState());
    const shown = useRef('');

    const write = useCallback((speed: number) => {
        const text = formatSpeed(speed, BLANK_CELL);
        if (text === shown.current || !digitsRef.current) return;
        shown.current = text;
        digitsRef.current.textContent = text;
    }, [digitsRef]);

    const start = useCallback(() => {
        controls.current?.stop();
        const jump = state.current;
        const offsetMs = resumeAt(jump.speed, fx.jump);
        jump.revealed = false;
        setRun((previous) => ({ id: previous.id + 1, jumping: true, revealed: false, offsetMs }));
        controls.current = animate(offsetMs, fx.jump.endMs, {
            duration: (fx.jump.endMs - offsetMs) / 1000,
            ease: 'linear',
            onUpdate: (elapsedMs) => {
                const wasRevealed = jump.revealed;
                jumpState(elapsedMs, fx.jump, jump);
                write(jump.speed);
                if (jump.revealed && !wasRevealed) setRun((previous) => ({ ...previous, revealed: true }));
            },
            onComplete: () => {
                jumpState(fx.jump.endMs, fx.jump, jump);
                write(jump.speed);
                setRun((previous) => ({ ...previous, jumping: false, revealed: true }));
            },
        });
    }, [write]);

    useEffect(() => () => controls.current?.stop(), []);

    return { ...run, start };
}
