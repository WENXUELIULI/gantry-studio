import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SECTION_STYLE,
  STYLE_CONTROLS,
  controlsFor,
  defaultStyleFor,
  resolveSectionStyle,
  styleVars,
} from './sectionStyles';

describe('section style system', () => {
  it('gives every section type a complete default style', () => {
    expect(defaultStyleFor('hero')).toMatchObject({
      layout: 'default',
      density: 'airy',
      align: 'left',
      surface: 'none',
      columns: 1,
      overlay: 'soft',
    });
    expect(defaultStyleFor('products').columns).toBe(3);
    expect(defaultStyleFor('footer').motion).toBe('none');
  });

  it('fills missing fields and clamps columns into the supported range', () => {
    const style = resolveSectionStyle(
      { layout: 'split', columns: 9 as 3, density: 'compact' },
      'products',
    );
    expect(style.layout).toBe('split');
    expect(style.density).toBe('compact');
    expect(style.columns).toBe(4);
    expect(style.align).toBe(DEFAULT_SECTION_STYLE.align);
    expect(style.mobile).toEqual({});
  });

  it('accepts explicit none, subtle and 16:9 instead of falling back', () => {
    const style = resolveSectionStyle(
      { surface: 'none', overlay: 'none', motion: 'subtle', ratio: '16:9' },
      'hero',
    );
    expect(style.surface).toBe('none');
    expect(style.overlay).toBe('none');
    expect(style.motion).toBe('subtle');
    expect(style.ratio).toBe('16:9');
  });

  it('only exposes controls that can affect the selected section type', () => {
    expect(controlsFor('hero').map((control) => control.key)).not.toContain(
      'ratio',
    );
    expect(controlsFor('products').map((control) => control.key)).toContain(
      'columns',
    );
    expect(controlsFor('metrics').map((control) => control.key)).not.toContain(
      'ratio',
    );
  });

  it('keeps valid mobile overrides and rejects invalid ones', () => {
    const style = resolveSectionStyle(
      {
        layout: 'wide',
        mobile: { layout: 'stacked', columns: 2, density: 'airy' },
      },
      'capabilities',
    );
    expect(style.mobile).toEqual({
      layout: 'stacked',
      columns: 2,
      density: 'airy',
    });
  });

  it('exposes schema-driven controls with labels and options', () => {
    const keys = STYLE_CONTROLS.map((control) => control.key);
    expect(keys).toContain('layout');
    expect(keys).toContain('density');
    expect(keys).toContain('surface');
    expect(keys).toContain('columns');
    expect(keys).toContain('motion');
    for (const control of STYLE_CONTROLS) {
      expect(control.label).not.toBe('');
      expect(control.options.length).toBeGreaterThan(1);
    }
  });

  it('turns a style into CSS custom properties', () => {
    const style = resolveSectionStyle({ columns: 2, ratio: '4:3' }, 'products');
    expect(styleVars(style)['--section-columns']).toBe('2');
    expect(styleVars(style)['--section-ratio']).toBe('4 / 3');
  });
});
