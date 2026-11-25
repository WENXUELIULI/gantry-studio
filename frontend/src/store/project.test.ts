import { beforeEach, describe, expect, it } from 'vitest';
import { useBuilderStore } from './builder';
import { useProjectStore } from './project';
import { createDocumentFromTemplate } from '../lib/site';
import { TEMPLATES } from '../data/templates';

describe('project page navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    useProjectStore.getState().reset();
    useBuilderStore.getState().resetProject();
    useBuilderStore
      .getState()
      .replaceDocument(createDocumentFromTemplate(TEMPLATES[0]));
    useProjectStore
      .getState()
      .startFromDocument(useBuilderStore.getState().doc!);
  });

  it('adds a page link to every page and keeps it in sync with page metadata', () => {
    useProjectStore.getState().addPage(useBuilderStore.getState().doc!);
    const added = useProjectStore.getState().pages[1];
    expect(added).toBeTruthy();

    const linked = useProjectStore
      .getState()
      .pages[0].document.nav.find((item) => item.pageKey === added.key);
    expect(linked).toMatchObject({
      kind: 'page',
      href: added.path,
      label: added.title,
    });

    useProjectStore
      .getState()
      .updatePageMeta(added.key, { title: '产品系列', path: '/products' });

    const updated = useProjectStore
      .getState()
      .pages[0].document.nav.find((item) => item.pageKey === added.key);
    expect(updated).toMatchObject({
      label: '产品系列',
      href: '/products',
    });
  });

  it('removes the link when a page is deleted', () => {
    useProjectStore.getState().addPage(useBuilderStore.getState().doc!);
    const added = useProjectStore.getState().pages[1];

    useProjectStore.getState().removePage(added.key);

    expect(useProjectStore.getState().pages).toHaveLength(1);
    expect(
      useProjectStore
        .getState()
        .pages[0].document.nav.some((item) => item.pageKey === added.key),
    ).toBe(false);
  });
});
