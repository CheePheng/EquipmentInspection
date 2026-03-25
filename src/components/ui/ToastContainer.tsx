import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../../stores/toast.store';
import { Toast } from './Toast';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-4 right-4 left-4 z-50 flex flex-col gap-2 max-w-lg mx-auto pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-auto"
          >
            <Toast
              message={toast.message}
              type={toast.type}
              onDismiss={() => removeToast(toast.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
