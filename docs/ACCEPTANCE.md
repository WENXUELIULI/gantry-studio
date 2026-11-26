# GANTRY 验收记录

日期：2026-11-25  
范围：`E:\asd\gantry-studio` 的前后端可运行版本（Phase 1–4）。

## 1. 验收结论

低代码官网生成器的主链路通过验收：

- 715 套官网模板可筛选、可打开、可编辑、可生成；每个「行业 × 风格」组合恰好 5 套。
- 7 种首屏叙事、8 类区块、18 套主题、11 种风格、13 个行业。
- 桌面/手机双视图、滚动视频、3–4 图拼贴、组件级样式、图片焦点/独立裁剪均可用。
- 七语言 UI（zh-CN / en / ar / tr / he / fa / ur）与 RTL；生成站点可设置 locale，导出写入 lang/dir。
- 登录、云端项目、多页编辑、PC → 手机接力、单页 HTML / 整站 ZIP 导出已打通。
- 前端 149 个单元测试、33 条 Playwright E2E；后端 4 条 Spring Boot 集成测试；类型检查、Lint、生产构建全部通过。

尚未完成：真实源码（React/Java）生成、在线支付、手机端编辑工作台。JSON 项目源文件当前是页面文档，不是生成出来的工程源码。

## 2. 功能对照

| 要求 | 实现 | 证据 |
| --- | --- | --- |
| 超多类型官网 | 715 套模板：13 行业 × 11 风格 × 5 套；30 套手工 + 685 套工厂生成 | `frontend/src/data/templates.ts`、`generatedTemplates.ts`、`globalTemplates.ts` |
| 国内外风格 | 20 套中文 + 10 套英文；市场筛选；英文导航/CTA/文档语言 | `e2e/site.spec.ts` 市场筛选用例 |
| 用户配置图片 | 上传、焦点 X/Y、缩放 1–2.5、独立裁剪弹窗；烘焙到 HTML inline style | `Inspector` 的 `MediaField`/`CropField`/`ImageCropper`、`frontend/src/lib/media.ts` |
| 视频背景随滚动播放 | `useSectionProgress` 驱动 `video.currentTime`；235cqh 滚动段 | E2E `scroll position drives the hero video timeline` |
| 视频贯穿场景 | 首屏、数字、能力矩阵、产品系列共用一条视频；滚动到关键帧时推进视频并切换高亮章节 | VideoScene.tsx、E2E keeps one film behind hero... |
| 首屏视频与关键帧 | 媒体类型可切图片/视频；ambient/scrub；关键帧跳转时间并高亮栏目 | `Heroes.tsx`、`scroll.ts` 的 `keyframeTime`/`activeKeyframe`、E2E `routes keyframes to video time...` |
| 3–4 张图按页面高度组合 | image-collage；图片按滚动进度位移 | `Heroes.tsx`、`site.css` |
| 桌面/手机切换 | Builder 设备切换；容器查询重排；手机预览 390×844 | E2E 手机无横向溢出、`builder-mobile.png` |
| 模板选择后自由编辑 | 内容字段、内联文本、区块增删/排序/隐藏、主题、SectionStyle、撤销/重做 | `frontend/src/store/builder.ts`、`Inspector.tsx` |
| 空白创建 | 启动面板设语境 → 空白画布选 7 种首屏之一 → 按分组添加区块/变体；首屏、页脚受限；无首屏导出提示 | `BlankStartDialog.tsx`、`createBlankDocument`、E2E `starts from an empty canvas...` |
| 多页官网 | 页面 tab、添加页面、每页独立文档、整站 ZIP | `frontend/src/store/project.ts`、`e2e/cloud.spec.ts` |
| 登录与跨设备 | JWT 注册/登录/刷新；云端项目；PC 保存后同账号重新打开 | `backend/src/main/java/com/gantry/auth`、`frontend/src/lib/api.ts`、`cloudSave.ts` |
| 生成要求登录 | 未登录点击导出弹出登录；登录后才生成 HTML/ZIP | E2E `requires login before generating or exporting` |
| 生成代码 | 单文件 HTML 内联 CSS/图片/视频/滚动脚本；整站 ZIP 保留多页路径 | E2E 导出后用 `file://` 打开；`exportProject.test.ts` |
| 源码/会员边界 | HTML 免费；JSON 项目源文件 Free 锁定、Pro 演示解锁 | `backend` 402 `PRO_REQUIRED`；`entitlement.ts`；`builder-export.png` |

## 3. 命令与结果

前端：

```bash
cd frontend
npx tsc --noEmit          # 通过
npx vitest run            # 23 files, 149 tests passed
npx playwright test       # 33 passed (2.6m)
npm run lint              # 0 error, 0 warning
npm run build             # 1666 modules
```

前端构建体积：

- 首屏 `index` 482.83 kB / gzip 160.97 kB
- 按需 `Builder` 369.30 kB / gzip 107.86 kB，`Gallery` 17.05 kB / gzip 5.29 kB
- `ImageCropper` 3.27 kB / gzip 1.42 kB
- CSS 110.12 kB / gzip 20.41 kB

后端：

```bash
cd backend
mvn -B test               # 4 tests, 0 failures, BUILD SUCCESS
```

## 4. 视觉验收

- `screenshots/gallery-top.png`：715 TEMPLATES / 13 行业 / 11 风格 / 02 市场
- `screenshots/gallery-resume.png`：重新进入先回首页，并提供「继续上次编辑」草稿入口
- `screenshots/gallery-templates.png`：715 套目录（首屏 24 套分页）
- `screenshots/gallery-715.png`：715 套模板计数与筛选
- `screenshots/builder-generated.png`：工厂生成的行业 × 风格组合模板
- `screenshots/gallery-media.png`：FILM 徽章、视频卡片悬浮预览与三列不同封面
- `screenshots/builder-video-story.png`：视频贯穿场景与 LIVE FILM 徽章
- `screenshots/builder-generated-video.png`：生成方案的真实视频背景
- `screenshots/builder-process-resize.png`：居中长标题恢复横向排版，流程标题可调整高度
- `screenshots/gallery-global.png`、`gallery-global-cards.png`：国际市场模板
- `screenshots/builder-desktop.png`、`builder-mobile.png`
- `screenshots/builder-hdw.png`、`builder-lgc.png`、`builder-chm.png`、`builder-med.png`、`builder-aut.png`、`builder-apx.png`
- `screenshots/builder-style.png`、`builder-style-applied.png`
- `screenshots/builder-cropper.png`、`builder-cropper-applied.png`
- `screenshots/builder-export.png`：登录提示 + 单文件 HTML + 整站 ZIP + Free/Pro
- `screenshots/auth-dialog.png`、`builder-pages.png`、`cloud-projects.png`
- `screenshots/gallery-ar.png`、`builder-ar.png`：阿拉伯语 RTL 界面
- `screenshots/locale-menu.png`、`locale-menu-ar.png`：语言菜单的固定列宽、统一对齐与 RTL 定位
- `screenshots/builder-site-nav.png`：站点导航编辑器、页面目标选择、字号与 select 样式
- `screenshots/builder-mobile-menu.png`：手机菜单中的区块与页面入口
- `screenshots/builder-cta-target.png`：询价按钮目标改为页面
- `screenshots/builder-keyframes.png`、`builder-keyframe-active.png`：关键帧编辑与章节高亮
- `screenshots/builder-video-story.png`：视频贯穿首屏与数字/能力/产品章节
- `screenshots/builder-inline-sync.png`：画布标题编辑与右侧检查器实时同步
- `screenshots/builder-tooltip.png`：字段悬浮解释（媒体类型/播放方式/关键帧操作）
- `screenshots/blank-start.png`、`blank-canvas.png`、`blank-catalog.png`、`blank-built.png`：从空白开始、首屏选择、区块目录、空白画布成品
- `screenshots/builder-inspector-context.png`：检查器标题固定在顶部，输入时显示“正在编辑”
- `screenshots/footer-check.png`：页脚与其它区块共用 section gutter
- `screenshots/preview-mobile.png`

## 5. 已知边界

1. 生成的是静态 HTML / ZIP，不是可二次开发的 React 工程源码。
2. 云端保存是显式按钮，不是自动保存；冲突时由 `expectedVersion` 返回 409。
3. 支付未接；Pro 仍是本地演示 + 服务端 plan 字段，没有真实订单。
4. 编辑器是桌面工作台；手机用于查看/预览，不提供完整编辑。
5. 首屏 JS 约 482.83 kB；Builder 与 Gallery 已拆包，模板数据仍可继续懒加载。
6. 后端默认 H2 文件库；生产需切 PostgreSQL 并配置真实 JWT secret。
7. 七语言 UI 已覆盖导航、首屏、筛选、登录、云端、Builder 顶栏与导出面板；Inspector 字段与模板正文仍以中文/英文为主，五语内容翻译待补。

## 6. 下一步

- 前后端已推送到 GitHub，保留分阶段提交记录。
- 补页面标题/路径编辑与自动保存。
- 接支付（Stripe / 微信 / 支付宝）与真实权益校验。
- 实现服务端 React 源码生成与下载鉴权。
- 715 套全量视觉回归、移动端编辑、axe 可访问性。
