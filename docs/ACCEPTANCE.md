# GANTRY 验收记录

日期：2026-11-25  
范围：当前仓库 `E:\asd\gantry-studio` 的前端可交互版本（Phase 1–3）。

## 1. 验收结论

前端低保真到高保真可交互版本通过验收：

- 30 套官网模板可筛选、可打开、可编辑、可导出。
- 6 种首屏叙事、8 类区块、18 套主题、11 种风格、13 个行业。
- 桌面/手机双视图、滚动视频、3–4 图拼贴、组件级样式、图片焦点/缩放均可用。
- 112 个单元测试、6 条 Playwright E2E、类型检查、Lint、生产构建全部通过。

尚未通过的部分：真实登录、在线支付、服务端源码导出鉴权。当前仅实现前端 entitlement 演示门槛，按 `docs/WORKFLOW.md` Phase 5 接入后端。

## 2. 功能对照

| 要求 | 实现 | 证据 |
| --- | --- | --- |
| 超多类型官网 | 30 套模板：机械、玻璃、商品、半导体、能源、机器人、仪器、建筑、五金、物流、化工、医疗、汽车 | `src/data/templates.ts`、`src/data/globalTemplates.ts`、`src/data/extraTemplates.ts` |
| 国内外风格 | 20 套中文 + 10 套英文；市场筛选；英文导航/CTA/文档语言 | `e2e/site.spec.ts` 市场筛选用例 |
| 用户配置图片 | 上传、焦点 X/Y、缩放 1–2.5；烘焙到 HTML inline style | `Inspector` 的 `MediaField`/`CropField`、`src/lib/media.ts` |
| 视频背景随滚动播放 | `useSectionProgress` 驱动 `video.currentTime`；235vh 滚动段 | E2E `scroll position drives the hero video timeline` |
| 3–4 张图按页面高度组合 | 6 种 hero 中的 image-collage；图片按滚动进度位移 | `Heroes.tsx`、`site.css` |
| 桌面/手机切换 | Builder 设备切换；容器查询重排；手机预览 390×844 | E2E 手机无横向溢出、截图 `builder-mobile.png` |
| 模板选择后自由编辑 | 内容字段、内联文本、区块增删/排序/隐藏、主题、SectionStyle、撤销/重做 | `store/builder.ts`、`Inspector.tsx` |
| 生成代码 | 单文件 HTML：内联 CSS、图片 dataURL、视频、滚动/菜单 runtime | E2E 导出后用 `file://` 打开并断言 8 区块 |
| 源码/会员边界 | HTML 免费；JSON 项目源文件加演示级 Pro 门槛 | `src/lib/entitlement.ts`、`builder-export.png` |

## 3. 命令与结果

```bash
npx tsc --noEmit          # 通过
npx vitest run            # 15 files, 112 tests passed
npx playwright test       # 6 passed (24.6s)
npm run lint              # 0 error, 0 warning
npm run build             # 1622 modules
```

构建体积：

- 首屏 `index` 350.78 kB / gzip 116.85 kB
- 按需 `Builder` 323.84 kB / gzip 92.11 kB，`Gallery` 19.35 kB / gzip 6.68 kB
- CSS 87.96 kB / gzip 16.27 kB

## 4. 视觉验收

已检查截图：

- `screenshots/gallery-top.png`：30 TEMPLATES / 13 行业 / 11 风格 / 02 市场
- `screenshots/gallery-templates.png`：30 套卡片
- `screenshots/gallery-global.png`、`gallery-global-cards.png`：国际市场 10 套
- `screenshots/builder-desktop.png`、`builder-mobile.png`
- `screenshots/builder-hdw.png`、`builder-lgc.png`、`builder-chm.png`、`builder-med.png`、`builder-aut.png`、`builder-apx.png`
- `screenshots/builder-style.png`、`builder-style-applied.png`
- `screenshots/builder-cropper.png`、`builder-cropper-applied.png`
- `screenshots/builder-export.png`
- `screenshots/preview-mobile.png`

## 5. 已知边界

1. 单页官网；多页、博客、产品详情页未实现。
2. 独立裁剪弹窗已实现；压缩质量与格式选择未实现。
3. 真实登录、云项目、支付、服务端源码生成未接入；entitlement 仅为前端演示。
4. 编辑器是桌面工作台；手机视图用于预览，不用于手机端编辑。
5. 首屏 JS 约 351 kB；Builder 与 Gallery 已路由级拆包，模板数据仍可继续拆分。

## 6. 下一步

- Phase 5：Supabase Auth/项目存储 + Hono 权益 API + Stripe/微信/支付宝。
- Phase 6：30 套全量视觉回归、axe 可访问性、移动端布局断言、验收报告定稿。
