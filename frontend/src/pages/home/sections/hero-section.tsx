import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBanners } from '@/features/banners/banners-api';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 5000;

/**
 * Full-width hero slider: one CMS banner (`placement: 'hero'`) visible at a
 * time, auto-advancing on a timer and swipeable/clickable via arrows and
 * dots. Falls back to a single on-brand promo slide when no banners exist
 * yet, so the page never opens on an empty strip.
 */
export function HeroSection() {
  const { data: banners } = useBanners('hero');
  const { openEnquiryDialog } = useEnquiryDialog();

  const slides = banners && banners.length > 0 ? banners : null;
  const slideCount = slides?.length ?? 1;

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % slideCount) + slideCount) % slideCount);
    },
    [slideCount],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay — pauses on hover/focus and whenever there's only one slide.
  useEffect(() => {
    if (slideCount <= 1 || isPaused) return undefined;

    timerRef.current = setInterval(() => {
      setIndex((current) => (current + 1) % slideCount);
    }, AUTOPLAY_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slideCount, isPaused]);

  // Clamp index if the slide count shrinks (e.g. data refetch).
  useEffect(() => {
    if (index >= slideCount) setIndex(0);
  }, [index, slideCount]);

  return (
    <section className="border-b border-border-warm bg-ivory px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div
          className="group/slider relative h-64 w-full overflow-hidden rounded-2xl bg-teak-deep sm:h-80 lg:h-[26rem]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {slides
            ? slides.map((banner, slideIndex) => (
                <Link
                  key={banner._id}
                  to={banner.ctaLink && banner.ctaLink !== '' ? banner.ctaLink : '/categories'}
                  aria-hidden={slideIndex !== index}
                  tabIndex={slideIndex === index ? 0 : -1}
                  className={cn(
                    'absolute inset-0 block transition-opacity duration-700 ease-out',
                    slideIndex === index ? 'opacity-100' : 'pointer-events-none opacity-0',
                  )}
                >
                  {banner.desktopImage.url ? (
                    <img
                      src={banner.desktopImage.url}
                      alt={banner.desktopImage.alt || banner.title}
                      loading={slideIndex === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                    <p className="max-w-xl text-2xl font-bold text-ivory sm:text-3xl lg:text-4xl">
                      {banner.title}
                    </p>
                    {banner.subtitle ? (
                      <p className="mt-2 max-w-md text-sm text-ivory-deep/85 sm:text-base">
                        {banner.subtitle}
                      </p>
                    ) : null}
                    <span className="mt-4 inline-flex items-center rounded-[var(--radius-pill)] bg-ivory px-5 py-2 text-xs font-semibold uppercase tracking-wide text-charcoal sm:text-sm">
                      {banner.ctaLabel ?? 'Shop Now'}
                    </span>
                  </div>
                </Link>
              ))
            : (
                <button
                  type="button"
                  onClick={() => openEnquiryDialog('homepage')}
                  className="absolute inset-0 block bg-[radial-gradient(circle_at_20%_20%,_rgba(37,99,235,0.16),_transparent_45%),radial-gradient(circle_at_80%_70%,_rgba(37,99,235,0.12),_transparent_45%)] text-left"
                >
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                    <p className="max-w-xl text-2xl font-bold text-ivory sm:text-3xl lg:text-4xl">
                      Wood, shaped into something that outlasts you.
                    </p>
                    <p className="mt-2 max-w-md text-sm text-ivory-deep/85 sm:text-base">
                      Temples, doors and furniture carved by hand, made to order in the wood you choose.
                    </p>
                    <span className="mt-4 inline-flex items-center rounded-[var(--radius-pill)] bg-ivory px-5 py-2 text-xs font-semibold uppercase tracking-wide text-charcoal sm:text-sm">
                      Get a Quote
                    </span>
                  </div>
                </button>
              )}

          {slides && slides.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-charcoal opacity-100 shadow-md transition-opacity duration-200 hover:bg-ivory sm:opacity-0 sm:group-hover/slider:opacity-100 focus-visible:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-charcoal opacity-100 shadow-md transition-opacity duration-200 hover:bg-ivory sm:opacity-0 sm:group-hover/slider:opacity-100 focus-visible:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
                {slides.map((banner, dotIndex) => (
                  <button
                    key={banner._id}
                    type="button"
                    onClick={() => goTo(dotIndex)}
                    aria-label={`Go to slide ${dotIndex + 1}`}
                    aria-current={dotIndex === index}
                    className={cn(
                      'h-1.5 rounded-[var(--radius-pill)] transition-all duration-300',
                      dotIndex === index ? 'w-6 bg-ivory' : 'w-1.5 bg-ivory/50 hover:bg-ivory/75',
                    )}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
