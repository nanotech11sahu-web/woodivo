import { useState } from 'react';

interface MediaGalleryImage {
  url: string;
  alt?: string;
}

/**
 * Extracted from product-details-page's local `ProductGallery` (Phase 19)
 * once project-details-page (Phase 20) needed the identical large-image +
 * thumbnail-strip pattern for a second entity. The component never
 * referenced anything product-specific — just a flat `{url, alt}[]` and a
 * name to fall back to for alt text — so unlike `ProductCard` vs
 * `ProjectCard` (genuinely different data shapes, kept as separate files
 * per Phase 19's category-listing/product-details reasoning), this one
 * serves both entities unchanged. Still no carousel library: same call
 * Phase 18 and 19 already made.
 */
export function MediaGallery({
  images,
  itemName,
}: {
  images: MediaGalleryImage[];
  itemName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep">
        {active?.url ? (
          <img
            src={active.url}
            alt={active.alt || itemName}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === activeIndex}
              className={`aspect-square overflow-hidden rounded-[var(--radius-card)] border transition-colors ${
                index === activeIndex ? 'border-brass' : 'border-border-warm hover:border-brass-light'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt || itemName}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
