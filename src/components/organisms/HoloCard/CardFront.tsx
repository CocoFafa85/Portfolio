import React, { type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { content } from '../../../data/content';
import { barcodeSvg, code128Widths } from '../../../utils/barcode';
import GlitchLabel from './GlitchLabel';
import HoloFilm from './HoloFilm';
import type { CardTilt } from './useCardTilt';
import type { CvDownload } from './useCvDownload';
import styles from './CardFront.module.scss';

const labels = content.skills.holoCard;
// A real Code 128 of the serial, used as a mask painted with a token colour: an image,
// rasterised once, never re-rasterised while the card moves (no SVG path in a moving layer)
const BARCODE = { '--barcode': `url("data:image/svg+xml,${encodeURIComponent(barcodeSvg(code128Widths(labels.serial), 40, '#000'))}")` } as CSSProperties;

export interface CardFrontProps {
    tilt: CardTilt;
    download: CvDownload;
    /** Pointer or focus on the card: the name and role decode */
    active: boolean;
    /** The back is shown: this face is inert */
    hidden: boolean;
    flipRef: React.RefObject<HTMLButtonElement | null>;
    onFlip(): void;
}

/**
 * Front of the HoloCard (LOT 4, S2, direction A "access badge"): the
 * original card's background and rotating border, an iridescent film with a
 * hexagon security print, a gold chip and a holographic seal, the "CF"
 * emblem of the navigation bar floating above, the name and role, a real
 * barcode of the serial, then the two actions (real buttons).
 */
const CardFront: React.FC<CardFrontProps> = React.memo(({ tilt, download, active, hidden, flipRef, onFlip }) => (
    <div className={`${styles.face} ${styles.front}`} inert={hidden}>
        <span className={styles.frame} aria-hidden="true"><span className={styles.spin} /><span className={styles.base} /></span>
        <HoloFilm tilt={tilt} pattern="hex" />
        <div className={styles.print}>
            <p className={styles.status}><span className={styles.dot} aria-hidden="true" />{labels.status}</p>
            <span className={styles.chip} aria-hidden="true" />
            <span className={styles.seal} aria-hidden="true"><motion.span className={styles.sealFilm} style={{ x: tilt.filmX, y: tilt.filmY }} /></span>
            <span className={styles.emblemSlot} aria-hidden="true" />
            <p className={styles.name}><GlitchLabel text={labels.name} active={active} /></p>
            <p className={styles.role}><GlitchLabel text={labels.role} active={active} /></p>
            <span className={styles.barcode} style={BARCODE} aria-hidden="true" />
            <p className={styles.serial}>{download.busy ? labels.uploading : labels.serial}</p>
            <span className={styles.gauge} aria-hidden="true"><span data-download="gauge" className={styles.fill} /></span>
            <div className={styles.actions}>
                <button type="button" className={styles.download} aria-label={content.ui.cvDownloadLabel}
                    aria-disabled={download.busy} onClick={download.start}>
                    {labels.download}
                </button>
                <button ref={flipRef} type="button" className={styles.flip} onClick={onFlip}>
                    <span aria-hidden="true">↻ </span>{labels.toBack}
                </button>
            </div>
        </div>
        <span className={styles.emblem} aria-hidden="true"><span className={styles.monogram}>{content.ui.monogram}</span></span>
        <span className={styles.scanLayer} data-busy={download.busy ? '' : undefined} aria-hidden="true">
            <span data-download="scan" className={styles.scan} />
            <span className={styles.stampWrap}><span data-download="stamp" className={styles.stamp}>{labels.granted}</span></span>
        </span>
    </div>
));

export default CardFront;
