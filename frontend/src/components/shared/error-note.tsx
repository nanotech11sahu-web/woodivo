/**
 * A section that fails to load should say so plainly rather than
 * disappear silently or show a scary raw error — this is the one shared
 * fallback every home-page section reaches for on a failed fetch.
 */
export function ErrorNote({ label }: { label: string }) {
  return (
    <p className="rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep px-4 py-3 text-center text-sm text-charcoal-soft">
      {label} couldn't be loaded right now. Please refresh, or check back shortly.
    </p>
  );
}
