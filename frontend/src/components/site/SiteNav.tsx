import { useState } from 'react';
import type { SiteDocument } from '../../types/site';

export function SiteNav({ doc }: { doc: SiteDocument }) {
  const [open, setOpen] = useState(false);
  const isGlobal = doc.market === 'global';
  const ctaLabel = isGlobal ? 'Enquire' : '询价';
  const status = isGlobal ? 'AVAILABLE Q3' : '可接单 Q3';

  return (
    <header className={`site-nav ${doc.theme.dark ? 'site-nav--dark' : ''}`}>
      <a className="site-brand" href="#top" aria-label={`${doc.name} home`}>
        <span className="site-brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="site-brand-text">
          <strong>{doc.name}</strong>
          <span className="mono">
            {isGlobal ? 'EN' : 'CN'} / {doc.code}
          </span>
        </span>
      </a>

      <nav className="site-links" aria-label={isGlobal ? 'Main navigation' : '主导航'}>
        {doc.nav.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="site-nav-right">
        <span className="site-status mono">
          <i aria-hidden="true" />
          {status}
        </span>
        <a className="site-nav-cta" href="#cta">
          {ctaLabel}
          <span aria-hidden="true">↗</span>
        </a>
        <button
          className="site-menu-button"
          type="button"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>

      <div className="site-mobile-menu" hidden={!open}>
        {doc.nav.map((item, index) => (
          <a href={item.href} key={item.href} onClick={() => setOpen(false)}>
            <span className="mono">0{index + 1}</span>
            {item.label}
          </a>
        ))}
        <a href="#cta" onClick={() => setOpen(false)}>
          <span className="mono">
            {String(doc.nav.length + 1).padStart(2, '0')}
          </span>
          {ctaLabel}
        </a>
      </div>
    </header>
  );
}
