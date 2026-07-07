import { Card, CardContent } from '@/components/ui/card';

/**
 * Placeholder for modules scoped to a later phase. Phase 8 only wires up
 * Auth + the dashboard shell — every other CMS module lands in Phase 9+.
 */
export function ComingSoon({ moduleName }: { moduleName: string }) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <p className="font-display text-lg text-espresso">
          {moduleName} isn't built yet
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
          The API for this module is live — this screen is scoped for the next
          CMS phase.
        </p>
      </CardContent>
    </Card>
  );
}
