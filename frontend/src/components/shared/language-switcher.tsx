import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  const current =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.language) ?? SUPPORTED_LANGUAGES[0];

  function selectLanguage(code: string) {
    void i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex h-10 items-center gap-1.5 rounded-[var(--radius-card)] px-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-ivory-deep"
        aria-expanded={open}
        aria-label={t('language_switcher.label')}
        onClick={() => setOpen((v) => !v)}
      >
        <Globe className="h-[18px] w-[18px]" />
        <span className="hidden xl:inline">{current.nativeLabel}</span>
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-40 max-h-80 w-48 overflow-y-auto rounded-[var(--radius-card)] border border-border-warm bg-ivory p-1.5 shadow-pop">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => selectLanguage(lang.code)}
              className={cn(
                'flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-ivory-deep',
                lang.code === current.code ? 'text-brass' : 'text-charcoal',
              )}
            >
              <span>{lang.nativeLabel}</span>
              <span className="text-xs text-charcoal-soft">{lang.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
