import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationPreferences } from '../../context/AnimationContext';

interface MotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const MotionModal: React.FC<MotionModalProps> = ({ isOpen, onClose, children }) => {
    const { reducedMotion } = useAnimationPreferences();

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        role="dialog"
                        aria-modal="true"
                        style={{
                            backgroundColor: 'var(--bg-main, white)',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            maxWidth: '90%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            border: '1px solid var(--card-border, #e5e7eb)'
                        }}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
