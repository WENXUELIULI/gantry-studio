# GANTRY v2 开发工作流

> 面向后续执行者：这是一份可执行的工作流，不是愿景稿。每个阶段都必须以测试、Playwright 验证和 `verification-before-completion` 门禁收口。

**Goal:** 把官网生成器从当前 30 套模板继续扩展为可做组件级样式控制与图片裁剪/焦点、具备更细主题 token，并为「登录 / 会员 / 支付 / 源码导出鉴权」预留正确后端边界的 v2 产品。

**Architecture:** 前端继续采用 React 19 + TypeScript + Vite + Zustand。数据层用「模板元数据（轻） + 模板内容（按需加载）」拆包；样式层用「主题 token → 区块 style recipe → 内容」三层；导出层拆成免费 HTML 导出与受服务端鉴权的源码导出；后端采用 Supabase Auth/Postgres/Storage + 独立 Hono API，所有会员权益只在服务端判定。

**Tech Stack:** React 19、TypeScript 5.9、Vite 7、Zustand 5、Zod 4、Motion、Vitest、Testing Library、Playwright、ESLint 9；后端 Hono + Node 22 + Supabase（Auth/Postgres/Storage），支付采用 Stripe Checkout（国际）与微信支付/支付宝适配器（国内）。

## Global Constraints

- 不覆盖 `E:\asd` 下已有项目；本项目根目录固定为 `E:\asd\gantry-studio`。
- 不新增 UI 组件库；产品壳与官网模板继续使用自有 CSS 与工业编辑风设计语言。
- 30 套模板每套必须有 8 个区块：hero / metrics / capabilities / products / process / proof / cta / footer。
- 所有模板必须同时通过桌面 1440×900 与手机 390×844 的布局验证，不允许横向溢出。
- 源码导出能力不得只靠前端布尔值或 localStorage 判定；服务端必须是唯一可信源。
- 不把 Stripe/微信/支付宝密钥写入 `VITE_*` 环境变量或前端 bundle。
- 每次改动必须保持现有 30 套模板可用；迁移以回归测试保护，不做一次性大爆炸重写。
- 关键纯函数（contrast、focal、crop、style resolve、template factory）必须先写失败测试，再写实现。
- 任何「已完成 / 已修复 / 已通过」的表述，必须先附命令输出或截图证据。

---

## 1. 当前基线（2026-11-25）

- 模板：30 套（国内 20 + 国际 10），13 个行业，11 种风格，18 套主题，2 个市场。
- 首屏：6 种叙事（video-scrub / image-collage / split-editorial / full-bleed / kinetic-type / product-stage）。
- 页面区块：8 类；编辑器支持就地改字、上下移动、显隐、复制、删除、撤销/重做、桌面/手机视图、主题切换、组件级样式、图片焦点/独立裁剪、多页、云端保存、HTML/ZIP/JSON 导出。
- 质量：131 个 Vitest 测试、10 条 Playwright 用例、4 条后端 Spring Boot 测试、`tsc`、`lint`、`build` 全通过。
- 已知边界：生成物是静态 HTML/ZIP，不是可二次开发的 React 工程源码；云端保存是显式按钮；支付与真实源码生成未接；手机端只用于查看/预览。

## 2. v2 范围

### 2.1 必做

1. 模板从 15 扩到 30，新增 5 个行业：五金、物流、化工、医疗器械、汽车与零部件；每个新行业 3 套。
2. 编辑器新增「样式」面板：组件级布局、密度、对齐、表面、图片比例、列数、遮罩、动效；支持桌面/手机不同覆盖。
3. 图片资产支持焦点、缩放、比例与非破坏裁剪；导出后保持构图。
4. 主题 token 从 11 个扩展到 20+ 个，增加 surface / accentSoft / focus / borderWidth / sectionSpace / displayWeight / tracking / motion，并做对比度校验。
5. 导出拆成：HTML（免费，继续单文件）、源码包（会员，服务端鉴权 + 签名下载）。
6. 预留并打通：Supabase Auth 登录、会员套餐、Stripe/微信/支付宝结账与 webhook、权益查询、导出审计。

### 2.2 不做

- 不做完整 CMS、博客、多页站点、产品详情页；仍以单页官网为主。
- 不做自由拖拽画布；保持「结构化区块 + 样式 recipe」，避免变成不可维护的 Webflow。
- 不做自研支付通道；只做 provider-hosted checkout 与 webhook 适配。
- 不做团队协作实时编辑；只预留 `team.seats` 权益字段。
- 不在本阶段做移动端编辑器；手机视图仍是成品预览。

---

## 3. 目标架构

```text
E:\asd\gantry-studio
  src/                         前端
    types/
      site.ts                  模板/文档/区块类型
      style.ts                 SectionStyle、控件 schema
      media.ts                 MediaRef、焦点/裁剪类型
      entitlement.ts           Feature、PlanCode、EntitlementSnapshot
    data/
      taxonomy.ts              市场/行业/风格/首屏
      themes.ts                18 套主题 token
      templates/
        meta.ts                轻量模板元数据（Gallery 用）
        factory.ts             区块工厂 + 模板工厂
        cn/                    国内模板模块
        global/                国际模板模块
        index.ts               loadTemplate() 动态加载
    lib/
      theme/tokens.ts          themeToCssVars / validateTheme
      theme/contrast.ts        WCAG 对比度
      style/sectionStyle.ts    resolveSectionStyle / styleToVars
      style/controls.ts        各区块控件 schema
      media/focal.ts           focal / zoom / crop 纯函数
      media/bake.ts            canvas 裁剪（导出用）
      export/html.ts           单文件 HTML
      entitlement/gateway.ts   前端接口 + dev stub
    components/
      builder/inspector/
        ContentPanel.tsx
        StylePanel.tsx
        ThemePanel.tsx
        ExportPanel.tsx
        controls/              Segmented / Range / Color / Select
      builder/media/
        ImageField.tsx
        ImageCropper.tsx
      site/
        sections/              按区块拆文件，避免 Sections.tsx 继续膨胀
  server/                      Hono API（Node 22）
    src/index.ts
    src/auth.ts                Supabase JWT 验证
    src/routes/projects.ts
    src/routes/entitlements.ts
    src/routes/exports.ts
    src/routes/billing.ts
    src/routes/webhooks.ts
    src/export/buildSource.ts 服务端源码包生成（唯一生成入口，前端不打包）
    src/db/schema.ts           Drizzle schema
    test/
  shared/
    contracts.ts               Zod API 契约（前后端共享类型）
  e2e/
    gallery.spec.ts
    editor.spec.ts
    templates.spec.ts
    export.spec.ts
    auth.spec.ts
  docs/
    WORKFLOW.md
    ADR/                       关键决策记录
```

### 3.1 数据流

```text
Gallery (TemplateMeta)
  → loadTemplate(id) 动态加载 TemplateDefinition
  → createDocumentFromTemplate()
  → Builder store (doc + view + device + history)
  → SiteRenderer(doc)
  → themeToCssVars + resolveSectionStyle
  → HTML / JSON / source bundle
```

### 3.2 边界原则

- **模板数据**只描述内容与 recipe，不写页面结构代码；页面结构由 renderer 决定。
- **主题 token**只描述视觉变量，不描述某个区块的布局；布局由 SectionStyle 决定。
- **SectionStyle**只描述当前区块的视觉选择，不复制内容；内容仍在 section 数据里。
- **导出**不重新实现渲染；HTML 导出复用 `SiteRenderer`，源码导出复用同一份模板/样式契约。
- **权益**只从 `GET /v1/me` 或导出接口的 402 响应读取；前端缓存仅用于 UI 展示，不作为授权依据。

### 3.3 新增依赖（按阶段引入，不提前安装）

| 包 | 阶段 | 用途 |
| --- | --- | --- |
| `fflate` | Phase 4 | 服务端生成源码 zip |
| `hono`、`@hono/node-server` | Phase 5 | API 框架与 Node adapter |
| `@supabase/supabase-js` | Phase 5 | JWT 验证、Storage |
| `drizzle-orm`、`postgres` | Phase 5 | Postgres schema/query |
| `stripe` | Phase 5 | 国际支付 |
| `tsx`（dev） | Phase 5 | 本地运行 server TS |
| `@axe-core/playwright`（dev） | Phase 6 | 可访问性测试 |

微信/支付宝 SDK 等真实商户号确定后再引入；在此之前只写 `PaymentProvider` 适配器接口与 fixture 测试。

---

## 4. 核心数据契约

### 4.1 主题 token（扩展而非重写）

保留现有扁平 `Theme` 形态，减少 18 套主题迁移成本；新增字段全部有默认值。

```ts
// src/types/site.ts
export type GridKind = 'blueprint' | 'rule' | 'none';
export type MotionKind = 'none' | 'subtle' | 'expressive';

export interface Theme {
  id: string;
  name: string;
  dark: boolean;

  // color
  paper: string;
  surface: string;        // 卡片/面板底色，默认 paper
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentInk: string;      // accent 上的文字色
  accentSoft: string;     // accent 的 8%-14% 混合色
  focus: string;          // 键盘焦点环

  // type
  display: string;
  body: string;
  mono: string;
  displayWeight: number;  // 400-800
  bodySize: number;       // 15-19
  tracking: number;       // -0.04 - 0.02

  // layout
  radius: number;         // 0-24
  borderWidth: number;    // 0-2
  sectionSpace: number;   // 64-160
  grid: GridKind;

  // motion
  motion: MotionKind;
}
```

CSS 变量映射（`src/lib/theme/tokens.ts`）：

```ts
export function themeToCssVars(theme: Theme): Record<string, string> {
  return {
    '--paper': theme.paper,
    '--surface': theme.surface,
    '--ink': theme.ink,
    '--muted': theme.muted,
    '--line': theme.line,
    '--accent': theme.accent,
    '--accent-ink': theme.accentInk,
    '--accent-soft': theme.accentSoft,
    '--focus': theme.focus,
    '--display': theme.display,
    '--body': theme.body,
    '--mono': theme.mono,
    '--display-weight': String(theme.displayWeight),
    '--body-size': `${theme.bodySize}px`,
    '--tracking': `${theme.tracking}em`,
    '--radius': `${theme.radius}px`,
    '--border': `${theme.borderWidth}px`,
    '--section-gap': `${theme.sectionSpace}px`,
    '--grid': theme.grid,
    '--motion': theme.motion,
  };
}
```

对比度规则（`src/lib/theme/contrast.ts`）：

- `ink / paper` ≥ 7.0（正文 AAA）
- `muted / paper` ≥ 4.5
- `accentInk / accent` ≥ 4.5
- `focus / paper` ≥ 3.0
- `line / paper` ≥ 1.35（仅装饰线，不参与文本对比）
- 不满足时 Inspector 显示警告，不阻止保存；提供「自动加深/提亮」按钮，把颜色向黑/白混合到阈值。

### 4.2 SectionStyle

```ts
// src/types/style.ts
export type SectionLayout =
  | 'strip' | 'grid' | 'rows' | 'sticky'
  | 'cards' | 'index' | 'stage'
  | 'timeline' | 'split' | 'stack' | 'centered';

export interface SectionStyle {
  layout?: SectionLayout;
  density?: 'compact' | 'normal' | 'airy';
  align?: 'left' | 'center';
  surface?: 'none' | 'paper' | 'ink' | 'accent';
  ratio?: 'auto' | 'square' | 'portrait' | 'landscape' | 'wide';
  columns?: 2 | 3 | 4;
  overlay?: number;          // 0-80
  motion?: MotionKind;
  mobile?: Partial<Omit<SectionStyle, 'mobile'>>;
}
```

解析优先级：

```ts
resolveSectionStyle(section, device)
  = defaults[section.type]
  → section.style
  → device === 'mobile' ? section.style.mobile : {}
```

每个区块的控件白名单在 `src/lib/style/controls.ts`，Inspector 不写 `switch(section.type)` 大分支，而是读取 schema 渲染：

```ts
export interface StyleControl {
  key: keyof SectionStyle;
  label: string;
  type: 'segmented' | 'range' | 'select';
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export const STYLE_CONTROLS: Record<SectionType, StyleControl[]> = {
  metrics: [
    { key: 'layout', label: '布局', type: 'segmented', options: [
      { label: '横条', value: 'strip' },
      { label: '网格', value: 'grid' },
      { label: '索引', value: 'index' },
    ]},
    { key: 'columns', label: '列数', type: 'segmented', options: [2, 3, 4].map((v) => ({ label: `${v} 列`, value: v })) },
    { key: 'density', label: '密度', type: 'segmented', options: ['compact', 'normal', 'airy'].map((v) => ({ label: v, value: v })) },
    { key: 'surface', label: '表面', type: 'segmented', options: ['none', 'paper', 'ink', 'accent'].map((v) => ({ label: v, value: v })) },
  ],
  // capabilities / products / process / proof / cta / footer 同理
};
```

渲染层用 data 属性 + CSS 变量，不生成大量 inline class：

```tsx
<article
  className={`site-section section-${section.type}`}
  data-layout={style.layout}
  data-density={style.density}
  data-surface={style.surface}
  data-align={style.align}
  style={styleToVars(style) as CSSProperties}
/>
```

### 4.3 MediaRef v2

```ts
// src/types/media.ts
export type MediaAspect = 'auto' | 'square' | 'portrait' | 'landscape' | 'wide';

export interface FocalPoint {
  x: number; // 0..1
  y: number; // 0..1
}

export interface MediaRef {
  src: string;
  alt: string;
  caption?: string;
  focal?: FocalPoint;
  zoom?: number;        // 1..3
  aspect?: MediaAspect;
  assetId?: string;
}
```

`Product.image` 从 `string` 迁到 `MediaRef`；模板迁移时给所有图片默认 `{ src, alt, focal: { x: 0.5, y: 0.5 }, zoom: 1, aspect: 'auto' }`。

纯函数（`src/lib/media/focal.ts`）：

```ts
export function clampFocal(x: number, y: number): FocalPoint;
export function focalToObjectPosition(f: FocalPoint): string; // "50% 40%"
export function clampZoom(z: number): number;                  // 1..3
export function computeCropRect(input: {
  width: number; height: number; aspect: number;
  focal: FocalPoint; zoom: number;
}): { x: number; y: number; width: number; height: number };
```

测试必须覆盖：0/1 边界、非等比图片、zoom 放大后仍不越界、超宽/超高的裁剪窗口、NaN 输入回退默认值。

### 4.4 权益与导出契约

> 源码包生成器只存在于 `server/src/export/`，不得从 `src/main.tsx` 可达。前端只依赖 `ExportGateway`，避免把付费生成逻辑打进客户端 bundle。

```ts
// src/types/entitlement.ts
export type PlanCode = 'free' | 'pro' | 'studio';
export type Feature =
  | 'html.export'
  | 'source.export'
  | 'premium.templates'
  | 'cloud.projects'
  | 'team.seats';

export interface EntitlementSnapshot {
  userId: string | null;
  plan: PlanCode;
  features: Record<Feature, boolean>;
  expiresAt?: string;
  source: 'api' | 'mock';
}

export interface SourceExportRequest {
  projectId: string;
  format: 'react-vite';
  idempotencyKey: string;
}

export interface SourceExportJob {
  exportId: string;
  status: 'queued' | 'building' | 'ready' | 'failed' | 'expired';
  downloadUrl?: string;
  expiresAt?: string;
}
```

前端只依赖接口，不依赖具体实现：

```ts
export interface ExportGateway {
  can(feature: Feature): boolean;
  requestSource(req: SourceExportRequest): Promise<SourceExportJob>;
  poll(exportId: string): Promise<SourceExportJob>;
}
```

开发期 `createDevGateway()` 可以返回 `source.export: false` 或通过 `VITE_DEV_ENTITLEMENT=pro` 打开，但必须在 UI 标注 `DEV MOCK`，且生产构建不得启用。

---

## 5. 30 套模板矩阵

### 5.1 新增行业

| id | 中文 | English | code |
| --- | --- | --- | --- |
| `hardware` | 五金与工具 | Hardware & Tools | HWD |
| `logistics` | 物流与仓储 | Logistics | LOG |
| `chemical` | 化工与材料 | Chemical & Materials | CHM |
| `medical` | 医疗器械 | Medical Devices | MED |
| `automotive` | 汽车与零部件 | Automotive | AUT |

### 5.2 新增主题（共 18 套）

| id | 名称 | 用途 | 关键色 |
| --- | --- | --- | --- |
| `alloy` | 合金 | 五金 | #e8e9e6 / #1d2327 / #d9480f |
| `cargo` | 货运 | 物流 | #f2efdf / #141414 / #f2c200 |
| `reagent` | 试剂 | 化工 | #eef4ee / #17352c / #2f7d5a |
| `surgical` | 手术室 | 医疗 | #eef3f4 / #17323b / #0f7c8a |

### 5.3 新增 15 套模板

| # | id | code | 名称 | 市场 | 行业 | 风格 | 首屏 | 主题 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 16 | `ironworks-supply` | IRN-16 | 铁匠五金 | CN | hardware | industrial-editorial | product-stage | hot-rolled |
| 17 | `forge-toolworks` | FTW-17 | FORGE TOOLWORKS | Global | hardware | american-workshop | split-editorial | alloy |
| 18 | `kern-hardware` | KRN-18 | KERN HARDWARE | Global | hardware | german-technical | image-collage | graphite |
| 19 | `haul-line` | HUL-19 | 干线物流 | CN | logistics | kinetic-brutalist | video-scrub | cargo |
| 20 | `port-authority` | PRT-20 | PORT AUTHORITY | Global | logistics | swiss-technical | full-bleed | fjord |
| 21 | `cold-chain` | CLD-21 | 冷链网络 | CN | logistics | industrial-editorial | split-editorial | cleanroom |
| 22 | `reagent-works` | RGT-22 | 试剂工场 | CN | chemical | swiss-technical | product-stage | reagent |
| 23 | `basel-synth` | BSL-23 | BASEL SYNTH | Global | chemical | german-technical | image-collage | reagent |
| 24 | `polymer-line` | PLY-24 | 聚合产线 | CN | chemical | dark-precision | full-bleed | foundry |
| 25 | `surgical-instruments` | SRG-25 | 手术器械 | CN | medical | swiss-technical | product-stage | surgical |
| 26 | `medtech-north` | MTN-26 | MEDTECH NORTH | Global | medical | nordic-functional | split-editorial | surgical |
| 27 | `care-device` | CRD-27 | 居家医疗 | CN | medical | warm-craft | product-stage | washi |
| 28 | `drivetrain` | DRV-28 | 动力总成 | CN | automotive | industrial-editorial | video-scrub | hot-rolled |
| 29 | `stuttgart-parts` | STG-29 | STUTTGART PARTS | Global | automotive | german-technical | full-bleed | graphite |
| 30 | `ev-platform` | EVP-30 | 电动平台 | CN | automotive | kinetic-brutalist | kinetic-type | kinetic |

市场分布：20 套 CN + 10 套 Global。行业分布：机械 3、五金 3、玻璃 2、商品 2、半导体 1、能源 2、机器人 1、仪器 3、建筑 1、物流 3、化工 3、医疗 3、汽车 3 = 30。

### 5.4 模板生产规则

- 所有模板由 `src/data/templates/factory.ts` 生成，不允许复制 8 个区块再手改。
- 每个模板模块只提供 `TemplateSeed`：行业、风格、市场、首屏类型、主题、文案、图片、参数。
- `makeTemplate(seed)` 负责补齐 `id/type/visible/style`、生成 nav、校验 8 个区块。
- 图片必须来自 `public/assets/`，且每个新模板至少 4 张不同图片；不得复用同一张图作为 hero + products 主图。
- 国际模板正文、按钮、导航、meta 全部英文；品牌名可保留外文；不得出现中文标点混排。
- 每套模板必须有 3 个可信数字（metrics/proof），不得使用“行业领先”这类空词。
- 30 套模板需覆盖至少 6 种首屏各 4 次以上，避免全部变成同一种 landing page。

### 5.5 性能：模板懒加载

```ts
// src/data/templates/meta.ts
export const TEMPLATE_META: TemplateMeta[] = [/* 只含 id/code/name/market/industry/style/cover/tags/themeName */];

// src/data/templates/index.ts
const loaders = {
  'ironworks-supply': () => import('./cn/ironworks-supply'),
  // ...
} satisfies Record<string, () => Promise<{ default: TemplateDefinition }>>;

export async function loadTemplate(id: string): Promise<TemplateDefinition> {
  const loader = loaders[id];
  if (!loader) throw new Error(`Unknown template: ${id}`);
  return (await loader()).default;
}
```

Gallery 首屏只加载 meta；点击模板后显示 200ms 内的骨架，再进入 Builder。初始 JS gzip 目标 < 230KB，模板 chunk 单个 < 20KB。

---

## 6. 编辑器工作流

### 6.1 Inspector 新结构

```text
Inspector
  Tabs: 内容 / 样式 / 主题 / 导出
  内容  → 现有 ContentPanel（按 section 类型）
  样式  → StylePanel（schema 驱动）
  主题  → ThemePanel（token 分组 + 对比度警告）
  导出  → ExportPanel（HTML / JSON / 源码包 / 会员状态）
```

`Inspector.tsx` 超过 1000 行，必须先拆成 4 个 panel，再在 StylePanel 内新增控件。拆分时不做行为改动，先加回归测试，再迁移。

### 6.2 组件级样式控制

- 选中区块后，样式面板只显示该区块允许的控件，不显示无效项。
- 每个控件变化立即写入 store；range 控件在 `pointerup` / `blur` 时提交，避免每次拖动都写 history。
- 手机视图下，StylePanel 顶部显示「仅手机」开关；关闭时编辑桌面值，打开时写 `style.mobile`。
- 每个区块有「重置本区块样式」；主题面板有「恢复模板主题」。
- 所有样式改动必须进入 undo/redo；一次拖动算一个 history entry，不是几十个。

### 6.3 图片裁剪 / 焦点

```text
ImageField
  [预览缩略图] [上传] [替换] [URL]
  [裁剪/焦点] → ImageCropper modal
    - 画布：原图 + 3×3 网格 + 可拖动焦点
    - 缩放滑杆 1.0–3.0
    - 比例：auto / 1:1 / 4:5 / 16:9 / 4:3
    - 键盘：方向键移动焦点 1%，Shift+方向键 10%
    - 按钮：重置 / 取消 / 应用
```

- 裁剪是非破坏性的：只存 `focal/zoom/aspect`，不改原图。
- 导出 HTML 时用 `object-position` + `transform: scale()` 保持构图；需要真正裁像素时，用 `src/lib/media/bake.ts` 在 canvas 里按 `computeCropRect` 烘焙为 dataURL（仅导出路径使用）。
- 上传文件限制：图片 ≤ 8MB，视频 ≤ 40MB；上传前读 `naturalWidth/naturalHeight`，低于 800px 宽的图给出警告。
- 所有图片必须有 `alt`；装饰图允许空 alt，但要在 UI 明确这是装饰图。

### 6.4 持久化与迁移

- `STORAGE_KEY` 从 `gantry:site:v1` 升到 `gantry:site:v2`；读取 v1 时执行 `migrateDocument()`。
- 迁移内容：`Product.image` string → MediaRef；`variant` → `style.layout`；主题缺省 token 用默认值补齐；market 缺省 `cn`。
- 迁移必须幂等：同一份 v1 文档迁移两次结果一致。
- 迁移失败时保留原草稿到 `gantry:site:v1:backup`，并提示用户，不静默清空。

---

## 7. 导出与会员架构

### 7.1 两种导出

| 类型 | 内容 | 权限 | 生成位置 |
| --- | --- | --- | --- |
| HTML | 单文件 HTML，内嵌 CSS/图片/视频/滚动脚本 | 免费/登录用户 | 前端（现有 `siteToHtml` 扩展 token/focal） |
| JSON | SiteDocument | 免费 | 前端 |
| 源码包 | React + Vite 项目 zip，含内容、组件、样式、资源 | Pro/Studio | 服务端生成 + 签名 URL |

### 7.2 服务端 API

```text
GET    /v1/me                       → { user, entitlements }
GET    /v1/projects                 → 当前用户项目
POST   /v1/projects                 → 创建项目
GET    /v1/projects/:id             → 读取（owner only）
PUT    /v1/projects/:id             → 保存（owner only, version 乐观锁）
POST   /v1/exports/source           → 202 { exportId } 或 402 { code: 'UPGRADE_REQUIRED' }
GET    /v1/exports/:id              → { status, downloadUrl?, expiresAt? }
POST   /v1/billing/checkout         → { url }（Stripe / 微信 / 支付宝）
POST   /v1/webhooks/stripe          → 验签 + 幂等
POST   /v1/webhooks/wechat          → 验签 + 幂等
POST   /v1/webhooks/alipay          → 验签 + 幂等
```

### 7.3 数据库（Supabase Postgres / Drizzle）

```sql
users(id uuid pk, email text unique, name text, created_at timestamptz)
projects(id uuid pk, user_id uuid fk, name text, document jsonb, version int, updated_at timestamptz)
plans(id text pk, name text, price_cents int, currency text, interval text, features jsonb)
subscriptions(id uuid pk, user_id uuid fk, plan_id text fk, provider text, provider_sub_id text unique,
              status text, current_period_end timestamptz, created_at timestamptz)
entitlements(id uuid pk, user_id uuid fk, feature text, source text, expires_at timestamptz)
exports(id uuid pk, user_id uuid fk, project_id uuid fk, format text, status text,
        storage_key text, expires_at timestamptz, created_at timestamptz)
audit_events(id uuid pk, user_id uuid fk, action text, meta jsonb, created_at timestamptz)
```

RLS：`projects`、`exports`、`subscriptions` 仅 owner 可读写；`plans` 公开读；`audit_events` 仅服务端写。

### 7.4 套餐与权益

| 套餐 | 价格示例 | 权益 |
| --- | --- | --- |
| Free | 0 | 30 套模板预览、HTML/JSON 导出、云项目 3 个、带 GANTRY 角标 |
| Pro | ¥99/月 或 $19/月 | 去角标、源码导出、云项目无限、优先构建 |
| Studio | ¥299/月 或 $49/月 | Pro + 5 个席位、团队项目、优先支持 |

`features_json` 示例：

```json
{
  "html.export": true,
  "source.export": true,
  "premium.templates": true,
  "cloud.projects": true,
  "team.seats": 5
}
```

### 7.5 支付适配器

```ts
export interface PaymentProvider {
  id: 'stripe' | 'wechat' | 'alipay';
  createCheckout(input: {
    userId: string; planCode: PlanCode; successUrl: string; cancelUrl: string;
  }): Promise<{ url: string; providerSessionId: string }>;
  verifyWebhook(rawBody: string, signature: string): Promise<WebhookEvent>;
}
```

- Stripe：Checkout Session + `checkout.session.completed` / `customer.subscription.updated` / `deleted`。
- 微信：Native 扫码，`transaction.success` 通知；需要商户号与 API v3 密钥。
- 支付宝：电脑网站支付，异步通知验签；需要应用私钥/支付宝公钥。
- Webhook 必须：原始 body 验签、事件幂等表、失败重试、审计日志；不得信任前端回跳页。

### 7.6 源码导出安全清单

- [ ] `POST /v1/exports/source` 必须验证 Supabase JWT。
- [ ] 必须查询 `entitlements`，而不是相信请求体里的 `plan`。
- [ ] 必须校验 `project.user_id === user.id`。
- [ ] 生成在服务端完成；前端只拿 `exportId` 与短时签名 URL。
- [ ] 签名 URL 5 分钟过期；对象存储私有 bucket。
- [ ] 同一 `idempotencyKey` 10 分钟内复用同一 export，避免重复扣费/重复构建。
- [ ] 失败返回 `402 UPGRADE_REQUIRED` / `403 FORBIDDEN` / `404 NOT_FOUND`，不泄露项目是否存在。
- [ ] 记录 `audit_events`：user、project、format、ip、ua、result。
- [ ] 单元测试覆盖：未登录、无权益、过期会员、他人项目、重复请求、签名过期。

---

## 8. 分阶段执行计划

> 每个 Task 都以「失败测试 → 最小实现 → 通过 → 回归 → 提交」推进。人工验收节点用 ✅ 标记。

### Phase 0：冻结基线与决策（0.5 天）

**Task 0.1 记录基线**
- 文件：`docs/ADR/0001-baseline.md`
- 内容：当前 30 套模板、131 单测、10 E2E、构建体积、已知边界。
- 命令：`npx tsc --noEmit && npx vitest run && npx playwright test && npm run build`。
- 验收：四项输出贴进 ADR；后续任何回归可对比。

**Task 0.2 决策记录**
- 文件：`docs/ADR/0002-v2-boundaries.md`
- 决策：扁平 Theme 扩展、SectionStyle schema、模板懒加载、源码导出服务端化、Supabase + Hono、provider-hosted checkout。
- 验收：每条决策写「选择 / 放弃的替代方案 / 原因」。

### Phase 1：主题 token 与样式 schema（3–4 天）

**Task 1.1 对比度纯函数**
- 文件：`src/lib/theme/contrast.ts`、`src/lib/theme/contrast.test.ts`
- 接口：`hexToRgb`、`relativeLuminance`、`contrastRatio`、`ensureContrast`。
- 测试：黑白 21:1、同色 1:1、无效 hex 抛错、`ensureContrast` 在 3 次迭代内达到阈值。
- 命令：`npx vitest run src/lib/theme/contrast.test.ts`。

**Task 1.2 扩展 Theme + 18 套主题**
- 文件：`src/types/site.ts`、`src/data/themes.ts`、`src/lib/theme/tokens.ts`、`src/lib/theme/tokens.test.ts`。
- 迁移：14 套主题补齐 `surface/accentSoft/focus/displayWeight/bodySize/tracking/borderWidth/sectionSpace/motion`；新增 `alloy/cargo/reagent/surgical`。
- 测试：每套主题 token 完整；`themeToCssVars` 输出 20 个变量；`validateTheme` 对低对比主题返回 issue。
- 验收：主题面板 18 套可切换，无 console error。

**Task 1.3 SectionStyle 解析**
- 文件：`src/types/style.ts`、`src/lib/style/sectionStyle.ts`、`src/lib/style/sectionStyle.test.ts`。
- 接口：`resolveSectionStyle(section, device)`、`styleToVars(style)`、`DEFAULT_SECTION_STYLE`。
- 测试：默认值、mobile 覆盖、非法 columns 回退、overlay 0–80 clamp。
- 迁移：现有 `variant` 映射到 `style.layout`；renderer 先读 `style.layout ?? variant ?? default`。

**Task 1.4 Renderer 支持 data 属性与 CSS 变量**
- 文件：`src/components/site/Sections.tsx`、`src/components/site/Heroes.tsx`、`src/styles/site.css`。
- 测试：`SiteRenderer.test.tsx` 增加 data-layout/data-density/data-surface 断言；桌面/手机快照。
- 验收：现有 30 套模板视觉不回归；`npx playwright test e2e/templates.spec.ts`。

**Task 1.5 Inspector 拆分为 4 个 panel**
- 文件：`src/components/builder/inspector/ContentPanel.tsx`、`StylePanel.tsx`、`ThemePanel.tsx`、`ExportPanel.tsx`、`Inspector.tsx`。
- 要求：只搬家不改行为；原有 8 个 Inspector 测试必须全过。
- 验收：`Inspector.tsx` < 250 行；每个 panel < 500 行。

**Task 1.6 StylePanel schema 驱动**
- 文件：`src/lib/style/controls.ts`、`src/components/builder/inspector/StylePanel.tsx`、`src/store/builder.ts`、`StylePanel.test.tsx`。
- store 新 action：`updateSectionStyle(id, patch, options?: { mobile?: boolean; commit?: boolean })`。
- 测试：只显示允许控件；切换 layout 写入 doc；手机覆盖写 `style.mobile`；重置恢复默认；undo 一步回退。
- 验收：选中 metrics/capabilities/products 各改 3 个属性，画布即时变化，刷新后保持。

### Phase 2：图片裁剪与焦点（2–3 天）

**Task 2.1 MediaRef v2 + 纯函数**
- 文件：`src/types/media.ts`、`src/lib/media/focal.ts`、`src/lib/media/focal.test.ts`。
- 测试：边界、zoom、crop 窗口、NaN 回退。
- 迁移：`Product.image` string → MediaRef；`createSection` 默认 MediaRef；`siteToHtml` 读取新字段。

**Task 2.2 MediaImage 组件**
- 文件：`src/components/site/MediaImage.tsx`、`MediaImage.test.tsx`、`site.css`。
- 行为：aspect-ratio、object-position、scale(zoom)、loading lazy、alt 必填。
- 测试：focal 0/0.5/1 输出正确 object-position；zoom 1/2；无 alt 抛开发警告。

**Task 2.3 ImageField + ImageCropper**
- 文件：`src/components/builder/media/ImageField.tsx`、`ImageCropper.tsx`、`ImageCropper.test.tsx`、`shell.css`。
- 约束：`ImageCropper` 通过 `React.lazy` 动态加载，不进入首屏 bundle。
- 交互：上传/替换/URL/重置；拖拽焦点；缩放；比例；键盘；取消/应用；Esc 关闭。
- 测试：拖拽更新 focal；方向键 1%；Shift 10%；应用回写；取消不写；焦点不能越界。
- 验收：上传一张 4:3 图，切 16:9，焦点移到右侧，导出 HTML 后构图保持。

**Task 2.4 导出烘焙**
- 文件：`src/lib/media/bake.ts`、`bake.test.ts`、`exportSite.ts`。
- 行为：按 `computeCropRect` 在 canvas 裁剪；最大边 2400px；JPEG/WebP 质量 0.86；CORS 失败回退原图。
- 测试：mock canvas 尺寸；输出 dataURL 前缀；超大图缩放；失败回退。

### Phase 3：模板扩到 30（5–6 天）

**Task 3.1 新行业与 4 套主题**
- 文件：`src/types/site.ts`、`src/data/taxonomy.ts`、`src/data/themes.ts`、对应测试。
- 验收：行业 13 个、主题 18 套、市场 2 个；类型无 any；所有 label/labelEn 完整。

**Task 3.2 模板工厂**
- 文件：`src/data/templates/factory.ts`、`factory.test.ts`。
- 接口：`makeTemplate(seed)`、`makeHero(seed)`、`makeMetrics(...)`、`makeFooter(...)`。
- 测试：8 个区块、唯一 id、nav 排除 hero/footer、市场决定 nav 语言、全局 id 唯一。

**Task 3.3 迁移现有 15 套**
- 文件：`src/data/templates/cn/*.ts`、`global/*.ts`、`meta.ts`、`index.ts`。
- 要求：现有文案/图片不变；只改结构；15 套快照对照。
- 验收：`loadTemplate()` 15 套全部打开；旧 URL/草稿迁移可用。

**Task 3.4 五金 + 物流（6 套）**
- 文件：`cn/ironworks-supply.ts`、`global/forge-toolworks.ts`、`global/kern-hardware.ts`、`cn/haul-line.ts`、`global/port-authority.ts`、`cn/cold-chain.ts`。
- 验收：每套 8 区块；桌面/手机截图；无横向溢出；国际站英文。

**Task 3.5 化工 + 医疗（6 套）**
- 文件：`cn/reagent-works.ts`、`global/basel-synth.ts`、`cn/polymer-line.ts`、`cn/surgical-instruments.ts`、`global/medtech-north.ts`、`cn/care-device.ts`。
- 验收：同上；医疗模板不得使用血腥/临床恐怖图；化工模板必须有安全/合规文案。

**Task 3.6 汽车（3 套）+ 30 套总装**
- 文件：`cn/drivetrain.ts`、`global/stuttgart-parts.ts`、`cn/ev-platform.ts`、`meta.ts`。
- 验收：30 套、13 行业、18 主题；Gallery 计数动态；筛选组合无死路。

**Task 3.7 Gallery 懒加载与 30 套筛选**
- 文件：`Gallery.tsx`、`meta.ts`、`index.ts`、`Gallery.test.tsx`、`e2e/gallery.spec.ts`。
- 验收：首屏不加载 30 套 sections；打开模板有 loading；筛选结果计数正确；搜索支持 code/name/nameEn/tag。
- 性能：初始 JS gzip < 230KB；单个模板 chunk < 20KB。

### Phase 4：导出 v2 与权益接缝（3–4 天）

**Task 4.1 HTML 导出升级**
- 文件：`src/lib/export/html.ts`（从 `exportSite.ts` 拆出）、`exportSite.test.ts`。
- 内容：新 token、focal/zoom、18 主题、30 模板、英文 lang、meta OG。
- 验收：导出 3 套（TRS/LUM/SRG）用 `file://` 打开，桌面/手机截图一致。

**Task 4.2 源码包生成器（服务端纯函数）**
- 文件：`server/src/export/buildSource.ts`、`server/src/export/templates.ts`、`server/test/buildSource.test.ts`。
- 依赖：`fflate`。
- 约束：生成器只从 server 入口导入；前端 bundle 不得包含源码包模板。
- 产物：`package.json`、`vite.config.ts`、`index.html`、`src/main.tsx`、`src/site/Site.tsx`、`content.json`、`site.css`、`public/assets/*`。
- 测试：zip 条目齐全；`content.json` 可 round-trip；无密钥/无 `.env`；源码中不含 GANTRY 内部 token。
- 验收：本地生成一个样例，`npm install && npm run build` 能通过（在临时目录）。

**Task 4.3 权益接缝 + ExportPanel**
- 文件：`src/types/entitlement.ts`、`src/lib/entitlement/gateway.ts`、`ExportPanel.tsx`、`ExportPanel.test.tsx`。
- 行为：Free 显示「源码导出 · Pro」；点击打开升级弹窗；登录后刷新权益；服务端 402 显示升级；构建中轮询；过期链接提示重新生成。
- 测试：guest/free/pro/expired 四态；不读 localStorage 授权；dev mock 标注。
- 验收：前端无任何「只改 localStorage 就能导出源码」的路径。

### Phase 5：后端、登录、会员、支付（6–8 天）

**Task 5.1 API 骨架**
- 文件：`server/src/index.ts`、`server/src/auth.ts`、`server/tsconfig.json`、`server/test/health.test.ts`。
- 配置：`vite.config.ts` 的 `test.include` 增加 `server/test/**/*.test.ts`；`package.json` 增加 `api:dev: "tsx server/src/index.ts"`。
- 内容：Hono、CORS、请求 id、结构化日志、Supabase JWT 验证中间件、`GET /health`。
- 测试：无 token 401、坏 token 401、好 token 200。
- 命令：`npm run api:dev`、`npx vitest run server/test/health.test.ts`。

**Task 5.2 项目 CRUD**
- 文件：`server/src/routes/projects.ts`、`server/src/db/schema.ts`、`server/test/projects.test.ts`。
- 测试：owner 可读写、他人 404、version 冲突 409、文档 Zod 校验。
- 验收：前端保存/恢复云项目；localStorage 仍可离线工作。

**Task 5.3 权益与套餐**
- 文件：`server/src/routes/entitlements.ts`、`server/src/db/seed.ts`、`server/test/entitlements.test.ts`。
- 测试：free/pro/studio 快照；过期会员降级；`/v1/me` 聚合 subscription+entitlements。
- 验收：前端 `useEntitlement()` 只读 API。

**Task 5.4 源码导出服务**
- 文件：`server/src/routes/exports.ts`、`server/src/export/buildSource.ts`、`server/test/exports.test.ts`。
- 测试：未登录 401、free 402、pro 202、他人项目 404、重复 idempotency 复用、签名 URL 过期。
- 验收：真实 Supabase Storage 上传/下载；审计表有记录。

**Task 5.5 支付适配器**
- 文件：`server/src/routes/billing.ts`、`server/src/routes/webhooks.ts`、`server/src/payments/*.ts`、`server/test/webhooks.test.ts`。
- 测试：Stripe 签名、重复事件幂等、订阅更新、取消；微信/支付宝 fixture 验签。
- 验收：Stripe test mode 完成一次 Pro 购买，webhook 后 `/v1/me` 变为 pro。

**Task 5.6 前端登录与升级**
- 文件：`src/components/auth/*`、`src/lib/auth.ts`、`src/components/billing/UpgradeDialog.tsx`、`e2e/auth.spec.ts`。
- 流程：登录 → 套餐页 → checkout → 回跳 → 权益刷新 → 源码导出可用。
- 测试：Playwright 用 Supabase 测试用户；无真实支付，mock checkout URL。
- 验收：未登录点源码导出 → 登录 → 升级 → 导出，全链路可走通。

### Phase 6：质量收口（2–3 天）

**Task 6.1 单元与集成**
- 目标：lib 90%、store 85%、components 75%；新增 30 套模板数据测试。
- 命令：`npx vitest run --coverage`。

**Task 6.2 E2E 矩阵**
- 文件：`e2e/templates.spec.ts`、`editor.spec.ts`、`export.spec.ts`、`auth.spec.ts`。
- 覆盖：30 套打开、6 种 hero、桌面/手机、裁剪、样式、撤销、导出、登录/升级。
- 命令：`npx playwright test --workers=2`。

**Task 6.3 视觉回归**
- 文件：`e2e/visual.spec.ts`、`e2e/__screenshots__/`。
- 30 套 × 2 视口 = 60 张；阈值 `maxDiffPixelRatio: 0.01`。
- 只在设计变更时 `--update-snapshots`，并在 PR 说明里附 diff。

**Task 6.4 可访问性与性能**
- 依赖：`@axe-core/playwright`。
- axe：无 serious/critical；键盘可达所有控件；焦点可见。
- 性能：LCP < 2.5s（本地 4G 模拟）、初始 JS gzip < 230KB、模板 chunk < 20KB。
- 命令：`npx playwright test e2e/a11y.spec.ts`、`npx vite-bundle-visualizer`（或 `npm run build` 体积报告）。

**Task 6.5 验收报告**
- 文件：`docs/ACCEPTANCE.md`
- 内容：需求对照表、命令输出、截图、已知限制、下一阶段。
- 验收：用户按清单逐项勾选；没有「应该可以」的表述。

---

## 9. 测试策略

| 层 | 工具 | 范围 | 门槛 |
| --- | --- | --- | --- |
| 纯函数 | Vitest | contrast / focal / crop / sectionStyle / factory / source manifest | 90% 行覆盖，边界必测 |
| Store | Vitest | 新 action、undo、迁移、持久化 | 85% |
| 组件 | Testing Library | StylePanel、ImageCropper、ExportPanel、MediaImage | 75% |
| 数据 | Vitest | 30 套 × 8 区块、唯一 id、市场/行业/风格分布 | 100% 模板 |
| E2E | Playwright | 打开/筛选/编辑/裁剪/主题/导出/登录 | 30 套 smoke |
| 视觉 | Playwright screenshots | 30 × 2 视口 | diff ≤ 1% |
| A11y | axe-core | Gallery/Builder/导出页 | 0 serious/critical |
| 性能 | Lighthouse / bundle | 初始 JS、LCP、模板 chunk | 见门槛 |

测试命名约定：

- 纯函数：`describe('computeCropRect')` + `it('clamps zoomed crop to image bounds')`。
- 组件：用 role/label 查询，不用 CSS class；只有画布断言用 `data-*`。
- E2E：用 `getByRole`/`getByLabel`；禁止 `page.waitForTimeout` 作为断言，只用于动画稳定。
- 视觉：截图前 `await page.evaluate(() => document.fonts.ready)`，关闭动画。

---

## 10. Skill 使用矩阵

| 阶段 / 场景 | Skill | 用法 | 期望效果 |
| --- | --- | --- | --- |
| 每个 Phase 开始 | `brainstorming` | 先确认范围、取舍、验收标准 | 避免做错方向 |
| 本工作流 / 任务拆解 | `writing-plans` | 文件、接口、测试、命令、验收 | 执行者零上下文可做 |
| 纯函数 / schema / 导出 | `test-driven-development` | 红-绿-重构；先写失败测试 | 逻辑可回归 |
| 主题 / 模板视觉 | `frontend-design` + `ui-ux-pro-max` | 先定 art direction，再选 palette/font；不套默认暗色 SaaS | 30 套不雷同 |
| UI 规范 / 可访问性 | `web-design-guidelines` | 检查对比度、焦点、键盘、语义 | 无 serious a11y |
| 组件 API | `vercel-composition-patterns` | 用 compound components / slot 替代布尔 prop 爆炸 | Inspector 可扩展 |
| 性能 / 拆包 | `vercel-react-best-practices` | 动态 import、避免 barrel、memo 边界 | 初始 JS < 230KB |
| E2E / 视觉 | `playwright-best-practices` + `webapp-testing` | fixtures、storageState、视觉快照、移动端 | 30 套稳定 |
| 代码审查 | `code-review-excellence` + `requesting-code-review` | 每个 Task 后自审 + 交叉审 | 早发现设计问题 |
| 安全 / 支付 / 导出 | `review-security` + `review-bugbot` | 鉴权、越权、webhook、签名 URL | 无客户端授权漏洞 |
| 调试 | `systematic-debugging` | 先复现、再定位、再修复 | 不猜修复 |
| 最终验收 | `verification-before-completion` | 每条声明附命令输出/截图 | 不虚报完成 |

执行时每个 Task 的 PR 描述必须写：

```text
Skill used: test-driven-development, vercel-react-best-practices
Tests: npx vitest run src/lib/style/sectionStyle.test.ts (12 passed)
E2E: npx playwright test e2e/editor.spec.ts --grep "style panel" (2 passed)
Screenshots: docs/evidence/style-panel-desktop.png
```

---

## 11. 质量门禁

### G0 计划门禁
- [ ] 本文件评审通过；范围、30 套矩阵、权益模型无异议。

### G1 静态门禁
- [ ] `npx tsc --noEmit` 0 error。
- [ ] `npm run lint` 0 error / 0 warning。
- [ ] 无新增 `any`、无 `@ts-ignore`（除非 ADR 记录）。

### G2 单测门禁
- [ ] `npx vitest run` 全绿。
- [ ] 覆盖率：lib ≥ 90%、store ≥ 85%、components ≥ 75%。

### G3 E2E 门禁
- [ ] `npx playwright test` 全绿。
- [ ] 30 套模板各打开一次，8 区块存在。
- [ ] 1440×900 与 390×844 无横向溢出。
- [ ] 无 console error / pageerror。

### G4 视觉门禁
- [ ] 60 张截图 diff ≤ 1%。
- [ ] 6 种首屏各至少 4 套，视觉可区分。
- [ ] 18 套主题切换不出现文字不可读。

### G5 可访问性门禁
- [ ] axe 0 serious/critical。
- [ ] 所有交互可键盘完成；焦点环可见。
- [ ] 图片 alt 完整；表单 label 关联。

### G6 性能门禁
- [ ] 初始 JS gzip < 230KB。
- [ ] 单个模板 chunk < 20KB。
- [ ] 4G 模拟 LCP < 2.5s。
- [ ] 30 套 Gallery 首屏不加载 sections。

### G7 安全门禁
- [ ] 源码导出无客户端授权路径。
- [ ] 未登录/无权益/过期会员/他人项目测试全过。
- [ ] Webhook 验签 + 幂等测试全过。
- [ ] 无密钥进入前端 bundle。

### G8 文档门禁
- [ ] README 更新 30 套 / 18 主题 / 新命令。
- [ ] `docs/ACCEPTANCE.md` 有逐项证据。
- [ ] ADR 记录关键取舍。

---

## 12. 风险与应对

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| 30 套模板复制爆炸 | 维护成本高、风格趋同 | 模板工厂 + seed；每套只写内容；视觉评审 |
| 主题 token 扩展破坏旧模板 | 现有 15 套回归 | 默认值 + 迁移测试 + 逐套截图 |
| 图片裁剪数学错误 | 导出构图错位 | 纯函数 + 边界测试 + 导出实测 |
| 源码导出被白嫖 | 商业损失 | 服务端权益 + 签名 URL + 审计 |
| 支付合规/商户号 | 国内支付无法上线 | 先 Stripe test mode；微信/支付宝只做适配器与文档，待资质 |
| bundle 变大 | 首屏慢 | meta/sections 拆分、动态 import、bundle 分析 |
| Supabase RLS 配置错 | 越权 | 服务端二次校验 + 集成测试 + 安全 review |
| 会员状态不同步 | 付了不能用 | webhook 幂等 + `/me` 刷新 + 重试队列 |
| 现有测试拖慢 | 迭代慢 | 按文件跑、CI 分片、E2E 只跑 smoke |

---

## 13. 验收清单（v2 Definition of Done）

### 模板
- [ ] 30 套模板，13 个行业，18 套主题，2 个市场。
- [ ] 每套 8 个区块，桌面/手机截图通过。
- [ ] 国际模板英文完整，国内模板中文完整。
- [ ] Gallery 市场/行业/风格/搜索组合可用，计数正确。

### 编辑器
- [ ] 内容/样式/主题/导出四 tab。
- [ ] 8 类区块都有组件级样式控制，手机可覆盖。
- [ ] 图片可上传、替换、焦点、缩放、比例、重置。
- [ ] 撤销/重做覆盖样式与图片改动。
- [ ] v1 草稿可迁移，不丢数据。

### 导出
- [ ] HTML 单文件包含新 token、focal、响应式、菜单脚本。
- [ ] 源码包可 `npm install && npm run build`。
- [ ] Free 不能源码导出；Pro 可以；过期降级。
- [ ] 服务端 402/403/404 语义正确。
- [ ] 导出审计可查。

### 账号与支付
- [ ] 邮箱 OTP / Google 登录可用。
- [ ] 套餐页、checkout、回跳、权益刷新可用。
- [ ] Stripe test mode webhook 激活 Pro。
- [ ] 微信/支付宝适配器接口与 fixture 测试完成（真实商户号可后补）。

### 质量
- [ ] G1–G8 全绿。
- [ ] README / WORKFLOW / ACCEPTANCE / ADR 完整。
- [ ] 演示路径 5 分钟可讲完：选行业 → 选模板 → 改样式 → 裁图 → 切手机 → 导出 HTML → 升级 → 导出源码。

---

## 14. 建议执行顺序（第一批）

1. Task 0.1 / 0.2：基线 + ADR。
2. Task 1.1–1.4：token、SectionStyle、renderer；先不动 UI。
3. Task 1.5–1.6：Inspector 拆分 + StylePanel。
4. Task 2.1–2.3：MediaRef + MediaImage + Cropper。
5. Task 3.1–3.3：新行业/主题 + 工厂 + 迁移 15 套。
6. Task 3.4–3.7：15 套新模板 + Gallery 懒加载。
7. Task 4.1–4.3：导出 v2 + 权益接缝。
8. Task 5.1–5.6：后端/登录/会员/支付。
9. Task 6.1–6.5：质量收口 + 验收。

每个 Task 完成后立即跑对应测试，不积压到 Phase 结束。每个 Phase 结束跑一次全量门禁并截图；截图存入 `docs/evidence/<phase>/`，作为验收证据。
