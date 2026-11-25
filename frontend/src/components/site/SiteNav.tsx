import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { SiteDocument } from '../../types/site';
import { siteChrome } from '../../i18n/siteStrings';
import { activeKeyframe, computeScrollProgress } from '../../lib/scroll';

export function SiteNav({
  doc,
  editable = false,
  activeSceneId,
  onNavigatePage,
  onNavigateSection,
}: {
  doc: SiteDocument;
  editable?: boolean;
  activeSceneId?: string;
  onNavigatePage?: (path: string) => void;
  onNavigateSection?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState<string | undefined>();
  const locale = doc.locale ?? (doc.market === 'global' ? 'en' : 'zh-CN');
  const chrome = siteChrome(locale);
  const code = locale === 'zh-CN' ? 'CN' : locale.split('-')[0].toUpperCase();
  const nav = doc.nav;
  const cta = doc.ctaTarget ?? { href: '#cta', kind: 'section' as const };
  const navLabel = (item: (typeof nav)[number]) => {
    if (!item.labelKey?.startsWith('nav.')) return item.label;
    const index = Number(item.labelKey.slice('nav.'.length));
    return chrome.nav[index] ?? item.label;
  };

  useEffect(() => {
    if (activeSceneId) setActiveSection(activeSceneId);
  }, [activeSceneId]);

  useEffect(() => {
    if (activeSceneId !== undefined) return;
    const navElement = navRef.current;
    const root = navElement?.closest('.site-root');
    const scroller = root?.querySelector<HTMLElement>('[data-site-scroll]');
    const hero = doc.sections.find((section) => section.type === 'hero');
    if (!scroller || !hero?.keyframes?.length) {
      setActiveSection(undefined);
      return;
    }
    const target = scroller.querySelector<HTMLElement>(
      hero.heroKind === 'video-story'
        ? '[data-video-scene]'
        : `[data-slot-id="${hero.id}"]`,
    );
    if (!target) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollTop = scroller.scrollTop;
      const sectionTop =
        target.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scrollTop;
      const progress = computeScrollProgress({
        scrollTop,
        viewportHeight: scroller.clientHeight,
        sectionTop,
        sectionHeight: target.offsetHeight,
      });
      setActiveSection(activeKeyframe(progress, hero.keyframes)?.sectionId);
    };
    const request = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const syncSceneActive = () => {
      const next = target.getAttribute('data-active') ?? undefined;
      setActiveSection(next);
    };
    const observer =
      hero.heroKind === 'video-story'
        ? new MutationObserver(syncSceneActive)
        : null;
    if (observer) {
      observer.observe(target, {
        attributes: true,
        attributeFilter: ['data-active'],
      });
      syncSceneActive();
    }
    update();
    scroller.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer?.disconnect();
      scroller.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, [doc.id, doc.sections, activeSceneId]);

  const follow = (event: MouseEvent<HTMLAnchorElement>, href: string, kind?: string) => {
    if (kind === 'page' && onNavigatePage) {
      event.preventDefault();
      setOpen(false);
      onNavigatePage(href);
      return;
    }
    if (!editable) return;
    event.preventDefault();
    setOpen(false);
    if (kind === 'section') onNavigateSection?.(href.replace(/^#/, ''));
  };

  return (
    <header
      ref={navRef}
      className={`site-nav ${doc.theme.dark ? 'site-nav--dark' : ''}`}
      data-active-section={activeSection}
    >
      <a className="site-brand" href="#top" aria-label={`${doc.name} ${chrome.home}`}>
        <span className="site-brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="site-brand-text">
          <strong>{doc.name}</strong>
          <span className="mono">
            {code} / {doc.code}
          </span>
        </span>
      </a>

      <nav className="site-links" aria-label={chrome.mainNav}>
        {nav.map((item, index) => (
          <a
            href={item.href}
            key={`${item.href}-${index}`}
            className={activeSection === item.href.replace(/^#/, '') ? 'is-active' : undefined}
            aria-current={activeSection === item.href.replace(/^#/, '') ? 'true' : undefined}
            onClick={(event) => follow(event, item.href, item.kind)}
          >
            {navLabel(item)}
          </a>
        ))}
      </nav>

      <div className="site-nav-right">
        <span className="site-status mono">
          <i aria-hidden="true" />
          {chrome.status}
        </span>
        <a
          className="site-nav-cta"
          href={cta.href}
          onClick={(event) => follow(event, cta.href, cta.kind)}
        >
          {chrome.cta}
          <span aria-hidden="true">↗</span>
        </a>
        <button
          className="site-menu-button"
          type="button"
          aria-label={open ? chrome.closeMenu : chrome.openMenu}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>

      <div className="site-mobile-menu" hidden={!open}>
        {nav.map((item, index) => (
          <a
            href={item.href}
            key={`${item.href}-${index}`}
            onClick={(event) => {
              follow(event, item.href, item.kind);
              setOpen(false);
            }}
          >
            <span className="mono">0{index + 1}</span>
            {navLabel(item)}
          </a>
        ))}
        <a
          href={cta.href}
          onClick={(event) => {
            follow(event, cta.href, cta.kind);
            setOpen(false);
          }}
        >
          <span className="mono">
            {String(nav.length + 1).padStart(2, '0')}
          </span>
          {chrome.cta}
        </a>
      </div>
    </header>
  );
}
