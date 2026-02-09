import React from 'react';
import { useMatrix } from '@/core/context/MatrixContext';
import { motion } from 'framer-motion';

export const PillToggle: React.FC = () => {
    const { isMatrixMode, toggleMatrixMode } = useMatrix();

    return (
        <div className="fixed top-4 right-4 z-50 flex gap-4">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => !isMatrixMode && toggleMatrixMode()}
                className={`w-8 h-16 rounded-full border-2 border-white/20 shadow-lg transition-all duration-300 ${isMatrixMode
                    ? 'bg-red-600 shadow-[0_0_15px_#ff0000] opacity-100'
                    : 'bg-red-900 opacity-50 hover:opacity-80'
                    }`}
                title="Take the Red Pill (Matrix Mode)"
            />

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => isMatrixMode && toggleMatrixMode()}
                className={`w-8 h-16 rounded-full border-2 border-white/20 shadow-lg transition-all duration-300 ${!isMatrixMode
                    ? 'bg-blue-600 shadow-[0_0_15px_#0000ff] opacity-100'
                    : 'bg-blue-900 opacity-50 hover:opacity-80'
                    }`}
                title="Take the Blue Pill (Normal Mode)"
            />
        </div>
    );
};
