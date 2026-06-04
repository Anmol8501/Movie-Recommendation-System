/**
 * Library of reusable Framer Motion animation variants for CineMatch AI
 */

export const fadeUpVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: 'easeOut' } 
  }
};

export const staggerContainerVariant = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.08 } 
  }
};

export const cardHoverVariant = {
  rest: { y: 0, scale: 1 },
  hover: { 
    y: -10, 
    scale: 1.02, 
    transition: { duration: 0.3, ease: 'easeOut' } 
  }
};

export const overlayVariant = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.2 } 
  }
};

export const slideInFromLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5 } 
  }
};

export const heroTextVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
  }
};

export const pulseVariant = {
  animate: { 
    scale: [1, 1.05, 1], 
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } 
  }
};

/**
 * Returns a Framer Motion transition config with delay proportional to the item's index.
 * @param {number} index - The index of the item in the list
 * @param {number} [base=0.08] - The base delay increment per index
 * @returns {object} Framer Motion transition object
 */
export const staggerDelay = (index, base = 0.08) => {
  return { 
    transition: { delay: index * base } 
  };
};
