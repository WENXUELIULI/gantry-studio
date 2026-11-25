import { describe, expect, it } from 'vitest';
import { applyLocaleToDocument } from './applyLocale';

describe('applyLocaleToDocument', () => {
  it('sets lang and rtl direction for Arabic', () => {
    applyLocaleToDocument('ar');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('resets direction when switching back to English', () => {
    applyLocaleToDocument('ar');
    applyLocaleToDocument('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
