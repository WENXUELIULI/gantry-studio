import { describe, expect, it } from 'vitest';
import { LOCALES } from './locales';
import { resources } from './resources';

function flattenKeys(value: Record<string, string>): string[] {
  return Object.keys(value).sort();
}

describe('translation resources', () => {
  it('provides every locale with the same keys', () => {
    const base = flattenKeys(resources['zh-CN'].translation);
    for (const locale of LOCALES) {
      expect(flattenKeys(resources[locale.code].translation), locale.code).toEqual(base);
    }
  });

  it('does not leave any locale with an empty string', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(resources[locale.code].translation)) {
        expect(value.trim(), `${locale.code}:${key}`).not.toBe('');
      }
    }
  });
});
