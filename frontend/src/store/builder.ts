import { create } from 'zustand';
import type {
  Device,
  NavItem,
  NavTarget,
  SectionType,
  SiteDocument,
  SiteSection,
  Theme,
} from '../types/site';
import { TEMPLATE_BY_ID } from '../data/templates';
import { SECTION_LABELS } from '../types/site';
import { createId } from '../lib/id';
import { createSection, type SectionCreateOptions } from '../lib/sections';
import { createDocumentFromTemplate } from '../lib/site';
import type { LocaleCode } from '../i18n/locales';

export const STORAGE_KEY = 'gantry:site:v1';

export type AppView = 'gallery' | 'builder';

export interface SectionScrollRequest {
  id: string;
  token: number;
}

interface BuilderState {
  doc: SiteDocument | null;
  view: AppView;
  selectedId: string | null;
  scrollRequest: SectionScrollRequest | null;
  device: Device;
  zoom: number;
  history: SiteDocument[];
  future: SiteDocument[];
  savedAt: string | null;
  editSectionId: string | null;
  editBaseline: SiteDocument | null;
  openTemplate: (templateId: string) => void;
  openBlankDocument: (doc: SiteDocument) => void;
  resumeDraft: () => void;
  replaceDocument: (doc: SiteDocument) => void;
  closeProject: () => void;
  selectSection: (id: string | null) => void;
  revealSection: (id: string) => void;
  beginSectionEdit: (id: string) => void;
  endSectionEdit: () => void;
  setDevice: (device: Device) => void;
  setZoom: (zoom: number) => void;
  updateSection: (
    id: string,
    recipe: (section: SiteSection) => SiteSection,
  ) => void;
  updateTheme: (patch: Partial<Theme>) => void;
  updateNav: (nav: NavItem[]) => void;
  setCtaTarget: (target: NavTarget) => void;
  setDocumentName: (name: string) => void;
  setDocumentLocale: (locale: LocaleCode) => void;
  moveSection: (id: string, direction: -1 | 1) => void;
  toggleSection: (id: string) => void;
  addSection: (type: SectionType, options?: SectionCreateOptions) => void;
  duplicateSection: (id: string) => void;
  removeSection: (id: string) => void;
  undo: () => void;
  redo: () => void;
  resetProject: () => void;
}

function loadDraft(): SiteDocument | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SiteDocument;
    if (!parsed || !Array.isArray(parsed.sections) || !parsed.theme) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persist(doc: SiteDocument): string {
  const now = new Date().toISOString();
  const saved = { ...doc, updatedAt: now };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // A full or blocked storage must not break editing.
    }
  }
  return now;
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

const initialDoc = loadDraft();

export const useBuilderStore = create<BuilderState>()((set, get) => {
  const commit = (next: SiteDocument, pushHistory = true) => {
    const current = get().doc;
    const history =
      pushHistory && current
        ? [...get().history, structuredClone(current)].slice(-30)
        : get().history;
    const savedAt = persist(next);
    set({
      doc: { ...next, updatedAt: savedAt },
      history,
      future: pushHistory ? [] : get().future,
      savedAt,
    });
  };

  const withDoc = (
    recipe: (doc: SiteDocument) => SiteDocument | null,
    pushHistory = true,
  ) => {
    const current = get().doc;
    if (!current) return;
    const next = recipe(structuredClone(current));
    if (next) commit(next, pushHistory);
  };

  return {
    doc: initialDoc,
    view: 'gallery',
    selectedId: initialDoc?.sections[0]?.id ?? null,
    scrollRequest: null,
    device: 'desktop',
    zoom: 0.72,
    history: [],
    future: [],
    savedAt: initialDoc?.updatedAt ?? null,
    editSectionId: null,
    editBaseline: null,

    openTemplate: (templateId) => {
      const template = TEMPLATE_BY_ID[templateId];
      if (!template) return;
      const doc = createDocumentFromTemplate(template);
      const savedAt = persist(doc);
      set({
        doc: { ...doc, updatedAt: savedAt },
        view: 'builder',
        selectedId: doc.sections[0]?.id ?? null,
        scrollRequest: null,
        device: 'desktop',
        history: [],
        future: [],
        savedAt,
        editSectionId: null,
        editBaseline: null,
      });
    },

    openBlankDocument: (doc) => {
      const savedAt = persist(doc);
      set({
        doc: { ...doc, updatedAt: savedAt },
        view: 'builder',
        selectedId: doc.sections[0]?.id ?? null,
        scrollRequest: null,
        device: 'desktop',
        history: [],
        future: [],
        savedAt,
        editSectionId: null,
        editBaseline: null,
      });
    },

    resumeDraft: () => {
      const current = get().doc;
      if (!current) return;
      set({
        view: 'builder',
        selectedId: current.sections[0]?.id ?? null,
        scrollRequest: null,
        editSectionId: null,
        editBaseline: null,
      });
    },

    closeProject: () => {
      set({
        view: 'gallery',
        selectedId: null,
        scrollRequest: null,
        editSectionId: null,
        editBaseline: null,
      });
    },

    replaceDocument: (doc) => {
      const savedAt = persist(doc);
      set({
        doc: { ...doc, updatedAt: savedAt },
        view: 'builder',
        selectedId: doc.sections[0]?.id ?? null,
        scrollRequest: null,
        history: [],
        future: [],
        savedAt,
        editSectionId: null,
        editBaseline: null,
      });
    },

    selectSection: (id) => set({ selectedId: id }),

    revealSection: (id) =>
      set((state) => ({
        selectedId: id,
        scrollRequest: { id, token: (state.scrollRequest?.token ?? 0) + 1 },
      })),

    beginSectionEdit: (id) => {
      const state = get();
      if (!state.doc || state.editSectionId === id) return;
      if (state.editSectionId) get().endSectionEdit();
      set({
        editSectionId: id,
        editBaseline: structuredClone(get().doc),
      });
    },

    endSectionEdit: () => {
      const { editBaseline, doc, history, editSectionId } = get();
      if (!editSectionId || !editBaseline || !doc) return;
      const changed =
        JSON.stringify(editBaseline) !== JSON.stringify(doc);
      set({
        editSectionId: null,
        editBaseline: null,
        history: changed
          ? [...history, editBaseline].slice(-30)
          : history,
        future: changed ? [] : get().future,
      });
    },

    setDevice: (device) => set({ device }),

    setZoom: (zoom) =>
      set({ zoom: Math.min(1, Math.max(0.35, Math.round(zoom * 100) / 100)) }),

    updateSection: (id, recipe) => {
      const editing = get().editSectionId === id;
      withDoc((doc) => {
        const index = doc.sections.findIndex((section) => section.id === id);
        if (index < 0) return null;
        const current = doc.sections[index] as SiteSection;
        const updated = recipe(current);
        const nextSection = {
          ...updated,
          id: current.id,
          type: current.type,
        } as SiteSection;
        const sections = [...doc.sections];
        sections[index] = nextSection;
        return { ...doc, sections };
      }, !editing);
    },

    updateTheme: (patch) => {
      withDoc((doc) => ({ ...doc, theme: { ...doc.theme, ...patch } }));
    },

    updateNav: (nav) => {
      withDoc((doc) => ({ ...doc, nav }));
    },

    setCtaTarget: (target) => {
      withDoc((doc) => ({ ...doc, ctaTarget: target }));
    },

    setDocumentName: (name) => {
      withDoc((doc) => ({ ...doc, name: name.trim() || doc.name }));
    },

    setDocumentLocale: (locale) => {
      withDoc((doc) => ({ ...doc, locale }));
    },

    moveSection: (id, direction) => {
      withDoc((doc) => {
        const index = doc.sections.findIndex((section) => section.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= doc.sections.length) {
          return null;
        }
        const sections = [...doc.sections];
        [sections[index], sections[target]] = [
          sections[target],
          sections[index],
        ];
        return { ...doc, sections };
      });
    },

    toggleSection: (id) => {
      withDoc((doc) => ({
        ...doc,
        sections: doc.sections.map((section) =>
          section.id === id
            ? { ...section, visible: !section.visible }
            : section,
        ),
      }));
    },

    addSection: (type, options) => {
      withDoc((doc) => {
        if (type === 'hero' && doc.sections.some((item) => item.type === 'hero')) {
          return null;
        }
        if (type === 'footer' && doc.sections.some((item) => item.type === 'footer')) {
          return null;
        }
        const section = createSection(type, doc.sections, options);
        const footerIndex = doc.sections.findIndex(
          (item) => item.type === 'footer',
        );
        const insertAt = footerIndex < 0 ? doc.sections.length : footerIndex;
        const sections = [...doc.sections];
        sections.splice(insertAt, 0, section);
        const nav =
          type === 'hero' || type === 'footer' || doc.nav.length >= 4
            ? doc.nav
            : [
                ...doc.nav,
                {
                  label:
                    section.title.split('\n')[0]?.trim() ||
                    SECTION_LABELS[type],
                  href: `#${section.id}`,
                  kind: 'section' as const,
                },
              ];
        set({
          selectedId: section.id,
          scrollRequest: { id: section.id, token: Date.now() },
        });
        return { ...doc, sections, nav };
      });
    },

    duplicateSection: (id) => {
      withDoc((doc) => {
        const index = doc.sections.findIndex((section) => section.id === id);
        if (index < 0) return null;
        const source = doc.sections[index];
        const copy = {
          ...structuredClone(source),
          id: `${source.type}-${createId('copy')}`,
        } as SiteSection;
        const sections = [...doc.sections];
        sections.splice(index + 1, 0, copy);
        set({ selectedId: copy.id });
        return { ...doc, sections };
      });
    },

    removeSection: (id) => {
      withDoc((doc) => {
        const section = doc.sections.find((item) => item.id === id);
        if (!section) return null;
        if (section.type === 'hero' && doc.templateId !== 'blank') return null;
        const sections = doc.sections.filter((item) => item.id !== id);
        const nav = doc.nav.filter((item) => item.href !== `#${id}`);
        if (get().selectedId === id) {
          set({ selectedId: sections[0]?.id ?? null });
        }
        return { ...doc, sections, nav };
      });
    },

    undo: () => {
      const { history, doc, editSectionId, editBaseline } = get();
      if (!doc) return;
      if (editSectionId && editBaseline) {
        const savedAt = persist(editBaseline);
        set({
          doc: { ...editBaseline, updatedAt: savedAt },
          future: [structuredClone(doc), ...get().future].slice(0, 30),
          savedAt,
          selectedId: editBaseline.sections[0]?.id ?? null,
          editSectionId: null,
          editBaseline: null,
        });
        return;
      }
      if (!history.length) return;
      const previous = history[history.length - 1];
      const savedAt = persist(previous);
      set({
        doc: { ...previous, updatedAt: savedAt },
        history: history.slice(0, -1),
        future: [structuredClone(doc), ...get().future].slice(0, 30),
        savedAt,
        selectedId: previous.sections[0]?.id ?? null,
      });
    },

    redo: () => {
      const { future, doc } = get();
      if (!future.length || !doc) return;
      const next = future[0];
      const savedAt = persist(next);
      set({
        doc: { ...next, updatedAt: savedAt },
        future: future.slice(1),
        history: [...get().history, structuredClone(doc)].slice(-30),
        savedAt,
        selectedId: next.sections[0]?.id ?? null,
      });
    },

    resetProject: () => {
      clearDraft();
      set({
        doc: null,
        view: 'gallery',
        selectedId: null,
        history: [],
        future: [],
        savedAt: null,
        device: 'desktop',
        editSectionId: null,
        editBaseline: null,
      });
    },
  };
});
