import React, { useEffect, useRef } from 'react';
import { holoEffects as fx } from '../../../data/effects';
import { linkedinQr } from '../../../data/generated/linkedinQr';
import { capPixelRatio } from '../../../utils/canvas';
import styles from './CardBack.module.scss';

const QUIET = 4;

export interface QrCanvasProps {
    /** Accessible name of the code (the link around it is named by it) */
    label: string;
}

/**
 * The LinkedIn QR code drawn once in a canvas (LOT 4, S2): as an SVG mask it
 * was rasterised the first time the back turned into view, a 50–67 ms frame
 * on a slow phone (the LOT 3 lesson: no SVG path in a moving layer). Whole
 * device pixels per module, the 4-module quiet zone included; colours from
 * the design tokens (the canvas CSS colour and background).
 */
const QrCanvas: React.FC<QrCanvasProps> = ({ label }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const { rows } = linkedinQr;
        const modules = rows.length + QUIET * 2;
        // Layout width: the face is turned and tilted in 3D, its bounding box is not the canvas size
        const css = canvas.offsetWidth;
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        const ratio = capPixelRatio(window.devicePixelRatio, css, css, coarse, fx.qrPixelRatio);
        const unit = Math.max(1, Math.floor((css * ratio) / modules));
        canvas.width = canvas.height = unit * modules;
        const style = getComputedStyle(canvas);
        ctx.fillStyle = style.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = style.color;
        rows.forEach((row, y) => {
            for (let x = 0; x < row.length; x++) {
                if (row[x] === '1') ctx.fillRect((x + QUIET) * unit, (y + QUIET) * unit, unit, unit);
            }
        });
    }, []);

    return <canvas ref={canvasRef} className={styles.qr} role="img" aria-label={label} />;
};

export default QrCanvas;
