import { beforeEach, describe, expect, it } from 'vitest';
import { changeLocale, initI18n, i18n } from './index';
import { LOCALE_STORAGE_KEY } from './locales';

describe('i18n runtime', () => {
  beforeEach(async () => {
    localStorage.clear();
    await initI18n();
    await changeLocale('zh-CN');
  });

  it('translates the same key into every shipped locale', async () => {
    await changeLocale('en');
    expect(i18n.t('common.login')).toBe('Sign in');
    await changeLocale('ar');
    expect(i18n.t('common.login')).toBe('تسجيل الدخول');
    await changeLocale('he');
    expect(i18n.t('common.login')).toBe('התחברות');
  });

  it('persists the locale and updates document direction', async () => {
    await changeLocale('fa');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fa');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('fa');
    await changeLocale('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
