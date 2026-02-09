import React from 'react';

interface NeonTitleProps {
    text: string;
    tag?: 'h1' | 'h2' | 'h3';
    className?: string;
}

export const NeonTitle: React.FC<NeonTitleProps> = ({ text, tag: Tag = 'h1', className = '' }) => {
    // Split text to animate specific letters if needed, but for now we apply the blink to the whole or spans
    // Legacy had specific spans blinking. We'll simplify for Atomic start: apply blink to random chars or whole.
    // Actually, let's replicate the structure: <span>P</span>roj<span>ec</span>ts

    // For a generic component, we might just blink the whole thing or specific logic.
    // Let's make it simple: The text glows.

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Tag className="font-orbitron font-bold text-neon-pink text-4xl md:text-6xl text-shadow-neon tracking-wider">
                {text}
            </Tag>
        </div>
    );
};
