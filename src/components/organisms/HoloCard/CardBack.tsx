import React from 'react';
import { content } from '../../../data/content';
import HoloFilm from './HoloFilm';
import QrCanvas from './QrCanvas';
import type { CardTilt } from './useCardTilt';
import styles from './CardBack.module.scss';

const labels = content.skills.holoCard;

export interface CardBackProps {
    tilt: CardTilt;
    /** The front is shown: this face is inert */
    hidden: boolean;
    flipRef: React.RefObject<HTMLButtonElement | null>;
    onFlip(): void;
}

/**
 * Back of the HoloCard (LOT 4, S2): a magnetic stripe, the film on the lower
 * band, and the QR code of the LinkedIn profile on a white plate (dark on
 * light: what scanners read best), itself a link to the profile. No contact
 * details nor photo (decision F6).
 */
const CardBack: React.FC<CardBackProps> = React.memo(({ tilt, hidden, flipRef, onFlip }) => (
    <div className={`${styles.face} ${styles.back}`} inert={hidden}>
        <span className={styles.frame} aria-hidden="true"><span className={styles.spin} /><span className={styles.base} /></span>
        <span className={styles.stripe} aria-hidden="true" />
        <HoloFilm tilt={tilt} pattern="stripe" />
        <div className={styles.print}>
            <a className={styles.qrLink} href={content.profiles.linkedin} target="_blank" rel="noopener noreferrer">
                <QrCanvas label={labels.qrAlt} />
            </a>
            <p className={styles.caption}>{labels.qrCaption}</p>
            <p className={styles.hint}>{labels.qrHint}</p>
            <div className={styles.actions}>
                <button ref={flipRef} type="button" className={styles.flip} onClick={onFlip}>
                    <span aria-hidden="true">↻ </span>{labels.toFront}
                </button>
            </div>
        </div>
    </div>
));

export default CardBack;
