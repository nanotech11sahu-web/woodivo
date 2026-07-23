import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-11 w-full appearance-none rounded-[var(--radius-card)] border bg-ivory pl-4 pr-10 text-sm text-charcoal',
          'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brass/30',
          invalid ? 'border-vermilion focus:border-vermilion' : 'border-border-warm focus:border-brass',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-soft"
        strokeWidth={1.75}
      />
    </div>
  ),
);
Select.displayName = 'Select';
