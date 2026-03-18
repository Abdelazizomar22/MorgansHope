import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useAnimationPreferences } from '../../context/AnimationContext';

interface MotionStaggerListProps extends HTMLMotionProps<"ul"> {
    staggerDelay?: number;
}

export const MotionStaggerList: React.FC<MotionStaggerListProps> = ({
    children,
    staggerDelay = 0.1,
    ...props
}) => {
    const { reducedMotion } = useAnimationPreferences();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: reducedMotion ? 0 : staggerDelay,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            } as const
        },
    };

    return (
        <motion.ul
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            {...props}
            style={{ padding: 0, margin: 0, ...props.style }}
        >
            {React.Children.map(children as any, (child) => {
                if (!React.isValidElement(child)) return child;
                return (
                    <motion.li variants={item} style={{ listStyle: 'none', height: '100%' }}>
                        {child}
                    </motion.li>
                );
            })}
        </motion.ul>
    );
};
