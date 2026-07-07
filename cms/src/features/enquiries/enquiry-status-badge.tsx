import { Badge } from '@/components/ui/badge';
import type { EnquiryStatus } from '@/types/enquiry';

// Badge variant is repurposed here (it's normally active/inactive) to read
// as a lifecycle: unread leads stand out (destructive/rust), in-progress
// ones are neutral or positive, and closed ones fade back (inactive).
const STATUS_VARIANTS: Record<EnquiryStatus, 'destructive' | 'neutral' | 'active' | 'inactive'> = {
  new: 'destructive',
  seen: 'neutral',
  contacted: 'active',
  closed: 'inactive',
};

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className="capitalize">
      {status}
    </Badge>
  );
}
