export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener(toasts);
}

function dismiss(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(item: Omit<ToastItem, 'id'>): void {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  toasts = [...toasts, { ...item, id }];
  emit();
  setTimeout(() => dismiss(id), 4500);
}

export const toast = {
  success: (title: string, description?: string) => push({ title, description, variant: 'success' }),
  error: (title: string, description?: string) => push({ title, description, variant: 'error' }),
  info: (title: string, description?: string) => push({ title, description, variant: 'info' }),
  dismiss,
};

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToastSnapshot(): ToastItem[] {
  return toasts;
}
