import { describe, expect, it } from 'vitest';
import { THEMES } from './themes';
import { contrastRatio } from '../lib/theme/contrast';

describe('theme token system', () => {
  it('ships eighteen themes with unique ids', () => {
    expect(THEMES).toHaveLength(18);
    expect(new Set(THEMES.map((theme) => theme.id)).size).toBe(18);
  });

  it('gives every theme the v2 layout tokens', () => {
    for (const theme of THEMES) {
      expect(theme.surface, theme.id).toMatch(/^#|^color-mix/);
      expect(theme.accentSoft, theme.id).toMatch(/^#|^color-mix/);
      expect(theme.focus, theme.id).toMatch(/^#/);
      expect(theme.displayWeight, theme.id).toBeGreaterThanOrEqual(400);
      expect(theme.bodySize, theme.id).toBeGreaterThanOrEqual(14);
      expect(theme.tracking, theme.id).not.toBe('');
      expect(theme.borderWidth, theme.id).toBeGreaterThanOrEqual(0);
      expect(theme.sectionSpace, theme.id).toBeGreaterThanOrEqual(48);
      expect(['none', 'subtle', 'expressive']).toContain(theme.motion);
    }
  });

  it('keeps body text readable on every paper', () => {
    for (const theme of THEMES) {
      expect(
        contrastRatio(theme.ink, theme.paper),
        `${theme.id} ink/paper`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
