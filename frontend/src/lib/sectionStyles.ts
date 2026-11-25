import type { CSSProperties } from 'react';
import type { SectionStyle, SectionType } from '../types/site';

export type StyleKey = Exclude<keyof SectionStyle, 'mobile'>;

export interface StyleControl {
  key: StyleKey;
  label: string;
  hint: string;
  options: { value: string; label: string }[];
}

export const STYLE_CONTROLS: StyleControl[] = [
  {
    key: 'layout',
    label: '布局',
    hint: '决定这一区块怎么排：默认 / 左右分栏 / 通栏 / 窄栏 / 上下堆叠。只影响当前区块。',
    options: [
      { value: 'default', label: '默认' },
      { value: 'split', label: '左右分栏' },
      { value: 'wide', label: '通栏' },
      { value: 'narrow', label: '窄栏' },
      { value: 'stacked', label: '上下堆叠' },
    ],
  },
  {
    key: 'density',
    label: '密度',
    hint: '控制上下留白与内容间距：舒展更松弛，紧凑适合参数多的区块。',
    options: [
      { value: 'airy', label: '舒展' },
      { value: 'balanced', label: '平衡' },
      { value: 'compact', label: '紧凑' },
    ],
  },
  {
    key: 'align',
    label: '对齐',
    hint: '标题、正文与按钮沿左侧轴线排，还是整体居中。',
    options: [
      { value: 'left', label: '左对齐' },
      { value: 'center', label: '居中' },
    ],
  },
  {
    key: 'surface',
    label: '表面',
    hint: '区块底色：跟随页面=透明；浅表面=浅底卡片；强调色=品牌色底；墨色=深色底。',
    options: [
      { value: 'none', label: '跟随页面' },
      { value: 'surface', label: '浅表面' },
      { value: 'accent', label: '强调色' },
      { value: 'ink', label: '墨色' },
    ],
  },
  {
    key: 'ratio',
    label: '媒体比例',
    hint: '图片/视频的显示比例，超出部分按焦点裁切。',
    options: [
      { value: '1:1', label: '1 : 1' },
      { value: '4:3', label: '4 : 3' },
      { value: '3:2', label: '3 : 2' },
      { value: '16:9', label: '16 : 9' },
      { value: '21:9', label: '21 : 9' },
    ],
  },
  {
    key: 'columns',
    label: '列数',
    hint: '卡片/条目一行分几列；手机端会自动降列。',
    options: [
      { value: '1', label: '1 列' },
      { value: '2', label: '2 列' },
      { value: '3', label: '3 列' },
      { value: '4', label: '4 列' },
    ],
  },
  {
    key: 'overlay',
    label: '影像遮罩',
    hint: '压在图片/视频上的暗层：轻遮罩适合亮图，重遮罩适合复杂背景，用来保证白字可读。',
    options: [
      { value: 'none', label: '无' },
      { value: 'soft', label: '轻遮罩' },
      { value: 'strong', label: '重遮罩' },
    ],
  },
  {
    key: 'motion',
    label: '动效',
    hint: '滚动进入视口时的节奏：无 / 轻微淡入 / 上浮；会尊重系统“减少动效”设置。',
    options: [
      { value: 'none', label: '无' },
      { value: 'subtle', label: '轻微' },
      { value: 'rise', label: '上浮' },
    ],
  },
];

const STYLE_KEYS_BY_TYPE: Record<SectionType, StyleKey[]> = {
  hero: ['density', 'align', 'surface', 'overlay', 'motion'],
  metrics: ['density', 'align', 'surface', 'columns', 'motion'],
  capabilities: ['layout', 'density', 'align', 'surface', 'columns', 'motion'],
  products: [
    'layout',
    'density',
    'align',
    'surface',
    'ratio',
    'columns',
    'motion',
  ],
  process: ['density', 'align', 'surface', 'columns', 'motion'],
  proof: ['density', 'align', 'surface', 'motion'],
  cta: ['density', 'align', 'surface', 'overlay', 'motion'],
  footer: ['density', 'align', 'surface', 'motion'],
};

export function controlsFor(type: SectionType): StyleControl[] {
  const keys = new Set(STYLE_KEYS_BY_TYPE[type]);
  return STYLE_CONTROLS.filter((control) => keys.has(control.key));
}

export const DEFAULT_SECTION_STYLE: SectionStyle = {  layout: 'default',
  density: 'balanced',
  align: 'left',
  surface: 'none',
  ratio: '16:9',
  columns: 1,
  overlay: 'none',
  motion: 'subtle',
  mobile: {},
};

function columns(value: unknown): SectionStyle['columns'] {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(4, Math.max(1, Math.round(number))) as SectionStyle['columns'];
}

const LAYOUTS: SectionStyle['layout'][] = [
  'default',
  'split',
  'wide',
  'narrow',
  'stacked',
];
const DENSITIES: SectionStyle['density'][] = ['airy', 'balanced', 'compact'];
const ALIGNS: SectionStyle['align'][] = ['left', 'center'];
const SURFACES: SectionStyle['surface'][] = [
  'none',
  'surface',
  'accent',
  'ink',
];
const RATIOS: SectionStyle['ratio'][] = [
  '1:1',
  '4:3',
  '3:2',
  '16:9',
  '21:9',
];
const OVERLAYS: SectionStyle['overlay'][] = ['none', 'soft', 'strong'];
const MOTIONS: SectionStyle['motion'][] = ['none', 'subtle', 'rise'];

function valid<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && values.includes(value as T);
}

export function defaultStyleFor(type: SectionType): SectionStyle {
  const base = { ...DEFAULT_SECTION_STYLE, mobile: {} };
  if (type === 'hero') {
    return { ...base, density: 'airy', overlay: 'soft', motion: 'rise' };
  }
  if (type === 'products') return { ...base, columns: 3 };
  if (type === 'capabilities') return { ...base, columns: 2, density: 'compact' };
  if (type === 'metrics') return { ...base, columns: 4, density: 'compact' };
  if (type === 'process') return { ...base, columns: 4, density: 'compact' };
  if (type === 'footer') return { ...base, motion: 'none' };
  if (type === 'cta') return { ...base, align: 'center' };
  return base;
}

export function resolveSectionStyle(
  style: Partial<SectionStyle> | undefined,
  type: SectionType,
): SectionStyle {
  const base = defaultStyleFor(type);
  if (!style) return base;

  const raw = style as Partial<SectionStyle>;
  const mobile = raw.mobile ?? {};
  return {
    layout: valid(LAYOUTS, raw.layout) ? raw.layout : base.layout,
    density: valid(DENSITIES, raw.density) ? raw.density : base.density,
    align: valid(ALIGNS, raw.align) ? raw.align : base.align,
    surface: valid(SURFACES, raw.surface) ? raw.surface : base.surface,
    ratio: valid(RATIOS, raw.ratio) ? raw.ratio : base.ratio,
    columns:
      raw.columns === undefined ? base.columns : columns(raw.columns),
    overlay: valid(OVERLAYS, raw.overlay) ? raw.overlay : base.overlay,
    motion: valid(MOTIONS, raw.motion) ? raw.motion : base.motion,
    mobile: {
      ...(valid(LAYOUTS, mobile.layout) ? { layout: mobile.layout } : {}),
      ...(valid(DENSITIES, mobile.density) ? { density: mobile.density } : {}),
      ...(valid(ALIGNS, mobile.align) ? { align: mobile.align } : {}),
      ...(mobile.columns === undefined
        ? {}
        : { columns: columns(mobile.columns) }),
    },
  };
}

export type StyleVars = CSSProperties & Record<`--${string}`, string>;

export function styleVars(style: SectionStyle): StyleVars {
  return {
    '--section-columns': String(style.columns),
    '--section-ratio': style.ratio.replace(':', ' / '),
    '--section-mobile-columns': String(style.mobile?.columns ?? style.columns),
  } as StyleVars;
}
