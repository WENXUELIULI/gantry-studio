import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  ensureContrast,
  hexToRgb,
  relativeLuminance,
} from './contrast';

describe('contrast', () => {
  it('parses six-digit and three-digit hex', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('rejects malformed hex', () => {
    expect(() => hexToRgb('#12')).toThrow('Invalid hex color');
    expect(() => hexToRgb('nope')).toThrow('Invalid hex color');
  });

  it('computes relative luminance for black and white', () => {
    expect(relativeLuminance(hexToRgb('#000000'))).toBeCloseTo(0, 5);
    expect(relativeLuminance(hexToRgb('#ffffff'))).toBeCloseTo(1, 5);
  });

  it('computes the black/white contrast ratio', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('returns the original color when it already passes', () => {
    expect(ensureContrast('#111111', '#ffffff', 4.5)).toBe('#111111');
  });

  it('darkens a failing accent until it reaches the threshold', () => {
    const original = '#e04b1f';
    const next = ensureContrast(original, '#f1eee6', 4.5);
    expect(next).not.toBe(original);
    expect(contrastRatio(next, '#f1eee6')).toBeGreaterThanOrEqual(4.5);
  });

  it('lightens a failing accent on a dark surface', () => {
    const original = '#6b2f1f';
    const next = ensureContrast(original, '#151513', 4.5);
    expect(next).not.toBe(original);
    expect(contrastRatio(next, '#151513')).toBeGreaterThanOrEqual(4.5);
  });
});
