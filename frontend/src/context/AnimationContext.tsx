import React, { createContext, useContext, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface AnimationContextType {
    reducedMotion: boolean;
    toggleAnimation: () => void;
}

const AnimationContext = createContext<AnimationContextType>({
    reducedMotion: false,
    toggleAnimation: () => { },
});

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // User requested "do not respect OS preference"
    const [reducedMotion, setReducedMotion] = useState(false);

    const toggleAnimation = () => setReducedMotion((prev) => !prev);

    return (
        <AnimationContext.Provider value={{ reducedMotion, toggleAnimation }}>
            {children}
        </AnimationContext.Provider>
    );
};

export const useAnimationPreferences = () => useContext(AnimationContext);
