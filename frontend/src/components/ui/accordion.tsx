import { createContext, useContext, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionContextValue {
  openItem: string | null;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

/** Single-open accordion (opening one item closes any other) — matches the
 * FAQ/product-info use cases this was built for, where showing several
 * long sections at once defeats the point of collapsing them. */
export function Accordion({
  children,
  defaultOpenIndex,
}: {
  children: ReactNode;
  defaultOpenIndex?: number;
}) {
  const [openItem, setOpenItem] = useState<string | null>(
    typeof defaultOpenIndex === 'number' ? String(defaultOpenIndex) : null,
  );

  const toggle = (id: string) => setOpenItem((prev) => (prev === id ? null : id));

  return (
    <AccordionContext.Provider value={{ openItem, toggle }}>
      <div className="divide-y divide-border-warm border-t border-border-warm">{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionItem must be used within Accordion');
  const id = String(index);
  const isOpen = ctx.openItem === id;
  const panelId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => ctx.toggle(id)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-semibold text-teak">{title}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-charcoal-soft transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>
      <div
        id={panelId}
        className={cn('grid transition-all duration-200 ease-in-out', isOpen ? 'grid-rows-[1fr] pb-4 opacity-100' : 'grid-rows-[0fr] opacity-0')}
      >
        <div className="overflow-hidden text-sm leading-relaxed text-charcoal-soft">{children}</div>
      </div>
    </div>
  );
}
