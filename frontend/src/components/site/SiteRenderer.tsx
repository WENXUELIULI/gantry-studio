import type { MouseEvent } from 'react';
import type { Device, SiteDocument, SiteSection } from '../../types/site';
import { localeDir, localeHtmlLang } from '../../i18n/locales';
import { themeStyle } from '../../lib/theme';
import { resolveSectionStyle, styleVars } from '../../lib/sectionStyles';
import { Hero } from './Heroes';
import { Section } from './Sections';
import { SiteNav } from './SiteNav';

interface SiteRendererProps {
  doc: SiteDocument;
  device?: Device;
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onEditSection?: (
    id: string,
    field: 'eyebrow' | 'title' | 'body',
    value: string,
  ) => void;
  onNavigatePage?: (path: string) => void;
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
}: {
  section: SiteSection;
  index: number;
  editable: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onEditSection?: SiteRendererProps['onEditSection'];
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
      ? (field: 'eyebrow' | 'title' | 'body', value: string) =>
          onEditSection(section.id, field, value)
      : undefined;

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
        <Hero section={section} editable={editable} onEdit={edit} />
      ) : (
        <Section section={section} index={index} editable={editable} onEdit={edit} />
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
  onNavigatePage,
}: SiteRendererProps) {
  const locale = doc.locale ?? (doc.market === 'global' ? 'en' : 'zh-CN');
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
        <SiteNav doc={doc} onNavigatePage={onNavigatePage} />
        <main id="main">
          {doc.sections.map((section, index) => (
            <SectionSlot
              key={section.id}
              section={section}
              index={index + 1}
              editable={editable}
              selectedId={selectedId}
              onSelect={onSelect}
              onEditSection={onEditSection}
            />
          ))}
        </main>
      </div>
    </div>
  );
}
