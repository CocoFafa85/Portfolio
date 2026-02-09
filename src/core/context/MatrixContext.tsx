import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MatrixContextType {
    isMatrixMode: boolean;
    toggleMatrixMode: () => void;
}

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

export const MatrixProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isMatrixMode, setIsMatrixMode] = useState(false);

    const toggleMatrixMode = () => {
        setIsMatrixMode(prev => !prev);
    };

    // Persist preference (optional - not in strict reqs but good UX)
    // For now, let's keep it simple state. 

    return (
        <MatrixContext.Provider value={{ isMatrixMode, toggleMatrixMode }}>
            {children}
        </MatrixContext.Provider>
    );
};

export const useMatrix = () => {
    const context = useContext(MatrixContext);
    if (context === undefined) {
        throw new Error('useMatrix must be used within a MatrixProvider');
    }
    return context;
};
