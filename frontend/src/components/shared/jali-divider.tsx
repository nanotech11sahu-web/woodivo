/**
 * The signature motif for the public site: a hairline repeat of a jali
 * (lattice) unit — the kind of pierced geometric screen carved into
 * Woodivo's own temple doors — used as a section divider instead of a
 * plain <hr> or gradient fade. Pure SVG, no image request, tiles via
 * <pattern> so it reads as one continuous carved strip at any width.
 */
export function JaliDivider({ className = '' }: { className?: string }) {
  const patternId = 'jali-unit';
  return (
    <svg
      viewBox="0 0 64 16"
      preserveAspectRatio="none"
      className={`jali-divider h-4 w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern id={patternId} width="16" height="16" patternUnits="userSpaceOnUse">
          <path
            d="M8 1 L15 8 L8 15 L1 8 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="8" cy="8" r="1.4" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="64" height="16" fill={`url(#${patternId})`} />
    </svg>
  );
}
