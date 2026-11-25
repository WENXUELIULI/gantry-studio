import type {
  Capability,
  HeroKind,
  IndustryId,
  MarketId,
  Metric,
  ProcessStep,
  Product,
  SectionStyle,
  SiteSection,
  StyleId,
  TemplateDefinition,
  Theme,
} from '../types/site';
import { INDUSTRIES, STYLES } from './taxonomy';
import { cloneTheme, THEME_BY_ID } from './themes';

interface Copy {
  short: string;
  shortEn: string;
  noun: string;
  nounEn: string;
  place: string;
  placeEn: string;
  images: string[];
}

const COPY: Record<IndustryId, Copy> = {
  machinery: { short: '机械', shortEn: 'Machinery', noun: '机械零件', nounEn: 'machined parts', place: '河北 · 沧州', placeEn: 'Cangzhou, CN', images: ['/assets/metal-01.jpg', '/assets/factory-01.jpg', '/assets/pipes-01.jpg', '/assets/engineer-01.jpg', '/assets/industrial-01.jpg'] },
  glass: { short: '玻璃', shortEn: 'Glass', noun: '玻璃制品', nounEn: 'glass objects', place: '河北 · 河间', placeEn: 'Hejian, CN', images: ['/assets/glassware-01.jpg', '/assets/glassware-02.jpg', '/assets/glass-01.jpg', '/assets/glass-03.jpg', '/assets/glass-02.jpg'] },
  commodity: { short: '商品', shortEn: 'Goods', noun: '工业耗材', nounEn: 'industrial goods', place: '广东 · 深圳', placeEn: 'Shenzhen, CN', images: ['/assets/warehouse-01.jpg', '/assets/factory-02.jpg', '/assets/industrial-01.jpg', '/assets/pipes-01.jpg', '/assets/metal-01.jpg'] },
  semiconductor: { short: '半导体', shortEn: 'Semiconductor', noun: '半导体部件', nounEn: 'semiconductor parts', place: '江苏 · 无锡', placeEn: 'Wuxi, CN', images: ['/assets/chip-01.jpg', '/assets/engineer-02.jpg', '/assets/glass-02.jpg', '/assets/chip-01.jpg', '/assets/engineer-02.jpg'] },
  energy: { short: '能源', shortEn: 'Energy', noun: '能源装备', nounEn: 'energy systems', place: '江苏 · 常州', placeEn: 'Changzhou, CN', images: ['/assets/solar-01.jpg', '/assets/wind-01.jpg', '/assets/pipes-01.jpg', '/assets/solar-01.jpg', '/assets/wind-01.jpg'] },
  robotics: { short: '机器人', shortEn: 'Robotics', noun: '协作机器人', nounEn: 'cobots', place: '广东 · 东莞', placeEn: 'Dongguan, CN', images: ['/assets/glass-02.jpg', '/assets/robot-01.jpg', '/assets/engineer-02.jpg', '/assets/glass-02.jpg', '/assets/robot-01.jpg'] },
  instrument: { short: '仪器', shortEn: 'Instrument', noun: '精密仪器', nounEn: 'precision instruments', place: '江苏 · 苏州', placeEn: 'Suzhou, CN', images: ['/assets/engineer-02.jpg', '/assets/chip-01.jpg', '/assets/robot-01.jpg', '/assets/engineer-01.jpg', '/assets/chip-01.jpg'] },
  architecture: { short: '建筑', shortEn: 'Architecture', noun: '建筑立面', nounEn: 'facades', place: '上海 · 临港', placeEn: 'Shanghai, CN', images: ['/assets/glass-01.jpg', '/assets/glass-03.jpg', '/assets/glass-02.jpg', '/assets/glass-01.jpg', '/assets/glass-03.jpg'] },
  hardware: { short: '五金', shortEn: 'Hardware', noun: '五金件', nounEn: 'hardware components', place: '河北 · 邯郸', placeEn: 'Handan, CN', images: ['/assets/metal-01.jpg', '/assets/factory-01.jpg', '/assets/pipes-01.jpg', '/assets/industrial-01.jpg', '/assets/factory-01.jpg'] },
  logistics: { short: '物流', shortEn: 'Logistics', noun: '物流装备', nounEn: 'logistics systems', place: '上海 · 临港', placeEn: 'Shanghai, CN', images: ['/assets/warehouse-01.jpg', '/assets/industrial-01.jpg', '/assets/factory-02.jpg', '/assets/warehouse-01.jpg', '/assets/industrial-01.jpg'] },
  chemical: { short: '化工', shortEn: 'Chemical', noun: '化工材料', nounEn: 'chemical materials', place: '江苏 · 泰州', placeEn: 'Taizhou, CN', images: ['/assets/pipes-01.jpg', '/assets/chip-01.jpg', '/assets/factory-01.jpg', '/assets/pipes-01.jpg', '/assets/engineer-01.jpg'] },
  medical: { short: '医疗', shortEn: 'Medical', noun: '医疗器械', nounEn: 'medical devices', place: '江苏 · 常州', placeEn: 'Changzhou, CN', images: ['/assets/engineer-01.jpg', '/assets/robot-01.jpg', '/assets/chip-01.jpg', '/assets/engineer-01.jpg', '/assets/glass-03.jpg'] },
  automotive: { short: '汽车', shortEn: 'Automotive', noun: '汽车零部件', nounEn: 'auto parts', place: '湖北 · 武汉', placeEn: 'Wuhan, CN', images: ['/assets/glass-02.jpg', '/assets/factory-02.jpg', '/assets/metal-01.jpg', '/assets/glass-02.jpg', '/assets/factory-02.jpg'] },
};

interface StyleProfile {
  theme: string;
  themeAlt: string;
  hero: HeroKind;
  capability: 'rows' | 'grid' | 'sticky';
  product: 'cards' | 'index' | 'stage';
  accent: string;
}

const STYLE_PROFILE: Record<StyleId, StyleProfile> = {
  'industrial-editorial': { theme: 'hot-rolled', themeAlt: 'alloy', hero: 'video-scrub', capability: 'rows', product: 'index', accent: '重工' },
  'swiss-technical': { theme: 'lab-white', themeAlt: 'cleanroom', hero: 'split-editorial', capability: 'grid', product: 'index', accent: '标准' },
  'warm-craft': { theme: 'kraft-paper', themeAlt: 'washi', hero: 'image-collage', capability: 'rows', product: 'cards', accent: '手感' },
  'glass-luxe': { theme: 'molten-glass', themeAlt: 'architectural', hero: 'image-collage', capability: 'sticky', product: 'stage', accent: '光' },
  'kinetic-brutalist': { theme: 'kinetic', themeAlt: 'signal', hero: 'kinetic-type', capability: 'rows', product: 'cards', accent: '速度' },
  'dark-precision': { theme: 'foundry', themeAlt: 'graphite', hero: 'video-scrub', capability: 'sticky', product: 'stage', accent: '精度' },
  'american-workshop': { theme: 'cargo', themeAlt: 'hot-rolled', hero: 'split-editorial', capability: 'rows', product: 'cards', accent: '车间' },
  'german-technical': { theme: 'graphite', themeAlt: 'cleanroom', hero: 'split-editorial', capability: 'grid', product: 'index', accent: '规范' },
  'italian-editorial': { theme: 'atelier', themeAlt: 'molten-glass', hero: 'image-collage', capability: 'rows', product: 'stage', accent: '叙事' },
  'japanese-minimal': { theme: 'washi', themeAlt: 'lab-white', hero: 'product-stage', capability: 'rows', product: 'stage', accent: '留白' },
  'nordic-functional': { theme: 'fjord', themeAlt: 'cleanroom', hero: 'full-bleed', capability: 'grid', product: 'cards', accent: '功能' },
};

const HERO_ORDER: HeroKind[] = [
  'video-story',
  'video-scrub',
  'image-collage',
  'split-editorial',
  'full-bleed',
  'kinetic-type',
  'product-stage',
];

const STYLE_CODE: Record<StyleId, string> = {
  'industrial-editorial': 'IE',
  'swiss-technical': 'ST',
  'warm-craft': 'WC',
  'glass-luxe': 'GL',
  'kinetic-brutalist': 'KB',
  'dark-precision': 'DP',
  'american-workshop': 'AW',
  'german-technical': 'GT',
  'italian-editorial': 'IT',
  'japanese-minimal': 'JM',
  'nordic-functional': 'NF',
};

function heroTitle(copy: Copy, edition: number, global: boolean): string {
  if (global) {
    return [
      `${copy.nounEn}, made to hold a tolerance.`,
      `The ${copy.shortEn.toLowerCase()} floor, edited.`,
      `Built for the ${copy.shortEn.toLowerCase()} standard.`,
      `From drawing to a repeatable part.`,
      `${copy.nounEn}, without the noise.`,
    ][edition];
  }
  return [
    `${copy.noun}，\n把公差守住。`,
    `${copy.short}这一行，\n值得一套好叙事。`,
    `从一张图纸，\n到一件可复制的成品。`,
    `${copy.noun}的下一道工序。`,
    `把${copy.short}的标准，\n做成日常。`,
  ][edition];
}

function metricItems(global: boolean): Metric[] {
  return global
    ? [
        { value: '0.01 mm', label: 'working tolerance', note: 'verified per lot' },
        { value: '48 h', label: 'quote turnaround', note: 'drawing to answer' },
        { value: '99.2%', label: 'on-time delivery', note: 'rolling 12 months' },
        { value: '20 yr', label: 'field life', note: 'serviceable design' },
      ]
    : [
        { value: '0.01 mm', label: '工作公差', note: '批次可追溯' },
        { value: '48 h', label: '报价响应', note: '图纸到答复' },
        { value: '99.2%', label: '准时交付', note: '滚动 12 个月' },
        { value: '20 年', label: '现场寿命', note: '可维护结构' },
      ];
}

function capabilityItems(copy: Copy, global: boolean): Capability[] {
  return global
    ? [
        { index: '01', title: 'Material & process', body: `We match the ${copy.nounEn} to the load case, not to a catalogue.` },
        { index: '02', title: 'Dimension & fit', body: `Every critical feature is measured and recorded before ${copy.nounEn} leaves the floor.` },
        { index: '03', title: 'Trace & handover', body: `Heat numbers, inspection files, and packing records travel with the ${copy.nounEn}.` },
      ]
    : [
        { index: '01', title: '材料与工艺', body: `按负载与工况选材，不为${copy.noun}套一个通用模板。` },
        { index: '02', title: '尺寸与配合', body: `关键尺寸逐件测量，${copy.noun}出厂前留下完整记录。` },
        { index: '03', title: '追溯与交接', body: `炉号、检验文件与包装记录，随${copy.noun}一起交付。` },
      ];
}

function productItems(copy: Copy, global: boolean): Product[] {
  return global
    ? [
        { id: 'p1', name: `${copy.shortEn} standard`, code: 'STD-01', spec: 'Repeatable series · drawing-controlled', image: copy.images[0], tags: ['standard', 'repeatable'] },
        { id: 'p2', name: `${copy.shortEn} custom`, code: 'CUS-02', spec: 'Made to drawing · small batch', image: copy.images[1], tags: ['custom', 'small batch'] },
        { id: 'p3', name: `${copy.shortEn} pilot`, code: 'PIL-03', spec: 'First article · process validation', image: copy.images[2], tags: ['pilot', 'validation'] },
      ]
    : [
        { id: 'p1', name: `${copy.short}标准系列`, code: 'STD-01', spec: '图纸控制 · 可重复生产', image: copy.images[0], tags: ['标准件', '可复制'] },
        { id: 'p2', name: `${copy.short}定制系列`, code: 'CUS-02', spec: '按图制造 · 小批量', image: copy.images[1], tags: ['定制', '小批量'] },
        { id: 'p3', name: `${copy.short}试制系列`, code: 'PIL-03', spec: '首件验证 · 工艺确认', image: copy.images[2], tags: ['试制', '验证'] },
      ];
}

function processItems(copy: Copy, global: boolean): ProcessStep[] {
  return global
    ? [
        { index: '01', title: 'Review', body: `Drawing, tolerance, and ${copy.nounEn} intent are checked before quoting.`, time: 'D1' },
        { index: '02', title: 'Plan', body: 'Process route, fixtures, and inspection points are fixed in one sheet.', time: 'D2' },
        { index: '03', title: 'Make', body: 'Machining and inspection run against the same revision.', time: 'D3–D8' },
        { index: '04', title: 'Ship', body: 'Parts, records, and packing list leave together.', time: 'D9' },
      ]
    : [
        { index: '01', title: '图纸评审', body: `先确认${copy.noun}的工况、公差与接口，再进入报价。`, time: 'D1' },
        { index: '02', title: '工艺排程', body: '路线、工装与检验点固定在同一张工艺卡上。', time: 'D2' },
        { index: '03', title: '加工与检验', body: '加工与检验始终对齐同一版图纸。', time: 'D3–D8' },
        { index: '04', title: '包装与交付', body: `${copy.noun}、记录与装箱单一起发出。`, time: 'D9' },
      ];
}

function buildSections(
  copy: Copy,
  style: StyleProfile,
  theme: Theme,
  edition: number,
  global: boolean,
  name: string,
): SiteSection[] {
  const heroKind = HERO_ORDER[(HERO_ORDER.indexOf(style.hero) + edition) % HERO_ORDER.length];
  const primary = global ? 'Request a quote' : '获取报价';
  const secondary = global ? 'See the range' : '查看产品';
  const image = (index: number) => copy.images[index % copy.images.length];
  const layouts = ['default', 'wide', 'split', 'narrow', 'stacked'] as const;
  const densities = ['balanced', 'compact', 'airy'] as const;
  const variation = (offset: number): SectionStyle => ({
    layout: layouts[(edition + offset) % layouts.length],
    density: densities[(edition + offset) % densities.length],
    align: edition % 5 === 3 ? 'center' : 'left',
    surface: edition % 5 === 2 ? 'surface' : 'none',
    ratio: '16:9',
    columns: edition % 2 === 0 ? 3 : 2,
    overlay: 'soft',
    motion: edition % 3 === 0 ? 'subtle' : 'rise',
  });

  return [
    {
      id: 'hero',
      type: 'hero',
      eyebrow: `${copy.shortEn} / ${style.accent} / EDITION ${edition + 1}`,
      title: heroTitle(copy, edition, global),
      body: global
        ? `A ${style.accent.toLowerCase()} treatment for ${copy.nounEn}. One system, five repeatable editions.`
        : `为${copy.noun}准备的一套${style.accent}叙事。同一套系统，五个可复制的版本。`,
      visible: true,
      tone: theme.dark ? 'dark' : 'light',
      heroKind,
      media: { src: image(edition), alt: `${copy.short} ${style.accent}` },
      collage: [0, 1, 2, 3].map((item) => ({ src: image(item + edition), alt: `${copy.short} ${item + 1}` })),
      primaryCta: primary,
      secondaryCta: secondary,
      location: global ? copy.placeEn : copy.place,
      scrollHint: global ? 'SCROLL TO READ THE LINE' : '向下滚动，进入产线',
      specRows: [
        { label: global ? 'MATERIAL' : '材料', value: global ? '42CrMo / 316L' : '42CrMo / 316L' },
        { label: global ? 'TOLERANCE' : '公差', value: '±0.008 mm' },
      ],
    },
    {
      id: 'metrics',
      type: 'metrics',
      eyebrow: global ? '01 / NUMBERS' : '01 / 数字凭证',
      title: global ? 'What the line can promise.' : '产线能承诺的，\n先写成数字。',
      visible: true,
      tone: theme.dark ? 'dark' : 'light',
      style: variation(1),
      items: metricItems(global),
    },
    {
      id: 'capabilities',
      type: 'capabilities',
      eyebrow: global ? '02 / CAPABILITY' : '02 / 能力矩阵',
      title: global ? 'Three things we refuse to hand-wave.' : '有三件事，\n不靠口头保证。',
      visible: true,
      tone: theme.dark ? 'dark' : 'light',
      style: variation(2),
      variant: style.capability,
      items: capabilityItems(copy, global),
    },
    {
      id: 'products',
      type: 'products',
      eyebrow: global ? '03 / PARTS' : '03 / 产品系列',
      title: global ? 'A small, legible range.' : '系列不多，\n每一类都能说清。',
      visible: true,
      tone: theme.dark ? 'dark' : 'light',
      style: variation(3),
      variant: style.product,
      items: productItems(copy, global),
    },
    {
      id: 'process',
      type: 'process',
      eyebrow: global ? '04 / PROCESS' : '04 / 交付流程',
      title: global ? 'From drawing to a repeatable handover.' : '从一张图纸，\n到一次可复制的交付。',
      visible: true,
      tone: theme.dark ? 'dark' : 'light',
      style: variation(4),
      items: processItems(copy, global),
    },
    {
      id: 'proof',
      type: 'proof',
      eyebrow: global ? '05 / FIELD NOTES' : '05 / 客户证言',
      title: global ? 'Trust is a record, not a slogan.' : '信任不是口号，\n是一份可查的记录。',
      visible: true,
      tone: theme.dark ? 'dark' : 'accent',
      style: variation(0),
      quote: global
        ? `The ${copy.nounEn} arrived with the records already in order. That is the whole product.`
        : `${copy.noun}到场时，记录已经齐了。这才是完整的产品。`,
      author: global ? 'A. Buyer' : '采购负责人',
      role: global ? 'Operations / repeat order' : '制造企业 / 复购客户',
      stats: metricItems(global).slice(0, 3),
      clients: global ? ['NORTHLINE', 'KISO', 'MERIDIAN', 'OSLO'] : ['华北制造', '东南精工', '中部装备', '沿海项目'],
    },
    {
      id: 'cta',
      type: 'cta',
      eyebrow: global ? 'START A PROJECT' : '开始一个项目',
      title: global ? 'Send the drawing. We will answer with a plan.' : '把图纸发来，\n我们回一份可制造的答案。',
      visible: true,
      tone: 'accent',
      headline: global ? 'Send the drawing.\nWe will answer with a plan.' : '把图纸发来，\n我们回一份可制造的答案。',
      body: global ? 'A real process route, a tolerance check, and a quote — not a brochure.' : '真实的工艺路线、公差判断与报价，不是一份宣传册。',
      primaryCta: primary,
      secondaryCta: secondary,
      media: { src: image(edition + 2), alt: `${copy.short} project` },
    },
    {
      id: 'footer',
      type: 'footer',
      eyebrow: 'FOOTER',
      title: name,
      visible: true,
      tone: 'dark',
      note: global ? `${copy.shortEn} / ${style.accent} — one of five editions in the GANTRY catalogue.` : `${copy.short} / ${style.accent} — GANTRY 目录中的五个版本之一。`,
      columns: [
        { title: global ? 'PARTS' : '产品', links: global ? ['Standard', 'Custom', 'Pilot'] : ['标准系列', '定制系列', '试制系列'] },
        { title: global ? 'PROCESS' : '流程', links: global ? ['Review', 'Plan', 'Inspection'] : ['图纸评审', '工艺排程', '加工检验'] },
        { title: global ? 'COMPANY' : '公司', links: global ? ['About', 'Quality', 'Contact'] : ['关于', '质量体系', '联系我们'] },
      ],
      legal: global ? `© 2026 ${name}. ALL RIGHTS RESERVED.` : `© 2026 ${name}。保留所有权利。`,
    },
  ];
}

export function buildCatalogue(curated: TemplateDefinition[]): TemplateDefinition[] {
  const result: TemplateDefinition[] = [...curated];
  const themeList = Object.keys(THEME_BY_ID);

  for (const industry of INDUSTRIES) {
    const copy = COPY[industry.id];
    for (const style of STYLES) {
      const styleIndex = STYLES.findIndex((item) => item.id === style.id);
      const profile = STYLE_PROFILE[style.id];
      const existing = curated.filter(
        (template) => template.industry === industry.id && template.style === style.id,
      );
      const need = Math.max(0, 5 - existing.length);
      for (let edition = 0; edition < need; edition += 1) {
        const variant = (existing.length + edition) % 5;
        const themeId =
          edition % 3 === 0
            ? profile.theme
            : edition % 3 === 1
              ? profile.themeAlt ?? themeList[(styleIndex + 3) % themeList.length]
              : themeList[(styleIndex * 2 + 5) % themeList.length];
        const theme = cloneTheme(THEME_BY_ID[themeId] ?? THEME_BY_ID['hot-rolled']);
        const market: MarketId = edition % 5 < 3 ? 'cn' : 'global';
        const global = market === 'global';
        const code = `${industry.code}-${STYLE_CODE[style.id]}-${String(variant + 1).padStart(2, '0')}`;
        const name = global
          ? `${copy.shortEn} ${style.labelEn} — Edition ${variant + 1}`
          : `${copy.short}${style.label} · 第 ${variant + 1} 版`;
        const nameEn = `${copy.shortEn} / ${style.labelEn} / 0${variant + 1}`;
        result.push({
          id: `gen-${industry.id}-${style.id}-${variant + 1}`,
          code,
          name,
          nameEn,
          market,
          industry: industry.id,
          style: style.id,
          heroKind: HERO_ORDER[(HERO_ORDER.indexOf(profile.hero) + variant) % HERO_ORDER.length],
          summary: global
            ? `${copy.shortEn} with a ${style.labelEn.toLowerCase()} treatment. Edition ${variant + 1} of five.`
            : `${copy.short}的${style.label}表达。第 ${variant + 1} / 5 版。`,
          tags: [style.label, copy.short, '5×覆盖'],
          theme,
          cover: {
            image: copy.images[(variant + styleIndex * 2) % copy.images.length],
            secondary: copy.images[(variant + styleIndex * 2 + 2) % copy.images.length],
            accentWord: profile.accent,
          },
          sections: buildSections(copy, profile, theme, variant, global, name),
        });
      }
    }
  }

  const generated = result.slice(curated.length);
  const merged: TemplateDefinition[] = [];
  let generatedIndex = 0;
  curated.forEach((template, index) => {
    merged.push(template);
    if (index % 2 === 1 && generatedIndex < generated.length) {
      merged.push(generated[generatedIndex]);
      generatedIndex += 1;
    }
  });
  for (; generatedIndex < generated.length; generatedIndex += 1) {
    merged.push(generated[generatedIndex]);
  }
  return merged;
}
