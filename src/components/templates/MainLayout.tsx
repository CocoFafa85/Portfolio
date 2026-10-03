import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import CyberpunkBackground from '../atoms/CyberpunkBackground/CyberpunkBackground';
import styles from './MainLayout.module.scss';

const MainLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isHome = location.pathname === '/';

    const handleMouseMove = (e: React.MouseEvent) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        document.documentElement.style.setProperty('--mouse-x', x.toString());
        document.documentElement.style.setProperty('--mouse-y', y.toString());
    };

    return (
        <div className={styles.container} onMouseMove={handleMouseMove}>
            {/* Perspective Grid removed */}
            <div className={styles.particlesBackground} />

            {!isHome && <CyberpunkBackground />}

            {!isHome && (
                <div className={styles.backButton}>
                    <button onClick={() => navigate('/')}>
                        &lt; Retour
                    </button>
                </div>
            )}

            <div className={`${styles.content} ${isHome ? styles.noScroll : ''}`}>
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
            </div>
        </div>
    );
};

export default MainLayout;
