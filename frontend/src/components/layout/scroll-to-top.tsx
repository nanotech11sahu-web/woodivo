import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * React Router does not reset scroll position on client-side navigation —
 * the browser just keeps whatever scrollY the previous page had. Without
 * this, clicking a link while scrolled down (e.g. a "related product" card
 * near the bottom of a product page) lands you on the new page still
 * scrolled to the same position, which reads as "the link didn't do
 * anything" even though the navigation succeeded and the content
 * underneath did change.
 *
 * Skips the reset on POP (back/forward) navigation so the browser's native
 * back-button scroll restoration still works as expected.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
}
