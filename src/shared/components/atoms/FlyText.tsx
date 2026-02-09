import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlyTextProps {
    texts: string[];
    className?: string;
}

export const FlyText: React.FC<FlyTextProps> = ({ texts, className = '' }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % texts.length);
        }, 4000); // Rotate every 4 seconds
        return () => clearInterval(interval);
    }, [texts.length]);

    return (
        <div className={`relative h-20 flex items-center justify-center ${className}`}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5, y: 50, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                    transition={{ duration: 0.8, ease: "backOut" }}
                    className="absolute text-center whitespace-nowrap"
                >
                    <span className="font-orbitron font-bold text-3xl md:text-5xl text-white drop-shadow-neon-pink">
                        {texts[index]}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
