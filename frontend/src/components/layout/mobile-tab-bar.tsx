import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, MessageSquareText, Phone } from 'lucide-react';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { cn } from '@/lib/utils';

/**
 * Reference-style bottom tab bar for small screens — the storefront brief
 * this phase is matching keeps Home/Cart/Account pinned to the bottom of
 * the viewport at all times rather than only inside a hamburger drawer.
 * Woodivo has no cart/account (it's an enquiry-led catalogue, not a
 * checkout flow), so the middle two slots become Categories and Enquire —
 * the two actions a visitor on mobile actually needs one thumb-reach away.
 */
export function MobileTabBar() {
  const { openEnquiryDialog } = useEnquiryDialog();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-border-warm bg-ivory/95 backdrop-blur sm:hidden"
      aria-label="Primary"
    >
      <NavLink to="/" end className={tabClass}>
        <Home className="h-5 w-5" />
        <span>Home</span>
      </NavLink>
      <NavLink to="/categories" className={tabClass}>
        <LayoutGrid className="h-5 w-5" />
        <span>Categories</span>
      </NavLink>
      <button type="button" className={cn(tabClassBase, 'text-charcoal')} onClick={() => openEnquiryDialog('floating_cta')}>
        <MessageSquareText className="h-5 w-5" />
        <span>Enquire</span>
      </button>
      <NavLink to="/contact" className={tabClass}>
        <Phone className="h-5 w-5" />
        <span>Contact</span>
      </NavLink>
    </nav>
  );
}

const tabClassBase = 'flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium';

function tabClass({ isActive }: { isActive: boolean }): string {
  return cn(tabClassBase, isActive ? 'text-brass' : 'text-charcoal-soft');
}
