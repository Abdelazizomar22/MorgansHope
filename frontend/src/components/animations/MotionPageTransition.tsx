import React from 'react';
import { motion } from 'framer-motion';
import { useAnimationPreferences } from '../../context/AnimationContext';

export const MotionPageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { reducedMotion } = useAnimationPreferences();

    return (
        <motion.main
            initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.3, ease: "easeInOut" }}
            style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
        >
            {children}
        </motion.main>
    );
};
