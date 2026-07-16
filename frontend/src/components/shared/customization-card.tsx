import type { Customization } from '@/types/customization';

/**
 * A single "already made" showcase card on the /customize page — cover
 * photo, title, short description and tags. Unlike ProductCard, this
 * never links anywhere: these aren't catalog items with their own detail
 * page, just proof-of-work sitting above the request form's fold.
 */
export function CustomizationCard({ item }: { item: Customization }) {
  const cover = item.images[0];

  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border-warm bg-ivory">
      <div className="relative aspect-[4/3] overflow-hidden bg-ivory-deep">
        {cover ? (
          <img
            src={cover.url}
            alt={cover.alt || item.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : null}
        {item.images.length > 1 ? (
          <span className="absolute bottom-2 right-2 rounded-full bg-charcoal/70 px-2 py-0.5 text-[11px] font-medium text-ivory">
            +{item.images.length - 1} more
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold leading-snug text-teak">{item.title}</h3>
        {item.description ? (
          <p className="line-clamp-3 text-xs leading-relaxed text-charcoal-soft">
            {item.description}
          </p>
        ) : null}
        {item.tags.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[var(--radius-card)] border border-border-warm px-2 py-0.5 text-[10px] text-charcoal-soft"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
