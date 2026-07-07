import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'light',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'mb-3 font-body text-xs font-semibold uppercase tracking-[0.25em]',
            tone === 'dark' ? 'text-brass-light' : 'text-brass',
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          'text-3xl leading-tight sm:text-4xl',
          tone === 'dark' ? 'text-ivory' : 'text-teak',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed',
            tone === 'dark' ? 'text-ivory-deep/80' : 'text-charcoal-soft',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
