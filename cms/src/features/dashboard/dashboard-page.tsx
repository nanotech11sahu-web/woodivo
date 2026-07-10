import {
  FolderTree,
  Package,
  Inbox,
  Newspaper,
  Image,
  MessageSquareQuote,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { useDashboardStats } from './dashboard-api';
import { StatCard } from './stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export function DashboardPage() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-6 text-rust">
          <AlertCircle size={20} />
          <p className="text-sm">
            Couldn't load dashboard stats. Check that the API is running and try
            refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Categories" value={stats.categories.total} icon={FolderTree} />
        <StatCard label="Products" value={stats.products.total} icon={Package} />
        <StatCard
          label="Enquiries"
          value={stats.enquiries.total}
          icon={Inbox}
          accent="sage"
        />
        <StatCard label="Blogs" value={stats.blogs.total} icon={Newspaper} />
        <StatCard label="Gallery items" value={stats.gallery.total} icon={Image} />
        <StatCard
          label="Testimonials"
          value={stats.testimonials.total}
          icon={MessageSquareQuote}
        />
        <StatCard label="FAQs" value={stats.faqs.total} icon={HelpCircle} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BreakdownCard title="Products by status" byStatus={stats.products.byStatus} />
        <BreakdownCard title="Blogs by status" byStatus={stats.blogs.byStatus} />
        <BreakdownCard title="Enquiries by status" byStatus={stats.enquiries.byStatus} />
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  byStatus,
}: {
  title: string;
  byStatus: Record<string, number>;
}) {
  const entries = Object.entries(byStatus);

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-3 font-display text-base font-medium text-espresso">
          {title}
        </h3>
        <ul className="space-y-2">
          {entries.map(([status, count]) => (
            <li key={status} className="flex items-center justify-between text-sm">
              <span className="capitalize text-ink-muted">
                {status.replace(/_/g, ' ')}
              </span>
              <span className="font-mono font-medium text-espresso">{count}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
