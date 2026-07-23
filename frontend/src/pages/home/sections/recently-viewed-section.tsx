import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductCard, type ProductCardItem } from '@/components/shared/product-card';
import { CardSlider, sliderItemWidths } from '@/components/shared/card-slider';
import { getRecentlyViewed } from '@/lib/recently-viewed';

/**
 * Purely a localStorage read — no backend model, no new API call. Renders
 * nothing (including no heading) until a visitor has actually viewed a
 * product, so it never shows on a first-ever visit. Read inside an effect
 * rather than `useState(() => getRecentlyViewed())` so the same component
 * tree stays correct across client-side navigations back to Home, where a
 * fresh mount wouldn't otherwise happen.
 */
export function RecentlyViewedSection() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ProductCardItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="bg-ivory px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-xl sm:text-2xl">{t('home.recently_viewed')}</h2>
        <CardSlider className="mt-6">
          {items.map((product) => (
            <div key={product._id} className={sliderItemWidths.product}>
              <ProductCard product={product} />
            </div>
          ))}
        </CardSlider>
      </div>
    </section>
  );
}
