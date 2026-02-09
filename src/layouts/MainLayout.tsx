import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { OrbitButton } from '@/shared/components/molecules/OrbitButton';
import { MatrixRain } from '@/shared/components/effects/MatrixRain';
import { PillToggle } from '@/features/home/components/PillToggle';

export const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    return (
        <div className="relative min-h-screen w-full bg-dark-bg text-white overflow-hidden font-montserrat selection:bg-neon-pink selection:text-white">
            {/* Matrix Rain Effect */}
            <MatrixRain />

            {/* Pill Toggle for Matrix Mode */}
            <PillToggle />

            {/* Scanlines Overlay - Low Opacity for subtlety */}
            <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,20,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] bg-repeat opacity-20" />

            {/* Background Gradient (matches legacy) */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#4b1e43] via-[#631f57] to-[#D85912] opacity-80" />

            {/* Orbit Button (Home Navigation) */}
            <div className="fixed bottom-8 right-8 z-40">
                <OrbitButton />
            </div>

            {/* Page Content with Transitions */}
            <AnimatePresence mode="wait">
                <motion.main
                    key={location.pathname}
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative z-10 w-full min-h-screen flex flex-col"
                >
                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
                        {children}
                    </div>
                </motion.main>
            </AnimatePresence>
        </div>
    );
};
