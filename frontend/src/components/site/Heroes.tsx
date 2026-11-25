import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { HeroSection } from '../../types/site';
import { useSectionProgress } from '../../lib/useSectionProgress';
import { scrubTime } from '../../lib/scroll';
import { cropBackground, cropVars } from '../../lib/media';
import { EditableText } from '../editor/EditableText';

export interface HeroProps {
  section: HeroSection;
  editable: boolean;
  onEdit?: (field: 'title' | 'eyebrow', value: string) => void;
}

export function Hero({ section, editable, onEdit }: HeroProps) {
  switch (section.heroKind) {
    case 'video-scrub':
      return <VideoScrubHero section={section} editable={editable} onEdit={onEdit} />;
    case 'image-collage':
      return <ImageCollageHero section={section} editable={editable} onEdit={onEdit} />;
    case 'split-editorial':
      return <SplitHero section={section} editable={editable} onEdit={onEdit} />;
    case 'full-bleed':
      return <FullBleedHero section={section} editable={editable} onEdit={onEdit} />;
    case 'kinetic-type':
      return <KineticHero section={section} editable={editable} onEdit={onEdit} />;
    case 'product-stage':
      return <ProductStageHero section={section} editable={editable} onEdit={onEdit} />;
    default:
      return null;
  }
}

function Title({
  section,
  editable,
  onEdit,
  className,
}: HeroProps & { className?: string }) {
  const longClass =
    section.title.replace(/\s/g, '').length > 15 ? 'hero-title--long' : '';
  if (editable) {
    return (
      <EditableText
        as="h1"
        value={section.title}
        editable
        multiline
        className={`hero-title ${className ?? ''} ${longClass}`}
        onCommit={(value) => onEdit?.('title', value)}
      />
    );
  }
  const lines = section.title.split('\n');
  return (
    <h1 className={`hero-title ${className ?? ''} ${longClass}`}>
      {lines.map((line, index) => (
        <span className="hero-title-line" key={`${line}-${index}`}>
          {line}
        </span>
      ))}
    </h1>
  );
}

function Eyebrow({ section, editable, onEdit }: HeroProps) {
  return (
    <div className="hero-eyebrow">
      <span className="hero-eyebrow-mark" aria-hidden="true" />
      <EditableText
        as="span"
        value={section.eyebrow}
        editable={editable}
        className="eyebrow-text"
        onCommit={(value) => onEdit?.('eyebrow', value)}
      />
      <span className="hero-eyebrow-code mono">{section.location}</span>
    </div>
  );
}

function CtaRow({ section }: { section: HeroSection }) {
  return (
    <div className="hero-ctas">
      <a className="btn btn--accent" href="#products">
        {section.primaryCta}
        <span aria-hidden="true">↗</span>
      </a>
      <a className="btn btn--ghost" href="#proof">
        {section.secondaryCta}
      </a>
    </div>
  );
}

function VideoScrubHero({ section, editable, onEdit }: HeroProps) {
  const { ref, progress } = useSectionProgress<HTMLElement>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const total = duration || video.duration;
    if (!total || !Number.isFinite(total)) return;
    const next = scrubTime(progress, total);
    if (Math.abs(video.currentTime - next) > 0.02) video.currentTime = next;
  }, [progress, duration]);

  const pct = Math.round(progress * 100);

  return (
    <section
      ref={ref}
      id={section.id}
      className="site-section hero hero--video"
      data-tone="dark"
      data-section-id={section.id}
      style={{ '--p': progress } as CSSProperties}
    >
      <div className="hero-sticky">
        <video
          ref={videoRef}
          className="hero-video media-framed"
          src={section.media.src}
          style={cropVars(section.media.crop)}
          muted
          playsInline
          preload="auto"
          aria-label={section.media.alt}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        />
        <div className="hero-shade" />
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-topline mono">
          <span>{section.location}</span>
          <span className="hero-topline-mid">SCROLL-DRIVEN FILM / 00:06</span>
          <span>GANTRY SYSTEMS</span>
        </div>

        <div className="hero-video-copy" style={{ transform: `translate3d(0, ${-progress * 6}vh, 0)` }}>
          <Eyebrow section={section} editable={editable} onEdit={onEdit} />
          <Title section={section} editable={editable} onEdit={onEdit} className="hero-title--xl" />
          <CtaRow section={section} />
        </div>

        <div className="hero-specs">
          {section.specRows.map((row) => (
            <div className="hero-spec" key={row.label}>
              <span className="mono">{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>

        <div className="hero-scrub-rail" aria-hidden="true">
          <span className="mono">{String(pct).padStart(2, '0')}</span>
          <div className="hero-scrub-track">
            <div className="hero-scrub-fill" style={{ height: `${Math.max(2, pct)}%` }} />
          </div>
          <span className="hero-scrub-label">{section.scrollHint}</span>
        </div>
      </div>
    </section>
  );
}

function ImageCollageHero({ section, editable, onEdit }: HeroProps) {
  const { ref, progress } = useSectionProgress<HTMLElement>();
  const images = section.collage.length ? section.collage : [section.media];
  const offsets = useMemo(() => [-48, 72, -96, 44], []);

  return (
    <section
      ref={ref}
      id={section.id}
      className="site-section hero hero--collage"
      data-tone={section.tone}
      data-section-id={section.id}
      style={{ '--p': progress } as CSSProperties}
    >
      <div className="hero-sticky collage-stage">
        <div className="collage-field" aria-hidden="true">
          {images.slice(0, 4).map((image, index) => (
            <figure className={`collage-image collage-image--${index + 1}`} key={`${image.src}-${index}`}>
              <img
                src={image.src}
                alt={image.alt}
                loading={index > 1 ? 'lazy' : 'eager'}
                data-parallax={offsets[index % offsets.length]}
                style={{
                  ...cropVars(image.crop),
                  transform: `translate3d(0, ${progress * offsets[index % offsets.length]}px, 0) scale(${1.04 + progress * 0.03})`,
                }}
              />
              <figcaption className="mono">
                <span>0{index + 1}</span>
                <span>{image.caption ?? image.alt}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="collage-veil" aria-hidden="true" />
        <div className="hero-topline mono">
          <span>{section.location}</span>
          <span className="hero-topline-mid">ASSEMBLY / {images.length.toString().padStart(2, '0')} PLATES</span>
          <span>GANTRY SYSTEMS</span>
        </div>

        <div className="collage-copy">
          <Eyebrow section={section} editable={editable} onEdit={onEdit} />
          <Title section={section} editable={editable} onEdit={onEdit} className="hero-title--collage" />
          <div className="collage-meta">
            <p className="hero-deck">{section.specRows[0]?.value ?? section.media.alt}</p>
            <CtaRow section={section} />
          </div>
        </div>

        <div className="collage-ticker mono" aria-hidden="true">
          <span>MATERIAL / FORM / LIGHT / TOLERANCE / </span>
          <span>MATERIAL / FORM / LIGHT / TOLERANCE / </span>
        </div>
      </div>
    </section>
  );
}

function SplitHero({ section, editable, onEdit }: HeroProps) {
  return (
    <section
      id={section.id}
      className="site-section hero hero--split"
      data-tone={section.tone}
      data-section-id={section.id}
    >
      <div className="split-copy">
        <div className="hero-topline mono">
          <span>{section.location}</span>
          <span>GANTRY SYSTEMS</span>
        </div>
        <Eyebrow section={section} editable={editable} onEdit={onEdit} />
        <Title section={section} editable={editable} onEdit={onEdit} className="hero-title--split" />
        <p className="hero-deck">{section.media.alt}</p>
        <CtaRow section={section} />
        <div className="split-specs">
          {section.specRows.map((row) => (
            <div className="split-spec" key={row.label}>
              <span className="mono">{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="split-media">
        <img
          className="media-framed"
          src={section.media.src}
          alt={section.media.alt}
          style={cropVars(section.media.crop)}
        />
        <div className="split-media-top mono">
          <span>{section.media.caption ?? 'FIELD STUDY'}</span>
          <span>01 / 01</span>
        </div>
        <div className="split-media-index" aria-hidden="true">
          {section.eyebrow.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </section>
  );
}

function FullBleedHero({ section, editable, onEdit }: HeroProps) {
  const { ref, progress } = useSectionProgress<HTMLElement>();
  return (
    <section
      ref={ref}
      id={section.id}
      className="site-section hero hero--bleed"
      data-tone="dark"
      data-section-id={section.id}
      style={{ '--p': progress } as CSSProperties}
    >
      <div
        className="bleed-image"
        data-bleed
        style={{
          backgroundImage: `url(${section.media.src})`,
          ...cropBackground(section.media.crop),
          transform: `scale(${1.06 + progress * 0.05})`,
        }}
      />
      <div className="bleed-shade" />
      <div className="hero-topline mono">
        <span>{section.location}</span>
        <span className="hero-topline-mid">GRID INFRASTRUCTURE / 2026</span>
        <span>GANTRY SYSTEMS</span>
      </div>
      <div className="bleed-copy">
        <Eyebrow section={section} editable={editable} onEdit={onEdit} />
        <Title section={section} editable={editable} onEdit={onEdit} className="hero-title--bleed" />
        <div className="bleed-bottom">
          <p className="hero-deck">{section.specRows[0]?.value ?? section.media.alt}</p>
          <CtaRow section={section} />
        </div>
      </div>
      <div className="bleed-serial mono" aria-hidden="true">
        <span>GRD—05</span>
        <span>34.05° N / 118.24° W</span>
      </div>
      <div className="bleed-ticker mono" aria-hidden="true">
        <span>POWER / TRANSMISSION / STORAGE / CONTROL / </span>
        <span>POWER / TRANSMISSION / STORAGE / CONTROL / </span>
      </div>
    </section>
  );
}

function KineticHero({ section, editable, onEdit }: HeroProps) {
  const lines = section.title.split('\n').filter(Boolean);
  const marquee = lines.length >= 2 ? lines : [lines[0] ?? 'MOTION', 'SYSTEMS', 'CONTROL'];
  return (
    <section
      id={section.id}
      className="site-section hero hero--kinetic"
      data-tone={section.tone}
      data-section-id={section.id}
    >
      <div className="kinetic-rows" aria-hidden="true">
        {marquee.slice(0, 3).map((line, index) => (
          <div className={`kinetic-row kinetic-row--${index + 1}`} key={`${line}-${index}`}>
            <span>{line}</span>
            <span className="kinetic-outline">{line}</span>
            <span>{line}</span>
          </div>
        ))}
      </div>
      <div className="kinetic-top hero-topline mono">
        <span>{section.location}</span>
        <span>ROBOTICS / AUTOMATION</span>
        <span>GANTRY SYSTEMS</span>
      </div>
      <div className="kinetic-core">
        <div className="kinetic-badge" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <defs>
              <path id="kinetic-circle" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
            </defs>
            <text>
              <textPath href="#kinetic-circle">BUILT TO MOVE · BUILT TO MOVE · </textPath>
            </text>
          </svg>
          <span>06</span>
        </div>
        <Eyebrow section={section} editable={editable} onEdit={onEdit} />
        <Title section={section} editable={editable} onEdit={onEdit} className="hero-title--kinetic" />
        <CtaRow section={section} />
      </div>
      <div className="kinetic-specs">
        {section.specRows.map((row) => (
          <div className="kinetic-spec" key={row.label}>
            <span className="mono">{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductStageHero({ section, editable, onEdit }: HeroProps) {
  return (
    <section
      id={section.id}
      className="site-section hero hero--stage"
      data-tone={section.tone}
      data-section-id={section.id}
    >
      <div className="stage-top hero-topline mono">
        <span>{section.location}</span>
        <span>PRECISION COMPONENTS / SERIES 04</span>
        <span>GANTRY SYSTEMS</span>
      </div>

      <div className="stage-canvas">
        <div className="stage-rings" aria-hidden="true">
          <span className="stage-ring stage-ring--1" />
          <span className="stage-ring stage-ring--2" />
          <span className="stage-ring stage-ring--3" />
          <span className="stage-cross stage-cross--h" />
          <span className="stage-cross stage-cross--v" />
        </div>
        <img className="stage-product" src={section.media.src} alt={section.media.alt} />
        <div className="stage-serial mono" aria-hidden="true">
          <span>FIG. 04</span>
          <span>SCALE 1:2</span>
        </div>
        {section.specRows.slice(0, 3).map((row, index) => (
          <div className={`stage-callout stage-callout--${index + 1}`} key={row.label}>
            <span className="stage-callout-dot" aria-hidden="true" />
            <span className="mono">{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>

      <div className="stage-copy">
        <div>
          <Eyebrow section={section} editable={editable} onEdit={onEdit} />
          <Title section={section} editable={editable} onEdit={onEdit} className="hero-title--stage" />
        </div>
        <div className="stage-copy-right">
          <p className="hero-deck">{section.media.alt}</p>
          <CtaRow section={section} />
        </div>
      </div>
      <div className="stage-index" aria-hidden="true">01</div>
    </section>
  );
}
