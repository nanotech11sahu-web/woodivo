import { Spinner } from '@/components/ui/spinner';

/**
 * Suspense fallback for lazy-loaded routes (`routes.tsx`, Phase 31).
 * `AppShell` wraps its `<Outlet />` in a single `Suspense` boundary using
 * this, so the sidebar/topbar chrome stays mounted while a route chunk
 * loads — only the content area shows the spinner, not a full-page
 * blank flash.
 */
export function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="size-6" />
    </div>
  );
}
