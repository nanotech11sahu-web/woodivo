import { useEffect, useState } from 'react';

/**
 * First debounce need this codebase has had — every existing filter
 * (category pills, gallery type toggle, pagination) is a discrete click
 * that can hit the API immediately. Phase 28's free-text search (blogs)
 * and tag filter (gallery) are the first filters driven by a text input,
 * where firing a request per keystroke would mean a network call on every
 * character typed. `delayMs` defaults to 400 — long enough to absorb a
 * normal typing cadence, short enough that the result list still feels
 * live once someone pauses.
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
