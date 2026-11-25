import { describe, expect, it } from 'vitest';
import {
  activeKeyframe,
  clamp,
  computeScrollProgress,
  keyframeTime,
  prefersReducedMotion,
  scrubTime,
} from './scroll';

describe('clamp', () => {
  it('keeps values inside the default range', () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(0.42)).toBe(0.42);
    expect(clamp(3)).toBe(1);
  });

  it('supports a custom range', () => {
    expect(clamp(5, 10, 20)).toBe(10);
    expect(clamp(15, 10, 20)).toBe(15);
    expect(clamp(25, 10, 20)).toBe(20);
  });
});

describe('computeScrollProgress', () => {
  const section = {
    viewportHeight: 800,
    sectionTop: 200,
    sectionHeight: 2400,
  };

  it('starts at zero before the section reaches the viewport top', () => {
    expect(computeScrollProgress({ ...section, scrollTop: 0 })).toBe(0);
  });

  it('maps the sticky travel to 0..1', () => {
    expect(computeScrollProgress({ ...section, scrollTop: 200 })).toBe(0);
    expect(computeScrollProgress({ ...section, scrollTop: 1000 })).toBe(0.5);
    expect(computeScrollProgress({ ...section, scrollTop: 1800 })).toBe(1);
  });

  it('clamps after the section has left the viewport', () => {
    expect(computeScrollProgress({ ...section, scrollTop: 4000 })).toBe(1);
  });

  it('never divides by zero for sections shorter than the viewport', () => {
    expect(
      computeScrollProgress({
        scrollTop: 200,
        viewportHeight: 800,
        sectionTop: 200,
        sectionHeight: 400,
      }),
    ).toBe(0);
  });
});

describe('scrubTime', () => {
  it('maps progress onto a video duration', () => {
    expect(scrubTime(0.5, 6)).toBe(3);
    expect(scrubTime(0, 6)).toBe(0);
    expect(scrubTime(1, 6)).toBe(6);
  });

  it('clamps progress and handles invalid durations', () => {
    expect(scrubTime(2, 6)).toBe(6);
    expect(scrubTime(0.5, 0)).toBe(0);
    expect(scrubTime(0.5, Number.NaN)).toBe(0);
  });
});

describe('keyframeTime', () => {
  const keyframes = [
    { at: 0, time: 0, sectionId: 'hero' },
    { at: 40, time: 2.4, sectionId: 'metrics' },
    { at: 75, time: 4.5, sectionId: 'products' },
  ];

  it('interpolates between authored keyframes', () => {
    expect(keyframeTime(0.2, keyframes, 6)).toBeCloseTo(1.2);
    expect(keyframeTime(0.575, keyframes, 6)).toBeCloseTo(3.45);
  });

  it('clamps to the first and last keyframe', () => {
    expect(keyframeTime(0, keyframes, 6)).toBe(0);
    expect(keyframeTime(1, keyframes, 6)).toBe(4.5);
  });

  it('falls back to linear scrub without keyframes', () => {
    expect(keyframeTime(0.5, [], 6)).toBe(3);
  });
});

describe('activeKeyframe', () => {
  const keyframes = [
    { at: 0, time: 0, sectionId: 'hero' },
    { at: 40, time: 2.4, sectionId: 'metrics' },
    { at: 75, time: 4.5, sectionId: 'products' },
  ];

  it('returns the last keyframe reached by progress', () => {
    expect(activeKeyframe(0.1, keyframes)?.sectionId).toBe('hero');
    expect(activeKeyframe(0.4, keyframes)?.sectionId).toBe('metrics');
    expect(activeKeyframe(0.9, keyframes)?.sectionId).toBe('products');
  });

  it('returns undefined when no keyframes are authored', () => {
    expect(activeKeyframe(0.5, [])).toBeUndefined();
  });
});

describe('prefersReducedMotion', () => {
  it('reads the media query result', () => {
    expect(typeof prefersReducedMotion()).toBe('boolean');
  });
});
