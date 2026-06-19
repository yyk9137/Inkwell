# Inkwell

> 一款视觉小说风格的 LLM 聊天桌面应用，基于 Tauri v2 + Rust + React 19 构建。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-ffc131)](https://tauri.app)
[![React 19](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)

---

## 简介

Inkwell 是一款轻量级、视觉丰富的 LLM 角色聊天桌面应用。它将 SillyTavern 的功能与视觉小说游戏美学相结合，提供沉浸式的 AI 对话体验。

### 核心特性

| 特性 | 说明 |
|------|------|
| 角色聊天 | 基于 LLM 的角色卡对话 |
| 视觉小说 UI | 对话框、角色立绘、屏幕转场 |
| 主题系统 | 全局主题、角色专属主题、主题池 |
| 粒子效果 | 樱花飘落、雪花、萤火虫、星空 |
| 角色立绘 | 多表情立绘，支持动画 |
| 状态栏 | 好感度、属性展示、HUD 元素 |
| 聊天记录 | 本地 SQLite 持久化存储 |
| 多模型支持 | OpenAI、Anthropic、Ollama 等 |
| 自动更新 | 通过 Tauri 更新插件签名更新 |

---

## 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **桌面壳** | Tauri | v2 | 原生窗口、IPC、系统集成 |
| **后端** | Rust | stable | SQLite、HTTP 客户端、命令 |
| **前端** | React | ^19.0.0 | UI 框架 |
| **构建工具** | Vite | ^6.0.0 | 开发服务器、打包 |
| **语言** | TypeScript | ^5.5.0 | 类型安全 |
| **样式** | Tailwind CSS | ^3.4.0 | 原子化 CSS |
| **状态管理** | Zustand | ^5.0.0 | 轻量级状态管理 |
| **动画** | motion | ^12.40.0 | DOM 动画、转场 |
| **粒子** | tsParticles | ^4.1.3 | 氛围效果 |

### Rust 依赖

| Crate | 用途 |
|-------|------|
| `tauri` | 应用框架 |
| `tauri-plugin-sql` | SQLite 集成 |
| `tauri-plugin-updater` | 自动更新 |
| `rusqlite` / `sqlx` | SQLite 驱动 |
| `reqwest` | HTTP 客户端 |
| `serde` / `serde_json` | 序列化 |
| `tokio` | 异步运行时 |

### 前端依赖

| 包 | 用途 |
|----|------|
| `react`, `react-dom` | UI 框架 |
| `motion` | 动画引擎 |
| `zustand` | 状态管理 |
| `@tsparticles/react` | 粒子效果 |
| `@tauri-apps/api` | Tauri IPC |
| `tailwindcss` | 样式 |
| `zod` | Schema 验证 |

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Tauri v2 窗口                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React 前端                               │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │  │
│  │  │   Zustand    │ │   motion    │ │    tsParticles      │  │  │
│  │  │   Store      │ │   Animate   │ │    Effects          │  │  │
│  │  └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘  │  │
│  │         │               │                    │             │  │
│  │  ┌──────┴───────────────┴────────────────────┴──────────┐  │  │
│  │  │              组件层                                    │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │  │  │
│  │  │  │ Dialogue │ │ Sprite   │ │ Effects  │ │  HUD    │  │  │  │
│  │  │  │ Box      │ │ System   │ │ Layer    │ │  Panel  │  │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘  │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                           │                                │  │
│  │  ┌────────────────────────┴─────────────────────────────┐  │  │
│  │  │              主题系统                                  │  │  │
│  │  │  CSS 自定义属性 + JSON 主题文件                        │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                    Tauri IPC (invoke / events)                   │
│                              │                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Rust 后端                                │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │  │
│  │  │   Commands   │ │   SQLite    │ │    LLM Client       │  │  │
│  │  │   (API)      │ │   (rusqlite)│ │    (reqwest)        │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流

```
用户输入 → React 组件 → Zustand Action → Tauri invoke()
    → Rust Command → SQLite/LLM API → 响应
    → Tauri emit() → Zustand 更新 → React 重渲染
```

---

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/tools/install) >= 1.75
- [Tauri CLI](https://tauri.app/start/prerequisites/)

### 安装依赖

```bash
# 安装前端依赖
npm install

# Rust 依赖会自动安装
```

### 开发模式

```bash
# 启动开发服务器（前端 + Rust 热重载）
cargo tauri dev
```

### 生产构建

```bash
# 构建生产版本
cargo tauri build
```

---

## 项目结构

```
inkwell/
├── src-tauri/                  # Rust 后端
│   ├── src/
│   │   ├── main.rs             # 入口
│   │   ├── commands/           # Tauri 命令
│   │   ├── db/                 # SQLite 数据库
│   │   └── llm/                # LLM 客户端
│   ├── Cargo.toml
│   └── tauri.conf.json         # Tauri 配置
├── src/                        # React 前端
│   ├── main.tsx                # 入口
│   ├── App.tsx                 # 根组件
│   ├── components/
│   │   ├── ui/                 # 通用 UI 组件
│   │   ├── chat/               # 聊天相关组件
│   │   ├── character/          # 角色相关组件
│   │   ├── effects/            # 视觉效果
│   │   └── theme/              # 主题组件
│   ├── hooks/                  # 自定义 Hooks
│   ├── stores/                 # Zustand 状态管理
│   ├── lib/                    # 工具函数
│   ├── styles/                 # 全局样式
│   └── types/                  # TypeScript 类型
├── docs/                       # 文档
│   └── ARCHITECTURE.md         # 架构设计文档
├── package.json
└── tailwind.config.js
```

---

## 主题系统

Inkwell 支持多层级主题系统：

### 主题结构

```typescript
interface Theme {
  id: string;
  name: string;
  author?: string;
  description?: string;
  tokens: ThemeTokens;        // CSS 变量键值对
  customCss?: string;         // 自定义 CSS
  backgroundEffect?: 'none' | 'aurora' | 'particles' | 'vanta-waves';
}
```

### 主题层级

1. **全局主题** - 应用整体外观
2. **角色主题** - 每个角色可设置专属主题
3. **消息主题池** - LLM 回复自动循环使用主题池中的主题

### CSS 变量

```css
:root {
  --ink-bg: '17 24 39';           /* 背景色 */
  --ink-surface: '31 41 55';      /* 表面色 */
  --ink-primary: '59 130 246';    /* 主色调 */
  --ink-accent: '168 85 247';     /* 强调色 */
  --ink-text: '249 250 251';      /* 文字色 */
  --ink-muted: '156 163 175';     /* 次要文字 */
}
```

---

## 视觉小说 UI

### 对话框

```tsx
import { m } from 'motion/react';
import { useTypewriter } from '@/hooks/useTypewriter';

export function DialogueBox({ speaker, text, onAdvance }) {
  const { displayed, done, skip } = useTypewriter({ text, speed: 25 });

  return (
    <m.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl
                 rounded-2xl border border-white/20 bg-black/40 p-6 text-white
                 shadow-2xl backdrop-blur-xl"
    >
      {speaker && (
        <div className="mb-2 font-bold text-rose-300 drop-shadow-lg">{speaker}</div>
      )}
      <div className="min-h-[5rem] text-lg leading-relaxed font-serif">
        {displayed}
        {!done && <span className="animate-pulse ml-1 text-rose-400">▌</span>}
      </div>
      <button onClick={() => done ? onAdvance() : skip()}>
        {done ? '▶ Continue' : 'Skip ▶▶'}
      </button>
    </m.div>
  );
}
```

### 粒子效果

支持多种氛围效果：

- **雪花** - 冬日氛围
- **樱花** - 春日浪漫
- **萤火虫** - 夏夜宁静
- **星空** - 梦幻效果

---

## 开发指南

### 命令

```bash
# 开发
cargo tauri dev              # 启动开发服务器
cargo tauri dev --release    # 开发模式（优化构建）

# 构建
cargo tauri build            # 构建生产版本
cargo tauri build --debug    # 构建调试版本

# 测试
cargo test                   # 运行 Rust 测试
npm run test                 # 运行前端测试

# 代码检查
cargo clippy                 # Rust 代码检查
npm run lint                 # TypeScript 代码检查
```

### 代码规范

- **Rust**: rustfmt + clippy
- **TypeScript**: ESLint + Prettier
- **组件**: PascalCase，每个文件一个组件
- **Hooks**: use 前缀，与组件放在一起
- **Stores**: Zustand slices，每个领域一个 store

---

## 实现路线

### Phase 1: 基础 (Week 1-2)
- [ ] Tauri v2 脚手架搭建
- [ ] SQLite 数据库设置与迁移
- [ ] 基础 Rust 命令（CRUD）
- [ ] Zustand stores + Tauri IPC 集成
- [ ] 基础 React 布局

### Phase 2: 主题 (Week 2-3)
- [ ] CSS 变量 schema 定义
- [ ] Tailwind 配置与主题 tokens
- [ ] ThemeProvider + 主题应用
- [ ] 主题商店（内置主题）
- [ ] 角色主题作用域

### Phase 3: 视觉小说 UI (Week 3-4)
- [ ] DialogueBox 打字机效果
- [ ] CharacterSprite 动画
- [ ] ScreenTransition 组件
- [ ] MessageList 视觉小说模式
- [ ] ChatInput 视觉小说风格

### Phase 4: 效果与打磨 (Week 4-5)
- [ ] tsParticles 集成
- [ ] 粒子预设（雪花、樱花、萤火虫、星空）
- [ ] HUD 组件（StatBar、AffectionMeter）
- [ ] 主题池功能
- [ ] 高级动画（震动、发光、缩放）

### Phase 5: LLM 集成 (Week 5-6)
- [ ] LLM 提供商集成（OpenAI、Anthropic、Ollama）
- [ ] 通过 Tauri 事件流式响应
- [ ] 角色卡系统提示词构建
- [ ] 错误处理与重试逻辑

### Phase 6: 分发 (Week 6-7)
- [ ] 自动更新设置
- [ ] GitHub Actions CI/CD
- [ ] 多平台构建（Windows、macOS、Linux）
- [ ] 签名与公证

---

## 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/yyk9137/Inkwell.git
cd Inkwell

# 安装依赖
npm install

# 启动开发服务器
cargo tauri dev
```

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 致谢

- [Tauri](https://tauri.app) - 跨平台桌面应用框架
- [React](https://react.dev) - UI 框架
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架
- [motion](https://motion.dev) - 动画库
- [tsParticles](https://particles.js.org) - 粒子效果库
- [SillyTavern](https://github.com/SillyTavern/SillyTavern) - 灵感来源

---

*文档生成时间: 2026-06-19*
*Inkwell v0.1.0*
