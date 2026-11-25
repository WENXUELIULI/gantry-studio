import { Globe2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { changeLocale, i18n } from '../../i18n';
import { LOCALES, resolveLocale, type LocaleCode } from '../../i18n/locales';

interface LocaleSwitcherProps {
  compact?: boolean;
  onChange?: (code: LocaleCode) => void;
}

export function LocaleSwitcher({ compact = false, onChange }: LocaleSwitcherProps) {
  const { t } = useTranslation();
  const current = resolveLocale(i18n.language);

  const handleChange = (value: string) => {
    const next = resolveLocale(value);
    void changeLocale(next);
    onChange?.(next);
  };

  return (
    <label className={`locale-switcher${compact ? ' is-compact' : ''}`}>
      <Globe2 size={13} strokeWidth={1.6} aria-hidden="true" />
      <span className="sr-only">{t('common.language')}</span>
      <select
        aria-label={t('common.language')}
        value={current}
        onChange={(event) => handleChange(event.target.value)}
      >
        {LOCALES.map((locale) => (
          <option key={locale.code} value={locale.code} lang={locale.code} dir={locale.dir}>
            {compact ? locale.code.toUpperCase() : locale.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
