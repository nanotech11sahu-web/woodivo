import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return (
    <Badge variant={status === 'active' ? 'active' : 'inactive'} className="capitalize">
      {status}
    </Badge>
  );
}
