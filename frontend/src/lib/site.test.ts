import { describe, expect, it } from 'vitest';
import { TEMPLATE_BY_ID, TEMPLATES } from '../data/templates';
import {
  cloneSections,
  countWords,
  createDocumentFromTemplate,
  documentStats,
  findHero,
  getSection,
} from './site';

const template = TEMPLATE_BY_ID['truss-precision'];

describe('createDocumentFromTemplate', () => {
  it('copies identity, theme and sections from the template', () => {
    const document = createDocumentFromTemplate(template);
    expect(document.templateId).toBe(template.id);
    expect(document.code).toBe(template.code);
    expect(document.name).toBe(template.name);
    expect(document.market).toBe(template.market);
    expect(document.industry).toBe(template.industry);
    expect(document.style).toBe(template.style);
    expect(document.theme).toEqual(template.theme);
    expect(document.sections).toHaveLength(template.sections.length);
    expect(document.sections[0].type).toBe('hero');
  });

  it('builds navigation from the content sections, never the hero or footer', () => {
    const document = createDocumentFromTemplate(template);
    expect(document.nav.length).toBeGreaterThan(0);
    expect(document.nav.length).toBeLessThanOrEqual(4);
    expect(document.nav.map((item) => item.href)).not.toContain('#hero');
    expect(
      document.nav.some((item) => item.href.includes('footer')),
    ).toBe(false);
  });

  it('uses English navigation for an international template', () => {
    const document = createDocumentFromTemplate(TEMPLATE_BY_ID['atlas-machine']);
    expect(document.market).toBe('global');
    expect(document.nav.map((item) => item.label)).toEqual([
      'Numbers',
      'Capability',
      'Parts',
      'Process',
    ]);
  });

  it('does not share section objects with the template', () => {
    const document = createDocumentFromTemplate(template);
    expect(document.sections).not.toBe(template.sections);
    expect(document.sections[0]).not.toBe(template.sections[0]);
  });
});

describe('section lookup', () => {
  it('finds the hero section', () => {
    const document = createDocumentFromTemplate(template);
    expect(findHero(document)?.type).toBe('hero');
  });

  it('finds a section by id and returns undefined otherwise', () => {
    const document = createDocumentFromTemplate(template);
    expect(getSection(document, document.sections[1].id)).toBe(
      document.sections[1],
    );
    expect(getSection(document, 'missing')).toBeUndefined();
    expect(getSection(document, null)).toBeUndefined();
  });
});

describe('document metrics', () => {
  it('counts visible sections, images and words', () => {
    const document = createDocumentFromTemplate(template);
    const stats = documentStats(document);
    expect(stats.sections).toBe(document.sections.length);
    expect(stats.visible).toBe(
      document.sections.filter((section) => section.visible).length,
    );
    expect(stats.images).toBeGreaterThan(0);
    expect(stats.words).toBeGreaterThan(100);
  });

  it('counts words without whitespace', () => {
    const document = createDocumentFromTemplate(template);
    const words = countWords(document);
    expect(words).toBeGreaterThan(0);
    expect(Number.isInteger(words)).toBe(true);

    const before = countWords(document);
    const hero = findHero(document);
    expect(hero).toBeDefined();
    if (hero) hero.title = `${hero.title}  额外 内容`;
    expect(countWords(document)).toBe(before + 4);
  });
});

describe('cloneSections', () => {
  it('deep-clones sections', () => {
    const document = createDocumentFromTemplate(template);
    const clone = cloneSections(document.sections);
    expect(clone).toEqual(document.sections);
    expect(clone[0]).not.toBe(document.sections[0]);
  });
});

describe('template library', () => {
  it('ships thirty unique templates across every industry and both markets', () => {
    expect(TEMPLATES).toHaveLength(30);
    expect(new Set(TEMPLATES.map((item) => item.id)).size).toBe(30);
    expect(new Set(TEMPLATES.map((item) => item.code)).size).toBe(30);
    expect(new Set(TEMPLATES.map((item) => item.industry)).size).toBe(13);
    expect(TEMPLATES.filter((item) => item.market === 'cn')).toHaveLength(20);
    expect(TEMPLATES.filter((item) => item.market === 'global')).toHaveLength(10);
  });

  it('gives every template a complete eight-section narrative', () => {
    for (const item of TEMPLATES) {
      expect(item.market).toMatch(/^(cn|global)$/);
      expect(item.sections.map((section) => section.type)).toEqual([
        'hero',
        'metrics',
        'capabilities',
        'products',
        'process',
        'proof',
        'cta',
        'footer',
      ]);
      expect(item.cover.image).toMatch(/^\/assets\//);
      expect(item.sections[0].type).toBe('hero');
    }
  });
});
