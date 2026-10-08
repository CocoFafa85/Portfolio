import React from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import CircuitBackground from '../atoms/CircuitBackground/CircuitBackground';
import HudNav from '../organisms/HudNav/HudNav';
import TravelOverlay from '../organisms/TravelOverlay/TravelOverlay';
import PageTravel from './PageTravel';
import { useMousePosition } from '../../hooks/useMousePosition';
import { usePagePreload } from '../../hooks/usePagePreload';
import { useTravel } from '../../hooks/useTravel';
import { isHomePath } from '../../utils/travel';
import styles from './MainLayout.module.scss';

const MainLayout: React.FC = () => {
    const location = useLocation();
    // Captured per render: the leaving page keeps its own route, not the new one
    const outlet = useOutlet();
    const travel = useTravel(location.pathname);
    useMousePosition();
    usePagePreload();

    // Background and navigation bar follow the page on screen: they switch under the overlay
    const isHome = isHomePath(travel.shownPath);

    return (
        <div className={styles.container}>
            <div className={styles.particlesBackground} />

            {!isHome && <CircuitBackground />}

            {/* No navigation bar on the home page (its orbital menu is the navigation) */}
            <AnimatePresence initial={false}>
                {!isHome && <HudNav key="hud" />}
            </AnimatePresence>

            <main className={isHome ? `${styles.content} ${styles.homeContent}` : styles.content}>
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
