import { lazy, type ComponentType } from 'react';

/**
 * `React.lazy` requires the dynamically imported module's component to
 * be a *default* export. Every page component in this CMS is a *named*
 * export (`export function CategoryListPage`, not `export default`) —
 * consistent with every other module in the project, not something
 * Phase 31 changes just to fit `lazy`'s expectation. This wraps the
 * `.then(module => ({ default: module[name] }))` re-mapping in one
 * place instead of repeating it ~25 times in `routes.tsx`.
 */
export function lazyImport<T extends ComponentType<unknown>>(
  factory: () => Promise<Record<string, T>>,
  name: string,
) {
  return lazy(() =>
    factory().then((module) => ({ default: module[name] })),
  );
}
