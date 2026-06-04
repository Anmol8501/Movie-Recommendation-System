import { useState, useEffect, useRef } from 'react';

/**
 * Custom React Hook to observe when a DOM element enters the viewport.
 * Useful for triggering entrance transitions (e.g. fade-in, slide-up) with Framer Motion.
 * @param {object} [options] - IntersectionObserver options
 * @param {number} [options.threshold=0.1] - Percentage of target visible before trigger
 * @param {string} [options.rootMargin='0px'] - Margins around the root
 * @param {boolean} [options.triggerOnce=true] - If true, unobserves after first intersect
 * @returns {[React.RefObject, boolean]} [ref, isVisible]
 */
export const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true
} = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(currentElement);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement && !triggerOnce) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [elementRef, isVisible];
};

export default useIntersectionObserver;
