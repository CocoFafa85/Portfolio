import React from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import CircuitBackground from '../atoms/CircuitBackground/CircuitBackground';
import HudNav from '../organisms/HudNav/HudNav';
import TravelOverlay from '../organisms/TravelOverlay/TravelOverlay';
import PageTravel from './PageTravel';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useTravel } from '../../hooks/useTravel';
import { isHomePath } from '../../utils/travel';
import styles from './MainLayout.module.scss';

const MainLayout: React.FC = () => {
    const location = useLocation();
    // Captured per render: the leaving page keeps its own route, not the new one
    const outlet = useOutlet();
    const travel = useTravel(location.pathname);
    useMousePosition();

    // The background follows the page on screen, so it switches under the overlay
    const isHome = isHomePath(travel.shownPath);

    return (
        <div className={styles.container}>
            <div className={styles.particlesBackground} />

            {!isHome && <CircuitBackground />}

            <HudNav />

            <main className={`${styles.content} ${isHome ? styles.noScroll : ''}`}>
                {/* initial={false}: no trip on first load (keeps the LCP) */}
                <AnimatePresence
                    mode="wait"
                    initial={false}
                    custom={travel.style}
                    onExitComplete={travel.onExitComplete}
                >
                    <PageTravel key={location.pathname}>{outlet}</PageTravel>
                </AnimatePresence>
            </main>

            <TravelOverlay
                key={travel.id}
                style={travel.style}
                arrived={travel.shownPath === location.pathname}
            />
        </div>
    );
};

export default MainLayout;
