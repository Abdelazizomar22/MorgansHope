import { HiExclamationTriangle } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, description, loading }: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border p-6 shadow-2xl"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'color-mix(in srgb, var(--primary) 12%, var(--card-border))',
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: 'rgba(220,38,38,0.1)',
                  color: '#dc2626',
                }}
              >
                <HiExclamationTriangle size={28} />
              </div>
              <h3 className="mb-2 text-lg font-black" style={{ color: 'var(--text-main)' }}>
                {title}
              </h3>
              <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {description}
              </p>
              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 rounded-2xl border py-3 text-sm font-bold transition"
                  style={{
                    borderColor: 'var(--card-border)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-main)',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'default' : 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-[2] rounded-2xl border-none py-3 text-sm font-bold text-white transition"
                  style={{
                    background: loading ? '#999' : '#dc2626',
                    cursor: loading ? 'default' : 'pointer',
                    boxShadow: loading ? 'none' : '0 8px 24px rgba(220,38,38,0.25)',
                  }}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
