import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SiteRenderer } from './SiteRenderer';
import { themeStyle } from '../../lib/theme';
import { TEMPLATE_BY_ID } from '../../data/templates';
import { createDocumentFromTemplate } from '../../lib/site';
import type { SiteDocument } from '../../types/site';

function makeDoc(): SiteDocument {
  return createDocumentFromTemplate(TEMPLATE_BY_ID['truss-precision']);
}

describe('themeStyle', () => {
  it('maps every theme token onto a CSS custom property', () => {
    const doc = makeDoc();
    const style = themeStyle(doc) as Record<string, string>;
    expect(style['--paper']).toBe(doc.theme.paper);
    expect(style['--ink']).toBe(doc.theme.ink);
    expect(style['--accent']).toBe(doc.theme.accent);
    expect(style['--accent-ink']).toBe(doc.theme.accentInk);
    expect(style['--display']).toBe(doc.theme.display);
    expect(style['--radius']).toBe(`${doc.theme.radius}px`);
    expect(style['--grid']).toBe(doc.theme.grid);
    expect(style['--surface']).toBe(doc.theme.surface);
    expect(style['--accent-soft']).toBe(doc.theme.accentSoft);
    expect(style['--focus']).toBe(doc.theme.focus);
    expect(style['--display-weight']).toBe(String(doc.theme.displayWeight));
    expect(style['--body-size']).toBe(`${doc.theme.bodySize}px`);
    expect(style['--tracking']).toBe(doc.theme.tracking);
    expect(style['--border-width']).toBe(`${doc.theme.borderWidth}px`);
    expect(style['--section-space']).toBe(`${doc.theme.sectionSpace}px`);
    expect(style['--motion']).toBe(doc.theme.motion);
  });
});

describe('SiteRenderer', () => {
  it('renders the complete eight-section document', () => {
    const doc = makeDoc();
    const { container } = render(<SiteRenderer doc={doc} />);
    expect(container.querySelectorAll('.section-slot')).toHaveLength(8);
    expect(container.querySelector('[data-slot-id="hero"]')).toBeInTheDocument();
    expect(container.querySelector('video')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '0.01 mm',
    );
    expect(container.querySelector('.site-root')).toHaveAttribute(
      'data-theme',
      doc.theme.id,
    );
  });

  it('renders all six hero systems without crashing', () => {
    const kinds = [
      'video-scrub',
      'image-collage',
      'split-editorial',
      'full-bleed',
      'kinetic-type',
      'product-stage',
    ] as const;
    for (const kind of kinds) {
      const doc = makeDoc();
      const hero = doc.sections[0];
      if (hero.type !== 'hero') throw new Error('missing hero');
      hero.heroKind = kind;
      const { container, unmount } = render(<SiteRenderer doc={doc} />);
      expect(container.querySelector('.hero')).toBeInTheDocument();
      unmount();
    }
  });

  it('skips hidden sections when not editing but keeps them in the editor', () => {
    const doc = makeDoc();
    doc.sections[1].visible = false;

    const readOnly = render(<SiteRenderer doc={doc} />);
    expect(readOnly.container.querySelectorAll('.section-slot')).toHaveLength(7);
    readOnly.unmount();

    const editing = render(<SiteRenderer doc={doc} editable />);
    expect(editing.container.querySelectorAll('.section-slot')).toHaveLength(8);
    expect(
      editing.container.querySelector('[data-slot-id="metrics"]'),
    ).toHaveClass('is-hidden');
  });

  it('marks the selected section and reports clicks', () => {
    const doc = makeDoc();
    const onSelect = vi.fn();
    const { container } = render(
      <SiteRenderer
        doc={doc}
        editable
        selectedId="metrics"
        onSelect={onSelect}
      />,
    );

    const metrics = container.querySelector('[data-slot-id="metrics"]');
    expect(metrics).toHaveClass('is-selected');
    if (!metrics) throw new Error('missing metrics slot');
    fireEvent.click(metrics);
    expect(onSelect).toHaveBeenCalledWith('metrics');
  });

  it('applies per-section style switches and column variables', () => {
    const doc = makeDoc();
    doc.sections[3].style = {
      layout: 'split',
      density: 'compact',
      align: 'center',
      surface: 'accent',
      ratio: '4:3',
      columns: 2,
      overlay: 'strong',
      motion: 'none',
    };
    const { container } = render(<SiteRenderer doc={doc} />);
    const slot = container.querySelector('[data-slot-id="products"]');
    if (!slot) throw new Error('missing products slot');
    expect(slot).toHaveAttribute('data-layout', 'split');
    expect(slot).toHaveAttribute('data-density', 'compact');
    expect(slot).toHaveAttribute('data-align', 'center');
    expect(slot).toHaveAttribute('data-surface', 'accent');
    expect(slot).toHaveAttribute('data-overlay', 'strong');
    expect(slot).toHaveAttribute('data-motion', 'none');
    expect((slot as HTMLElement).style.getPropertyValue('--section-columns')).toBe('2');
    expect((slot as HTMLElement).style.getPropertyValue('--section-ratio')).toBe('4 / 3');
  });

  it('commits an inline hero title edit with the section id', () => {
    const doc = makeDoc();
    const onEditSection = vi.fn();
    const { container } = render(
      <SiteRenderer doc={doc} editable onEditSection={onEditSection} />,
    );

    const title = container.querySelector<HTMLElement>(
      '[data-editable="true"].hero-title',
    );
    if (!title) throw new Error('missing editable title');
    title.innerText = '新的标题';
    fireEvent.blur(title);
    expect(onEditSection).toHaveBeenCalledWith('hero', 'title', '新的标题');
  });

  it('opens and closes the mobile navigation', () => {
    const doc = makeDoc();
    const { container } = render(<SiteRenderer doc={doc} />);
    const menu = container.querySelector('.site-mobile-menu');
    const button = screen.getByRole('button', { name: '打开菜单' });
    expect(menu).toHaveAttribute('hidden');

    fireEvent.click(button);
    expect(menu).not.toHaveAttribute('hidden');
    expect(screen.getByRole('button', { name: '关闭菜单' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    const links = container.querySelectorAll('.site-mobile-menu a');
    fireEvent.click(links[0]);
    expect(menu).toHaveAttribute('hidden');
  });

  it('uses the requested device and dark theme flags', () => {
    const doc = makeDoc();
    doc.theme.dark = true;
    const { container } = render(<SiteRenderer doc={doc} device="mobile" />);
    expect(container.querySelector('.site-root')).toHaveAttribute(
      'data-device',
      'mobile',
    );
    expect(container.querySelector('.site-root')).toHaveClass('site-root--dark');
  });
});
