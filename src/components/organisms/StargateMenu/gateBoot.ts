import { gateEffects as fx } from '../../../data/effects';
import { onIdleAfter } from '../../../hooks/useIdleReady';
import type { GateRenderer } from './gateRenderer';

/**
 * Boots the gate at the first idle moment once the first frames are through
 * (see onIdleAfter: a first WebGL context created earlier blocks): loads the
 * engine chunk, then polls the compile once per frame; `onReady` gets
 * the renderer, or null without WebGL. Returns a cancel function.
 */
export function startGateBoot(canvas: HTMLCanvasElement, onReady: (renderer: GateRenderer | null) => void): () => void {
    let frame = 0;
    let cancelled = false;
    const cancelIdle = onIdleAfter(fx.bootAfterMs, fx.bootTimeoutMs, () => {
        import('./gateEngine').then(({ bootGate, finishGate }) => {
            if (cancelled) return;
            const boot = bootGate(canvas);
            if (!boot) {
                onReady(null);
                return;
            }
            const poll = () => {
                frame = 0;
                if (cancelled) return;
                const result = finishGate(boot);
                if (result === 'waiting') frame = requestAnimationFrame(poll);
                else onReady(result);
            };
            frame = requestAnimationFrame(poll);
        }, () => {
            // The engine chunk failed to load (offline, old deployment): the CSS ring instead
            if (!cancelled) onReady(null);
        });
    });
    return () => {
        cancelled = true;
        cancelIdle();
        cancelAnimationFrame(frame);
    };
}
