import { useSyncExternalStore } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { subscribeToasts, getToastSnapshot, toast, type ToastVariant } from '@/lib/toast';
import { cn } from '@/lib/utils';

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-sage bg-sage-light text-espresso',
  error: 'border-rust bg-rust-light text-espresso',
  info: 'border-walnut bg-sand text-espresso',
};

const VARIANT_ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const ICON_COLORS: Record<ToastVariant, string> = {
  success: 'text-sage',
  error: 'text-rust',
  info: 'text-walnut',
};

export function Toaster() {
  const items = useSyncExternalStore(subscribeToasts, getToastSnapshot);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-end gap-2 p-4 sm:inset-x-auto sm:right-4">
      {items.map((item) => {
        const Icon = VARIANT_ICONS[item.variant];
        return (
          <div
            key={item.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border px-4 py-3 shadow-md sm:w-96',
              VARIANT_STYLES[item.variant],
            )}
          >
            <Icon size={18} className={cn('mt-0.5 shrink-0', ICON_COLORS[item.variant])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-xs text-ink-muted">{item.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(item.id)}
              className="shrink-0 rounded p-0.5 text-ink-muted hover:text-espresso"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
