import type { LocaleCode } from '../i18n/locales';

export type MarketId = 'cn' | 'global';

export type IndustryId =
  | 'machinery'
  | 'glass'
  | 'commodity'
  | 'semiconductor'
  | 'energy'
  | 'robotics'
  | 'instrument'
  | 'architecture'
  | 'hardware'
  | 'logistics'
  | 'chemical'
  | 'medical'
  | 'automotive';

export type StyleId =
  | 'industrial-editorial'
  | 'swiss-technical'
  | 'warm-craft'
  | 'glass-luxe'
  | 'kinetic-brutalist'
  | 'dark-precision'
  | 'american-workshop'
  | 'german-technical'
  | 'italian-editorial'
  | 'japanese-minimal'
  | 'nordic-functional';

export type HeroKind =
  | 'video-scrub'
  | 'video-story'
  | 'image-collage'
  | 'split-editorial'
  | 'full-bleed'
  | 'kinetic-type'
  | 'product-stage';

export type SectionType =
  | 'hero'
  | 'metrics'
  | 'capabilities'
  | 'products'
  | 'process'
  | 'proof'
  | 'cta'
  | 'footer';

export type Device = 'desktop' | 'mobile';

export type Tone = 'light' | 'dark' | 'accent';

export interface Market {
  id: MarketId;
  label: string;
  labelEn: string;
  note: string;
}

export interface Industry {
  id: IndustryId;
  label: string;
  labelEn: string;
  code: string;
}

export interface Style {
  id: StyleId;
  label: string;
  labelEn: string;
  note: string;
}

export interface HeroKindMeta {
  id: HeroKind;
  label: string;
  labelEn: string;
  note: string;
}

export interface ThemeTokens {
  surface: string;
  accentSoft: string;
  focus: string;
  displayWeight: number;
  bodySize: number;
  tracking: string;
  borderWidth: number;
  sectionSpace: number;
  motion: 'none' | 'subtle' | 'expressive';
}

export interface Theme extends ThemeTokens {
  id: string;
  name: string;
  dark: boolean;
  paper: string;
  ink: string;
  accent: string;
  accentInk: string;
  muted: string;
  line: string;
  display: string;
  body: string;
  mono: string;
  radius: number;
  grid: 'blueprint' | 'rule' | 'none';
}

export interface MediaCrop {
  x: number;
  y: number;
  zoom: number;
}

export interface MediaRef {
  src: string;
  alt: string;
  caption?: string;
  crop?: MediaCrop;
  /** The same asset slot can hold a still or a film. */
  kind?: 'image' | 'video';
}

export interface VideoKeyframe {
  /** Scroll progress in percent, 0-100. */
  at: number;
  /** Target video time in seconds. */
  time: number;
  /** The section highlighted while this keyframe is active. */
  sectionId: string;
  label?: string;
}

export interface NavTarget {
  href: string;
  kind?: 'section' | 'page' | 'url';
  pageKey?: string;
}

export interface NavItem extends NavTarget {
  label: string;
  /** Localized slot for the four generated section links. */
  labelKey?: string;
}

export interface Metric {
  value: string;
  label: string;
  note?: string;
}

export interface Capability {
  index: string;
  title: string;
  body: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  spec: string;
  image: string;
  crop?: MediaCrop;
  tags: string[];
}

export interface ProcessStep {
  index: string;
  title: string;
  body: string;
  time: string;
}

export interface SectionStyle {
  layout: 'default' | 'split' | 'wide' | 'narrow' | 'stacked';
  density: 'airy' | 'balanced' | 'compact';
  align: 'left' | 'center';
  surface: 'none' | 'surface' | 'accent' | 'ink';
  ratio: '1:1' | '4:3' | '3:2' | '16:9' | '21:9';
  columns: 1 | 2 | 3 | 4;
  overlay: 'none' | 'soft' | 'strong';
  motion: 'none' | 'subtle' | 'rise';
  mobile?: Partial<
    Pick<SectionStyle, 'layout' | 'density' | 'align' | 'columns'>
  >;
}

export interface SectionBase {
  id: string;
  type: SectionType;
  eyebrow: string;
  title: string;
  body?: string;
  visible: boolean;
  tone?: Tone;
  style?: SectionStyle;
}

export interface HeroSection extends SectionBase {
  type: 'hero';
  heroKind: HeroKind;
  tone: Tone;
  media: MediaRef;
  collage: MediaRef[];
  videoPlayback?: 'ambient' | 'scrub';
  keyframes?: VideoKeyframe[];
  primaryCta: string;
  secondaryCta: string;
  location: string;
  scrollHint: string;
  specRows: { label: string; value: string }[];
}

export interface MetricsSection extends SectionBase {
  type: 'metrics';
  items: Metric[];
}

export interface CapabilitiesSection extends SectionBase {
  type: 'capabilities';
  items: Capability[];
  variant: 'rows' | 'grid' | 'sticky';
}

export interface ProductsSection extends SectionBase {
  type: 'products';
  items: Product[];
  variant: 'cards' | 'index' | 'stage';
}

export interface ProcessSection extends SectionBase {
  type: 'process';
  items: ProcessStep[];
}

export interface ProofSection extends SectionBase {
  type: 'proof';
  quote: string;
  author: string;
  role: string;
  stats: Metric[];
  clients: string[];
}

export interface CtaSection extends SectionBase {
  type: 'cta';
  headline: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
  media?: MediaRef;
}

export interface FooterSection extends SectionBase {
  type: 'footer';
  note: string;
  columns: { title: string; links: string[] }[];
  legal: string;
}

export type SiteSection =
  | HeroSection
  | MetricsSection
  | CapabilitiesSection
  | ProductsSection
  | ProcessSection
  | ProofSection
  | CtaSection
  | FooterSection;

export interface SiteDocument {
  id: string;
  code: string;
  name: string;
  templateId: string;
  market: MarketId;
  locale?: LocaleCode;
  industry: IndustryId;
  style: StyleId;
  theme: Theme;
  nav: NavItem[];
  ctaTarget?: NavTarget;
  sections: SiteSection[];
  updatedAt: string;
}

export interface TemplateDefinition {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  market: MarketId;
  industry: IndustryId;
  style: StyleId;
  heroKind: HeroKind;
  summary: string;
  tags: string[];
  theme: Theme;
  cover: {
    image: string;
    secondary: string;
    accentWord: string;
  };
  sections: SiteSection[];
}

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: '首屏',
  metrics: '数字凭证',
  capabilities: '能力矩阵',
  products: '产品系列',
  process: '交付流程',
  proof: '客户证言',
  cta: '行动召唤',
  footer: '页脚',
};

export const SECTION_TYPES: SectionType[] = [
  'hero',
  'metrics',
  'capabilities',
  'products',
  'process',
  'proof',
  'cta',
  'footer',
];
