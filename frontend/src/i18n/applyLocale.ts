import type { LocaleCode } from './locales';
import { localeDir, localeHtmlLang } from './locales';

export function applyLocaleToDocument(code: LocaleCode): void {
  document.documentElement.lang = localeHtmlLang(code);
  document.documentElement.dir = localeDir(code);
}
