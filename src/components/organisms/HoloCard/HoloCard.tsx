import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { content } from '../../../data/content';
import styles from './HoloCard.module.scss';

const CV_URL = `${import.meta.env.BASE_URL}${content.cv.file}`;

const labels = content.skills.holoCard;

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\~`0123456789ABCDEF';
const BARCODE_PATTERN = [2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1, 1, 3, 2];

interface GlitchTextProps {
    text: string;
    isHovered: boolean;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, isHovered }) => {
    const [display, setDisplay] = useState(text);

    // Decode cycles run only while hovered; each cycle restarts after a pause.
    useEffect(() => {
        if (!isHovered) return;

        let interval: ReturnType<typeof setInterval> | undefined;
        let pause: ReturnType<typeof setTimeout> | undefined;

        const runCycle = () => {
            let iteration = 0;
            interval = setInterval(() => {
                setDisplay(
                    text
                        .split('')
                        .map((char, i) => {
                            if (char === ' ') return ' ';
                            if (i < iteration) return text[i];
                            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                        })
                        .join('')
                );
                iteration += 1 / 2;
                if (iteration >= text.length) {
                    clearInterval(interval);
                    setDisplay(text);
                    pause = setTimeout(runCycle, 1500);
                }
            }, 40);
        };

        runCycle();
        return () => {
            clearInterval(interval);
            clearTimeout(pause);
        };
    }, [isHovered, text]);

    return <span className={styles.glitchText}>{isHovered ? display : text}</span>;
};

const HoloCard: React.FC = () => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    // Motion values for 3D tilt
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    const rotateX = useSpring(useTransform(mouseY, [0, 1], [15, -15]), { stiffness: 200, damping: 20 });
    const rotateY = useSpring(useTransform(mouseX, [0, 1], [-15, 15]), { stiffness: 200, damping: 20 });

    // Holographic shine position
    const shineX = useTransform(mouseX, [0, 1], [0, 100]);
    const shineY = useTransform(mouseY, [0, 1], [0, 100]);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            mouseX.set((e.clientX - rect.left) / rect.width);
            mouseY.set((e.clientY - rect.top) / rect.height);
        },
        [mouseX, mouseY]
    );

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        mouseX.set(0.5);
        mouseY.set(0.5);
    }, [mouseX, mouseY]);

    const handleDownload = useCallback(() => {
        if (isDownloading) return;
        setIsDownloading(true);
        setDownloadProgress(0);

        // Simulate upload progress
        const duration = 2000;
        const steps = 40;
        const stepDuration = duration / steps;
        let step = 0;

        const interval = setInterval(() => {
            step++;
            // Non-linear progress for realism
            const progress = Math.min(100, Math.round((step / steps) * 100 + Math.random() * 3));
            setDownloadProgress(progress);

            if (step >= steps) {
                clearInterval(interval);
                setDownloadProgress(100);

                // Trigger actual download after animation completes
                setTimeout(() => {
                    // The CV ships with the site (public/), a single download action
                    const link = document.createElement('a');
                    link.href = CV_URL;
                    link.download = content.cv.downloadName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    setTimeout(() => {
                        setIsDownloading(false);
                        setDownloadProgress(0);
                    }, 500);
                }, 400);
            }
        }, stepDuration);
    }, [isDownloading]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDownload();
            }
        },
        [handleDownload]
    );

    return (
        <motion.div
            ref={cardRef}
            className={styles.holoCard}
            style={{ rotateX, rotateY, transformPerspective: 1200 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onClick={handleDownload}
            // Keyboard access: same action and same glitch feedback as the mouse
            role="button"
            tabIndex={0}
            aria-label={content.ui.cvDownloadLabel}
            aria-busy={isDownloading}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsHovered(true)}
            onBlur={handleMouseLeave}
            whileTap={{ scale: 0.98 }}
        >
            {/* Animated border */}
            <div className={styles.borderGlow} />

            {/* Holographic shine overlay */}
            <motion.div
                className={styles.holoShine}
                style={{
                    background: useTransform(
                        [shineX, shineY],
                        ([x, y]) =>
                            `radial-gradient(circle at ${x}% ${y}%, rgba(0, 243, 255, 0.15) 0%, rgba(188, 19, 254, 0.08) 40%, transparent 70%)`
                    ),
                }}
            />

            {/* Noise texture */}
            <div className={styles.noiseOverlay} />

            {/* Card content */}
            <div className={styles.cardInner}>
                {/* Status indicator */}
                <div className={styles.statusBar}>
                    <span className={styles.statusDot} />
                    <span className={styles.statusText}>{labels.status}</span>
                </div>

                {/* Avatar */}
                <div className={styles.avatarContainer}>
                    <div className={styles.avatarRing}>
                        <div className={styles.avatarInner}>
                            <span className={styles.avatarInitials}>{labels.initials}</span>
                        </div>
                    </div>
                </div>

                {/* Identity info */}
                <div className={styles.identityBlock}>
                    <p className={styles.name}>
                        <GlitchText text={labels.name} isHovered={isHovered} />
                    </p>
                    <p className={styles.role}>
                        <GlitchText text={labels.role} isHovered={isHovered} />
                    </p>
                </div>

                {/* Decorative barcode */}
                <div className={styles.barcode}>
                    {BARCODE_PATTERN.map((w, i) => (
                        <div
                            key={i}
                            className={styles.bar}
                            style={{ width: `${w}px` }}
                        />
                    ))}
                </div>
                <span className={styles.barcodeLabel}>{labels.serial}</span>

                {/* Download sequence */}
                {isDownloading ? (
                    <div className={styles.downloadSequence}>
                        <div className={styles.progressBarTrack}>
                            <motion.div
                                className={styles.progressBarFill}
                                initial={{ width: '0%' }}
                                animate={{ width: `${downloadProgress}%` }}
                                transition={{ duration: 0.05 }}
                            />
                        </div>
                        <span className={styles.downloadLabel}>
                            {labels.uploading} {downloadProgress}%
                        </span>
                    </div>
                ) : (
                    <div className={styles.ctaBlock}>
                        <span className={styles.ctaText}>
                            {labels.cta}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default HoloCard;
