export type LocaleCode = 'zh-CN' | 'en' | 'ar' | 'tr' | 'he' | 'fa' | 'ur';

export type LocaleDirection = 'ltr' | 'rtl';

export interface LocaleDefinition {
  code: LocaleCode;
  label: string;
  nativeName: string;
  dir: LocaleDirection;
  region: 'cn' | 'global' | 'middle-east';
}

export const DEFAULT_LOCALE: LocaleCode = 'zh-CN';
export const LOCALE_STORAGE_KEY = 'gantry:locale:v1';

export const LOCALES: LocaleDefinition[] = [
  { code: 'zh-CN', label: '简体中文', nativeName: '简体中文', dir: 'ltr', region: 'cn' },
  { code: 'en', label: 'English', nativeName: 'English', dir: 'ltr', region: 'global' },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', dir: 'rtl', region: 'middle-east' },
  { code: 'tr', label: 'Turkish', nativeName: 'Türkçe', dir: 'ltr', region: 'middle-east' },
  { code: 'he', label: 'Hebrew', nativeName: 'עברית', dir: 'rtl', region: 'middle-east' },
  { code: 'fa', label: 'Persian', nativeName: 'فارسی', dir: 'rtl', region: 'middle-east' },
  { code: 'ur', label: 'Urdu', nativeName: 'اردو', dir: 'rtl', region: 'middle-east' },
];

const LOCALE_BY_CODE = new Map(LOCALES.map((locale) => [locale.code, locale]));

const LANGUAGE_ALIASES: Record<string, LocaleCode> = {
  zh: 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-hans-cn': 'zh-CN',
  en: 'en',
  ar: 'ar',
  tr: 'tr',
  he: 'he',
  iw: 'he',
  fa: 'fa',
  ur: 'ur',
};

export function isRtl(code: LocaleCode): boolean {
  return LOCALE_BY_CODE.get(code)?.dir === 'rtl';
}

export function localeDir(code: LocaleCode): LocaleDirection {
  return isRtl(code) ? 'rtl' : 'ltr';
}

export function localeHtmlLang(code: LocaleCode): string {
  return code;
}

export function resolveLocale(input?: string | null): LocaleCode {
  if (!input) return DEFAULT_LOCALE;
  const normalized = input.trim().toLowerCase();
  if (!normalized) return DEFAULT_LOCALE;
  if (LOCALE_BY_CODE.has(normalized as LocaleCode)) {
    return normalized as LocaleCode;
  }
  const exact = LANGUAGE_ALIASES[normalized];
  if (exact) return exact;
  const base = normalized.split('-')[0];
  return LANGUAGE_ALIASES[base] ?? DEFAULT_LOCALE;
}

export function readLocale(): LocaleCode {
  if (typeof localStorage === 'undefined') return DEFAULT_LOCALE;
  try {
    return resolveLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function persistLocale(code: LocaleCode): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, code);
  } catch {
    // Private mode or a blocked storage quota must not break the editor.
  }
}
