import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { BlogStatus } from '@/types/blog';

const VARIANT_BY_STATUS: Record<BlogStatus, NonNullable<BadgeProps['variant']>> = {
  draft: 'inactive',
  published: 'active',
  scheduled: 'neutral',
  archived: 'destructive',
};

export function BlogStatusBadge({ status }: { status: BlogStatus }) {
  return (
    <Badge variant={VARIANT_BY_STATUS[status]} className="capitalize">
      {status}
    </Badge>
  );
}
