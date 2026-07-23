import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-[var(--radius-card)] border bg-ivory px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60',
        'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brass/30',
        invalid ? 'border-vermilion focus:border-vermilion' : 'border-border-warm focus:border-brass',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
