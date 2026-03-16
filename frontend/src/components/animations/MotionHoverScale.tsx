import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useAnimationPreferences } from '../../context/AnimationContext';

interface MotionHoverScaleProps extends HTMLMotionProps<"div"> {
    scaleAmount?: number;
}

export const MotionHoverScale: React.FC<MotionHoverScaleProps> = ({
    children,
    scaleAmount = 1.05,
    ...props
}) => {
    const { reducedMotion } = useAnimationPreferences();

    return (
        <motion.div
            whileHover={reducedMotion ? {} : { scale: scaleAmount }}
            whileTap={reducedMotion ? {} : { scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};
