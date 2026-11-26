# ADR 0001 — 当前基线

- 状态：Accepted
- 日期：2026-11-25
- 决策人：产品 / 工程（单人项目）

> 2026-11-26 更新：模板目录扩展为 715 套（13 行业 × 11 风格 × 每组合 5 套）；新增 Java 21 + Spring Boot 后端、七语言/RTL、多页与云端项目。本文记录当时 30 套基线，当前质量数据以 `docs/ACCEPTANCE.md` 为准。

## 背景

GANTRY 的第一步目标不是做一个通用页面搭建器，而是验证一条可演示的工业官网生产链路：

行业 → 风格 → 主题 → 首屏叙事 → 编辑 → 导出。

在这一步里，模板的“叙事完整度”和编辑后的视觉一致性，比“任意拖拽”更重要。

## 当前实现

- React 19 + TypeScript 5.9 + Vite 7 + Zustand 5。
- 30 套模板：20 套国内中文、10 套国际英文。
- 13 个行业、11 个风格、18 套主题、2 个市场。
- 7 种首屏：滚动视频、图片拼贴、分屏社论、全幅、动态字、产品舞台。
- 8 个区块：hero / metrics / capabilities / products / process / proof / cta / footer。
- 编辑器：模板库筛选、区块内容编辑、图片上传、图片焦点/缩放/独立裁剪、组件级 SectionStyle、主题 token、多页、云端项目、桌面/手机视图、预览、undo/redo、localStorage 草稿。
- 导出：单文件 HTML（内联 CSS、图片 dataURL、滚动/菜单 runtime）、整站 ZIP，以及 JSON 项目源文件；JSON 带演示级 Pro 门槛。
- 质量门禁：149 个 Vitest 单测、33 条 Playwright E2E、4 条后端 Spring Boot 测试、tsc、ESLint、build。
- 后端：Java 21 + Spring Boot 3.5.6、JWT/refresh、项目/页面、乐观锁、导出 artifact、H2/PostgreSQL、Flyway。

## 验证输出（2026-11-25）

- `npx tsc --noEmit`：通过。
- `npx vitest run`：23 个测试文件，149 个测试通过。
- `npx playwright test`：11/11 passed，覆盖 30 套模板 smoke、独立裁剪、云端多页、导航切页与登录闸门。
- `npm run build`：1666 modules；首屏 `index` 482.83 kB / gzip 160.97 kB；按需 `Builder` 369.30 kB、`Gallery` 17.05 kB；CSS 110.12 kB。
- `mvn -B test`：4 tests，0 failures。
- `npm run lint`：0 error / 0 warning。

## 关键决策

1. **采用“模板 + 可控编辑”，不做自由画布。**
   工业客户的官网需要稳定的信息结构；自由拖拽会迅速产生不可维护的页面。

2. **主题 token 与页面布局分离。**
   主题只改颜色、字体、圆角、网格；布局由区块 recipe 决定。否则换主题会破坏版式。

3. **首屏是叙事组件，不是背景图。**
   视频、拼贴、分屏、产品舞台各自有独立布局和滚动行为，不能用一个 hero 加参数硬套。

4. **HTML 导出在客户端完成。**
   第一步没有后端，单文件 HTML 是最小可交付物；源码导出涉及权限与计费，留到 v2。

5. **模板数据是纯数据。**
   模板不携带 JSX；页面结构由 renderer 决定，模板只描述内容、recipe、主题和素材。

## 后果

- 优点：视觉一致、可测试、可批量扩模板、导出可复用 renderer。
- 代价：页面结构不能任意改；需要更多模板覆盖不同行业，而不是让用户自由拼布局。
- v2 继续沿用这些边界，只增加组件级样式、图片焦点、更多模板与服务端权益。
