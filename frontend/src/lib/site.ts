import type {
  HeroSection,
  SiteDocument,
  SiteSection,
  TemplateDefinition,
} from '../types/site';
import { createId } from './id';

export function cloneSections(sections: SiteSection[]): SiteSection[] {
  return structuredClone(sections);
}

const GLOBAL_NAV_LABELS: Partial<Record<SiteSection['type'], string>> = {
  metrics: 'Numbers',
  capabilities: 'Capability',
  products: 'Parts',
  process: 'Process',
  proof: 'Field notes',
  cta: 'Contact',
};

const CN_NAV_LABELS: Partial<Record<SiteSection['type'], string>> = {
  metrics: '数字',
  capabilities: '能力',
  products: '产品',
  process: '流程',
  proof: '客户',
  cta: '联系',
};

export function createDocumentFromTemplate(
  template: TemplateDefinition,
): SiteDocument {
  const labels =
    template.market === 'global' ? GLOBAL_NAV_LABELS : CN_NAV_LABELS;
  return {
    id: createId('site'),
    code: template.code,
    name: template.name,
    templateId: template.id,
    market: template.market,
    locale: template.market === 'global' ? 'en' : 'zh-CN',
    industry: template.industry,
    style: template.style,
    theme: { ...template.theme },
    nav: template.sections
      .filter((section) => section.type !== 'footer' && section.type !== 'hero')
      .slice(0, 4)
      .map((section, index) => ({
        label: labels[section.type] ?? section.eyebrow,
        href: `#${section.id}`,
        kind: 'section' as const,
        labelKey: `nav.${index}`,
      })),
    sections: cloneSections(template.sections),
    updatedAt: new Date().toISOString(),
  };
}

export function findHero(doc: SiteDocument): HeroSection | undefined {
  return doc.sections.find(
    (section): section is HeroSection => section.type === 'hero',
  );
}

export function getSection(
  doc: SiteDocument,
  id: string | null,
): SiteSection | undefined {
  if (!id) return undefined;
  return doc.sections.find((section) => section.id === id);
}

export function countWords(doc: SiteDocument): number {
  return doc.sections.reduce((total, section) => {
    const parts: string[] = [section.eyebrow, section.title, section.body ?? ''];
    if (section.type === 'hero') {
      parts.push(section.location, section.scrollHint);
    }
    if (section.type === 'cta') {
      parts.push(section.headline, section.body);
    }
    if (section.type === 'proof') {
      parts.push(section.quote, section.author, section.role);
    }
    if (section.type === 'footer') {
      parts.push(section.note, section.legal);
    }
    return total + parts.join(' ').replace(/\s+/g, '').length;
  }, 0);
}

export function documentStats(doc: SiteDocument) {
  const visible = doc.sections.filter((section) => section.visible);
  const images = doc.sections.reduce((total, section) => {
    if (section.type === 'hero') {
      return (
        total +
        1 +
        section.collage.length +
        (section.media.src.startsWith('data:') ? 1 : 0)
      );
    }
    if (section.type === 'products') return total + section.items.length;
    if (section.type === 'cta' && section.media) return total + 1;
    return total;
  }, 0);
  return {
    sections: doc.sections.length,
    visible: visible.length,
    images,
    words: countWords(doc),
  };
}
