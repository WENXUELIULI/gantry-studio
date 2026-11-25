import { useState, type MouseEvent } from 'react';
import type { SiteDocument } from '../../types/site';
import { siteChrome } from '../../i18n/siteStrings';

export function SiteNav({
  doc,
  onNavigatePage,
}: {
  doc: SiteDocument;
  onNavigatePage?: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const locale = doc.locale ?? (doc.market === 'global' ? 'en' : 'zh-CN');
  const chrome = siteChrome(locale);
  const code = locale === 'zh-CN' ? 'CN' : locale.split('-')[0].toUpperCase();
  const nav = doc.nav;
  const navLabel = (item: (typeof nav)[number]) => {
    if (!item.labelKey?.startsWith('nav.')) return item.label;
    const index = Number(item.labelKey.slice('nav.'.length));
    return chrome.nav[index] ?? item.label;
  };

  const follow = (event: MouseEvent<HTMLAnchorElement>, href: string, kind?: string) => {
    if (kind !== 'page' || !onNavigatePage) return;
    event.preventDefault();
    setOpen(false);
    onNavigatePage(href);
  };

  return (
    <header className={`site-nav ${doc.theme.dark ? 'site-nav--dark' : ''}`}>
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
        <a className="site-nav-cta" href="#cta">
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
        <a href="#cta" onClick={() => setOpen(false)}>
          <span className="mono">
            {String(nav.length + 1).padStart(2, '0')}
          </span>
          {chrome.cta}
        </a>
      </div>
    </header>
  );
}
