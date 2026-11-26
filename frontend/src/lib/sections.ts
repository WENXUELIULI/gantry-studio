import type {
  Capability,
  CtaSection,
  FooterSection,
  HeroKind,
  HeroSection,
  Metric,
  ProcessStep,
  Product,
  SectionType,
  SiteSection,
} from '../types/site';
import { uniqueSectionId } from './id';

const A = '/assets';

export interface SectionCreateOptions {
  heroKind?: HeroKind;
  variant?: string;
}

const metrics: Metric[] = [
  { value: '12', label: '年行业经验', note: 'Since 2014' },
  { value: '48h', label: '平均响应', note: '工作日' },
  { value: '96%', label: '准时交付', note: '2025 年度' },
  { value: '50+', label: '合作客户', note: '全球' },
];

const capabilities: Capability[] = [
  { index: '01', title: '工程能力', body: '从需求到可制造的结构，先把问题拆清楚。' },
  { index: '02', title: '质量体系', body: '关键尺寸全检，过程数据可追溯。' },
  { index: '03', title: '交付网络', body: '区域仓与柔性产线，支持小批量快反。' },
];

const products: Product[] = [
  { id: 'new-p1', name: '产品系列 01', code: 'PRD-01', spec: '规格 / 材质 / 交期', image: `${A}/metal-01.jpg`, tags: ['标准品'] },
  { id: 'new-p2', name: '产品系列 02', code: 'PRD-02', spec: '规格 / 材质 / 交期', image: `${A}/pipes-01.jpg`, tags: ['定制'] },
  { id: 'new-p3', name: '产品系列 03', code: 'PRD-03', spec: '规格 / 材质 / 交期', image: `${A}/glass-01.jpg`, tags: ['工程'] },
  { id: 'new-p4', name: '产品系列 04', code: 'PRD-04', spec: '规格 / 材质 / 交期', image: `${A}/factory-01.jpg`, tags: ['批量'] },
];

const process: ProcessStep[] = [
  { index: '01', title: '需求评审', body: '确认工况、接口与验收标准。', time: 'D1' },
  { index: '02', title: '方案与打样', body: '给出可制造方案，完成首件确认。', time: 'D2–D5' },
  { index: '03', title: '批量交付', body: '按节拍生产，关键尺寸全检。', time: 'D6–D20' },
  { index: '04', title: '服务闭环', body: '交付后跟踪，问题 48 小时闭环。', time: 'Ongoing' },
];

export function createSection(
  type: SectionType,
  existing: { id: string }[],
  options: SectionCreateOptions = {},
): SiteSection {
  const id = uniqueSectionId(type, existing);

  const capabilitiesVariant =
    options.variant === 'grid' || options.variant === 'sticky'
      ? options.variant
      : 'rows';
  const productsVariant =
    options.variant === 'index' || options.variant === 'stage'
      ? options.variant
      : 'cards';

  switch (type) {
    case 'hero': {
      const heroKind = options.heroKind ?? 'split-editorial';
      const isFilm = heroKind === 'video-scrub' || heroKind === 'video-story';
      const hero: HeroSection = {
        id,
        type: 'hero',
        visible: true,
        eyebrow: 'NEW SITE / 2026',
        title: '复杂产品，\n讲清楚。',
        body: '从一个空白页开始，把首屏、区块和内容搭成你的官网。',
        tone: 'light',
        heroKind,
        media: isFilm
          ? { src: `${A}/truss-loop.webm`, alt: '工业影片', kind: 'video' }
          : { src: `${A}/factory-01.jpg`, alt: '工业产线' },
        collage: [
          { src: `${A}/factory-01.jpg`, alt: '焊接产线' },
          { src: `${A}/metal-01.jpg`, alt: '金属加工' },
          { src: `${A}/engineer-01.jpg`, alt: '工程师' },
          { src: `${A}/pipes-01.jpg`, alt: '管路' },
        ],
        videoPlayback: isFilm ? 'scrub' : undefined,
        primaryCta: '开始合作',
        secondaryCta: '查看产品',
        location: '中国 · 制造现场',
        scrollHint: '向下滚动',
        specRows: [
          { label: 'EST.', value: '2014' },
          { label: 'CAPACITY', value: '24/7' },
          { label: 'STANDARD', value: 'ISO 9001' },
        ],
      };
      return hero;
    }
    case 'metrics':
      return {
        id,
        type: 'metrics',
        visible: true,
        eyebrow: '01 / PROOF IN NUMBERS',
        title: '把承诺，\n写成数字。',
        body: '删掉形容词，留下可以被验证的指标。',
        items: metrics,
      };
    case 'capabilities':
      return {
        id,
        type: 'capabilities',
        visible: true,
        eyebrow: '02 / CAPABILITY',
        title: '我们做的，\n不止一道工序。',
        body: '把能力拆成可解释的模块，让采购和技术都能看懂。',
        items: capabilities,
        variant: capabilitiesVariant,
      };
    case 'products':
      return {
        id,
        type: 'products',
        visible: true,
        eyebrow: '03 / PRODUCT INDEX',
        title: '产品，\n按工况选。',
        body: '不堆 SKU，先讲清楚每一类产品解决什么问题。',
        items: products,
        variant: productsVariant,
      };
    case 'process':
      return {
        id,
        type: 'process',
        visible: true,
        eyebrow: '04 / PROCESS',
        title: '一次交付，\n四个节点。',
        body: '每一步都有负责人和时间戳。',
        items: process,
      };
    case 'proof':
      return {
        id,
        type: 'proof',
        visible: true,
        eyebrow: '05 / FIELD NOTE',
        title: '被验证过的，\n才叫口碑。',
        quote: '把客户的原话放上来。真实的数字与细节，比任何形容词都有用。',
        author: '客户姓名',
        role: '职位 / 公司',
        stats: [
          { value: '3y', label: '合作年限' },
          { value: '0', label: '质量事故' },
          { value: '48h', label: '响应时间' },
        ],
        clients: ['客户 A', '客户 B', '客户 C', '客户 D'],
      };
    case 'cta': {
      const cta: CtaSection = {
        id,
        type: 'cta',
        visible: true,
        eyebrow: '06 / NEXT STEP',
        title: '把需求发来，\n先拿一个可执行的方案。',
        body: '不需要完整需求文档，先把工况和目标说清楚。',
        headline: '把需求发来，\n先拿一个可执行的方案。',
        primaryCta: '发起询价',
        secondaryCta: '预约沟通',
      };
      return cta;
    }
    case 'footer': {
      const footer: FooterSection = {
        id,
        type: 'footer',
        visible: true,
        eyebrow: 'NEW SITE',
        title: '你的公司',
        note: '一句话说明你做什么',
        columns: [
          { title: '产品', links: ['产品 01', '产品 02', '产品 03'] },
          { title: '公司', links: ['关于我们', '质量体系', '联系'] },
          { title: '联系', links: ['+86 000 0000 0000', 'hello@example.com', '中国'] },
        ],
        legal: '© 2026 YOUR COMPANY. ALL RIGHTS RESERVED.',
      };
      return footer;
    }
  }
}
