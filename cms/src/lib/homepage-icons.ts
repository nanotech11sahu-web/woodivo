/**
 * Mirrors backend's `HomepageHighlightIcon` enum values exactly — kept in
 * sync by hand, same as every other type duplicated across
 * backend/cms/frontend (no shared-types package yet, flagged since
 * Phase 8). Labels here are just for the CMS operator picking a value in
 * the `<Select>`; the actual rendered icon lives in the frontend's own
 * `lib/homepage-icons.ts` map, since the CMS never renders these points
 * on a public-facing page itself.
 */
export const HOMEPAGE_HIGHLIGHT_ICON_OPTIONS = [
  { value: 'tree-pine', label: 'Tree — timber / material' },
  { value: 'ruler', label: 'Ruler — custom sizing' },
  { value: 'hammer', label: 'Hammer — craftsmanship' },
  { value: 'truck', label: 'Truck — delivery' },
  { value: 'shield-check', label: 'Shield — durability / warranty' },
  { value: 'award', label: 'Award — quality' },
  { value: 'leaf', label: 'Leaf — sustainability' },
  { value: 'clock', label: 'Clock — experience / turnaround' },
  { value: 'thumbs-up', label: 'Thumbs up — satisfaction' },
  { value: 'pen-tool', label: 'Pen tool — design' },
  { value: 'package', label: 'Package — packing' },
  { value: 'users', label: 'Users — team / support' },
] as const;

export type HomepageHighlightIconValue = (typeof HOMEPAGE_HIGHLIGHT_ICON_OPTIONS)[number]['value'];
