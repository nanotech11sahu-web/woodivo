import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NAV_SECTIONS } from './nav-items';

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border-warm bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border-warm px-5">
        <span className="font-display text-xl font-semibold tracking-tight text-espresso">
          WOODIVO
        </span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-ink-muted">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-sand-dark font-medium text-espresso'
                          : 'text-ink-muted hover:bg-sand-dark/60 hover:text-espresso',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-walnut-light via-walnut to-walnut-dark" />
                        )}
                        <item.icon size={16} strokeWidth={2} />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
