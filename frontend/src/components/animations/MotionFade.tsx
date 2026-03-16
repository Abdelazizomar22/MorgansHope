import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useAnimationPreferences } from '../../context/AnimationContext';

interface MotionFadeProps extends HTMLMotionProps<"div"> {
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    duration?: number;
    delay?: number;
}

export const MotionFade: React.FC<MotionFadeProps> = ({
    children,
    direction = 'up',
    duration = 0.5,
    delay = 0,
    ...props
}) => {
    const { reducedMotion } = useAnimationPreferences();

    const offsets = {
        up: { y: 20, x: 0 },
        down: { y: -20, x: 0 },
        left: { x: 20, y: 0 },
        right: { x: -20, y: 0 },
        none: { x: 0, y: 0 },
    };

    const initial = reducedMotion ? { opacity: 0 } : { opacity: 0, ...offsets[direction] };
    const animate = reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 };

    return (
        <motion.div
            initial={initial}
            whileInView={animate}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: reducedMotion ? 0.01 : duration, delay, ease: "easeOut" }}
            {...props}
        >
            {children}
        </motion.div>
    );
};
