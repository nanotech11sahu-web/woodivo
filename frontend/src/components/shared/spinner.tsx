import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'h-6 w-6 animate-spin rounded-full border-2 border-brass-pale border-t-brass',
        className,
      )}
    />
  );
}

export function SectionSpinner() {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
