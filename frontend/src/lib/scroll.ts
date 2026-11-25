import type { VideoKeyframe } from '../types/site';

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

export function keyframeTime(
  progress: number,
  keyframes: VideoKeyframe[] = [],
  duration: number,
): number {
  if (!keyframes.length) return scrubTime(progress, duration);
  const points = [...keyframes].sort((a, b) => a.at - b.at);
  const at = clamp(progress) * 100;
  if (at <= points[0].at) return points[0].time;
  const last = points[points.length - 1];
  if (at >= last.at) return last.time;
  for (let index = 0; index < points.length - 1; index += 1) {
    const from = points[index];
    const to = points[index + 1];
    if (at < from.at || at > to.at) continue;
    const span = to.at - from.at;
    if (span <= 0) return to.time;
    const ratio = (at - from.at) / span;
    return from.time + (to.time - from.time) * ratio;
  }
  return last.time;
}

export function activeKeyframe(
  progress: number,
  keyframes: VideoKeyframe[] = [],
): VideoKeyframe | undefined {
  if (!keyframes.length) return undefined;
  const points = [...keyframes].sort((a, b) => a.at - b.at);
  const at = clamp(progress) * 100;
  let current = points[0];
  for (const point of points) {
    if (point.at <= at) current = point;
  }
  return current;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
