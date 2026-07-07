import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useProducts } from './products-api';
import type { RelatedProductRef } from '@/types/product';

interface RelatedProductsPickerProps {
  value: RelatedProductRef[];
  onChange: (products: RelatedProductRef[]) => void;
  excludeProductId?: string;
}

export function RelatedProductsPicker({
  value,
  onChange,
  excludeProductId,
}: RelatedProductsPickerProps) {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useProducts({ page: 1, limit: 10, search: search || undefined });

  const selectedIds = new Set(value.map((product) => product._id));
  const results = (data?.items ?? []).filter(
    (product) => product._id !== excludeProductId && !selectedIds.has(product._id),
  );

  function addProduct(product: RelatedProductRef) {
    onChange([...value, product]);
  }

  function removeProduct(id: string) {
    onChange(value.filter((product) => product._id !== id));
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {value.map((product) => (
            <span
              key={product._id}
              className="flex items-center gap-1.5 rounded-full bg-sand-dark px-3 py-1 text-xs text-espresso"
            >
              {product.name}
              <button
                type="button"
                onClick={() => removeProduct(product._id)}
                aria-label={`Remove ${product.name} from related products`}
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
          placeholder="Search products to relate…"
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
            <p className="p-3 text-center text-xs text-ink-muted">No matching products</p>
          )}
          {!isLoading &&
            results.map((product) => (
              <button
                key={product._id}
                type="button"
                onClick={() => {
                  addProduct({ _id: product._id, name: product.name, slug: product.slug });
                  setSearch('');
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-sand"
              >
                <span>{product.name}</span>
                <span className="text-xs text-ink-muted">/{product.slug}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
