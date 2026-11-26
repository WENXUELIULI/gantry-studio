import { beforeEach, describe, expect, it } from 'vitest';
import { useBuilderStore, STORAGE_KEY } from './builder';
import { createBlankDocument } from '../lib/site';
import type { HeroSection, SiteDocument } from '../types/site';

function resetStore() {
  localStorage.clear();
  useBuilderStore.setState({
    doc: null,
    view: 'gallery',
    selectedId: null,
    device: 'desktop',
    zoom: 0.72,
    history: [],
    future: [],
    savedAt: null,
  });
}

function openTruss() {
  useBuilderStore.getState().openTemplate('truss-precision');
  const doc = useBuilderStore.getState().doc;
  if (!doc) throw new Error('template did not open');
  return doc;
}

function heroOf(doc: SiteDocument): HeroSection {
  return doc.sections[0] as HeroSection;
}

describe('builder store', () => {
  beforeEach(resetStore);

  it('opens a template into the builder and persists a draft', () => {
    const state = useBuilderStore.getState();
    state.openTemplate('truss-precision');

    const next = useBuilderStore.getState();
    expect(next.view).toBe('builder');
    expect(next.doc?.templateId).toBe('truss-precision');
    expect(next.doc?.sections).toHaveLength(8);
    expect(next.selectedId).toBe(next.doc?.sections[0].id);
    expect(next.device).toBe('desktop');
    expect(next.history).toHaveLength(0);
    expect(localStorage.getItem(STORAGE_KEY)).toContain('truss-precision');
  });

  it('ignores an unknown template id', () => {
    useBuilderStore.getState().openTemplate('does-not-exist');
    expect(useBuilderStore.getState().doc).toBeNull();
    expect(useBuilderStore.getState().view).toBe('gallery');
  });

  it('updates a section while preserving its id and type', () => {
    const doc = openTruss();
    const hero = heroOf(doc);
    useBuilderStore.getState().updateSection(hero.id, (section) => ({
      ...section,
      title: '新的首屏标题',
    }));

    const updated = useBuilderStore.getState().doc?.sections[0] as HeroSection;
    expect(updated.id).toBe(hero.id);
    expect(updated.type).toBe('hero');
    expect(updated.title).toBe('新的首屏标题');
    expect(useBuilderStore.getState().history).toHaveLength(1);
  });

  it('updates the CTA target', () => {
    openTruss();
    useBuilderStore
      .getState()
      .setCtaTarget({ href: '/products', kind: 'page', pageKey: 'products' });
    expect(useBuilderStore.getState().doc?.ctaTarget).toEqual({
      href: '/products',
      kind: 'page',
      pageKey: 'products',
    });
  });

  it('updates the theme and document name', () => {
    openTruss();
    useBuilderStore.getState().updateTheme({ accent: '#123456' });
    useBuilderStore.getState().setDocumentName('  新官网  ');

    const doc = useBuilderStore.getState().doc;
    expect(doc?.theme.accent).toBe('#123456');
    expect(doc?.name).toBe('新官网');
  });

  it('keeps the previous document name when the new name is blank', () => {
    const doc = openTruss();
    useBuilderStore.getState().setDocumentName('   ');
    expect(useBuilderStore.getState().doc?.name).toBe(doc.name);
  });

  it('moves sections up and down without leaving the array', () => {
    const doc = openTruss();
    const second = doc.sections[1].id;
    useBuilderStore.getState().moveSection(second, -1);
    expect(useBuilderStore.getState().doc?.sections[0].id).toBe(second);

    useBuilderStore.getState().moveSection(second, -1);
    expect(useBuilderStore.getState().doc?.sections[0].id).toBe(second);
  });

  it('toggles visibility and can select a section', () => {
    const doc = openTruss();
    const metrics = doc.sections[1];
    useBuilderStore.getState().selectSection(metrics.id);
    useBuilderStore.getState().toggleSection(metrics.id);

    const state = useBuilderStore.getState();
    expect(state.selectedId).toBe(metrics.id);
    expect(state.doc?.sections[1].visible).toBe(false);
  });

  it('adds a section before the footer and selects it', () => {
    const doc = openTruss();
    useBuilderStore.getState().addSection('metrics');
    const state = useBuilderStore.getState();
    const added = state.doc?.sections.at(-2);
    expect(added?.type).toBe('metrics');
    expect(state.doc?.sections.at(-1)?.type).toBe('footer');
    expect(state.selectedId).toBe(added?.id);
    expect(state.doc?.sections).toHaveLength(doc.sections.length + 1);
  });

  it('duplicates a section right after its source', () => {
    const doc = openTruss();
    const source = doc.sections[1];
    useBuilderStore.getState().duplicateSection(source.id);
    const state = useBuilderStore.getState();
    expect(state.doc?.sections[2].type).toBe(source.type);
    expect(state.doc?.sections[2].id).not.toBe(source.id);
    expect(state.selectedId).toBe(state.doc?.sections[2].id);
  });

  it('removes sections but never the hero', () => {
    const doc = openTruss();
    useBuilderStore.getState().removeSection(doc.sections[0].id);
    expect(useBuilderStore.getState().doc?.sections).toHaveLength(8);

    useBuilderStore.getState().removeSection(doc.sections[1].id);
    expect(useBuilderStore.getState().doc?.sections).toHaveLength(7);
  });

  it('undoes and redoes content changes', () => {
    const doc = openTruss();
    const hero = heroOf(doc);
    useBuilderStore.getState().updateSection(hero.id, (section) => ({
      ...section,
      title: '改动后',
    }));
    useBuilderStore.getState().undo();
    expect(heroOf(useBuilderStore.getState().doc as SiteDocument).title).toBe(
      hero.title,
    );

    useBuilderStore.getState().redo();
    expect(heroOf(useBuilderStore.getState().doc as SiteDocument).title).toBe(
      '改动后',
    );
  });

  it('coalesces live text edits into one undo step', () => {
    const doc = openTruss();
    const hero = heroOf(doc);
    useBuilderStore.getState().beginSectionEdit(hero.id);
    for (const title of ['改', '改动', '改动后']) {
      useBuilderStore.getState().updateSection(hero.id, (section) => ({
        ...section,
        title,
      }));
    }
    expect(useBuilderStore.getState().history).toHaveLength(0);
    expect(heroOf(useBuilderStore.getState().doc as SiteDocument).title).toBe(
      '改动后',
    );

    useBuilderStore.getState().endSectionEdit();
    expect(useBuilderStore.getState().history).toHaveLength(1);
    useBuilderStore.getState().undo();
    expect(heroOf(useBuilderStore.getState().doc as SiteDocument).title).toBe(
      hero.title,
    );
  });

  it('clamps zoom to the supported range', () => {
    useBuilderStore.getState().setZoom(0.1);
    expect(useBuilderStore.getState().zoom).toBe(0.35);
    useBuilderStore.getState().setZoom(1.8);
    expect(useBuilderStore.getState().zoom).toBe(1);
    useBuilderStore.getState().setZoom(0.634);
    expect(useBuilderStore.getState().zoom).toBe(0.63);
  });

  it('switches devices and returns to the gallery without losing the draft', () => {
    openTruss();
    useBuilderStore.getState().setDevice('mobile');
    expect(useBuilderStore.getState().device).toBe('mobile');

    useBuilderStore.getState().closeProject();
    expect(useBuilderStore.getState().view).toBe('gallery');
    expect(useBuilderStore.getState().doc).not.toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toContain('truss-precision');
  });

  it('builds a blank document from a hero and section variants', () => {
    useBuilderStore.getState().openBlankDocument(
      createBlankDocument({
        name: '空白工厂',
        market: 'cn',
        locale: 'zh-CN',
        industry: 'hardware',
        themeId: 'hot-rolled',
      }),
    );
    expect(useBuilderStore.getState().doc?.sections).toHaveLength(0);

    useBuilderStore.getState().addSection('hero', { heroKind: 'video-story' });
    const withHero = useBuilderStore.getState().doc as SiteDocument;
    expect(withHero.sections).toHaveLength(1);
    expect(withHero.sections[0].type).toBe('hero');
    expect((withHero.sections[0] as HeroSection).heroKind).toBe('video-story');
    expect((withHero.sections[0] as HeroSection).media.kind).toBe('video');

    useBuilderStore.getState().addSection('capabilities', { variant: 'grid' });
    const withCapability = useBuilderStore.getState().doc as SiteDocument;
    const capability = withCapability.sections[1];
    expect(capability.type).toBe('capabilities');
    expect(capability.type === 'capabilities' && capability.variant).toBe('grid');
    expect(withCapability.nav).toHaveLength(1);

    useBuilderStore.getState().addSection('footer');
    const withFooter = useBuilderStore.getState().doc as SiteDocument;
    expect(withFooter.sections.at(-1)?.type).toBe('footer');

    useBuilderStore.getState().addSection('footer');
    expect(useBuilderStore.getState().doc?.sections).toHaveLength(3);

    const heroId = withHero.sections[0].id;
    useBuilderStore.getState().removeSection(heroId);
    expect(useBuilderStore.getState().doc?.sections).toHaveLength(2);
  });

  it('resets the project and clears the draft', () => {
    openTruss();
    useBuilderStore.getState().resetProject();
    const state = useBuilderStore.getState();
    expect(state.doc).toBeNull();
    expect(state.view).toBe('gallery');
    expect(state.selectedId).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
