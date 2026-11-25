import type {
  HeroKindMeta,
  Industry,
  IndustryId,
  Market,
  MarketId,
  Style,
  StyleId,
} from '../types/site';

export const MARKETS: Market[] = [
  {
    id: 'cn',
    label: '中国市场',
    labelEn: 'CHINA',
    note: '中文语境、参数密度高、信任靠案例与资质。',
  },
  {
    id: 'global',
    label: '国际市场',
    labelEn: 'GLOBAL',
    note: '英文语境、留白更大、信任靠标准与过程。',
  },
];

export const INDUSTRIES: Industry[] = [
  { id: 'machinery', label: '机械与零件', labelEn: 'MACHINERY', code: 'MCH' },
  { id: 'glass', label: '玻璃与器皿', labelEn: 'GLASSWARE', code: 'GLS' },
  { id: 'commodity', label: '工业商品', labelEn: 'COMMODITY', code: 'CMD' },
  { id: 'semiconductor', label: '半导体', labelEn: 'SEMICONDUCTOR', code: 'SEM' },
  { id: 'energy', label: '新能源', labelEn: 'ENERGY', code: 'NRG' },
  { id: 'robotics', label: '机器人与自动化', labelEn: 'ROBOTICS', code: 'ROB' },
  { id: 'instrument', label: '精密仪器', labelEn: 'INSTRUMENT', code: 'INS' },
  { id: 'architecture', label: '建筑与幕墙', labelEn: 'ARCHITECTURE', code: 'ARC' },
  { id: 'hardware', label: '五金与紧固件', labelEn: 'HARDWARE', code: 'HDW' },
  { id: 'logistics', label: '物流与仓储', labelEn: 'LOGISTICS', code: 'LGC' },
  { id: 'chemical', label: '化工与材料', labelEn: 'CHEMICAL', code: 'CHM' },
  { id: 'medical', label: '医疗器械', labelEn: 'MEDICAL', code: 'MED' },
  { id: 'automotive', label: '汽车零部件', labelEn: 'AUTOMOTIVE', code: 'AUT' },
];

export const STYLES: Style[] = [
  {
    id: 'industrial-editorial',
    label: '工业编辑风',
    labelEn: 'INDUSTRIAL EDITORIAL',
    note: '超大标题、编号、技术标注，像一本工厂年鉴。',
  },
  {
    id: 'swiss-technical',
    label: '瑞士技术网格',
    labelEn: 'SWISS TECHNICAL',
    note: '严格栅格、无衬线、留白，让参数自己说话。',
  },
  {
    id: 'warm-craft',
    label: '温暖手作',
    labelEn: 'WARM CRAFT',
    note: '纸张质感、自然色、慢节奏，适合有温度的制造。',
  },
  {
    id: 'glass-luxe',
    label: '玻璃奢华',
    labelEn: 'GLASS LUXE',
    note: '透明层叠、冷光、深色底，强调材质与折射。',
  },
  {
    id: 'kinetic-brutalist',
    label: '动能粗野',
    labelEn: 'KINETIC BRUTALIST',
    note: '粗重字、撞色、滚动字幕，把速度做成视觉。',
  },
  {
    id: 'dark-precision',
    label: '暗色精密',
    labelEn: 'DARK PRECISION',
    note: '近黑背景、细线、荧光点，适合微观与高精。',
  },
  {
    id: 'american-workshop',
    label: '美式工坊',
    labelEn: 'AMERICAN WORKSHOP',
    note: '大字、红黑、目录感，像一本被放大的产品手册。',
  },
  {
    id: 'german-technical',
    label: '德式精密',
    labelEn: 'GERMAN TECHNICAL',
    note: '冷灰、严格基线、参数先行，克制到近乎冷静。',
  },
  {
    id: 'italian-editorial',
    label: '意式社论',
    labelEn: 'ITALIAN EDITORIAL',
    note: '衬线大标题、暖中性色、摄影优先，像一本材料杂志。',
  },
  {
    id: 'japanese-minimal',
    label: '日式极简',
    labelEn: 'JAPANESE MINIMAL',
    note: '和纸白、墨黑、朱红一点，留白比内容更响。',
  },
  {
    id: 'nordic-functional',
    label: '北欧功能',
    labelEn: 'NORDIC FUNCTIONAL',
    note: '浅色、清楚、功能主义，信息像说明书一样好读。',
  },
];

export const HERO_KINDS: HeroKindMeta[] = [
  {
    id: 'video-scrub',
    label: '视频滚动',
    labelEn: 'SCROLL VIDEO',
    note: '背景视频随页面滚动逐帧前进，适合产线与工艺叙事。',
  },
  {
    id: 'image-collage',
    label: '图片拼贴',
    labelEn: 'IMAGE COLLAGE',
    note: '三四张图片按页面高度重新组合、错位与裁切。',
  },
  {
    id: 'split-editorial',
    label: '分栏社论',
    labelEn: 'SPLIT EDITORIAL',
    note: '一半文字、一半影像，像一篇被放大的报道。',
  },
  {
    id: 'full-bleed',
    label: '全幅影像',
    labelEn: 'FULL BLEED',
    note: '一张图占满首屏，标题压在画面上，直接、有压迫感。',
  },
  {
    id: 'kinetic-type',
    label: '动态字体',
    labelEn: 'KINETIC TYPE',
    note: '文字成为主视觉，通过滚动速度与撞色制造节奏。',
  },
  {
    id: 'product-stage',
    label: '产品舞台',
    labelEn: 'PRODUCT STAGE',
    note: '产品居中、参数引线标注，像一张会呼吸的技术海报。',
  },
];

export const MARKET_BY_ID = Object.fromEntries(
  MARKETS.map((market) => [market.id, market]),
) as Record<MarketId, Market>;

export const INDUSTRY_BY_ID = Object.fromEntries(
  INDUSTRIES.map((industry) => [industry.id, industry]),
) as Record<IndustryId, Industry>;

export const STYLE_BY_ID = Object.fromEntries(
  STYLES.map((style) => [style.id, style]),
) as Record<StyleId, Style>;

export const HERO_KIND_BY_ID = Object.fromEntries(
  HERO_KINDS.map((kind) => [kind.id, kind]),
) as Record<HeroKindMeta['id'], HeroKindMeta>;

export function industryLabel(id: IndustryId): string {
  return INDUSTRY_BY_ID[id]?.label ?? id;
}

export function styleLabel(id: StyleId): string {
  return STYLE_BY_ID[id]?.label ?? id;
}

export function marketLabel(id: MarketId): string {
  return MARKET_BY_ID[id]?.label ?? id;
}
