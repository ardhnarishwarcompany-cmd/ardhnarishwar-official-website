import { useEffect, useState } from 'react';

// Plain-JS equivalent of shadcn's `use-media-query` hook (no TypeScript,
// no extra dependency) — used to gate the desktop-only pricing card
// perspective/scale animation so it doesn't run on small screens.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}