import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';

const cn = (...c) => c.filter(Boolean).join(' ');

// Official X logo (lucide's Twitter icon is the old bird)
const XIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Front-face text = short name of each platform (flips to the icon on hover).
const ICONS = {
  linkedin: { letter: 'LIN', label: 'LinkedIn', icon: <Linkedin size={18} /> },
  twitter: { letter: 'X', label: 'X (Twitter)', icon: <XIcon /> },
  facebook: { letter: 'FB', label: 'Facebook', icon: <Facebook size={18} /> },
  instagram: { letter: 'IG', label: 'Instagram', icon: <Instagram size={18} /> },
  youtube: { letter: 'YT', label: 'YouTube', icon: <Youtube size={18} /> },
};

function Node({ item, index, isHovered, tooltipIndex, setTooltipIndex }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.label}
      className="relative block h-10 w-10 cursor-pointer"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setTooltipIndex(index)}
      onMouseLeave={() => setTooltipIndex(null)}
    >
      <AnimatePresence>
        {isHovered && tooltipIndex === index && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8, x: '-50%' }}
            animate={{ opacity: 1, y: -50, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 10, scale: 0.8, x: '-50%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-1/2 z-50 whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-cream shadow-xl"
          >
            {item.label}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-ink" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative h-full w-full"
        initial={false}
        animate={{ rotateY: isHovered ? 180 : 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 120, damping: 15, delay: index * 0.08 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front: letter */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-paper-2 font-bold text-ink shadow-sm"
          style={{ backfaceVisibility: 'hidden', fontSize: item.letter.length > 1 ? '13px' : '18px', letterSpacing: item.letter.length > 1 ? '-0.02em' : undefined }}
        >
          {item.letter}
        </div>
        {/* Back: icon */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-ink text-cream"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {item.icon}
        </div>
      </motion.div>
    </a>
  );
}

/**
 * links = { linkedin, twitter, facebook, instagram, youtube } (URLs).
 * Only icons that have a URL are shown.
 */
export default function SocialFlipButton({ links = {}, className }) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState(null);

  const items = Object.keys(ICONS)
    .filter((k) => links[k])
    .map((k) => ({ ...ICONS[k], href: links[k] }));

  if (items.length === 0) return null;

  return (
    <div className={cn('flex items-center', className)}>
      <div
        className="relative flex items-center justify-center gap-2 rounded-2xl border border-line bg-paper p-3 shadow-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setTooltipIndex(null);
        }}
      >
        <div className="pointer-events-none absolute -inset-[1px] overflow-hidden rounded-2xl">
          <motion.div
            className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-gold to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-gold to-transparent"
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {items.map((item, index) => (
          <Node
            key={item.label}
            item={item}
            index={index}
            isHovered={isHovered}
            tooltipIndex={tooltipIndex}
            setTooltipIndex={setTooltipIndex}
          />
        ))}
      </div>
    </div>
  );
}