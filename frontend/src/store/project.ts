import { create } from 'zustand';
import type { NavItem, SiteDocument } from '../types/site';
import type { PageDetail, ProjectDetail } from '../lib/api';
import { useBuilderStore } from './builder';

export interface ProjectPage {
  key: string;
  title: string;
  path: string;
  document: SiteDocument;
  remoteId?: string;
  version: number;
}

interface ProjectState {
  projectId: string | null;
  projectName: string | null;
  pages: ProjectPage[];
  activeKey: string;
  dirty: boolean;
  startFromDocument: (doc: SiteDocument) => void;
  hydrateFromCloud: (project: ProjectDetail, pages: PageDetail[]) => void;
  syncActive: (doc: SiteDocument) => void;
  switchPage: (key: string) => void;
  addPage: (doc: SiteDocument) => void;
  removePage: (key: string) => void;
  updatePageMeta: (key: string, patch: { title?: string; path?: string }) => void;
  markSaved: (pages: ProjectPage[], projectId: string, projectName: string) => void;
  reset: () => void;
}

const HOME_PAGE: ProjectPage['key'] = 'home';

function toPageKey(path: string): string {
  const cleaned = path
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff-]+/g, '-');
  return cleaned || HOME_PAGE;
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed || trimmed === '/') return '/';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}`;
}

function pageLink(page: Pick<ProjectPage, 'key' | 'title' | 'path'>): NavItem {
  return {
    label: page.title,
    href: page.path,
    kind: 'page',
    pageKey: page.key,
  };
}

function withPageLink(doc: SiteDocument, link: NavItem): SiteDocument {
  if (doc.nav.some((item) => item.pageKey === link.pageKey)) return doc;
  return { ...doc, nav: [...doc.nav, link] };
}

function withUpdatedPageLink(
  doc: SiteDocument,
  pageKey: string,
  patch: { title?: string; path?: string },
): SiteDocument {
  return {
    ...doc,
    nav: doc.nav.map((item) =>
      item.pageKey === pageKey
        ? {
            ...item,
            label: patch.title ?? item.label,
            href: patch.path ?? item.href,
          }
        : item,
    ),
  };
}

function withoutPageLink(doc: SiteDocument, pageKey: string): SiteDocument {
  return {
    ...doc,
    nav: doc.nav.filter((item) => item.pageKey !== pageKey),
  };
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projectId: null,
  projectName: null,
  pages: [],
  activeKey: HOME_PAGE,
  dirty: false,

  startFromDocument: (doc) => {
    set({
      projectId: null,
      projectName: doc.name,
      pages: [
        {
          key: HOME_PAGE,
          title: '首页',
          path: '/',
          document: doc,
          version: 0,
        },
      ],
      activeKey: HOME_PAGE,
      dirty: true,
    });
  },

  hydrateFromCloud: (project, pageDetails) => {
    const pages = pageDetails.map((page) => ({
      key: page.key,
      title: page.title,
      path: page.path,
      document: page.document as unknown as SiteDocument,
      remoteId: page.id,
      version: page.version,
    }));
    const activeKey = pages.find((page) => page.key === HOME_PAGE)?.key ?? pages[0]?.key;
    if (!activeKey) return;
    set({
      projectId: project.project.id,
      projectName: project.project.name,
      pages,
      activeKey,
      dirty: false,
    });
    const active = pages.find((page) => page.key === activeKey);
    if (active) {
      useBuilderStore.getState().replaceDocument(active.document);
    }
  },

  syncActive: (doc) => {
    const { pages, activeKey } = get();
    set({
      pages: pages.map((page) =>
        page.key === activeKey
          ? { ...page, document: doc, title: page.title || doc.name }
          : page,
      ),
      dirty: true,
    });
  },

  switchPage: (key) => {
    const page = get().pages.find((item) => item.key === key);
    if (!page) return;
    set({ activeKey: key });
    useBuilderStore.getState().replaceDocument(page.document);
  },

  addPage: (doc) => {
    const { pages } = get();
    const count = pages.length + 1;
    let path = `/page-${count}`;
    while (pages.some((page) => page.path === path)) path = `${path}-${count}`;
    const next: ProjectPage = {
      key: toPageKey(path),
      title: `新页面 ${count}`,
      path,
      document: {
        ...structuredClone(doc),
        id: `page-${Date.now().toString(36)}`,
        code: `${doc.code}-${count}`,
        name: `${doc.name} · 页面 ${count}`,
      },
      version: 0,
    };
    const link = pageLink(next);
    const nextPages = [...pages, next].map((page) => ({
      ...page,
      document: withPageLink(page.document, link),
    }));
    set({ pages: nextPages, activeKey: next.key, dirty: true });
    const active = nextPages.find((page) => page.key === next.key);
    if (active) useBuilderStore.getState().replaceDocument(active.document);
  },

  removePage: (key) => {
    const pages = get()
      .pages.filter((page) => page.key !== key)
      .map((page) => ({
        ...page,
        document: withoutPageLink(page.document, key),
      }));
    if (!pages.length) return;
    const nextActive =
      get().activeKey === key ? pages[0].key : get().activeKey;
    set({ pages, activeKey: nextActive, dirty: true });
    const active = pages.find((page) => page.key === nextActive);
    if (active) useBuilderStore.getState().replaceDocument(active.document);
  },

  updatePageMeta: (key, patch) => {
    const title = patch.title?.trim() || undefined;
    const path = patch.path ? normalizePath(patch.path) : undefined;
    const pages = get().pages.map((page) => {
      const next = page.key === key ? { ...page, ...patch, title: title ?? page.title, path: path ?? page.path } : page;
      return {
        ...next,
        document: withUpdatedPageLink(next.document, key, {
          title: title ?? next.title,
          path: path ?? next.path,
        }),
      };
    });
    set({ pages, dirty: true });
    const active = pages.find((page) => page.key === get().activeKey);
    if (active) useBuilderStore.getState().replaceDocument(active.document);
  },

  markSaved: (pages, projectId, projectName) =>
    set({ pages, projectId, projectName, dirty: false }),

  reset: () =>
    set({
      projectId: null,
      projectName: null,
      pages: [],
      activeKey: HOME_PAGE,
      dirty: false,
    }),
}));
