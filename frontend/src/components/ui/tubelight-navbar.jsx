import { NavLink } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * TubelightNav
 *
 * Renders a list of primary navigation links with a "tubelight" active
 * indicator: a soft glowing bar that hovers above the current item and
 * glides smoothly to whichever item matches the active route.
 *
 * Built for React Router (NavLink + route matching) — not Next.js.
 * Active-state comes from the router itself (NavLink's isActive), so it
 * stays correct across refreshes, direct URL loads, and back/forward
 * navigation. No local "activeTab" state is used.
 *
 * Styling hooks into the existing `.desktop-nav` / `.desktop-nav-item`
 * classes already defined in index.css (including dark-mode and
 * "cinematic" header overrides), so it inherits the site's brand colors
 * (--gold, --ink, --line, etc.) instead of introducing new ones.
 *
 * Props:
 *  - items: [{ to, label, end? }]
 *  - className: extra class(es) appended to the <nav> element
 *  - layoutId: unique layoutId for the glow indicator (change if you
 *    render more than one TubelightNav on the same page at once)
 *  - activeOverride: optional `to` value to force-highlight, for routes
 *    that aren't themselves in `items` (e.g. /candidate/login should
 *    show "Home" as active instead of no glow at all). When omitted,
 *    normal router-driven active matching is used.
 */
export default function TubelightNav({
  items,
  className = '',
  layoutId = 'tubelight-indicator',
  activeOverride,
}) {
  const prefersReducedMotion = useReducedMotion();

  const glowTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 380, damping: 30, mass: 0.6 };

  return (
    <nav className={`desktop-nav${className ? ` ${className}` : ''}`} aria-label="Primary">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => {
            const active = activeOverride ? item.to === activeOverride : isActive;
            return `desktop-nav-item${active ? ' active' : ''}`;
          }}
        >
          {({ isActive }) => {
            const active = activeOverride ? item.to === activeOverride : isActive;
            return (
              <>
                <span className="desktop-nav-label">{item.label}</span>
                {active && (
                  <motion.span
                    layoutId={layoutId}
                    className="tubelight-pill"
                    aria-hidden="true"
                    transition={glowTransition}
                  >
                    <span className="tubelight-glow" />
                  </motion.span>
                )}
              </>
            );
          }}
        </NavLink>
      ))}
    </nav>
  );
}