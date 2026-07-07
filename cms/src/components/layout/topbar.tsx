import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-context';
import { cn } from '@/lib/utils';
import { titleForPath } from './nav-items';

export function Topbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const title = titleForPath(location.pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-warm bg-card px-6">
      <h1 className="font-display text-xl font-medium text-espresso">{title}</h1>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-sand-dark"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-walnut text-white">
            <User size={16} />
          </span>
          <span className="hidden text-left sm:block">
            <span className="block font-medium text-espresso">{user?.name}</span>
            <span className="block text-xs capitalize text-ink-muted">
              {user?.role.replace('_', ' ')}
            </span>
          </span>
        </button>

        {menuOpen && (
          <div
            role="menu"
            className={cn(
              'absolute right-0 top-full mt-2 w-44 rounded-md border border-border-warm',
              'bg-card py-1 shadow-md',
            )}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => void logout()}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rust hover:bg-rust-light"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
