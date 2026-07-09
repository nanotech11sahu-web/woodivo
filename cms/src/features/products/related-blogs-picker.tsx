import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useBlogs } from '@/features/blogs/blogs-api';
import type { RelatedBlogRef } from '@/types/product';

interface RelatedBlogsPickerProps {
  value: RelatedBlogRef[];
  onChange: (blogs: RelatedBlogRef[]) => void;
}

/** Lets a product link out to relevant blog posts for internal linking —
 * mirrors `RelatedProductsPicker` but searches blogs instead of products. */
export function RelatedBlogsPicker({ value, onChange }: RelatedBlogsPickerProps) {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useBlogs({ page: 1, limit: 10, search: search || undefined });

  const selectedIds = new Set(value.map((blog) => blog._id));
  const results = (data?.items ?? []).filter((blog) => !selectedIds.has(blog._id));

  function addBlog(blog: RelatedBlogRef) {
    onChange([...value, blog]);
  }

  function removeBlog(id: string) {
    onChange(value.filter((blog) => blog._id !== id));
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {value.map((blog) => (
            <span
              key={blog._id}
              className="flex items-center gap-1.5 rounded-full bg-sand-dark px-3 py-1 text-xs text-espresso"
            >
              {blog.title}
              <button
                type="button"
                onClick={() => removeBlog(blog._id)}
                aria-label={`Remove ${blog.title} from related blogs`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <Input
          placeholder="Search blog posts to link…"
          className="pl-9"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {search && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-border-warm bg-card">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 p-3 text-xs text-ink-muted">
              <Spinner className="h-3.5 w-3.5" />
              Searching…
            </div>
          )}
          {!isLoading && results.length === 0 && (
            <p className="p-3 text-center text-xs text-ink-muted">No matching posts</p>
          )}
          {!isLoading &&
            results.map((blog) => (
              <button
                key={blog._id}
                type="button"
                onClick={() => {
                  addBlog({ _id: blog._id, title: blog.title, slug: blog.slug, featuredImage: blog.featuredImage });
                  setSearch('');
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-sand"
              >
                <span>{blog.title}</span>
                <span className="text-xs text-ink-muted">/{blog.slug}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
