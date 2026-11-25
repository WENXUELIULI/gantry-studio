import { useState, type MouseEvent } from 'react';
import type { Device, HeroSection, SiteDocument, SiteSection } from '../../types/site';
import { localeDir, localeHtmlLang } from '../../i18n/locales';
import { themeStyle } from '../../lib/theme';
import { resolveSectionStyle, styleVars } from '../../lib/sectionStyles';
import { Hero } from './Heroes';
import { Section } from './Sections';
import { SiteNav } from './SiteNav';
import { VideoScene } from './VideoScene';
import { InlineEditContext } from '../editor/inlineEdit';

interface SiteRendererProps {
  doc: SiteDocument;
  device?: Device;
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onEditSection?: (id: string, field: string, value: unknown) => void;
  onEditStart?: (id: string) => void;
  onEditEnd?: () => void;
  onNavigatePage?: (path: string) => void;
  onNavigateSection?: (id: string) => void;
  onActiveSection?: (id: string) => void;
}

function isInteractive(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('a, button, input, textarea, select, summary'));
}

function SectionSlot({
  section,
  index,
  editable,
  selectedId,
  onSelect,
  onEditSection,
  onEditStart,
  onEditEnd,
  onActiveSection,
}: {
  section: SiteSection;
  index: number;
  editable: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onEditSection?: SiteRendererProps['onEditSection'];
  onEditStart?: (id: string) => void;
  onEditEnd?: () => void;
  onActiveSection?: (id: string) => void;
}) {
  if (!section.visible && !editable) return null;

  const style = resolveSectionStyle(section.style, section.type);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!editable) return;
    if (isInteractive(event.target)) event.preventDefault();
    onSelect?.(section.id);
  };

  const edit =
    editable && onEditSection
      ? (field: string, value: unknown) => onEditSection(section.id, field, value)
      : undefined;

  const inlineEdit =
    editable && onEditStart && onEditEnd
      ? { begin: () => onEditStart(section.id), end: onEditEnd }
      : null;

  return (
    <div
      className={`section-slot ${selectedId === section.id ? 'is-selected' : ''} ${section.visible ? '' : 'is-hidden'}`}
      data-slot-id={section.id}
      data-layout={style.layout}
      data-density={style.density}
      data-align={style.align}
      data-surface={style.surface}
      data-overlay={style.overlay}
      data-motion={style.motion}
      data-mobile-layout={style.mobile?.layout ?? style.layout}
      style={styleVars(style)}
      onClick={handleClick}
    >
      {section.type === 'hero' ? (
        <InlineEditContext.Provider value={inlineEdit}>
          <Hero
            section={section}
            editable={editable}
            onEdit={edit}
            onActiveSection={onActiveSection}
          />
        </InlineEditContext.Provider>
      ) : (
        <InlineEditContext.Provider value={inlineEdit}>
          <Section section={section} index={index} editable={editable} onEdit={edit} />
        </InlineEditContext.Provider>
      )}
      {editable && (
        <span className="slot-label mono" aria-hidden="true">
          {section.type.toUpperCase()} / {section.id}
        </span>
      )}
    </div>
  );
}

export function SiteRenderer({
  doc,
  device = 'desktop',
  editable = false,
  selectedId,
  onSelect,
  onEditSection,
  onEditStart,
  onEditEnd,
  onNavigatePage,
  onNavigateSection,
}: SiteRendererProps) {
  const locale = doc.locale ?? (doc.market === 'global' ? 'en' : 'zh-CN');
  const [sceneActive, setSceneActive] = useState<string | undefined>();
  const hero = doc.sections.find(
    (section): section is HeroSection => section.type === 'hero',
  );
  const storyHero = hero?.heroKind === 'video-story' ? hero : null;
  const storyEnd = storyHero
    ? Math.max(
        0,
        Math.max(
          ...(storyHero.keyframes ?? []).map((keyframe) =>
            doc.sections.findIndex((section) => section.id === keyframe.sectionId),
          ),
        ),
      )
    : -1;

  const slots = doc.sections.map((section, index) => (
    <SectionSlot
      key={section.id}
      section={section}
      index={index + 1}
      editable={editable}
      selectedId={selectedId}
      onSelect={onSelect}
      onEditSection={onEditSection}
      onEditStart={onEditStart}
      onEditEnd={onEditEnd}
    />
  ));

  return (
    <div
      className={`site-root ${doc.theme.dark ? 'site-root--dark' : ''} ${editable ? 'site-root--editable' : ''}`}
      style={themeStyle(doc)}
      data-device={device}
      data-theme={doc.theme.id}
      lang={localeHtmlLang(locale)}
      dir={localeDir(locale)}
    >
      <a className="skip-link" href="#main">跳到主要内容</a>
      <div className="site-scroll" data-site-scroll>
        <div id="top" />
        <SiteNav
          doc={doc}
          editable={editable}
          activeSceneId={sceneActive}
          onNavigatePage={onNavigatePage}
          onNavigateSection={onNavigateSection ?? onSelect}
        />
        <main id="main">
          {storyHero ? (
            <>
              <VideoScene hero={storyHero} onActiveChange={setSceneActive}>{slots.slice(0, storyEnd + 1)}</VideoScene>
              {slots.slice(storyEnd + 1)}
            </>
          ) : (
            slots
          )}
        </main>
      </div>
    </div>
  );
}
