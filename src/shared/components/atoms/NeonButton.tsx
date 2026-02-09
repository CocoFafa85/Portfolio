import React from 'react';

interface NeonButtonProps {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'secondary';
    className?: string;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ label, onClick, href, variant = 'primary', className = '' }) => {
    const baseStyles = "px-6 py-2 font-orbitron font-bold rounded transition-all duration-300 transform hover:scale-105";
    const variants = {
        primary: "border-2 border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white hover:drop-shadow-neon-pink",
        secondary: "border-2 border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-white hover:drop-shadow-[0_0_5px_#00bfff]",
    };

    if (href) {
        return (
            <a href={href} className={`${baseStyles} ${variants[variant]} ${className}`} target="_blank" rel="noopener noreferrer">
                {label}
            </a>
        );
    }

    return (
        <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
            {label}
        </button>
    );
};
