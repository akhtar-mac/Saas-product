/**
 * Shared Framer Motion animation variants for use across the app.
 * Usage:
 *   import { fadeIn, slideUp, staggerContainer } from '@/lib/animations';
 *   <motion.div variants={fadeIn} initial="initial" animate="animate">
 */

// ─── Fade ─────────────────────────────────────────────────────────────────────
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// ─── Slide Up (for cards, sections appearing from below) ──────────────────────
export const slideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: 16 },
};

// ─── Slide Down ───────────────────────────────────────────────────────────────
export const slideDown = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16 },
};

// ─── Slide In from Left ───────────────────────────────────────────────────────
export const slideInLeft = {
  initial: { opacity: 0, x: -32 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, x: -32 },
};

// ─── Slide In from Right ──────────────────────────────────────────────────────
export const slideInRight = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, x: 32 },
};

// ─── Scale (for cards and modals popping in) ──────────────────────────────────
export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.92 },
};

// ─── Stagger container — applies stagger delay to children ────────────────────
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// ─── Stagger Item — use as child inside staggerContainer ─────────────────────
export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─── Scroll-triggered animation preset (use with whileInView) ─────────────────
export const scrollReveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  viewport: { once: true, margin: '-80px' },
};

// ─── Hero text animation (fast, dramatic) ────────────────────────────────────
export const heroText = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Hover lift effect ────────────────────────────────────────────────────────
export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 },
};

// ─── Pulse glow (for CTA buttons) ────────────────────────────────────────────
export const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 0 0px rgba(16, 185, 129, 0.3)',
      '0 0 0 12px rgba(16, 185, 129, 0)',
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },
};
