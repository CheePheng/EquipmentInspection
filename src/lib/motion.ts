// Shared animation variants for Framer Motion
// Replaces copy-pasted variants across MachineList, AvailabilityBoard, etc.

import type { Variants, Transition } from 'framer-motion';

export const pageTransition: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
};

export const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15, ease: 'easeOut' } },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const microBounce = {
  whileTap: { scale: 0.97 },
  transition: { type: 'spring' as const, damping: 20, stiffness: 300 },
};
