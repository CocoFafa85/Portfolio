import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import CyberpunkBackground from '../atoms/CyberpunkBackground/CyberpunkBackground';
import HudNav from '../organisms/HudNav/HudNav';
import { useMousePosition } from '../../hooks/useMousePosition';
import { content } from '../../data/content';
import styles from './MainLayout.module.scss';

const MainLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    useMousePosition();

    const isHome = location.pathname === '/';

    return (
        <div className={styles.container}>
            {/* Perspective Grid removed */}
            <div className={styles.particlesBackground} />

            {!isHome && <CyberpunkBackground />}

            {!isHome && (
                <header className={styles.backButton}>
                    <button onClick={() => navigate('/')}>
                        {content.ui.backLabel}
                    </button>
                </header>
            )}

            <HudNav />

            <main className={`${styles.content} ${isHome ? styles.noScroll : ''}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default MainLayout;
