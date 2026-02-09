import React from 'react';
import { Link } from 'react-router-dom';
import { FlyText } from '../../shared/components/atoms/FlyText';
import { NeonTitle } from '../../shared/components/atoms/NeonTitle';

export const HomePage: React.FC = () => {
    const landingTexts = [
        "Welcome to the Core",
        "Full Stack Developer",
        "React & TypeScript Expert",
        "Cyberpunk Enthusiast",
        "Open to Work"
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
            <div className="space-y-4">
                <NeonTitle text="PORTFOLIO V2.0" />
                <FlyText texts={landingTexts} className="text-neon-blue" />
            </div>

            <Link
                to="/projects"
                className="group relative px-8 py-3 font-orbitron font-bold text-xl text-neon-pink border-2 border-neon-pink rounded hover:bg-neon-pink hover:text-white transition-all duration-300 shadow-[0_0_10px_#ff379b] hover:shadow-[0_0_25px_#ff379b]"
            >
                <span className="relative z-10">ENTER SYSTEM</span>
                <div className="absolute inset-0 bg-neon-pink opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
            </Link>
        </div>
    );
};
