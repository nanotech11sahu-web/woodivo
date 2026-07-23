import { useTranslation } from 'react-i18next';

/** Static — no CMS model behind these numbers. A quick, high-trust visual
 * break between the hero and the category grid; the owner can hand-edit
 * the value fields below as real figures firm up. */
export function StatsBarSection() {
  const { t } = useTranslation();

  const STATS = [
    { value: '1,000+', label: t('home.stat_pieces') },
    { value: '15+', label: t('home.stat_cities') },
    { value: '100%', label: t('home.stat_solid_wood') },
    { value: 'Custom', label: t('home.stat_custom') },
  ];

  return (
    <section className="border-y border-border-warm bg-brass-pale/40 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4 sm:gap-y-0">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-2xl font-medium leading-tight text-teak sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1.5 text-xs leading-snug text-charcoal-soft sm:text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
