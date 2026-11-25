import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { applyLocaleToDocument } from './applyLocale';
import { LOCALES, LOCALE_STORAGE_KEY, persistLocale, resolveLocale, type LocaleCode } from './locales';
import { resources } from './resources';

let initPromise: Promise<typeof i18n> | null = null;

export { i18n };

export function initI18n(): Promise<typeof i18n> {
  if (i18n.isInitialized) return Promise.resolve(i18n);
  if (initPromise) return initPromise;

  initPromise = i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'zh-CN',
      supportedLngs: LOCALES.map((locale) => locale.code),
      load: 'currentOnly',
      defaultNS: 'translation',
      keySeparator: false,
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: LOCALE_STORAGE_KEY,
      },
      react: { useSuspense: false },
    })
    .then(() => {
      const code = resolveLocale(i18n.language);
      applyLocaleToDocument(code);
      i18n.on('languageChanged', (next) => {
        applyLocaleToDocument(resolveLocale(next));
      });
      return i18n;
    });

  return initPromise;
}

export async function changeLocale(code: LocaleCode): Promise<void> {
  await initI18n();
  persistLocale(code);
  await i18n.changeLanguage(code);
  applyLocaleToDocument(code);
}
