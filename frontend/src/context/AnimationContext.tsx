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
    const systemPrefersReduced = useReducedMotion();
    const [userDisabledInfo, setUserDisabledInfo] = useState(false);

    const reducedMotion = systemPrefersReduced || userDisabledInfo;

    const toggleAnimation = () => setUserDisabledInfo((prev) => !prev);

    return (
        <AnimationContext.Provider value={{ reducedMotion, toggleAnimation }}>
            {children}
        </AnimationContext.Provider>
    );
};

export const useAnimationPreferences = () => useContext(AnimationContext);
