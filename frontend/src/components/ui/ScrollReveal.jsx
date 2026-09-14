import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

const variantsMap = {
  'fade-up': {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  },
  'fade-down': {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 }
  },
  'fade-left': {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  'fade-right': {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  'scale-up': {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 }
  },
  'flip': {
    hidden: { opacity: 0, rotateX: -30, y: 30 },
    visible: { opacity: 1, rotateX: 0, y: 0 }
  }
};

export const ScrollReveal = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.6,
  className = '',
  viewportAmount = 0.2,
  once = true
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: viewportAmount, once });

  const selectedVariant = variantsMap[variant] || variantsMap['fade-up'];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={selectedVariant}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({
  children,
  staggerDelay = 0.15,
  delay = 0,
  className = '',
  viewportAmount = 0.2,
  once = true
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: viewportAmount, once });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  variant = 'fade-up',
  className = ''
}) => {
  const itemVariant = variantsMap[variant] || variantsMap['fade-up'];

  return (
    <motion.div
      variants={itemVariant}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedCounter = ({ target, duration = 2, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const numericValue = parseInt(target.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numericValue)) return;

    let start = 0;
    const end = numericValue;
    const totalSteps = 60;
    const stepTime = (duration * 1000) / totalSteps;
    const increment = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  const hasPlus = target.includes('+');

  return (
    <span ref={ref}>
      {prefix}
      {isInView ? count : 0}
      {hasPlus ? '+' : ''}
      {suffix}
    </span>
  );
};
