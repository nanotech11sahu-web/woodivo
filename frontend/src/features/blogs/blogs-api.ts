import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { Blog, BlogCategory, QueryPublicBlogParams } from '@/types/blog';

/**
 * `GET /blogs` — the listing page's paginated grid, optionally scoped to a
 * category slug via the same `category` query param `findAllPublic`
 * (blogs.service.ts) already accepts. Mirrors `useProducts` /
 * `useProjects`'s shape rather than inventing a fourth pagination pattern.
 */
export function useBlogs(params: QueryPublicBlogParams = {}) {
  return useQuery({
    queryKey: ['public-blogs', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResult<Blog>>('/blogs', {
        params,
      });
      return data;
    },
  });
}

/**
 * `GET /blogs/categories` — `BlogCategoriesService.findAll()`, unfiltered
 * and unpaginated (there are only ever a handful of blog categories, same
 * assumption the CMS's own category manager makes). Powers the listing
 * page's filter pills; fetched from the API rather than hardcoded, unlike
 * `GalleryPage`'s "All / Photos / Videos" toggle, because blog categories
 * are CMS-editable content, not a fixed schema enum.
 */
export function useBlogCategories() {
  return useQuery({
    queryKey: ['public-blog-categories'],
    queryFn: async () => {
      const { data } = await apiClient.get<BlogCategory[]>('/blogs/categories');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLatestBlogs(limit = 3) {
  return useQuery({
    queryKey: ['public-blogs-latest', limit],
    queryFn: async () => {
      const { data } = await apiClient.get<Blog[]>('/blogs/latest', {
        params: { limit },
      });
      return data;
    },
  });
}

export function useBlog(slug: string | undefined) {
  return useQuery({
    queryKey: ['public-blog', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<Blog>(`/blogs/${slug}`);
      return data;
    },
    enabled: Boolean(slug),
  });
}
