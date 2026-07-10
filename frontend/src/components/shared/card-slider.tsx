import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardSliderProps {
  children: ReactNode;
  className?: string;
}

/**
 * Generic horizontal card carousel used by every homepage "curated list +
 * View all" section (categories, products, testimonials, blogs).
 * Native scroll-snap does the heavy lifting — touch/trackpad swiping works
 * for free — with arrow buttons layered on top for mouse/keyboard users and
 * a small pointer-drag handler so a mouse click-drag scrolls it too.
 *
 * Arrows auto-hide at either end (and altogether when the content doesn't
 * overflow, e.g. only 2-3 items on a wide screen), so this is safe to wrap
 * around any list regardless of how much data is behind it.
 */
export function CardSlider({ children, className }: CardSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return undefined;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState]);

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  }, []);

  // Mouse click-drag scrolling — touch devices already scroll natively,
  // this just extends the same gesture to desktop mouse users. Pointer
  // capture is only engaged once the pointer has actually moved past a
  // small threshold, not on every mousedown — capturing immediately used
  // to swallow plain clicks on links/buttons inside a card (mouseup +
  // click get delivered to the captured container, never the card), which
  // is why product/category cards looked "unclickable" on desktop.
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const pointerDownId = useRef<number | null>(null);
  const DRAG_THRESHOLD_PX = 6;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = false;
    pointerDownId.current = e.pointerId;
    dragStartX.current = e.clientX;
    dragStartScroll.current = el.scrollLeft;
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (pointerDownId.current !== e.pointerId) return;
    const el = scrollRef.current;
    if (!el) return;
    const delta = e.clientX - dragStartX.current;
    if (!isDragging.current) {
      if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;
      isDragging.current = true;
      el.setPointerCapture(e.pointerId);
    }
    el.scrollLeft = dragStartScroll.current - delta;
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (isDragging.current && el && el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    isDragging.current = false;
    pointerDownId.current = null;
  };

  return (
    <div className={cn('group/card-slider relative', className)}>
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-1 [cursor:grab] active:[cursor:grabbing]"
      >
        {children}
      </div>

      {canScrollPrev ? (
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Previous"
          className="absolute -left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-warm bg-ivory shadow-md transition-colors hover:bg-ivory-deep sm:-left-3 sm:h-10 sm:w-10"
        >
          <ChevronLeft className="h-4 w-4 text-charcoal sm:h-5 sm:w-5" />
        </button>
      ) : null}

      {canScrollNext ? (
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Next"
          className="absolute -right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-warm bg-ivory shadow-md transition-colors hover:bg-ivory-deep sm:-right-3 sm:h-10 sm:w-10"
        >
          <ChevronRight className="h-4 w-4 text-charcoal sm:h-5 sm:w-5" />
        </button>
      ) : null}
    </div>
  );
}

/** Shared slide-item width classes, per section type, so cards don't stretch full-width inside the slider. */
export const sliderItemWidths = {
  category: 'w-[42%] shrink-0 snap-start sm:w-[22%] lg:w-[16%]',
  product: 'w-[68%] shrink-0 snap-start sm:w-[42%] md:w-[30%] lg:w-[23%]',
  testimonial: 'w-[88%] shrink-0 snap-start sm:w-[48%] lg:w-[32%]',
  blog: 'w-[85%] shrink-0 snap-start sm:w-[47%] lg:w-[32%]',
} as const;
