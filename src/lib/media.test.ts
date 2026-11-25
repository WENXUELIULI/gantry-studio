import { describe, expect, it } from 'vitest';
import { clampCrop, cropVars, DEFAULT_CROP } from './media';

describe('media crop', () => {
  it('uses a centered cover crop by default', () => {
    expect(DEFAULT_CROP).toEqual({ x: 50, y: 50, zoom: 1 });
  });

  it('clamps focal points and zoom into usable ranges', () => {
    expect(clampCrop({ x: -20, y: 130, zoom: 9 })).toEqual({
      x: 0,
      y: 100,
      zoom: 2.5,
    });
    expect(clampCrop({ x: 32, y: 68, zoom: 1.4 })).toEqual({
      x: 32,
      y: 68,
      zoom: 1.4,
    });
  });

  it('falls back to defaults for invalid values', () => {
    expect(clampCrop({ x: Number.NaN, y: 20, zoom: 0 })).toEqual({
      x: 50,
      y: 20,
      zoom: 1,
    });
  });

  it('emits object-position and zoom custom properties', () => {
    const vars = cropVars({ x: 25, y: 75, zoom: 1.6 });
    expect(vars['--focal-x']).toBe('25%');
    expect(vars['--focal-y']).toBe('75%');
    expect(vars['--media-zoom']).toBe('1.6');
  });
});
