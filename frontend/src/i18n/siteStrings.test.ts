import { describe, expect, it } from 'vitest';
import { LOCALES } from './locales';
import { siteChrome } from './siteStrings';

describe('siteChrome', () => {
  it('ships chrome strings for every supported locale', () => {
    for (const locale of LOCALES) {
      const chrome = siteChrome(locale.code);
      expect(chrome.cta.length).toBeGreaterThan(0);
      expect(chrome.nav).toHaveLength(4);
    }
  });

  it('defaults to Chinese chrome', () => {
    expect(siteChrome().cta).toBe('询价');
  });
});
