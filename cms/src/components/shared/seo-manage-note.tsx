import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SeoManageNoteProps {
  /**
   * Pre-fills the SEO section's search box so the editor lands on this
   * entity's row instead of scrolling a long list. Omit while the entity
   * hasn't been saved yet — there's no row to search for until then.
   */
  searchTerm?: string;
}

/**
 * Meta title/description/keywords/OG image/canonical URL used to be a
 * form section repeated on every content type's edit page. They now live
 * in one centralized SEO section (see `features/seo`) that also owns the
 * static pages (home, about, contact, gallery, listings) and stays in
 * sync automatically whenever this entity's slug or name changes — so
 * this card is a pointer there, not a form.
 */
export function SeoManageNote({ searchTerm }: SeoManageNoteProps) {
  const href = searchTerm ? `/seo?search=${encodeURIComponent(searchTerm)}` : '/seo';

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-ink-muted">
          Meta title, description, keywords, OG image and canonical URL for this page are managed from
          the centralized SEO section, alongside every other page on the site. An entry for this page is
          created automatically and its URL stays in sync if you rename it here.
        </p>
        <Link
          to={href}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-walnut hover:underline"
        >
          <Search className="h-4 w-4" />
          {searchTerm ? 'Manage SEO for this page' : 'Save first, then manage its SEO'}
        </Link>
      </CardContent>
    </Card>
  );
}
