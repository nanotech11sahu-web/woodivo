import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import type { SocialLinks } from '@/types/settings';
import { cn } from '@/lib/utils';

// lucide-react has no Pinterest icon, so `SocialLinks.pinterest` -- present
// on the schema and the CMS's settings form -- has never had an icon to
// pair it with here. Still true after this extraction, not a gap this
// phase introduced; a text link instead of an icon would be the fix, but
// nothing asked for one and every other entry here is icon-only.
const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
} as const;

interface SocialLinksRowProps {
  links: SocialLinks | undefined;
  /** 'dark' = footer's teak-deep background (original, default). 'light' = an ivory page background, e.g. ContactPage. */
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * Extracted from `SiteFooter` (Phase 18's inline map over `SOCIAL_ICONS`)
 * once `ContactPage` (Phase 22) needed the identical icon row a second
 * place — same "pull it out once a second caller needs it" call this
 * project made for `ProductCard` (Phase 19), `ProjectCard` and
 * `MediaGallery` (Phase 20), and `BlogCard` (Phase 21). `SiteFooter` now
 * imports this instead of its own copy, with no visual change there (its
 * callsite doesn't pass `tone`, so it keeps the original dark styling by
 * default).
 */
export function SocialLinksRow({ links, tone = 'dark', className }: SocialLinksRowProps) {
  if (!links) return null;

  const entries = (Object.keys(SOCIAL_ICONS) as Array<keyof typeof SOCIAL_ICONS>).filter((key) =>
    Boolean(links[key]),
  );
  if (entries.length === 0) return null;

  return (
    <div className={cn('flex gap-3', className)}>
      {entries.map((key) => {
        const Icon = SOCIAL_ICONS[key];
        return (
          <a
            key={key}
            href={links[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={key}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border transition-colors',
              tone === 'dark'
                ? 'border-ivory-deep/25 text-ivory-deep hover:border-brass hover:text-brass'
                : 'border-border-warm text-charcoal-soft hover:border-brass hover:text-brass',
            )}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
