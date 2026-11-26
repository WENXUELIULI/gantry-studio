import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import type { HeroSection } from '../../types/site';
import { activeKeyframe, keyframeTime } from '../../lib/scroll';
import { useSectionProgress } from '../../lib/useSectionProgress';

export function VideoScene({
  hero,
  children,
  onActiveChange,
}: {
  hero: HeroSection;
  children: ReactNode;
  onActiveChange?: (id?: string) => void;
}) {
  const { ref, progress } = useSectionProgress<HTMLDivElement>();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const keyframes = useMemo(() => hero.keyframes ?? [], [hero.keyframes]);
  const active = activeKeyframe(progress, keyframes);
  const isScrub = hero.videoPlayback !== 'ambient';

  useEffect(() => {
    onActiveChange?.(active?.sectionId);
  }, [active?.sectionId, onActiveChange]);

  useEffect(() => {
    const video = videoRef.current;
    const duration = video?.duration ?? 0;
    if (!video || !Number.isFinite(duration) || duration <= 0 || !isScrub) return;
    const target = keyframeTime(progress, keyframes, duration);
    if (Number.isFinite(target)) video.currentTime = target;
  }, [isScrub, keyframes, progress]);

  return (
    <div className="video-scene" ref={ref} data-video-scene data-progress={progress.toFixed(2)} data-active={active?.sectionId}>
      <div className="video-scene-media" aria-hidden="true">
        <video
          ref={videoRef}
          className="video-scene-film"
          src={hero.media.src}
          muted
          playsInline
          preload="auto"
          loop={!isScrub}
          autoPlay={!isScrub}
        />
        <div className="video-scene-shade" />
        <span className="video-scene-badge">LIVE FILM · KEYFRAME STORY</span>
        {keyframes.length > 0 && (
          <nav className="hero-chapters video-scene-chapters" aria-label="Video chapters">
            {keyframes.map((keyframe, index) => (
              <a
                key={`${keyframe.sectionId}-${index}`}
                className={`hero-chapter ${active?.sectionId === keyframe.sectionId ? 'is-active' : ''}`}
                href={`#${keyframe.sectionId}`}
              >
                <span className="mono">{String(index + 1).padStart(2, '0')} / {keyframe.time.toFixed(1)}s</span>
                <span>{keyframe.label ?? keyframe.sectionId}</span>
              </a>
            ))}
          </nav>
        )}
      </div>
      <div className="video-scene-body">{children}</div>
    </div>
  );
}
