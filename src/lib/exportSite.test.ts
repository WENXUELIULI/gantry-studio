import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TEMPLATE_BY_ID } from '../data/templates';
import { createDocumentFromTemplate } from './site';
import {
  copyText,
  downloadText,
  safeFilename,
  siteToHtml,
  siteToJson,
} from './exportSite';
import type { SiteDocument } from '../types/site';

function makeDoc(): SiteDocument {
  return createDocumentFromTemplate(TEMPLATE_BY_ID['truss-precision']);
}

describe('siteToHtml', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => new Blob(['image'], { type: 'image/jpeg' }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a complete standalone document', async () => {
    const html = await siteToHtml(makeDoc());
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<html lang="zh-CN">');
    expect(html).toContain('<meta name="viewport"');
    expect(html).toContain('<style>');
    expect(html).toContain('.hero--video');
    expect(html).toContain('</html>');
  });

  it('renders real heading text, not empty editable nodes', async () => {
    const html = await siteToHtml(makeDoc());
    expect(html).toContain('0.01 mm');
    expect(html).not.toContain('data-editable="true"');
    expect(html).toContain('桁架精工');
  });

  it('inlines local images as data URLs', async () => {
    const html = await siteToHtml(makeDoc());
    expect(html).toContain('src="data:image/jpeg;base64,');
    expect(fetch).toHaveBeenCalled();
  });

  it('escapes the document name in metadata', async () => {
    const doc = makeDoc();
    doc.name = '<script>alert(1)</script>';
    const html = await siteToHtml(doc);
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<title><script>');
  });

  it('includes the scroll video and mobile menu runtime', async () => {
    const html = await siteToHtml(makeDoc());
    expect(html).toContain('.site-scroll');
    expect(html).toContain('.site-menu-button');
    expect(html).toContain('requestAnimationFrame');
  });

  it('bakes image focal points and zoom into inline styles', async () => {
    const doc = makeDoc();
    const hero = doc.sections[0];
    if (hero.type !== 'hero') throw new Error('expected hero');
    hero.media.crop = { x: 24, y: 62, zoom: 1.5 };

    const html = await siteToHtml(doc);
    expect(html).toContain('--focal-x:24%');
    expect(html).toContain('--focal-y:62%');
    expect(html).toContain('--media-zoom:1.5');
  });

  it('exports an international template with English language and navigation', async () => {
    const doc = createDocumentFromTemplate(TEMPLATE_BY_ID['lumen-glass']);
    const html = await siteToHtml(doc);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('LUMEN GLASS');
    expect(html).toContain('Enquire');
    expect(html).toContain('LIGHT,');
    expect(html).not.toContain('询价');
  });

  it('keeps working when an asset request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const html = await siteToHtml(makeDoc());
    expect(html).toContain('/assets/');
    expect(html).toContain('0.01 mm');
  });
});

describe('siteToJson', () => {
  it('round-trips the document', () => {
    const doc = makeDoc();
    expect(JSON.parse(siteToJson(doc))).toEqual(doc);
  });
});

describe('safeFilename', () => {
  it('replaces forbidden characters and whitespace', () => {
    expect(safeFilename('  桁架 精工 / 2026  ')).toBe('桁架-精工-2026');
    expect(safeFilename('a:b*c?d"e<f>g|h')).toBe('a-b-c-d-e-f-g-h');
  });

  it('caps the length and falls back for empty names', () => {
    expect(safeFilename('x'.repeat(100))).toHaveLength(60);
    expect(safeFilename('   ')).toBe('gantry-site');
  });
});

describe('copyText', () => {
  it('returns true when the clipboard accepts the write', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    await expect(copyText('hello')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('returns false when the clipboard is unavailable', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    await expect(copyText('hello')).resolves.toBe(false);
  });
});

describe('downloadText', () => {
  it('clicks a temporary anchor and revokes the URL', () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn().mockReturnValue('blob:site');
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    downloadText('site.html', '<html />', 'text/html');
    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    vi.advanceTimersByTime(1300);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:site');
    click.mockRestore();
    vi.useRealTimers();
  });
});
