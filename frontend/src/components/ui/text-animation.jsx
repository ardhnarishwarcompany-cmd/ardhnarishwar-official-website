import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

const container = (stagger, delay) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

const item = {
  hidden: { y: '110%' },
  show: {
    y: '0%',
    transition: { duration: 0.6, ease: EASE },
  },
};

// prefers-reduced-motion: skip the slide, just fade the mask away instantly
const reducedItem = {
  hidden: { y: '0%' },
  show: { y: '0%', transition: { duration: 0 } },
};

/**
 * TextAnimation
 *
 * Reveals text word-by-word (or letter-by-letter) with a staggered
 * slide-up-from-behind-a-mask animation, triggered once when it scrolls
 * into view.
 *
 * Props:
 *  - children: plain string (required — this only animates flat text; to
 *    animate a line that mixes styles, e.g. "<em>meets</em> machine-work.",
 *    compose two TextAnimation calls side by side instead of nesting JSX
 *    inside one, see usage in Home.jsx)
 *  - delay: seconds before this group starts animating (stagger the start
 *    of each TextAnimation instance to cascade multiple lines/words)
 *  - divideBy: 'word' (default) or 'letter'
 *  - as: element the animated wrapper renders as — defaults to 'span',
 *    but accepts anything Framer Motion supports ('em', 'h1', ...) so it
 *    can keep the original semantic tag and any CSS that targets it
 *    (e.g. this project's `h1 em { ... }` rule in index.css)
 *  - className: forwarded to the outer wrapper
 */
const TextAnimation = ({
  children,
  delay = 0,
  divideBy = 'word',
  as = 'span',
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (typeof children !== 'string') {
    if (typeof children === 'number' || typeof children === 'boolean') {
      children = String(children);
    } else {
      console.warn('TextAnimation only supports plain text/string children.');
      return <>{children}</>;
    }
  }

  const text = children;
  const parts = divideBy === 'letter' ? text.split('') : text.split(' ');
  const stagger = divideBy === 'letter' ? 0.02 : 0.05;
  const itemVariants = prefersReducedMotion ? reducedItem : item;

  // motion is a proxy — motion.em / motion.h1 / motion.span all work.
  const Wrapper = motion[as] || motion.span;

  return (
    <Wrapper
      variants={container(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={className}
      style={{ display: 'inline-block' }}
    >
      {parts.map((part, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden relative"
          style={{ verticalAlign: 'top' }}
        >
          <motion.span variants={itemVariants} className="inline-block will-change-transform">
            {divideBy === 'letter'
              ? part === ' '
                ? '\u00A0'
                : part
              : part + '\u00A0'}
          </motion.span>
        </span>
      ))}
    </Wrapper>
  );
};

export default TextAnimation;