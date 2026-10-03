import { useEffect } from 'react';
import { normalizePointer, type PointerPosition } from '../utils/pointer';

/**
 * Publishes the mouse position as CSS variables `--mouse-x` / `--mouse-y`
 * (range -0.5..0.5) on <html>, at most once per animation frame.
 * Mount it once, in the global layout. Parallax stays at rest when the
 * user prefers reduced motion.
 */
export function useMousePosition(): void {
    useEffect(() => {
        const rootStyle = document.documentElement.style;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const position: PointerPosition = { x: 0, y: 0 };
        let clientX = 0;
        let clientY = 0;
        let frame = 0;

        const write = () => {
            frame = 0;
            normalizePointer(position, clientX, clientY, window.innerWidth, window.innerHeight);
            rootStyle.setProperty('--mouse-x', String(position.x));
            rootStyle.setProperty('--mouse-y', String(position.y));
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (reducedMotion.matches) return;
            clientX = event.clientX;
            clientY = event.clientY;
            if (frame === 0) frame = requestAnimationFrame(write);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frame);
            rootStyle.removeProperty('--mouse-x');
            rootStyle.removeProperty('--mouse-y');
        };
    }, []);
}
