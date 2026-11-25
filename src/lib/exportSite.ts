import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { SiteDocument, SiteSection } from '../types/site';
import { SiteRenderer } from '../components/site/SiteRenderer';
import siteCss from '../styles/site.css?raw';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fontFamily(themeValue: string, fallback: string): string {
  if (themeValue.includes('Newsreader')) {
    return `'Newsreader', 'Songti SC', 'STSong', 'SimSun', ${fallback}`;
  }
  if (themeValue.includes('IBM Plex Mono')) {
    return `'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace`;
  }
  return `'Archivo', 'PingFang SC', 'Microsoft YaHei', ${fallback}`;
}

function runtime() {
  const scroller = document.querySelector<HTMLElement>('.site-scroll');
  if (!scroller) return;
  const heroes = Array.from(
    document.querySelectorAll<HTMLElement>('.hero--video, .hero--collage, .hero--bleed'),
  );
  let frame = 0;

  const update = () => {
    frame = 0;
    const viewport = scroller.clientHeight;
    heroes.forEach((hero) => {
      const rect = hero.getBoundingClientRect();
      const travel = Math.max(hero.offsetHeight - viewport, 1);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));

      const video = hero.querySelector<HTMLVideoElement>('video');
      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = progress * video.duration;
      }

      hero.querySelectorAll<HTMLImageElement>('[data-parallax]').forEach((image) => {
        const offset = Number(image.getAttribute('data-parallax')) || 0;
        image.style.transform = `translate3d(0, ${progress * offset}px, 0) scale(${1.04 + progress * 0.03})`;
      });

      const bleed = hero.querySelector<HTMLElement>('[data-bleed]');
      if (bleed) bleed.style.transform = `scale(${1.06 + progress * 0.05})`;
    });
  };

  const onScroll = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  scroller.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  document.querySelectorAll('video').forEach((video) => {
    video.addEventListener('loadedmetadata', onScroll);
  });

  document.querySelectorAll<HTMLButtonElement>('.site-menu-button').forEach((button) => {
    button.addEventListener('click', () => {
      const menu = document.querySelector<HTMLElement>('.site-mobile-menu');
      if (!menu) return;
      const willOpen = menu.hasAttribute('hidden');
      menu.toggleAttribute('hidden', !willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });

  update();
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function inlineAsset(src: string, cache: Map<string, string>): Promise<string> {
  if (!src || src.startsWith('data:') || /^https?:/i.test(src)) return src;
  const cached = cache.get(src);
  if (cached) return cached;
  try {
    const response = await fetch(src);
    if (!response.ok) return src;
    const dataUrl = await blobToDataUrl(await response.blob());
    cache.set(src, dataUrl);
    return dataUrl;
  } catch {
    return src;
  }
}

async function inlineDocumentAssets(doc: SiteDocument): Promise<SiteDocument> {
  const clone = structuredClone(doc);
  const cache = new Map<string, string>();

  const sections = await Promise.all(
    clone.sections.map(async (section): Promise<SiteSection> => {
      if (section.type === 'hero') {
        return {
          ...section,
          media: {
            ...section.media,
            src: await inlineAsset(section.media.src, cache),
          },
          collage: await Promise.all(
            section.collage.map(async (image) => ({
              ...image,
              src: await inlineAsset(image.src, cache),
            })),
          ),
        };
      }
      if (section.type === 'products') {
        return {
          ...section,
          items: await Promise.all(
            section.items.map(async (product) => ({
              ...product,
              image: await inlineAsset(product.image, cache),
            })),
          ),
        };
      }
      if (section.type === 'cta' && section.media) {
        return {
          ...section,
          media: {
            ...section.media,
            src: await inlineAsset(section.media.src, cache),
          },
        };
      }
      return section;
    }),
  );

  return { ...clone, sections };
}

export async function siteToHtml(doc: SiteDocument): Promise<string> {
  const embedded = await inlineDocumentAssets(doc);
  const markup = renderToStaticMarkup(
    createElement(SiteRenderer, { doc: embedded, editable: false }),
  );
  const display = fontFamily(doc.theme.display, 'sans-serif');
  const body = fontFamily(doc.theme.body, 'sans-serif');
  const mono = fontFamily(doc.theme.mono, 'monospace');

  return `<!doctype html>
<html lang="${doc.market === 'global' ? 'en' : 'zh-CN'}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="description" content="${escapeHtml(doc.name)} — designed and generated with GANTRY." />
<title>${escapeHtml(doc.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap" rel="stylesheet" />
<style>
html, body { height: 100%; margin: 0; }
body { background: ${doc.theme.paper}; color: ${doc.theme.ink}; }
.site-root { --display: ${display} !important; --body: ${body} !important; --mono: ${mono} !important; height: 100vh; }
${siteCss}
</style>
</head>
<body>
${markup}
<script>(${runtime.toString()})();</script>
</body>
</html>`;
}

export function siteToJson(doc: SiteDocument): string {
  return JSON.stringify(doc, null, 2);
}

export function downloadText(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

export async function copyText(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    return false;
  }
}

export function safeFilename(name: string): string {
  return (
    name
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'gantry-site'
  );
}
