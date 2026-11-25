import { strToU8, zipSync } from 'fflate';
import type { SiteDocument } from '../types/site';
import { siteToHtml, safeFilename } from './exportSite';
import type { ProjectPage } from '../store/project';

function pageFile(path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `${clean}/index.html` : 'index.html';
}

function exportedHref(href: string): string {
  const clean = href.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
  return clean ? `/${clean}/index.html` : '/index.html';
}

export async function projectToZip(
  projectName: string,
  pages: ProjectPage[],
): Promise<{ blob: Blob; bytes: Uint8Array; fileName: string }> {
  const files: Record<string, Uint8Array> = {};
  const manifest = {
    name: projectName,
    generatedAt: new Date().toISOString(),
    pages: [] as { title: string; path: string; file: string }[],
  };

  for (const page of pages) {
    const document = page.document as SiteDocument;
    const withStaticLinks: SiteDocument = {
      ...document,
      nav: (document.nav ?? []).map((item) =>
        item.kind === 'page'
          ? { ...item, href: exportedHref(item.href) }
          : item,
      ),
    };
    const html = await siteToHtml(withStaticLinks);
    const file = pageFile(page.path);
    files[file] = strToU8(html);
    manifest.pages.push({ title: page.title, path: page.path, file });
  }

  files['project.json'] = strToU8(JSON.stringify(manifest, null, 2));
  const zipped = zipSync(files, { level: 6 });
  return {
    blob: new Blob([zipped], { type: 'application/zip' }),
    bytes: zipped,
    fileName: `${safeFilename(projectName)}-site.zip`,
  };
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
