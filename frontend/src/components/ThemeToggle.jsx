import { useCallback, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Premium theme toggle with circular radial reveal using the View Transitions API.
 * Falls back to instant class toggle when the API is unavailable or reduced-motion is preferred.
 */
export default function ThemeToggle({ className = '', size = 18 }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const btnRef = useRef(null);
  const isDark = resolvedTheme === 'dark';

  const handleToggle = useCallback(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const supportsVT =
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !prefersReduced;

    if (!supportsVT) {
      toggleTheme();
      return;
    }

    const btn = btnRef.current;
    if (!btn) {
      toggleTheme();
      return;
    }

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Maximum radius to cover the entire viewport from the button
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Set CSS custom properties for the clip-path animation origin
    document.documentElement.style.setProperty('--theme-x', `${x}px`);
    document.documentElement.style.setProperty('--theme-y', `${y}px`);
    document.documentElement.style.setProperty('--theme-r', `${endRadius}px`);

    const transition = document.startViewTransition(() => {
      toggleTheme();
    });

    transition.ready.then(() => {
      // The CSS handles the actual animation via ::view-transition-*
    }).catch(() => {
      // Ignore aborted transitions
    });
  }, [toggleTheme]);

  return (
    <button
      ref={btnRef}
      type="button"
      className={`theme-toggle ${className}`}
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {isDark ? <Sun size={size} strokeWidth={1.75} /> : <Moon size={size} strokeWidth={1.75} />}
      </span>
    </button>
  );
}
