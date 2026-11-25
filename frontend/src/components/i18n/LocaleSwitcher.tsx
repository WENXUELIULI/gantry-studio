import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { changeLocale, i18n } from '../../i18n';
import { LOCALES, resolveLocale, type LocaleCode } from '../../i18n/locales';

interface LocaleSwitcherProps {
  compact?: boolean;
  onChange?: (code: LocaleCode) => void;
}

export function LocaleSwitcher({ compact = false, onChange }: LocaleSwitcherProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = resolveLocale(i18n.language);
  const currentLocale = LOCALES.find((locale) => locale.code === current) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleChange = (value: string) => {
    const next = resolveLocale(value);
    void changeLocale(next);
    onChange?.(next);
    setOpen(false);
  };

  return (
    <div
      className={`locale-switcher${compact ? ' is-compact' : ''}${open ? ' is-open' : ''}`}
      ref={rootRef}
    >
      <Globe2 size={13} strokeWidth={1.6} aria-hidden="true" />
      <button
        type="button"
        className="locale-trigger"
        aria-label={t('common.language')}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{compact ? currentLocale.code.toUpperCase() : currentLocale.nativeName}</span>
        <ChevronDown size={11} strokeWidth={1.8} aria-hidden="true" />
      </button>

      {open && (
        <div
          className="locale-menu"
          role="listbox"
          aria-label={t('common.language')}
          dir="ltr"
        >
          {LOCALES.map((locale) => (
            <button
              key={locale.code}
              type="button"
              role="option"
              aria-selected={locale.code === current}
              className={`locale-option${locale.code === current ? ' is-selected' : ''}`}
              onClick={() => handleChange(locale.code)}
            >
              <span className="locale-option-name" lang={locale.code}>
                {locale.nativeName}
              </span>
              <span className="locale-option-meta mono">
                {locale.code.toUpperCase()}
                {locale.dir === 'rtl' ? ' · RTL' : ''}
              </span>
              {locale.code === current && (
                <Check size={13} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
