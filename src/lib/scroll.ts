export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export interface ScrollProgressInput {
  scrollTop: number;
  viewportHeight: number;
  sectionTop: number;
  sectionHeight: number;
}

/**
 * Maps the scroll position inside a scroll container to 0..1 for one section.
 * Progress starts when the section top meets the container top and ends when
 * the section bottom meets the container bottom. Tall sticky sections therefore
 * use their extra height as the animation timeline.
 */
export function computeScrollProgress({
  scrollTop,
  viewportHeight,
  sectionTop,
  sectionHeight,
}: ScrollProgressInput): number {
  const travel = Math.max(sectionHeight - viewportHeight, 1);
  return clamp((scrollTop - sectionTop) / travel);
}

export function scrubTime(progress: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return clamp(progress) * duration;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
