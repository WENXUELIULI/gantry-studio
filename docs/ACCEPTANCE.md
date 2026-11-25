# GANTRY 验收记录

日期：2026-11-25  
范围：`E:\asd\gantry-studio` 的前后端可运行版本（Phase 1–4）。

## 1. 验收结论

低代码官网生成器的主链路通过验收：

- 30 套官网模板可筛选、可打开、可编辑、可生成。
- 6 种首屏叙事、8 类区块、18 套主题、11 种风格、13 个行业。
- 桌面/手机双视图、滚动视频、3–4 图拼贴、组件级样式、图片焦点/独立裁剪均可用。
- 七语言 UI（zh-CN / en / ar / tr / he / fa / ur）与 RTL；生成站点可设置 locale，导出写入 lang/dir。
- 登录、云端项目、多页编辑、PC → 手机接力、单页 HTML / 整站 ZIP 导出已打通。
- 前端 138 个单元测试、17 条 Playwright E2E；后端 4 条 Spring Boot 集成测试；类型检查、Lint、生产构建全部通过。

尚未完成：真实源码（React/Java）生成、在线支付、手机端编辑工作台。JSON 项目源文件当前是页面文档，不是生成出来的工程源码。

## 2. 功能对照

| 要求 | 实现 | 证据 |
| --- | --- | --- |
| 超多类型官网 | 30 套模板：机械、玻璃、商品、半导体、能源、机器人、仪器、建筑、五金、物流、化工、医疗、汽车 | `frontend/src/data/templates.ts`、`globalTemplates.ts`、`extraTemplates.ts` |
| 国内外风格 | 20 套中文 + 10 套英文；市场筛选；英文导航/CTA/文档语言 | `e2e/site.spec.ts` 市场筛选用例 |
| 用户配置图片 | 上传、焦点 X/Y、缩放 1–2.5、独立裁剪弹窗；烘焙到 HTML inline style | `Inspector` 的 `MediaField`/`CropField`/`ImageCropper`、`frontend/src/lib/media.ts` |
| 视频背景随滚动播放 | `useSectionProgress` 驱动 `video.currentTime`；235cqh 滚动段 | E2E `scroll position drives the hero video timeline` |
| 3–4 张图按页面高度组合 | image-collage；图片按滚动进度位移 | `Heroes.tsx`、`site.css` |
| 桌面/手机切换 | Builder 设备切换；容器查询重排；手机预览 390×844 | E2E 手机无横向溢出、`builder-mobile.png` |
| 模板选择后自由编辑 | 内容字段、内联文本、区块增删/排序/隐藏、主题、SectionStyle、撤销/重做 | `frontend/src/store/builder.ts`、`Inspector.tsx` |
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
npx vitest run            # 23 files, 138 tests passed
npx playwright test       # 9 passed (35.6s)
npm run lint              # 0 error, 0 warning
npm run build             # 1661 modules
```

前端构建体积：

- 首屏 `index` 458.60 kB / gzip 153.12 kB
- 按需 `Builder` 350.15 kB / gzip 102.53 kB，`Gallery` 19.11 kB / gzip 6.43 kB
- `ImageCropper` 3.27 kB / gzip 1.42 kB
- CSS 98.36 kB / gzip 18.38 kB

后端：

```bash
cd backend
mvn -B test               # 4 tests, 0 failures, BUILD SUCCESS
```

## 4. 视觉验收

- `screenshots/gallery-top.png`：30 TEMPLATES / 13 行业 / 11 风格 / 02 市场
- `screenshots/gallery-templates.png`：30 套卡片
- `screenshots/gallery-global.png`、`gallery-global-cards.png`：国际市场 10 套
- `screenshots/builder-desktop.png`、`builder-mobile.png`
- `screenshots/builder-hdw.png`、`builder-lgc.png`、`builder-chm.png`、`builder-med.png`、`builder-aut.png`、`builder-apx.png`
- `screenshots/builder-style.png`、`builder-style-applied.png`
- `screenshots/builder-cropper.png`、`builder-cropper-applied.png`
- `screenshots/builder-export.png`：登录提示 + 单文件 HTML + 整站 ZIP + Free/Pro
- `screenshots/auth-dialog.png`、`builder-pages.png`、`cloud-projects.png`
- `screenshots/gallery-ar.png`、`builder-ar.png`：阿拉伯语 RTL 界面
- `screenshots/locale-menu.png`、`locale-menu-ar.png`：语言菜单的固定列宽、统一对齐与 RTL 定位
- `screenshots/builder-site-nav.png`：站点导航编辑器、页面目标选择、字号与 select 样式
- `screenshots/builder-cta-target.png`：询价按钮目标改为页面
- `screenshots/builder-inline-sync.png`：画布标题编辑与右侧检查器实时同步
- `screenshots/footer-check.png`：页脚与其它区块共用 section gutter
- `screenshots/preview-mobile.png`

## 5. 已知边界

1. 生成的是静态 HTML / ZIP，不是可二次开发的 React 工程源码。
2. 云端保存是显式按钮，不是自动保存；冲突时由 `expectedVersion` 返回 409。
3. 支付未接；Pro 仍是本地演示 + 服务端 plan 字段，没有真实订单。
4. 编辑器是桌面工作台；手机用于查看/预览，不提供完整编辑。
5. 首屏 JS 约 458.60 kB；Builder 与 Gallery 已拆包，模板数据仍可继续懒加载。
6. 后端默认 H2 文件库；生产需切 PostgreSQL 并配置真实 JWT secret。
7. 七语言 UI 已覆盖导航、首屏、筛选、登录、云端、Builder 顶栏与导出面板；Inspector 字段与模板正文仍以中文/英文为主，五语内容翻译待补。

## 6. 下一步

- 前后端已推送到 GitHub，保留分阶段提交记录。
- 补页面标题/路径编辑与自动保存。
- 接支付（Stripe / 微信 / 支付宝）与真实权益校验。
- 实现服务端 React 源码生成与下载鉴权。
- 30 套全量视觉回归、移动端编辑、axe 可访问性。
