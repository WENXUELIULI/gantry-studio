import { useState } from 'react';
import type { SiteDocument } from '../../types/site';
import { siteChrome } from '../../i18n/siteStrings';

export function SiteNav({ doc }: { doc: SiteDocument }) {
  const [open, setOpen] = useState(false);
  const locale = doc.locale ?? (doc.market === 'global' ? 'en' : 'zh-CN');
  const chrome = siteChrome(locale);
  const code = locale === 'zh-CN' ? 'CN' : locale.split('-')[0].toUpperCase();
  const nav = doc.nav.map((item, index) => ({
    ...item,
    label: chrome.nav[index] ?? item.label,
  }));

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
        {nav.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
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
          <a href={item.href} key={item.href} onClick={() => setOpen(false)}>
            <span className="mono">0{index + 1}</span>
            {item.label}
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
