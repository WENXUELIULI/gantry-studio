# GANTRY / 桁架

低代码多页官网生成平台。产品壳采用工业编辑风「桁架 GANTRY」，生成的官网使用独立的行业 → 风格 → 主题系统。

## 工作区

```text
gantry-studio/
├── frontend/          React 19 + TypeScript + Vite 官网编辑器
├── backend/           Java 21 + Spring Boot API（多页项目、登录、导出鉴权）
├── docs/              工作流、ADR、验收记录
└── .agents/skills/    项目级技能
```

## 当前能力

- 30 套官网模板：20 套国内中文、10 套国际英文，覆盖 13 个行业。
- 18 套主题、11 种风格、6 种首屏、8 类区块。
- 滚动视频、3–4 图拼贴、组件级样式、图片焦点/缩放/独立裁剪。
- 桌面/手机双视图，HTML 单文件导出与 JSON 项目源文件。
- 前端现有 112 个 Vitest 单测、6 条 Playwright E2E。

## 本地运行

前端：

```bash
cd frontend
npm install
npm run dev        # http://127.0.0.1:5174
npm run test
npm run test:e2e
```

后端（开发中）：

```bash
cd backend
mvn spring-boot:run   # http://127.0.0.1:8080
mvn test
```

## 文档

- [开发工作流](docs/WORKFLOW.md)
- [验收记录](docs/ACCEPTANCE.md)
- [ADR 0001 基线](docs/ADR/0001-baseline.md)
- [ADR 0002 v2 边界](docs/ADR/0002-v2-boundaries.md)
- [前端说明](frontend/README.md)
