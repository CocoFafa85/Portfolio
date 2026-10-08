import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { content } from '../../../data/content';
import { holoEffects as fx } from '../../../data/effects';

const CV_URL = `${import.meta.env.BASE_URL}${content.cv.file}`;

/** One download of the local PDF, under the name proposed to the visitor. */
function downloadCv(): void {
    const link = document.createElement('a');
    link.href = CV_URL;
    link.download = content.cv.downloadName;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

export interface CvDownload {
    /** The sequence runs: further presses are ignored */
    busy: boolean;
    /** The download started (status announced to screen readers) */
    started: boolean;
    start(): void;
}

/** Parts of the card the sequence animates, marked `data-download="…"` */
const part = (scene: HTMLElement | null, name: string) => scene?.querySelector<HTMLElement>(`[data-download="${name}"]`) ?? null;

/**
 * Download of the CV from the HoloCard (LOT 4, S2): a laser sweeps the card,
 * the gauge fills, "ACCÈS AUTORISÉ" is stamped, and the PDF downloads at
 * ~0.8 s — once, whatever the number of presses (it was 2.4 s of fake
 * progress, then a Drive popup, before LOT 0). Transform and opacity only;
 * reduced motion: the download starts at once.
 */
export function useCvDownload(sceneRef: RefObject<HTMLElement | null>): CvDownload {
    const reducedMotion = useReducedMotion();
    const [busy, setBusy] = useState(false);
    const [started, setStarted] = useState(false);
    const timers = useRef<number[]>([]);
    const running = useRef(false);

    useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

    const start = useCallback(() => {
        if (running.current) return;
        running.current = true;
        setStarted(false);
        if (reducedMotion) {
            downloadCv();
            setStarted(true);
            running.current = false;
            return;
        }
        setBusy(true);
        const { scanMs, gaugeMs, stampAtMs, stampMs, downloadAtMs, restAtMs } = fx.download;
        const scene = sceneRef.current;
        const scan = part(scene, 'scan'), gauge = part(scene, 'gauge'), stamp = part(scene, 'stamp');
        if (scan) animate(scan, { y: ['-100%', '0%'], opacity: [1, 1, 0] }, { duration: scanMs / 1000, ease: 'easeInOut' });
        if (gauge) animate(gauge, { scaleX: [0, 1] }, { duration: gaugeMs / 1000, ease: [0.3, 0, 0.2, 1] });
        if (stamp) animate(stamp, { opacity: [0, 1], scale: [1.4, 1] }, { duration: stampMs / 1000, delay: stampAtMs / 1000 });
        timers.current.push(window.setTimeout(() => { downloadCv(); setStarted(true); }, downloadAtMs));
        timers.current.push(window.setTimeout(() => {
            if (gauge) animate(gauge, { scaleX: 0 }, { duration: 0.2 });
            if (stamp) animate(stamp, { opacity: 0 }, { duration: 0.2 });
            setBusy(false);
            running.current = false;
        }, restAtMs));
    }, [reducedMotion, sceneRef]);

    return useMemo(() => ({ busy, started, start }), [busy, started, start]);
}
