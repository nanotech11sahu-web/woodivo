import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryItem } from '@/types/gallery';

interface GalleryLightboxProps {
  items: GalleryItem[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

/**
 * Built on the native <dialog> element, same call `enquiry-dialog.tsx`
 * (Phase 18) already made for the site's only other modal — Escape-to-
 * close, ::backdrop, and top-layer stacking all come free, so a second
 * modal doesn't justify a headless-UI/Radix dependency either.
 *
 * `activeIndex` is owned by the gallery page, not local state here —
 * navigation only needs to walk the current page's `items` array (the
 * gallery grid is paginated, same as category-listing's product grid),
 * so it deliberately doesn't reach across page boundaries; going past the
 * last thumbnail on the current page wraps to the first rather than
 * fetching the next page's items into a modal.
 */
export function GalleryLightbox({ items, activeIndex, onClose, onNavigate }: GalleryLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = activeIndex !== null;
  const item = isOpen ? items[activeIndex] : undefined;

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (isOpen && !node.open) {
      node.showModal();
    } else if (!isOpen && node.open) {
      node.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeIndex === null || items.length <= 1) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') {
        onNavigate(((activeIndex as number) + 1) % items.length);
      } else if (event.key === 'ArrowLeft') {
        onNavigate(((activeIndex as number) - 1 + items.length) % items.length);
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, activeIndex, items.length, onNavigate]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[min(56rem,94vw)] rounded-[var(--radius-card)] border border-border-warm bg-charcoal p-0 backdrop:bg-charcoal/80 backdrop:backdrop-blur-sm"
    >
      {item && activeIndex !== null ? (
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 rounded-full bg-charcoal/60 p-1.5 text-ivory hover:bg-charcoal/80"
          >
            <X className="h-5 w-5" />
          </button>

          {items.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous item"
                onClick={() => onNavigate((activeIndex - 1 + items.length) % items.length)}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-charcoal/60 p-1.5 text-ivory hover:bg-charcoal/80"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next item"
                onClick={() => onNavigate((activeIndex + 1) % items.length)}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-charcoal/60 p-1.5 text-ivory hover:bg-charcoal/80"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          <div className="flex max-h-[85vh] items-center justify-center">
            {item.type === 'video' ? (
              <video
                key={item._id}
                src={item.media.url}
                controls
                autoPlay
                className="max-h-[85vh] w-full"
              />
            ) : (
              <img
                src={item.media.url}
                alt={item.media.alt || item.caption || 'Gallery image'}
                className="max-h-[85vh] w-full object-contain"
              />
            )}
          </div>

          {item.caption ? (
            <p className="px-6 py-4 text-center text-sm text-ivory-deep/80">{item.caption}</p>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
