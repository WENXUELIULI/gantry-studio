import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_STORAGE_KEY,
  isRtl,
  localeDir,
  localeHtmlLang,
  persistLocale,
  readLocale,
  resolveLocale,
} from './locales';

describe('locale registry', () => {
  it('ships Chinese, English and five Middle East languages', () => {
    expect(LOCALES.map((locale) => locale.code)).toEqual([
      'zh-CN',
      'en',
      'ar',
      'tr',
      'he',
      'fa',
      'ur',
    ]);
    expect(new Set(LOCALES.map((locale) => locale.code)).size).toBe(7);
  });

  it('marks Arabic, Hebrew, Persian and Urdu as right-to-left', () => {
    expect(LOCALES.filter((locale) => locale.dir === 'rtl').map((locale) => locale.code)).toEqual([
      'ar',
      'he',
      'fa',
      'ur',
    ]);
    expect(isRtl('ar')).toBe(true);
    expect(isRtl('he')).toBe(true);
    expect(isRtl('fa')).toBe(true);
    expect(isRtl('ur')).toBe(true);
    expect(isRtl('en')).toBe(false);
    expect(isRtl('tr')).toBe(false);
  });

  it('normalizes browser tags and regional variants', () => {
    expect(resolveLocale('zh')).toBe('zh-CN');
    expect(resolveLocale('zh-Hans-CN')).toBe('zh-CN');
    expect(resolveLocale('en-US')).toBe('en');
    expect(resolveLocale('ar-SA')).toBe('ar');
    expect(resolveLocale('fa-IR')).toBe('fa');
    expect(resolveLocale('ur-PK')).toBe('ur');
    expect(resolveLocale('de-DE')).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
  });

  it('maps locale to html lang and direction', () => {
    expect(localeHtmlLang('zh-CN')).toBe('zh-CN');
    expect(localeHtmlLang('ar')).toBe('ar');
    expect(localeDir('ar')).toBe('rtl');
    expect(localeDir('en')).toBe('ltr');
  });

  it('persists a valid locale and ignores invalid storage values', () => {
    expect(readLocale()).toBe(DEFAULT_LOCALE);
    persistLocale('ar');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('ar');
    expect(readLocale()).toBe('ar');
    localStorage.setItem(LOCALE_STORAGE_KEY, 'xx');
    expect(readLocale()).toBe(DEFAULT_LOCALE);
  });
});
