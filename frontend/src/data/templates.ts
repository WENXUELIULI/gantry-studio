import type {
  Capability,
  HeroSection,
  IndustryId,
  Metric,
  ProcessStep,
  Product,
  StyleId,
  TemplateDefinition,
  Theme,
} from '../types/site';
import { THEME_BY_ID } from './themes';
import { GLOBAL_TEMPLATES } from './globalTemplates';
import { EXTRA_TEMPLATES } from './extraTemplates';
import { buildCatalogue } from './generatedTemplates';

const A = '/assets';

function theme(id: string): Theme {
  const found = THEME_BY_ID[id];
  if (!found) throw new Error(`Unknown theme: ${id}`);
  return found;
}

const hero = (data: Omit<HeroSection, 'id' | 'type' | 'visible'>): HeroSection => ({
  id: 'hero',
  type: 'hero',
  visible: true,
  ...data,
});

const factoryMetrics: Metric[] = [
  { value: '0.008', label: '重复定位精度', note: 'mm / 三坐标实测' },
  { value: '48h', label: '样件交付', note: '常规材料 · 工作日' },
  { value: '12y', label: '连续运行验证', note: '矿山与风电场景' },
  { value: '96.4%', label: '一次交检合格率', note: '2025 年度均值' },
];

const factoryCapabilities: Capability[] = [
  { index: '01', title: '五轴联动加工', body: '叶轮、阀体与异形壳体一次装夹成型，减少重复定位带来的累积误差。' },
  { index: '02', title: '热处理与表面工程', body: '调质、渗碳、氮化与激光熔覆，按工况匹配硬度与韧性，而不是只交一张硬度报告。' },
  { index: '03', title: '在线测量与追溯', body: '每件产品绑定炉号、刀具与测量记录。扫码即可回到它被加工的那个时刻。' },
];

const factoryProducts: Product[] = [
  { id: 'p1', name: '行星减速器壳体', code: 'TRS-HX 220', spec: '42CrMo / ±0.008 mm / 72 小时', image: `${A}/metal-01.jpg`, tags: ['工程机械', '小批量'] },
  { id: 'p2', name: '重载传动轴', code: 'TRS-SH 480', spec: '40CrNiMoA / 渗碳 58HRC / 8t', image: `${A}/pipes-01.jpg`, tags: ['风电', '重载'] },
  { id: 'p3', name: '精密阀体', code: 'TRS-VB 016', spec: '316L / 0.4μm 表面 / 100% 探伤', image: `${A}/engineer-01.jpg`, tags: ['流体', '洁净'] },
  { id: 'p4', name: '定制齿轮组', code: 'TRS-GR 032', spec: '20CrMnTi / DIN 6 级 / 配对交付', image: `${A}/factory-01.jpg`, tags: ['自动化', '配对'] },
];

const factoryProcess: ProcessStep[] = [
  { index: '01', title: '拆图与 DFM', body: '工程师先看工况，再看图纸。能改的结构，绝不留给加工硬扛。', time: 'D1–D2' },
  { index: '02', title: '样件试制', body: '五轴样件 + 首件检测报告，确认公差、材料与表面处理。', time: 'D3–D5' },
  { index: '03', title: '批量与检测', body: 'SPC 过程控制，关键尺寸全检，炉号与刀补记录同步归档。', time: 'D6–D20' },
  { index: '04', title: '交付与追溯', body: '按工位分箱，附材质书、检测报告与扫码追溯入口。', time: 'D21' },
];

const trustMetrics: Metric[] = [
  { value: '17', label: '道火抛工序', note: '每一只器皿' },
  { value: '580°C', label: '退火温差', note: '≤ ±3°C' },
  { value: '0.3%', label: '光学畸变', note: '干涉仪抽检' },
  { value: '42', label: '合作品牌', note: '餐饮 / 照明 / 建筑' },
];

const trustCapabilities: Capability[] = [
  { index: '01', title: '手工吹制', body: '保留气泡与轻微不对称。每一只都不同，但每一批都在公差之内。' },
  { index: '02', title: '精密模压', body: '高硼硅 3.3 模压成型，壁厚差控制在 0.4 mm 内，适合规模化订单。' },
  { index: '03', title: '光学检测', body: '偏振光与激光干涉双重检测，把应力、畸变与壁厚变成可读报告。' },
];

const trustProducts: Product[] = [
  { id: 'p1', name: '高硼硅耐热器皿', code: 'VTR-HB 01', spec: '耐 -20–150°C / 手工吹制 / 可洗碗机', image: `${A}/glassware-01.jpg`, tags: ['餐饮', '耐热'] },
  { id: 'p2', name: '光学级玻璃棒', code: 'VTR-OP 07', spec: '透过率 92% / 直径 4–40 mm / 可切割', image: `${A}/glassware-02.jpg`, tags: ['照明', '光学'] },
  { id: 'p3', name: '建筑夹胶玻璃', code: 'VTR-AR 12', spec: '超白 / PVB 1.52 / 最大 3.6 × 12 m', image: `${A}/glass-01.jpg`, tags: ['建筑', '幕墙'] },
  { id: 'p4', name: '定制灯罩', code: 'VTR-LP 03', spec: '吹制 / 磨砂 / 暖光扩散 85%', image: `${A}/glass-03.jpg`, tags: ['照明', '定制'] },
];

const DOMESTIC_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'truss-precision',
    market: 'cn',
    code: 'TRS-01',
    name: '桁架精工',
    nameEn: 'TRUSS PRECISION',
    industry: 'machinery',
    style: 'industrial-editorial',
    heroKind: 'video-scrub',
    summary: '把 0.01 mm 的精度，做成可以滚动观看的产线叙事。',
    tags: ['视频滚动', '重工业', '参数可视化'],
    theme: theme('hot-rolled'),
    cover: { image: `${A}/factory-01.jpg`, secondary: `${A}/metal-01.jpg`, accentWord: 'PRECISION' },
    sections: [
      hero({
        heroKind: 'video-scrub',
        tone: 'dark',
        eyebrow: 'TRUSS PRECISION / EST. 2012',
        title: '0.01 mm\n决定一台设备的寿命',
        body: '为工程机械、能源装备与自动化产线提供高精度传动零件。从一张图纸，到一万件一致。',
        primaryCta: '索取报价',
        secondaryCta: '查看产品',
        location: '河北 · 沧州 / 38.3°N 116.8°E',
        scrollHint: '向下滚动，拆解精度',
        media: { src: `${A}/truss-loop.webm`, alt: '焊接产线与飞溅的火花', caption: 'TRUSS WORKS / LINE 04' },
        collage: [
          { src: `${A}/factory-01.jpg`, alt: '焊接火花' },
          { src: `${A}/metal-01.jpg`, alt: '车床加工' },
          { src: `${A}/engineer-01.jpg`, alt: '车间工程师' },
          { src: `${A}/pipes-01.jpg`, alt: '不锈钢管路' },
        ],
        specRows: [
          { label: 'MATERIAL', value: '42CrMo' },
          { label: 'TOLERANCE', value: '±0.008 mm' },
          { label: 'BATCH', value: '1–10,000' },
        ],
      }),
      {
        id: 'metrics', type: 'metrics', visible: true,
        eyebrow: '01 / PROOF IN NUMBERS',
        title: '把承诺，\n写成可测量的数字。',
        body: '精度不是形容词。它应该出现在检测报告、节拍与交付记录里。',
        items: factoryMetrics,
      },
      {
        id: 'capabilities', type: 'capabilities', visible: true,
        eyebrow: '02 / CAPABILITY',
        title: '不是加工，\n是让每一件都可解释。',
        body: '从材料到刀补，每个决定都留下记录。',
        items: factoryCapabilities, variant: 'rows',
      },
      {
        id: 'products', type: 'products', visible: true,
        eyebrow: '03 / PRODUCT INDEX',
        title: '四个系列，\n覆盖从样件到量产。',
        body: '没有标准品录。按工况选型，按图纸交付。',
        items: factoryProducts, variant: 'cards',
      },
      {
        id: 'process', type: 'process', visible: true,
        eyebrow: '04 / PROCESS',
        title: '一张图纸的旅程。',
        body: '从 DFM 到扫码追溯，每一步都能被叫停。',
        items: factoryProcess,
      },
      {
        id: 'proof', type: 'proof', visible: true,
        eyebrow: '05 / FIELD NOTE',
        title: '被产线验证过的，\n才叫精度。',
        quote: '他们不是最便宜的，但第一批样件就把我们的装配间隙问题解决了。现在这条线跑了三年，没因为他们的零件停过机。',
        author: '周工', role: '工艺总工 / 某工程机械集团',
        stats: [{ value: '3y', label: '连续供货' }, { value: '0', label: '非计划停机' }, { value: '2 天', label: '问题闭环' }],
        clients: ['徐工基础', '三一重能', '中车传动', 'Nordex'],
      },
      {
        id: 'cta', type: 'cta', visible: true,
        eyebrow: '06 / NEXT STEP',
        title: '把图纸发来，\n48 小时给你一个可制造的答案。',
        body: '上传 STEP / DWG，或直接描述工况。工程师会回复一份 DFM 建议与报价区间。',
        headline: '把图纸发来，\n48 小时给你一个可制造的答案。',
        primaryCta: '上传图纸', secondaryCta: '预约工艺评审',
      },
      {
        id: 'footer', type: 'footer', visible: true,
        eyebrow: 'TRUSS PRECISION', title: 'TRUSS 桁架精工', note: '高精度传动零件 · 河北沧州',
        columns: [
          { title: '产品', links: ['减速器壳体', '传动轴', '阀体', '齿轮组'] },
          { title: '公司', links: ['关于桁架', '质量体系', '设备清单', '加入我们'] },
          { title: '联系', links: ['+86 317 000 0000', 'rfq@truss.example', '沧州经济开发区'] },
        ],
        legal: '© 2026 TRUSS PRECISION CO., LTD. 冀ICP备00000000号',
      },
    ],
  },
  {
    id: 'vitra-glass',
    market: 'cn', code: 'VTR-02', name: '熔光玻璃', nameEn: 'VITRA MOLTEN LIGHT',
    industry: 'glass', style: 'glass-luxe', heroKind: 'image-collage',
    summary: '四张玻璃影像随页面高度重排，把折射与火抛做成叙事。',
    tags: ['图片拼贴', '玻璃器皿', '材质叙事'], theme: theme('molten-glass'),
    cover: { image: `${A}/glassware-01.jpg`, secondary: `${A}/glass-03.jpg`, accentWord: 'LIGHT' },
    sections: [
      hero({
        heroKind: 'image-collage', tone: 'dark',
        eyebrow: 'VITRA GLASS / HAND & MOLD',
        title: '把光，\n做成可触摸的器皿。',
        body: '高硼硅玻璃，在手工吹制与精密模压之间。为餐桌、照明与建筑，保留一次折射。',
        primaryCta: '浏览器皿', secondaryCta: '预约打样',
        location: '浙江 · 浦江 / 29.4°N 119.9°E', scrollHint: '滚动，观看光的重组',
        media: { src: `${A}/glassware-01.jpg`, alt: '薄荷青柠玻璃杯' },
        collage: [
          { src: `${A}/glassware-01.jpg`, alt: '薄荷青柠玻璃杯', caption: 'HB-01 / 耐热器皿' },
          { src: `${A}/glassware-02.jpg`, alt: '室内玻璃花瓶', caption: 'LP-03 / 柔光花瓶' },
          { src: `${A}/glass-01.jpg`, alt: '玻璃幕墙建筑', caption: 'AR-12 / 建筑夹胶' },
          { src: `${A}/glass-03.jpg`, alt: '仰视玻璃摩天楼', caption: 'AR-18 / 超白立面' },
        ],
        specRows: [{ label: 'GLASS', value: 'BORO 3.3' }, { label: 'ANNEAL', value: '580°C' }, { label: 'TOLERANCE', value: '±0.4 mm' }],
      }),
      { id: 'metrics', type: 'metrics', visible: true, eyebrow: '01 / THE FIRE', title: '火候，\n是最早的参数。', body: '从配料到退火，一只器皿要经过 17 道工序。', items: trustMetrics },
      { id: 'capabilities', type: 'capabilities', visible: true, eyebrow: '02 / CRAFT', title: '手的判断，\n机器的重复。', body: '手工与模压不是对立，是两种不同的容差。', items: trustCapabilities, variant: 'grid' },
      { id: 'products', type: 'products', visible: true, eyebrow: '03 / COLLECTION', title: '透明的四种用法。', body: '餐桌、照明、建筑、定制。', items: trustProducts, variant: 'index' },
      {
        id: 'process', type: 'process', visible: true, eyebrow: '04 / FROM SAND', title: '从砂，到光。', body: '每一批都保留配料单与退火曲线。',
        items: [
          { index: '01', title: '配料', body: '石英砂、硼砂与纯碱按配方称量，铁含量控制在 0.02% 以下。', time: 'D1' },
          { index: '02', title: '熔融', body: '1580°C 连续熔窑，澄清与均化后进入供料道。', time: 'D2' },
          { index: '03', title: '成型', body: '手工吹制或模压成型，壁厚在线激光测量。', time: 'D2–D3' },
          { index: '04', title: '退火与检测', body: '580°C 退火，偏振光检查应力，激光干涉检查畸变。', time: 'D4' },
        ],
      },
      {
        id: 'proof', type: 'proof', visible: true, eyebrow: '05 / ON THE TABLE', title: '光落在桌上，\n客人先看见它。',
        quote: '我们把这款杯子放进了 12 家门店。它比普通玻璃杯轻，但更稳。客人会拿起来看底部，这就是我们想要的第一次接触。',
        author: '林岚', role: '品牌主理人 / 山下咖啡',
        stats: [{ value: '12', label: '门店在用' }, { value: '18%', label: '复购提升' }, { value: '0.3%', label: '破损率' }],
        clients: ['山下咖啡', 'MUJI HOTEL', 'Aesop', '杭州天目里'],
      },
      {
        id: 'cta', type: 'cta', visible: true, eyebrow: '06 / SAMPLE', title: '先看一只样品，\n再决定一批订单。', body: '提供 3 款标准样与 1 次定制打样。打样周期 7–10 天。',
        headline: '先看一只样品，\n再决定一批订单。', primaryCta: '申请样品', secondaryCta: '下载图册',
      },
      {
        id: 'footer', type: 'footer', visible: true, eyebrow: 'VITRA GLASS', title: 'VITRA 熔光', note: '高硼硅玻璃器皿 · 浙江浦江',
        columns: [
          { title: '系列', links: ['耐热器皿', '光学玻璃', '建筑夹胶', '定制灯罩'] },
          { title: '工艺', links: ['手工吹制', '精密模压', '火抛', '退火'] },
          { title: '联系', links: ['+86 579 000 0000', 'hello@vitra.example', '浦江水晶产业园'] },
        ],
        legal: '© 2026 VITRA GLASS STUDIO. 浙ICP备00000000号',
      },
    ],
  },
  {
    id: 'cargo-industrial',
    market: 'cn', code: 'CRG-03', name: '货运工业', nameEn: 'CARGO INDUSTRIAL',
    industry: 'commodity', style: 'warm-craft', heroKind: 'split-editorial',
    summary: '把最普通的工业耗材，讲成一次体面的交付。',
    tags: ['分栏社论', '工业商品', '暖色'], theme: theme('kraft-paper'),
    cover: { image: `${A}/warehouse-01.jpg`, secondary: `${A}/industrial-01.jpg`, accentWord: 'CARGO' },
    sections: [
      hero({
        heroKind: 'split-editorial', tone: 'light', eyebrow: 'CARGO SUPPLY / SINCE 2014',
        title: '工业耗材，\n也值得被认真对待。',
        body: '纸箱、托盘、缓冲内衬。看起来最普通的环节，决定一次交付的体面。',
        primaryCta: '获取选型表', secondaryCta: '查看案例',
        location: '广东 · 东莞 / 23.0°N 113.7°E', scrollHint: '向下，看看一次交付的全貌',
        media: { src: `${A}/warehouse-01.jpg`, alt: '仓储货架与纸箱' },
        collage: [
          { src: `${A}/warehouse-01.jpg`, alt: '仓储货架' },
          { src: `${A}/industrial-01.jpg`, alt: '物流卡车' },
          { src: `${A}/factory-02.jpg`, alt: '成排商品' },
        ],
        specRows: [{ label: 'SKU', value: '6,000+' }, { label: 'LEAD TIME', value: '72h' }, { label: 'COVERAGE', value: '全国 28 仓' }],
      }),
      {
        id: 'metrics', type: 'metrics', visible: true, eyebrow: '01 / OPERATIONS', title: '把琐碎，\n变成可预期的日常。', body: '从一张采购单到最后一公里，所有节点都可查。',
        items: [
          { value: '72h', label: '打样交付', note: '结构样 / 印刷样' },
          { value: '98.7%', label: '准时交付率', note: '2025 年度' },
          { value: '6,000+', label: '常备 SKU', note: '纸 / 塑 / 木' },
          { value: '28', label: '区域仓', note: '全国履约' },
        ],
      },
      {
        id: 'capabilities', type: 'capabilities', visible: true, eyebrow: '02 / WHY US', title: '不是卖箱子，\n是解决一次运输。', body: '结构、材料、库存与履约，放在同一张桌上讨论。',
        items: [
          { index: '01', title: '结构设计', body: '按跌落、堆码与运输方式做结构，不靠加厚解决所有问题。' },
          { index: '02', title: '材料库', body: '瓦楞、蜂窝、EPE、EVA 与防静电材料，按成本与保护级别组合。' },
          { index: '03', title: '全国履约', body: '28 个区域仓，支持一件代发与批量 JIT 补货。' },
        ], variant: 'rows',
      },
      {
        id: 'products', type: 'products', visible: true, eyebrow: '03 / CATALOG', title: '四类常备，\n也能全部定制。', body: '标准品当天出库，定制结构 72 小时打样。',
        items: [
          { id: 'p1', name: '重型瓦楞箱', code: 'CRG-BC 07', spec: '七层 / 耐破 3,200 kPa / 可印刷', image: `${A}/warehouse-01.jpg`, tags: ['重货', '出口'] },
          { id: 'p2', name: '防静电托盘', code: 'CRG-EP 02', spec: '表面电阻 10⁶–10⁹ Ω / 1160×1160', image: `${A}/industrial-01.jpg`, tags: ['电子', '周转'] },
          { id: 'p3', name: '蜂窝缓冲内衬', code: 'CRG-HC 11', spec: '纸蜂窝 / 可回收 / 异形模切', image: `${A}/factory-02.jpg`, tags: ['精密', '环保'] },
          { id: 'p4', name: '循环周转箱', code: 'CRG-RB 04', spec: 'PP 中空板 / 折叠 / 50 次循环', image: `${A}/warehouse-01.jpg`, tags: ['循环', '降本'] },
        ], variant: 'cards',
      },
      {
        id: 'process', type: 'process', visible: true, eyebrow: '04 / HOW IT MOVES', title: '一次交付，四个节点。', body: '每一步都有负责人和时间戳。',
        items: [
          { index: '01', title: '选型', body: '输入尺寸、重量与运输方式，系统给出 3 套结构建议。', time: 'D1' },
          { index: '02', title: '打样', body: '结构样与印刷样分开发，确认后再锁版。', time: 'D2–D4' },
          { index: '03', title: '生产', body: '就近工厂排产，印刷与模切在同一园区完成。', time: 'D5–D12' },
          { index: '04', title: '履约', body: '按门店/工位分箱，贴标后直发。', time: 'D13–D15' },
        ],
      },
      {
        id: 'proof', type: 'proof', visible: true, eyebrow: '05 / CUSTOMER', title: '包装不出错，\n前端才敢卖。',
        quote: '他们把我们的破损率从 1.8% 压到 0.4%，还顺手把仓库的 SKU 从 47 个减到 19 个。采购终于不用每周追着补货了。',
        author: '陈立', role: '供应链总监 / 某家居品牌',
        stats: [{ value: '0.4%', label: '破损率' }, { value: '-59%', label: 'SKU 数量' }, { value: '28 仓', label: '覆盖' }],
        clients: ['林氏家居', '大疆创新', '安克', 'SHEIN'],
      },
      {
        id: 'cta', type: 'cta', visible: true, eyebrow: '06 / GET A QUOTE', title: '把尺寸和重量发来，\n今天给你三套方案。', body: '支持一件代发、批量 JIT 与出口唛头。',
        headline: '把尺寸和重量发来，\n今天给你三套方案。', primaryCta: '获取报价', secondaryCta: '下载产品册',
      },
      {
        id: 'footer', type: 'footer', visible: true, eyebrow: 'CARGO SUPPLY', title: 'CARGO 货运工业', note: '工业包装与耗材 · 广东东莞',
        columns: [
          { title: '产品', links: ['瓦楞箱', '防静电托盘', '蜂窝内衬', '周转箱'] },
          { title: '服务', links: ['结构设计', '一件代发', 'JIT 补货', '出口包装'] },
          { title: '联系', links: ['+86 769 000 0000', 'sales@cargo.example', '东莞厚街工业区'] },
        ], legal: '© 2026 CARGO SUPPLY CO., LTD. 粤ICP备00000000号',
      },
    ],
  },
  {
    id: 'substrate-semi',
    market: 'cn', code: 'SUB-04', name: '基底半导体', nameEn: 'SUBSTRATE SEMI',
    industry: 'semiconductor', style: 'dark-precision', heroKind: 'product-stage',
    summary: '把 3 纳米的冷静，做成一张会呼吸的技术海报。',
    tags: ['产品舞台', '半导体', '暗色精密'], theme: theme('cleanroom'),
    cover: { image: `${A}/chip-01.jpg`, secondary: `${A}/engineer-02.jpg`, accentWord: '3 NANOMETER' },
    sections: [
      hero({
        heroKind: 'product-stage', tone: 'dark', eyebrow: 'SUBSTRATE SEMI / ADVANCED PACKAGING',
        title: '在 3 纳米的尺度上，\n保持绝对冷静。',
        body: '为先进封装与晶圆检测提供超纯管路、陶瓷部件与洁净室夹具。',
        primaryCta: '查看洁净方案', secondaryCta: '索取规格书',
        location: '上海 · 张江 / 31.2°N 121.6°E', scrollHint: '滚动，进入洁净室',
        media: { src: `${A}/chip-01.jpg`, alt: '深色电路板与芯片' },
        collage: [{ src: `${A}/chip-01.jpg`, alt: '芯片' }, { src: `${A}/engineer-02.jpg`, alt: '电路板维修' }],
        specRows: [{ label: 'NODE', value: '3 nm' }, { label: 'PARTICLE', value: '≤ 0.02 μm' }, { label: 'CLASS', value: 'ISO 14644-1' }],
      }),
      {
        id: 'metrics', type: 'metrics', visible: true, eyebrow: '01 / TOLERANCE', title: '越安静，\n越接近极限。', body: '在洁净室里，最小的变量决定良率。',
        items: [
          { value: '3nm', label: '制程节点', note: '先进封装' },
          { value: '99.9999%', label: '超纯气体', note: '6N 纯度' },
          { value: '0.02μm', label: '颗粒控制', note: '在线计数' },
          { value: '24/7', label: '洁净装配', note: 'Class 100' },
        ],
      },
      {
        id: 'capabilities', type: 'capabilities', visible: true, eyebrow: '02 / CLEAN ENGINEERING', title: '把污染，\n挡在工艺之外。', body: '材料、表面与装配顺序，都是良率的一部分。',
        items: [
          { index: '01', title: '超纯表面', body: '电解抛光至 Ra 0.05 μm，减少颗粒附着与气体残留。' },
          { index: '02', title: '洁净装配', body: 'Class 100 洁净台装配，人员与工装双重颗粒管控。' },
          { index: '03', title: '计量追溯', body: '每批次附颗粒、泄漏与表面粗糙度报告。' },
        ], variant: 'grid',
      },
      {
        id: 'products', type: 'products', visible: true, eyebrow: '03 / COMPONENTS', title: '四个关键部件，\n一条洁净链路。', body: '从气体输送到晶圆搬运。',
        items: [
          { id: 'p1', name: '陶瓷静电吸盘', code: 'SUB-ESC 300', spec: 'Al₂O₃ / 300 mm / ±1 μm 平整度', image: `${A}/chip-01.jpg`, tags: ['晶圆', '陶瓷'] },
          { id: 'p2', name: '超纯管路', code: 'SUB-UP 316L', spec: 'EP 级 / Ra 0.05 / 6N 气体', image: `${A}/pipes-01.jpg`, tags: ['气体', '超纯'] },
          { id: 'p3', name: '晶圆载具', code: 'SUB-FOUP 25', spec: '25 片 / 低析出 PP / 可追溯', image: `${A}/engineer-02.jpg`, tags: ['搬运', '洁净'] },
          { id: 'p4', name: '洁净夹具', code: 'SUB-CF 08', spec: 'PEEK / 无金属摩擦 / 定制', image: `${A}/metal-01.jpg`, tags: ['装配', '定制'] },
        ], variant: 'index',
      },
      {
        id: 'process', type: 'process', visible: true, eyebrow: '04 / QUALIFICATION', title: '从图纸，到验证。', body: '每一步都在洁净边界内完成。',
        items: [
          { index: '01', title: '需求评审', body: '确认介质、温度、颗粒与真空兼容性。', time: 'D1–D2' },
          { index: '02', title: '洁净设计', body: 'DFM + 洁净度仿真，锁定材料与表面工艺。', time: 'D3–D6' },
          { index: '03', title: '洁净装配', body: 'Class 100 环境装配，在线颗粒监测。', time: 'D7–D12' },
          { index: '04', title: '验证交付', body: '氦检、颗粒、粗糙度与出气报告随货。', time: 'D13–D15' },
        ],
      },
      {
        id: 'proof', type: 'proof', visible: true, eyebrow: '05 / FAB NOTE', title: '良率，\n不会说谎。',
        quote: '替换他们的超纯管路后，我们的一台刻蚀机连续跑了 11 个月没有因为颗粒报警停机。对 Fab 来说，这就是最有说服力的销售。',
        author: '王博士', role: '设备工程师 / 12 英寸晶圆厂',
        stats: [{ value: '11m', label: '无颗粒停机' }, { value: '0.02μm', label: '在线颗粒' }, { value: '6N', label: '气体纯度' }],
        clients: ['中芯国际', '华虹', '长江存储', 'ASML'],
      },
      {
        id: 'cta', type: 'cta', visible: true, eyebrow: '06 / SPEC SHEET', title: '把工况发来，\n我们回一份洁净规格。', body: '支持小批量验证与量产导入。',
        headline: '把工况发来，\n我们回一份洁净规格。', primaryCta: '索取规格书', secondaryCta: '预约洁净评审',
      },
      {
        id: 'footer', type: 'footer', visible: true, eyebrow: 'SUBSTRATE SEMI', title: 'SUBSTRATE 基底', note: '先进封装洁净部件 · 上海张江',
        columns: [
          { title: '产品', links: ['静电吸盘', '超纯管路', '晶圆载具', '洁净夹具'] },
          { title: '质量', links: ['颗粒控制', '氦检', '表面粗糙度', '出气测试'] },
          { title: '联系', links: ['+86 21 0000 0000', 'clean@substrate.example', '张江科学城'] },
        ], legal: '© 2026 SUBSTRATE SEMI CO., LTD. 沪ICP备00000000号',
      },
    ],
  },
  {
    id: 'grid-energy',
    market: 'cn', code: 'GRD-05', name: '并网能源', nameEn: 'GRID ENERGY',
    industry: 'energy', style: 'industrial-editorial', heroKind: 'full-bleed',
    summary: '用一张全幅电站影像，讲清楚一度电的来路。',
    tags: ['全幅影像', '新能源', '电站'], theme: theme('high-voltage'),
    cover: { image: `${A}/solar-01.jpg`, secondary: `${A}/wind-01.jpg`, accentWord: '2.4 GW' },
    sections: [
      hero({
        heroKind: 'full-bleed', tone: 'dark', eyebrow: 'GRID ENERGY / PV + STORAGE',
        title: '让每一度电，\n都有迹可循。',
        body: '从光伏支架到储能柜，为新能源电站提供结构、热管理与并网部件。',
        primaryCta: '查看电站案例', secondaryCta: '下载选型手册',
        location: '江苏 · 常州 / 31.8°N 119.9°E', scrollHint: '向下，进入电站',
        media: { src: `${A}/solar-01.jpg`, alt: '光伏电站' },
        collage: [{ src: `${A}/solar-01.jpg`, alt: '光伏板' }, { src: `${A}/wind-01.jpg`, alt: '风机' }],
        specRows: [{ label: 'CAPACITY', value: '2.4 GW' }, { label: 'WARRANTY', value: '25 years' }, { label: 'WIND LOAD', value: '0.65 kN/m²' }],
      }),
      {
        id: 'metrics', type: 'metrics', visible: true, eyebrow: '01 / PLANT DATA', title: '电站不看故事，\n只看曲线。', body: '发电量、可用率与衰减率，是唯一的口径。',
        items: [
          { value: '2.4GW', label: '累计装机', note: '38 个电站' },
          { value: '99.2%', label: '系统可用率', note: '2025 年度' },
          { value: '25y', label: '结构质保', note: '风载/雪载' },
          { value: '0.3%', label: '年衰减率', note: '首年 ≤ 2%' },
        ],
      },
      {
        id: 'capabilities', type: 'capabilities', visible: true, eyebrow: '02 / ENGINEERING', title: '从风载，\n到并网。', body: '结构、热与电气，三件事必须一起算。',
        items: [
          { index: '01', title: '结构仿真', body: '风载、雪载与地震工况耦合分析，输出可施工的节点。' },
          { index: '02', title: '热管理', body: '储能柜风道与液冷方案，按环境温度与倍率选型。' },
          { index: '03', title: '并网部件', body: '汇流箱、逆变器外壳与防雷接地，成套交付。' },
        ], variant: 'rows',
      },
      {
        id: 'products', type: 'products', visible: true, eyebrow: '03 / HARDWARE', title: '四个部件，\n撑起一座电站。', body: '从跟踪支架到储能柜。',
        items: [
          { id: 'p1', name: '跟踪支架', code: 'GRD-TR 21', spec: '双轴 / 0.65 kN/m² / 25 年', image: `${A}/solar-01.jpg`, tags: ['光伏', '结构'] },
          { id: 'p2', name: '储能柜', code: 'GRD-ES 372', spec: '372 kWh / 液冷 / IP55', image: `${A}/wind-01.jpg`, tags: ['储能', '液冷'] },
          { id: 'p3', name: '智能汇流箱', code: 'GRD-CB 16', spec: '16 路 / IP66 / 组串监测', image: `${A}/pipes-01.jpg`, tags: ['电气', '监测'] },
          { id: 'p4', name: '逆变器外壳', code: 'GRD-IN 05', spec: '压铸铝 / IP65 / 导热 2.1 W/mK', image: `${A}/metal-01.jpg`, tags: ['热管理', '压铸'] },
        ], variant: 'cards',
      },
      {
        id: 'process', type: 'process', visible: true, eyebrow: '04 / DELIVERY', title: '一座电站的 120 天。', body: '设计、供货、安装与并网，节点可查。',
        items: [
          { index: '01', title: '选址与仿真', body: '辐照、风载与地形数据建模。', time: 'D1–D15' },
          { index: '02', title: '结构设计', body: '支架排布、基础与节点出图。', time: 'D16–D35' },
          { index: '03', title: '供货', body: '按安装顺序分批发运，现场零二次倒运。', time: 'D36–D80' },
          { index: '04', title: '并网', body: '调试、涉网试验与运维移交。', time: 'D81–D120' },
        ],
      },
      {
        id: 'proof', type: 'proof', visible: true, eyebrow: '05 / SITE LOG', title: '发电曲线，\n比 PPT 更有说服力。',
        quote: '他们在 45 天里完成了 120 MW 的支架供货，现场没有因为缺件停过一天。并网后的首年可用率是 99.1%，比合同高。',
        author: '李工', role: '项目经理 / 某新能源投资集团',
        stats: [{ value: '120MW', label: '45 天供货' }, { value: '99.1%', label: '首年可用率' }, { value: '0', label: '缺件停工' }],
        clients: ['国家电投', '华能', '三峡能源', '晶科'],
      },
      {
        id: 'cta', type: 'cta', visible: true, eyebrow: '06 / NEW PROJECT', title: '有新的电站？\n先做一次风载仿真。', body: '提供项目地址、装机容量与并网时间，我们回一份初步方案。',
        headline: '有新的电站？\n先做一次风载仿真。', primaryCta: '提交项目', secondaryCta: '下载案例',
      },
      {
        id: 'footer', type: 'footer', visible: true, eyebrow: 'GRID ENERGY', title: 'GRID 并网能源', note: '光伏支架与储能部件 · 江苏常州',
        columns: [
          { title: '产品', links: ['跟踪支架', '储能柜', '汇流箱', '逆变器外壳'] },
          { title: '项目', links: ['集中式电站', '分布式', '储能', '运维'] },
          { title: '联系', links: ['+86 519 000 0000', 'project@grid.example', '常州武进高新区'] },
        ], legal: '© 2026 GRID ENERGY CO., LTD. 苏ICP备00000000号',
      },
    ],
  },
  {
    id: 'kinetic-robot',
    market: 'cn', code: 'KNT-06', name: '动能协作', nameEn: 'KINETIC ROBOTICS',
    industry: 'robotics', style: 'kinetic-brutalist', heroKind: 'kinetic-type',
    summary: '把协作机器人的速度，直接做成滚动的大字与撞色。',
    tags: ['动态字体', '机器人', '粗野主义'], theme: theme('kinetic'),
    cover: { image: `${A}/glass-02.jpg`, secondary: `${A}/robot-01.jpg`, accentWord: 'NO FENCE' },
    sections: [
      hero({
        heroKind: 'kinetic-type', tone: 'light', eyebrow: 'KINETIC ROBOTICS / COBOT 07',
        title: '协作，\n不必降速。',
        body: '七轴协作机器人，重复定位精度 ±0.02 mm。人机同线，不需要安全围栏。',
        primaryCta: '预约现场演示', secondaryCta: '查看技术参数',
        location: '广东 · 深圳 / 22.5°N 114.0°E', scrollHint: '滚动，让它动起来',
        media: { src: `${A}/glass-02.jpg`, alt: '汽车焊装机器人产线' },
        collage: [
          { src: `${A}/glass-02.jpg`, alt: '机器人产线' },
          { src: `${A}/robot-01.jpg`, alt: '工程师特写' },
          { src: `${A}/engineer-01.jpg`, alt: '车间工程师' },
        ],
        specRows: [{ label: 'AXES', value: '7' }, { label: 'REPEAT', value: '±0.02 mm' }, { label: 'PAYLOAD', value: '12 kg' }],
      }),
      {
        id: 'metrics', type: 'metrics', visible: true, eyebrow: '01 / SPEC', title: '快，是参数。\n稳，是底线。', body: '七轴、12 kg、1.2 m/s。所有数字都可现场复测。',
        items: [
          { value: '7', label: '自由度', note: '可绕人工作' },
          { value: '±0.02', label: '重复定位', note: 'mm' },
          { value: '1.2', label: '最大速度', note: 'm/s' },
          { value: '12', label: '额定负载', note: 'kg' },
        ],
      },
      {
        id: 'capabilities', type: 'capabilities', visible: true, eyebrow: '02 / WHY COBOT', title: '不用围栏，\n也能安全。', body: '力控、视觉与速度监控，三层安全。',
        items: [
          { index: '01', title: '力控关节', body: '每个关节内置力矩传感，碰撞后 5 ms 内停止。' },
          { index: '02', title: '视觉引导', body: '2D/3D 视觉定位，支持无序抓取与在线纠偏。' },
          { index: '03', title: '快速部署', body: '拖拽示教 + 图形化流程，4 小时完成换线。' },
        ], variant: 'grid',
      },
      {
        id: 'products', type: 'products', visible: true, eyebrow: '03 / MODELS', title: '三个型号，\n一条协作线。', body: '从 5 kg 到 20 kg。',
        items: [
          { id: 'p1', name: 'KNT-7 协作臂', code: 'KNT-7 / 12', spec: '7 轴 / 12 kg / 1,300 mm', image: `${A}/glass-02.jpg`, tags: ['协作', '七轴'] },
          { id: 'p2', name: 'KNT-12 协作臂', code: 'KNT-12 / 20', spec: '6 轴 / 20 kg / 1,800 mm', image: `${A}/robot-01.jpg`, tags: ['重载', '码垛'] },
          { id: 'p3', name: '末端执行器', code: 'KNT-EO 04', spec: '快换 / 真空 / 夹爪', image: `${A}/metal-01.jpg`, tags: ['末端', '快换'] },
          { id: 'p4', name: '控制柜', code: 'KNT-CB 02', spec: 'IP54 / EtherCAT / 安全 I/O', image: `${A}/chip-01.jpg`, tags: ['控制', '集成'] },
        ], variant: 'stage',
      },
      {
        id: 'process', type: 'process', visible: true, eyebrow: '04 / DEPLOY', title: '四小时，\n换一条线。', body: '从开箱到首件，不需要写代码。',
        items: [
          { index: '01', title: '开箱', body: '整机吊装到位，插电即用。', time: '0.5h' },
          { index: '02', title: '示教', body: '拖拽记录轨迹，设置速度与力限。', time: '1.5h' },
          { index: '03', title: '视觉', body: '标定相机与抓取点，验证 20 次。', time: '1h' },
          { index: '04', title: '首件', body: '节拍与良率确认，移交操作员。', time: '1h' },
        ],
      },
      {
        id: 'proof', type: 'proof', visible: true, eyebrow: '05 / LINE NOTE', title: '操作员愿意用，\n才算部署成功。',
        quote: '我们没裁掉一个工位，只是把最累的搬运动作交给了它。现在夜班两个人就能跑完整条线，操作员自己会改轨迹。',
        author: '阿杰', role: '生产主管 / 某 3C 结构件厂',
        stats: [{ value: '4h', label: '换线时间' }, { value: '2 人', label: '夜班配置' }, { value: '0', label: '安全围栏' }],
        clients: ['立讯精密', '比亚迪', '富士康', '大族激光'],
      },
      {
        id: 'cta', type: 'cta', visible: true, eyebrow: '06 / DEMO', title: '把你的工位发来，\n我们拍一段它干活。', body: '提供视频或节拍要求，48 小时回一段真实演示。',
        headline: '把你的工位发来，\n我们拍一段它干活。', primaryCta: '预约演示', secondaryCta: '下载参数',
      },
      {
        id: 'footer', type: 'footer', visible: true, eyebrow: 'KINETIC ROBOTICS', title: 'KINETIC 动能', note: '七轴协作机器人 · 广东深圳',
        columns: [
          { title: '产品', links: ['KNT-7', 'KNT-12', '末端执行器', '控制柜'] },
          { title: '支持', links: ['现场演示', '换线服务', '培训', '备件'] },
          { title: '联系', links: ['+86 755 0000 0000', 'demo@kinetic.example', '深圳南山智造'] },
        ], legal: '© 2026 KINETIC ROBOTICS CO., LTD. 粤ICP备00000000号',
      },
    ],
  },
  {
    id: 'orbit-instrument',
    market: 'cn', code: 'ORB-07', name: '轨道仪器', nameEn: 'ORBIT INSTRUMENT',
    industry: 'instrument', style: 'swiss-technical', heroKind: 'split-editorial',
    summary: '用瑞士网格与冷蓝，把纳米级误差讲成一张测量图。',
    tags: ['瑞士网格', '精密仪器', '冷蓝'], theme: theme('lab-white'),
    cover: { image: `${A}/chip-01.jpg`, secondary: `${A}/engineer-02.jpg`, accentWord: '0.1 nm' },
    sections: [
      hero({
        heroKind: 'split-editorial', tone: 'light', eyebrow: 'ORBIT INSTRUMENT / METROLOGY',
        title: '把不可见的误差，\n变成可见的数字。',
        body: '激光干涉仪、精密位移台与在线测量系统。为超精密制造提供可追溯的尺度。',
        primaryCta: '查看测量方案', secondaryCta: '下载白皮书',
        location: '北京 · 海淀 / 39.9°N 116.3°E', scrollHint: '向下，校准你的尺度',
        media: { src: `${A}/chip-01.jpg`, alt: '精密电路板' },
        collage: [{ src: `${A}/chip-01.jpg`, alt: '芯片' }, { src: `${A}/engineer-02.jpg`, alt: '精密装配' }],
        specRows: [{ label: 'RESOLUTION', value: '0.1 nm' }, { label: 'RANGE', value: '5 m' }, { label: 'SAMPLE', value: '2 kHz' }],
      }),
      {
        id: 'metrics', type: 'metrics', visible: true, eyebrow: '01 / SPECIFICATION', title: '尺度，\n必须可以被复现。', body: '所有指标均可在标准实验室复测。',
        items: [
          { value: '0.1nm', label: '分辨率', note: '激光干涉' },
          { value: '5m', label: '测量范围', note: '单轴' },
          { value: '2kHz', label: '采样率', note: '实时' },
          { value: '10y', label: '校准周期', note: '可追溯' },
        ],
      },
      {
        id: 'capabilities', type: 'capabilities', visible: true, eyebrow: '02 / MEASURE', title: '从光，\n到长度。', body: '干涉、位移与软件，构成一条完整的测量链。',
        items: [
          { index: '01', title: '激光干涉', body: '稳频激光与多轴干涉光路，直接溯源到波长标准。' },
          { index: '02', title: '纳米位移', body: '柔性铰链与压电驱动，闭环分辨率 0.1 nm。' },
          { index: '03', title: '计量软件', body: '实时采集、温度补偿与不确定度评估，一键出报告。' },
        ], variant: 'rows',
      },
      {
        id: 'products', type: 'products', visible: true, eyebrow: '03 / INSTRUMENTS', title: '四台仪器，\n一套尺度。', body: '从实验室到产线。',
        items: [
          { id: 'p1', name: 'ORB-100 干涉仪', code: 'ORB-100', spec: '0.1 nm / 5 m / 多轴', image: `${A}/chip-01.jpg`, tags: ['干涉', '实验室'] },
          { id: 'p2', name: 'NX-5 位移台', code: 'NX-5', spec: '5 轴 / 0.1 nm / 真空兼容', image: `${A}/engineer-02.jpg`, tags: ['位移', '真空'] },
          { id: 'p3', name: '在线测头', code: 'ORB-P3', spec: 'IP65 / 2 kHz / 无线', image: `${A}/metal-01.jpg`, tags: ['产线', '在线'] },
          { id: 'p4', name: '计量软件', code: 'ORB-SW', spec: 'Windows / API / 不确定度', image: `${A}/chip-01.jpg`, tags: ['软件', '报告'] },
        ], variant: 'index',
      },
      {
        id: 'process', type: 'process', visible: true, eyebrow: '04 / CALIBRATION', title: '一次校准，\n四个步骤。', body: '从环境评估到证书交付。',
        items: [
          { index: '01', title: '环境评估', body: '温度、振动与气流，先确认测量房间是否合格。', time: 'D1' },
          { index: '02', title: '光路搭建', body: '按测量轴系布置干涉光路，完成准直。', time: 'D2–D3' },
          { index: '03', title: '补偿与采样', body: '温度、湿度与折射率补偿，连续采样 30 分钟。', time: 'D4' },
          { index: '04', title: '不确定度报告', body: '输出扩展不确定度与可追溯证书。', time: 'D5' },
        ],
      },
      {
        id: 'proof', type: 'proof', visible: true, eyebrow: '05 / LAB NOTE', title: '测量结果，\n必须能说服计量院。',
        quote: '他们的干涉仪在我们实验室跑了 18 个月，复测结果和计量院证书的偏差小于 0.3 nm。对做超精密的人来说，这就是全部。',
        author: '赵研究员', role: '超精密加工实验室 / 某高校',
        stats: [{ value: '0.3nm', label: '复测偏差' }, { value: '18m', label: '连续运行' }, { value: '5m', label: '测量范围' }],
        clients: ['中国计量院', '清华大学', '中科院光电所', '蔡司'],
      },
      {
        id: 'cta', type: 'cta', visible: true, eyebrow: '06 / WHITE PAPER', title: '先校准问题，\n再校准仪器。', body: '告诉我们你的量程、精度与环境，我们回一份测量方案。',
        headline: '先校准问题，\n再校准仪器。', primaryCta: '获取方案', secondaryCta: '下载白皮书',
      },
      {
        id: 'footer', type: 'footer', visible: true, eyebrow: 'ORBIT INSTRUMENT', title: 'ORBIT 轨道仪器', note: '激光干涉与纳米测量 · 北京海淀',
        columns: [
          { title: '产品', links: ['干涉仪', '位移台', '在线测头', '计量软件'] },
          { title: '服务', links: ['校准', '不确定度评估', '光路设计', '培训'] },
          { title: '联系', links: ['+86 10 0000 0000', 'lab@orbit.example', '海淀区中关村'] },
        ], legal: '© 2026 ORBIT INSTRUMENT CO., LTD. 京ICP备00000000号',
      },
    ],
  },
  {
    id: 'facade-architecture',
    market: 'cn', code: 'FCD-08', name: '立面建筑', nameEn: 'FACADE ARCHITECTURE',
    industry: 'architecture', style: 'glass-luxe', heroKind: 'image-collage',
    summary: '四张建筑影像按高度叠合，让立面成为会呼吸的皮肤。',
    tags: ['图片拼贴', '建筑幕墙', '冷灰'], theme: theme('architectural'),
    cover: { image: `${A}/glass-03.jpg`, secondary: `${A}/glass-01.jpg`, accentWord: 'SKIN' },
    sections: [
      hero({
        heroKind: 'image-collage', tone: 'light', eyebrow: 'FACADE ARCHITECTURE / ENVELOPE',
        title: '建筑的\n第二层皮肤。',
        body: '超白夹胶、Low-E 镀膜与异形幕墙。让立面在白天反射城市，在夜晚透出光。',
        primaryCta: '查看幕墙系统', secondaryCta: '预约样板',
        location: '上海 · 徐汇 / 31.2°N 121.4°E', scrollHint: '滚动，展开立面',
        media: { src: `${A}/glass-03.jpg`, alt: '玻璃摩天楼' },
        collage: [
          { src: `${A}/glass-03.jpg`, alt: '玻璃摩天楼', caption: 'FCD / 陆家嘴' },
          { src: `${A}/glass-01.jpg`, alt: '白色几何建筑', caption: 'FCD / 西岸美术馆' },
          { src: `${A}/glass-02.jpg`, alt: '工业厂房玻璃', caption: 'FCD / 制造基地' },
          { src: `${A}/industrial-01.jpg`, alt: '航拍园区', caption: 'FCD / 物流中心' },
        ],
        specRows: [{ label: 'MAX PANEL', value: '3.6 × 12 m' }, { label: 'U-VALUE', value: '0.8 W/m²K' }, { label: 'WARRANTY', value: '15 years' }],
      }),
      {
        id: 'metrics', type: 'metrics', visible: true, eyebrow: '01 / ENVELOPE', title: '立面，\n是建筑最贵的表情。', body: '透光、遮阳、结构与维护，必须一起成立。',
        items: [
          { value: '3.6m', label: '最大板幅', note: '超白夹胶' },
          { value: '0.8', label: 'U 值', note: 'W/m²K' },
          { value: '40万m²', label: '累计交付', note: '28 个项目' },
          { value: '15y', label: '质保', note: '结构胶' },
        ],
      },
      {
        id: 'capabilities', type: 'capabilities', visible: true, eyebrow: '02 / SYSTEM', title: '不是玻璃，\n是一套系统。', body: '玻璃、框架、密封与排水，缺一不可。',
        items: [
          { index: '01', title: '热工设计', body: '按气候区与朝向计算遮阳系数，平衡采光与能耗。' },
          { index: '02', title: '结构计算', body: '风载、地震与温度变形耦合，节点可施工。' },
          { index: '03', title: '防水与维护', body: '等压腔排水与可更换单元，降低全生命周期成本。' },
        ], variant: 'grid',
      },
      {
        id: 'products', type: 'products', visible: true, eyebrow: '03 / SYSTEMS', title: '四套系统，\n四种表情。', body: '从超白到异形热弯。',
        items: [
          { id: 'p1', name: '超白夹胶', code: 'FCD-AR 12', spec: '超白 / PVB 1.52 / 3.6×12 m', image: `${A}/glass-01.jpg`, tags: ['超白', '夹胶'] },
          { id: 'p2', name: '中空 Low-E', code: 'FCD-LO 24', spec: '双银 / U 0.8 / 遮阳 0.32', image: `${A}/glass-03.jpg`, tags: ['节能', '中空'] },
          { id: 'p3', name: '异形热弯', code: 'FCD-HB 08', spec: '双曲 / 最大 2.4×6 m', image: `${A}/glass-01.jpg`, tags: ['异形', '热弯'] },
          { id: 'p4', name: '单元幕墙', code: 'FCD-UT 03', spec: '等压腔 / 可更换 / 1.5×4.2 m', image: `${A}/glass-03.jpg`, tags: ['单元', '系统'] },
        ], variant: 'cards',
      },
      {
        id: 'process', type: 'process', visible: true, eyebrow: '04 / PROJECT', title: '从样板，\n到立面。', body: '样板先行，性能与节点都要过。',
        items: [
          { index: '01', title: '性能定义', body: '确定 U 值、遮阳、隔声与安全等级。', time: 'W1–W2' },
          { index: '02', title: '样板', body: '1:1 单元样板，完成四性试验。', time: 'W3–W6' },
          { index: '03', title: '深化', body: '节点、排水与连接件出图。', time: 'W7–W10' },
          { index: '04', title: '安装', body: '按楼层单元吊装，逐层淋水验收。', time: 'W11–W24' },
        ],
      },
      {
        id: 'proof', type: 'proof', visible: true, eyebrow: '05 / BUILT', title: '立面做完，\n建筑才开始呼吸。',
        quote: '他们把 3.6 米宽的超白玻璃做到了几乎无畸变。傍晚从江对岸看，整栋楼的反射是完整的，没有一块碎片。',
        author: '沈建筑师', role: '主持建筑师 / 某设计院',
        stats: [{ value: '3.6m', label: '单板宽度' }, { value: '0.8', label: 'U 值' }, { value: '28', label: '交付项目' }],
        clients: ['西岸美术馆', '浦东美术馆', '大疆天空之城', '苏州博物馆'],
      },
      {
        id: 'cta', type: 'cta', visible: true, eyebrow: '06 / SAMPLE', title: '先看一块样板，\n再谈一座建筑。', body: '提供 300×300 样板与四性试验报告。',
        headline: '先看一块样板，\n再谈一座建筑。', primaryCta: '预约样板', secondaryCta: '下载系统手册',
      },
      {
        id: 'footer', type: 'footer', visible: true, eyebrow: 'FACADE ARCHITECTURE', title: 'FACADE 立面', note: '建筑幕墙系统 · 上海徐汇',
        columns: [
          { title: '系统', links: ['超白夹胶', 'Low-E 中空', '异形热弯', '单元幕墙'] },
          { title: '项目', links: ['文化建筑', '商业综合体', '总部办公', '改造'] },
          { title: '联系', links: ['+86 21 0000 0000', 'studio@facade.example', '徐汇滨江'] },
        ], legal: '© 2026 FACADE ARCHITECTURE CO., LTD. 沪ICP备00000000号',
      },
    ],
  },
  {
    id: 'foundry-cast',
    market: 'cn', code: 'FRG-09', name: '铸造之夜', nameEn: 'FOUNDRY NIGHT',
    industry: 'machinery', style: 'industrial-editorial', heroKind: 'video-scrub',
    summary: '1600°C 的铸造夜，用滚动视频把熔炼节奏压进首屏。',
    tags: ['视频滚动', '铸造', '暗色'], theme: theme('foundry'),
    cover: { image: `${A}/factory-01.jpg`, secondary: `${A}/metal-01.jpg`, accentWord: '1600°C' },
    sections: [
      hero({
        heroKind: 'video-scrub', tone: 'dark', eyebrow: 'FOUNDRY NIGHT / SINCE 1998',
        title: '1600°C 之后，\n形状才有意义。',
        body: '灰铸铁、球墨铸铁与耐热合金铸件。从模具到探伤，每一炉都有编号。',
        primaryCta: '发送铸件图纸', secondaryCta: '查看材质表',
        location: '山东 · 潍坊 / 36.7°N 119.1°E', scrollHint: '滚动，靠近熔炉',
        media: { src: `${A}/truss-loop.webm`, alt: '铸造车间', caption: 'FOUNDRY / HEAT 08' },
        collage: [
          { src: `${A}/factory-01.jpg`, alt: '火花' },
          { src: `${A}/metal-01.jpg`, alt: '金属加工' },
          { src: `${A}/pipes-01.jpg`, alt: '泵体' },
        ],
        specRows: [{ label: 'POURING', value: '1600°C' }, { label: 'MAX WEIGHT', value: '8 t' }, { label: 'TOLERANCE', value: 'CT8' }],
      }),
      {
        id: 'metrics', type: 'metrics', visible: true, eyebrow: '01 / HEAT LOG', title: '每一炉，\n都有身份证。', body: '炉号、光谱与热处理曲线，随货可查。',
        items: [
          { value: '1600°C', label: '浇注温度', note: '±15°C' },
          { value: '8t', label: '单件最大', note: '树脂砂' },
          { value: '0.05mm', label: '尺寸公差', note: 'CT8' },
          { value: '100%', label: '探伤覆盖', note: 'UT / MT' },
        ],
      },
      {
        id: 'capabilities', type: 'capabilities', visible: true, eyebrow: '02 / FOUNDRY', title: '从模具，\n到探伤。', body: '三件事决定一件铸件的命运。',
        items: [
          { index: '01', title: '模具与造型', body: '树脂砂与消失模，复杂流道一次成型。' },
          { index: '02', title: '熔炼与浇注', body: '中频炉 + 光谱分析，成分在线调整。' },
          { index: '03', title: '热处理与探伤', body: '正火、回火与 UT/MT，缺陷无处可藏。' },
        ], variant: 'rows',
      },
      {
        id: 'products', type: 'products', visible: true, eyebrow: '03 / CASTINGS', title: '四类铸件，\n从 1 kg 到 8 t。', body: '风电、泵阀、机床与耐热。',
        items: [
          { id: 'p1', name: '风电轮毂', code: 'FRG-WH 08', spec: 'QT500-7 / 8 t / UT 2 级', image: `${A}/wind-01.jpg`, tags: ['风电', '球铁'] },
          { id: 'p2', name: '泵体', code: 'FRG-PB 12', spec: 'HT250 / 1.2 t / 水压 1.6 MPa', image: `${A}/pipes-01.jpg`, tags: ['泵阀', '灰铁'] },
          { id: 'p3', name: '机床床身', code: 'FRG-MB 03', spec: 'HT300 / 3.5 t / 时效', image: `${A}/metal-01.jpg`, tags: ['机床', '减震'] },
          { id: 'p4', name: '耐热炉辊', code: 'FRG-RR 06', spec: '耐热合金 / 1,100°C / 离心', image: `${A}/factory-01.jpg`, tags: ['耐热', '离心'] },
        ], variant: 'cards',
      },
      {
        id: 'process', type: 'process', visible: true, eyebrow: '04 / POUR', title: '一炉钢水的 72 小时。', body: '从工艺评审到探伤报告。',
        items: [
          { index: '01', title: '工艺评审', body: '浇注系统、冒口与冷铁布置。', time: 'D1' },
          { index: '02', title: '造型', body: '树脂砂造型与涂料烘干。', time: 'D2' },
          { index: '03', title: '熔炼浇注', body: '光谱调质，1600°C 浇注。', time: 'D3' },
          { index: '04', title: '热处理探伤', body: '正火回火，UT/MT 全检。', time: 'D4–D7' },
        ],
      },
      {
        id: 'proof', type: 'proof', visible: true, eyebrow: '05 / HEAT NOTE', title: '铸件不说话，\n探伤会。',
        quote: '他们给我们做的风电轮毂，UT 一次合格率 97%，比上一家高 9 个点。更关键的是每炉成分都能查到，出了问题时不用猜。',
        author: '孙工', role: '质量总监 / 某风电整机厂',
        stats: [{ value: '97%', label: 'UT 一次合格' }, { value: '8t', label: '单件最大' }, { value: '100%', label: '炉号追溯' }],
        clients: ['金风科技', '远景能源', '上海电气', '中国中车'],
      },
      {
        id: 'cta', type: 'cta', visible: true, eyebrow: '06 / RFQ', title: '把铸件图纸发来，\n先做一次工艺评审。', body: '支持 1 件打样与 8 吨级批量。',
        headline: '把铸件图纸发来，\n先做一次工艺评审。', primaryCta: '上传图纸', secondaryCta: '查看材质表',
      },
      {
        id: 'footer', type: 'footer', visible: true, eyebrow: 'FOUNDRY NIGHT', title: 'FOUNDRY 铸造夜', note: '灰铁 / 球铁 / 耐热铸件 · 山东潍坊',
        columns: [
          { title: '铸件', links: ['风电轮毂', '泵体', '机床床身', '耐热炉辊'] },
          { title: '工艺', links: ['树脂砂', '消失模', '离心铸造', '热处理'] },
          { title: '联系', links: ['+86 536 000 0000', 'cast@foundry.example', '潍坊滨海工业园'] },
        ], legal: '© 2026 FOUNDRY NIGHT CO., LTD. 鲁ICP备00000000号',
      },
    ],
  },
  {
    id: 'pack-line',
    market: 'cn', code: 'PCK-10', name: '包装产线', nameEn: 'PACK LINE',
    industry: 'commodity', style: 'swiss-technical', heroKind: 'product-stage',
    summary: '用产品舞台与蓝色信号，把一条包装线讲成一套节拍。',
    tags: ['产品舞台', '包装机械', '信号蓝'], theme: theme('signal'),
    cover: { image: `${A}/warehouse-01.jpg`, secondary: `${A}/industrial-01.jpg`, accentWord: '120 PPM' },
    sections: [
      hero({
        heroKind: 'product-stage', tone: 'light', eyebrow: 'PACK LINE / END-OF-LINE AUTOMATION',
        title: '一条产线，\n装下整座工厂的节奏。',
        body: '纸箱成型、装盒、封箱、码垛。模块化包装线，7 天完成部署。',
        primaryCta: '计算产线节拍', secondaryCta: '查看模块',
        location: '江苏 · 苏州 / 31.3°N 120.6°E', scrollHint: '向下，拆解节拍',
        media: { src: `${A}/warehouse-01.jpg`, alt: '仓储与包装' },
        collage: [
          { src: `${A}/warehouse-01.jpg`, alt: '仓储' },
          { src: `${A}/industrial-01.jpg`, alt: '物流' },
          { src: `${A}/factory-02.jpg`, alt: '商品' },
        ],
        specRows: [{ label: 'SPEED', value: '120 ppm' }, { label: 'DEPLOY', value: '7 days' }, { label: 'OEE', value: '98.5%' }],
      }),
      {
        id: 'metrics', type: 'metrics', visible: true, eyebrow: '01 / LINE DATA', title: '节拍，\n是产线的语法。', body: '每分钟 120 件，换型 10 分钟。',
        items: [
          { value: '120', label: '件/分钟', note: '标准箱' },
          { value: '7d', label: '部署周期', note: '模块化' },
          { value: '98.5%', label: 'OEE', note: '客户实测' },
          { value: '24m', label: '投资回收', note: '两班制' },
        ],
      },
      {
        id: 'capabilities', type: 'capabilities', visible: true, eyebrow: '02 / MODULES', title: '像积木一样，\n拼一条线。', body: '每个模块独立调试，整线只做接口。',
        items: [
          { index: '01', title: '伺服控制', body: '电子凸轮替代机械连杆，换型只改参数。' },
          { index: '02', title: '视觉检测', body: '缺件、错标与封口缺陷在线剔除。' },
          { index: '03', title: '整线集成', body: 'MES / WMS 接口，产量与故障实时上报。' },
        ], variant: 'grid',
      },
      {
        id: 'products', type: 'products', visible: true, eyebrow: '03 / MODULES', title: '四个模块，\n一条完整产线。', body: '从开箱到码垛。',
        items: [
          { id: 'p1', name: '开箱机', code: 'PCK-CF 20', spec: '20 箱/分 / 伺服 / 自动补箱', image: `${A}/warehouse-01.jpg`, tags: ['开箱', '伺服'] },
          { id: 'p2', name: '装盒机', code: 'PCK-CB 12', spec: '120 件/分 / 视觉 / 快速换型', image: `${A}/industrial-01.jpg`, tags: ['装盒', '视觉'] },
          { id: 'p3', name: '封箱机', code: 'PCK-SE 08', spec: '胶带/热熔 / 自动调宽', image: `${A}/factory-02.jpg`, tags: ['封箱', '自适应'] },
          { id: 'p4', name: '码垛机', code: 'PCK-PL 06', spec: '6 轴 / 12 kg / 双工位', image: `${A}/metal-01.jpg`, tags: ['码垛', '机器人'] },
        ], variant: 'stage',
      },
      {
        id: 'process', type: 'process', visible: true, eyebrow: '04 / DEPLOY', title: '七天，\n让线跑起来。', body: '从布局到验收。',
        items: [
          { index: '01', title: '节拍测算', body: '按箱型、速度与换型频率选模块。', time: 'D1' },
          { index: '02', title: '布局', body: '3D 布局与接口确认，预留维护空间。', time: 'D2–D3' },
          { index: '03', title: '安装', body: '模块进场、接线与单机调试。', time: 'D4–D5' },
          { index: '04', title: '验收', body: '连续 8 小时跑机，OEE 与良率确认。', time: 'D6–D7' },
        ],
      },
      {
        id: 'proof', type: 'proof', visible: true, eyebrow: '05 / LINE NOTE', title: '换型时间，\n决定这条线值不值。',
        quote: '我们一天要换 6 次箱型。以前换型要停 40 分钟，现在 10 分钟。操作员在屏幕上点几下，不用叫工程师。',
        author: '吴厂长', role: '生产厂长 / 某日化代工厂',
        stats: [{ value: '10min', label: '换型时间' }, { value: '120ppm', label: '稳定节拍' }, { value: '98.5%', label: 'OEE' }],
        clients: ['立白', '联合利华', '农夫山泉', '顺丰'],
      },
      {
        id: 'cta', type: 'cta', visible: true, eyebrow: '06 / CALCULATE', title: '把你的箱型与产量发来，\n我们算一条线。', body: '输入箱型、速度与换型频率，回一份布局与投资回收测算。',
        headline: '把你的箱型与产量发来，\n我们算一条线。', primaryCta: '计算节拍', secondaryCta: '下载模块手册',
      },
      {
        id: 'footer', type: 'footer', visible: true, eyebrow: 'PACK LINE', title: 'PACK 包装产线', note: '末端包装自动化 · 江苏苏州',
        columns: [
          { title: '模块', links: ['开箱机', '装盒机', '封箱机', '码垛机'] },
          { title: '服务', links: ['节拍测算', '布局设计', '安装调试', '备件'] },
          { title: '联系', links: ['+86 512 000 0000', 'line@pack.example', '苏州工业园区'] },
        ], legal: '© 2026 PACK LINE AUTOMATION CO., LTD. 苏ICP备00000000号',
      },
    ],
  },
];

const CURATED_TEMPLATES: TemplateDefinition[] = [
  ...DOMESTIC_TEMPLATES,
  ...GLOBAL_TEMPLATES,
  ...EXTRA_TEMPLATES,
];

export const TEMPLATES: TemplateDefinition[] = buildCatalogue(CURATED_TEMPLATES);

export const TEMPLATE_BY_ID = Object.fromEntries(
  TEMPLATES.map((template) => [template.id, template]),
) as Record<string, TemplateDefinition>;

export const INDUSTRY_TEMPLATE_COUNT = TEMPLATES.reduce<Record<IndustryId, number>>(
  (counts, template) => {
    counts[template.industry] = (counts[template.industry] ?? 0) + 1;
    return counts;
  },
  {} as Record<IndustryId, number>,
);

export const STYLE_TEMPLATE_COUNT = TEMPLATES.reduce<Record<StyleId, number>>(
  (counts, template) => {
    counts[template.style] = (counts[template.style] ?? 0) + 1;
    return counts;
  },
  {} as Record<StyleId, number>,
);
