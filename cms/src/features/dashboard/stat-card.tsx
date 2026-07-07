import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: 'walnut' | 'sage' | 'rust';
}

const ACCENT_STYLES = {
  walnut: 'bg-walnut/10 text-walnut',
  sage: 'bg-sage-light text-sage',
  rust: 'bg-rust-light text-rust',
};

export function StatCard({ label, value, icon: Icon, accent = 'walnut' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-md',
            ACCENT_STYLES[accent],
          )}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
        <div>
          <p className="font-mono text-2xl font-semibold text-espresso">
            {value.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-ink-muted">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
