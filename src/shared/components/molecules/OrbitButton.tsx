import React from 'react';
import { Link } from 'react-router-dom';

export const OrbitButton: React.FC = () => {
    return (
        <Link to="/" className="group relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full transition-transform hover:scale-110">
            {/* Glowing Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-neon-blue opacity-50 group-hover:opacity-100 group-hover:shadow-[0_0_15px_#00bfff] transition-all duration-300 animate-spin-slow" />

            {/* Inner Circle/Icon */}
            <div className="relative w-full h-full rounded-full overflow-hidden border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                {/* Using text for now, could be an image or icon */}
                <span className="font-orbitron font-bold text-xs md:text-sm text-white group-hover:text-neon-blue transition-colors">
                    MENU
                </span>
            </div>

            {/* Tooltip text separate from rotation */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs text-neon-blue opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neon-blue">
                Back to Orbit
            </span>
        </Link>
    );
};
