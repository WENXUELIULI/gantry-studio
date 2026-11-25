import { useCallback, useEffect, useRef, useState } from 'react';
import { computeScrollProgress } from './scroll';

export function useSectionProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);

  const measure = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    const scroller = element.closest<HTMLElement>('[data-site-scroll]');
    const sectionRect = element.getBoundingClientRect();
    const scrollerRect = scroller?.getBoundingClientRect();
    const scrollTop = scroller?.scrollTop ?? window.scrollY;
    const viewportHeight = scroller?.clientHeight ?? window.innerHeight;
    const sectionTop =
      sectionRect.top - (scrollerRect?.top ?? 0) + scrollTop;
    setProgress(
      computeScrollProgress({
        scrollTop,
        viewportHeight,
        sectionTop,
        sectionHeight: sectionRect.height,
      }),
    );
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const scroller = element.closest<HTMLElement>('[data-site-scroll]');
    const target: HTMLElement | Window = scroller ?? window;

    const onScroll = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(measure);
    };

    measure();
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(onScroll)
        : null;
    observer?.observe(element);
    if (scroller) observer?.observe(scroller);

    return () => {
      cancelAnimationFrame(frame.current);
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      observer?.disconnect();
    };
  }, [measure]);

  return { ref, progress };
}
