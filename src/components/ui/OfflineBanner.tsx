import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useAppStore } from '../../stores/app.store';

export default function OfflineBanner() {
  const isOnline = useAppStore((s) => s.isOnline);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-banner"
          className="fixed top-0 left-0 right-0 z-50 bg-amber-primary/20 border-b border-amber-primary/30"
          style={{ height: 36 }}
          initial={{ y: -36 }}
          animate={{ y: 0 }}
          exit={{ y: -36 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="h-full flex items-center justify-center gap-2 px-4 text-sm text-amber-primary">
            <WifiOff size={14} />
            <span>You're offline — data saves locally</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
