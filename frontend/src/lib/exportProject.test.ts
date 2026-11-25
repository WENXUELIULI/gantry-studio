import { strFromU8, unzipSync } from 'fflate';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { siteToHtml } = vi.hoisted(() => ({
  siteToHtml: vi.fn(async (...args: unknown[]) => {
    const page = args[0] as { name?: string } | undefined;
    return `<html>${page?.name ?? ''}</html>`;
  }),
}));

vi.mock('./exportSite', () => ({
  siteToHtml,
  safeFilename: (value: string) => value.replace(/\s+/g, '-'),
}));

import { projectToZip } from './exportProject';

describe('projectToZip', () => {
  beforeEach(() => siteToHtml.mockClear());

  it('writes every page to a crawlable path and a manifest', async () => {
    const pages = [
      {
        key: 'home',
        title: '首页',
        path: '/',
        version: 0,
        document: { name: '首页' },
      },
      {
        key: 'products',
        title: '产品',
        path: '/products',
        version: 0,
        document: { name: '产品' },
      },
    ] as never;

    const { bytes, fileName } = await projectToZip('桁架 精工', pages);
    expect(fileName).toBe('桁架-精工-site.zip');

    const files = unzipSync(bytes);
    expect(Object.keys(files).sort()).toEqual([
      'index.html',
      'products/index.html',
      'project.json',
    ]);
    expect(strFromU8(files['index.html'])).toContain('首页');
    expect(strFromU8(files['products/index.html'])).toContain('产品');
    expect(JSON.parse(strFromU8(files['project.json'])).pages).toHaveLength(2);
    expect(siteToHtml).toHaveBeenCalledTimes(2);
  });
});
