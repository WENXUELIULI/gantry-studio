# ADR 0002 — v2 边界

- 状态：Accepted
- 日期：2026-11-25
- 关联：[WORKFLOW.md](../WORKFLOW.md)

## 决策

### 1. 模板扩到 30 套，不靠“换色”充数

新增 15 套覆盖五金、物流、化工、医疗器械、汽车零部件，每个行业 3 套，各自有不同的首屏叙事、信息密度和主题。

模板总数 30：20 套中国市场、10 套国际市场；13 个行业、18 套主题。

### 2. 编辑深度到“组件级样式”，不到“任意布局”

每个区块可以有 layout / density / align / surface / ratio / columns / overlay / motion，以及移动端覆盖；由 `STYLE_CONTROLS` schema 驱动 Inspector。

不提供自由拖拽、绝对定位、自定义 CSS。工业官网需要的是可控变体，不是第二个 Figma。

### 3. 图片以 MediaRef 为中心

`MediaRef` 增加 `focal`、`zoom`、`aspect`、`assetId`；`Product.image` 从字符串迁移为 MediaRef。

裁剪/焦点是纯函数，先测 `computeCropRect`，再接 UI。ImageCropper 用 `React.lazy`，不进入首屏 bundle。

### 4. HTML 免费，源码包服务端鉴权

- HTML：客户端复用 `SiteRenderer` 生成，免费。
- 源码包：只在 `server/src/export/buildSource.ts` 生成，客户端只有 `ExportGateway`。
- 服务端校验 Supabase JWT + entitlement；未授权返回 402；成功后返回 15 分钟签名 URL，并写审计。
- 前端 bundle 不包含源码包模板，避免绕过。

### 5. 后端用 Supabase + Hono，支付做适配器

- Supabase：Auth / Postgres / Storage。
- Hono on Node：API、鉴权、导出、支付 webhook。
- Stripe：国际市场；微信/支付宝：国内市场，真实商户号确定前只写适配器接口与 fixture。
- 套餐：Free / Pro / Studio。

### 6. 先单页，再多页

v2 的 30 套模板仍是单页官网。多页（产品详情、案例详情、新闻）在 v2 之后再评估；数据结构预留 `pages` 的演进空间，但不在本阶段实现。

### 7. 不把“低代码”做成“代码编辑器”

用户编辑的是内容、样式 recipe、主题 token、媒体焦点；不暴露 JSX、CSS、脚本编辑。源码包是交付物，不是编辑界面。

## 放弃的替代方案

- **直接做 100 套换色模板**：数量看起来多，但首屏叙事和信息结构重复，客户一眼能看出是同一套；选择 30 套、每套独立文案与 recipe。
- **自由拖拽 / 绝对定位**：更像 Figma，但移动端重排、导出和可维护性都会崩；选择组件级样式变体。
- **只支持 CSS object-position 裁剪**：无法表达缩放、比例、导出时的真实裁剪；选择 MediaRef + computeCropRect。
- **客户端生成源码并前端校验会员**：可被绕过；选择服务端生成 + JWT/entitlement + 签名 URL。
- **自建账号/数据库/支付**：周期长、合规成本高；选择 Supabase + Hono + provider-hosted checkout。
- **一步做多页 CMS**：会稀释单页模板的质量；v2 先做单页，多页后置。

## 后果

- 30 套模板可通过工厂批量生成，但每套必须有独立文案、素材、首屏 recipe 与主题，避免“同一页换色”。
- Inspector 会变复杂，必须拆面板、做 schema 驱动和懒加载。
- 源码导出需要后端、鉴权、计费、审计，不能在前端“假装鉴权”。
- 图片裁剪/焦点会改变导出 HTML 的图片标记，`siteToHtml` 必须复用同一 `MediaImage` 逻辑。
