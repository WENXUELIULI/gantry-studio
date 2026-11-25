import { describe, expect, it } from 'vitest';
import {
  PLAN_STORAGE_KEY,
  canExportSource,
  readPlan,
  savePlan,
} from './entitlement';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

describe('entitlement', () => {
  it('defaults to the free plan and only enables source for pro', () => {
    expect(readPlan(memoryStorage())).toBe('free');
    expect(canExportSource('free')).toBe(false);
    expect(canExportSource('pro')).toBe(true);
  });

  it('persists a pro plan and reads it back', () => {
    const store = memoryStorage();
    savePlan('pro', store);
    expect(store.getItem(PLAN_STORAGE_KEY)).toBe('pro');
    expect(readPlan(store)).toBe('pro');
  });

  it('falls back safely when storage is unavailable or corrupted', () => {
    expect(readPlan(null)).toBe('free');
    expect(readPlan(memoryStorage({ [PLAN_STORAGE_KEY]: 'studio' }))).toBe('free');
    expect(() => savePlan('pro', null)).not.toThrow();
  });
});
