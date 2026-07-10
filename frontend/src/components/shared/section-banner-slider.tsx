import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Banner } from '@/types/banner';

const AUTOPLAY_MS = 5000;

interface SectionBannerSliderProps {
  /** All active banners for a placement, in display order. Renders nothing
   * if empty so callers can keep their existing gradient/no-banner fallback. */
  banners: Banner[] | undefined;
  /** Dims the images (matches the existing `opacity-35` treatment section
   * pages used for a single background banner behind an overlay + text). */
  dimmed?: boolean;
  /** Show small dot indicators at the bottom, like the homepage hero. */
  showDots?: boolean;
  className?: string;
}

/**
 * Crossfades through every active banner for a placement, autoplaying on a
 * timer — the same behavior `hero-section.tsx` already has for `placement:
 * 'hero'`, extracted so section pages (blog/projects/about, etc.) can cycle
 * through more than just `banners[0]` too. Renders only the image layer;
 * callers keep their own gradient overlay and text on top, since that
 * content stays page-owned rather than coming from the banner.
 */
export function SectionBannerSlider({
  banners,
  dimmed = false,
  showDots = false,
  className = 'absolute inset-0',
}: SectionBannerSliderProps) {
  const slides = banners ?? [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className={className}>
      <div className={cn('absolute inset-0', dimmed && 'opacity-35')}>
        {slides.map((banner, slideIndex) => (
          <img
            key={banner._id}
            src={banner.desktopImage.url}
            alt={banner.desktopImage.alt || banner.title}
            loading={slideIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out',
              slideIndex === index ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}
      </div>

      {showDots && slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-1.5">
          {slides.map((banner, dotIndex) => (
            <button
              key={banner._id}
              type="button"
              onClick={() => setIndex(dotIndex)}
              aria-label={`Go to slide ${dotIndex + 1}`}
              aria-current={dotIndex === index}
              className={cn(
                'h-1.5 rounded-[var(--radius-pill)] transition-all duration-300',
                dotIndex === index ? 'w-6 bg-ivory' : 'w-1.5 bg-ivory/50 hover:bg-ivory/75',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
