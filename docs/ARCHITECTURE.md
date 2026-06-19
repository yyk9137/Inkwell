# Inkwell Architecture Design Document

> A visual novel-style LLM chat desktop application built with Tauri v2, Rust, React 19, and Tailwind CSS.

---

## 1. Project Overview

### 1.1 Vision

Inkwell is a lightweight, visually rich desktop application for LLM-based character chat. It combines the functionality of SillyTavern with a visual novel game aesthetic, featuring:

- **Immersive UI**: Visual novel-style dialogue boxes, character sprites, particle effects, and screen transitions
- **Dynamic Theming**: Global themes, per-character themes, and per-message theme cycling
- **Offline-First**: All data stored locally in SQLite, no cloud dependency
- **One-Click Deploy**: Single binary distribution with auto-update support
- **Extensible**: Plugin system for custom components, themes, and effects

### 1.2 Core Features

| Feature | Description |
|---------|-------------|
| Character Chat | LLM-powered conversations with character cards |
| Visual Novel UI | Dialogue boxes, character sprites, screen transitions |
| Theme System | Global themes, per-character themes, theme store |
| Particle Effects | Sakura petals, snow, fireflies, custom particles |
| Character Sprites | Multi-expression portraits with animations |
| Status Bars | Affection meters, stat displays, HUD elements |
| Chat History | Persistent SQLite storage |
| Multi-Provider | Support for OpenAI, Anthropic, Ollama, and more |
| Auto-Update | Signed updates via Tauri updater plugin |

### 1.3 Non-Goals (v1)

- Multi-user/server mode
- Real-time collaboration
- Mobile platforms (iOS/Android)
- Voice chat/TTS
- Image generation

---

## 2. Technology Stack

### 2.1 Core Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Desktop Shell** | Tauri | v2 | Native window, IPC, system integration |
| **Backend** | Rust | stable | SQLite, HTTP client, commands |
| **Frontend** | React | ^19.0.0 | UI framework |
| **Build Tool** | Vite | ^6.0.0 | Dev server, bundling |
| **Language** | TypeScript | ^5.5.0 | Type safety |
| **Styling** | Tailwind CSS | ^3.4.0 | Utility-first CSS |
| **State** | Zustand | ^5.0.0 | Lightweight state management |
| **Animation** | motion | ^12.40.0 | DOM animations, transitions |
| **Particles** | tsParticles | ^4.1.3 | Atmospheric effects |

### 2.2 Rust Dependencies

| Crate | Purpose |
|-------|---------|
| `tauri` | Application framework |
| `tauri-plugin-sql` | SQLite integration |
| `tauri-plugin-updater` | Auto-update |
| `tauri-plugin-shell` | Process management |
| `tauri-plugin-fs` | File system access |
| `rusqlite` / `sqlx` | SQLite driver |
| `reqwest` | HTTP client for LLM APIs |
| `serde` / `serde_json` | Serialization |
| `tokio` | Async runtime |
| `uuid` | ID generation |
| `chrono` | Timestamps |

### 2.3 Frontend Dependencies

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | UI framework |
| `motion` | Animation engine |
| `zustand` | State management |
| `@tsparticles/react` | Particle effects |
| `@tsparticles/slim` | Particle engine (slim) |
| `@tauri-apps/api` | Tauri IPC |
| `tailwindcss` | Styling |
| `clsx` | Class name utility |
| `zod` | Schema validation |

### 2.4 Optional Dependencies

| Package | Purpose | When to Add |
|---------|---------|-------------|
| `@rive-app/react-canvas-lite` | Vector character animations | When artists provide .riv files |
| `gsap` | Complex timeline animations | When motion can't handle a sequence |
| `@mui/material` | Complex form components | Settings panels, data tables |
| `lucide-react` | Icon library | UI icons |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Tauri v2 Window                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React Frontend                          │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │  │
│  │  │   Zustand    │ │   motion    │ │    tsParticles      │  │  │
│  │  │   Store      │ │   Animate   │ │    Effects          │  │  │
│  │  └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘  │  │
│  │         │               │                    │             │  │
│  │  ┌──────┴───────────────┴────────────────────┴──────────┐  │  │
│  │  │              Component Layer                          │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │  │  │
│  │  │  │ Dialogue │ │ Sprite   │ │ Effects  │ │  HUD    │  │  │  │
│  │  │  │ Box      │ │ System   │ │ Layer    │ │  Panel  │  │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘  │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                           │                                │  │
│  │  ┌────────────────────────┴─────────────────────────────┐  │  │
│  │  │              Theme System                             │  │  │
│  │  │  CSS Custom Properties + JSON Theme Files             │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                    Tauri IPC (invoke / events)                   │
│                              │                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Rust Backend                            │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │  │
│  │  │   Commands   │ │   SQLite    │ │    LLM Client       │  │  │
│  │  │   (API)      │ │   (rusqlite)│ │    (reqwest)        │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

```
User Input -> React Component -> Zustand Action -> Tauri invoke()
    -> Rust Command -> SQLite/LLM API -> Response
    -> Tauri emit() -> Zustand Update -> React Re-render
```

### 3.3 IPC Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| `invoke()` | Request-response | `get_messages()`, `send_message()` |
| `listen()` | Server-push events | `llm-token`, `theme-changed` |
| `emit()` | Frontend to Backend | `app-ready`, `error-report` |

---

## 4. Data Layer

### 4.1 Database Schema

```sql
-- Characters
CREATE TABLE characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    personality TEXT,
    first_message TEXT,
    avatar_path TEXT,
    sprite_paths TEXT,        -- JSON: { "happy": "/sprites/char_happy.webp", ... }
    tags TEXT,                -- JSON array
    extensions TEXT,          -- JSON: templates, custom fields, theme overrides
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Chat Sessions
CREATE TABLE chat_sessions (
    id TEXT PRIMARY KEY,
    character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    title TEXT,
    theme_id TEXT,
    metadata TEXT,            -- JSON: custom data
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Messages
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    theme_id TEXT,            -- Per-message theme (for theme pool feature)
    sprite_expression TEXT,   -- Character expression for this message
    effects TEXT,             -- JSON: particle effects, screen effects
    metadata TEXT,            -- JSON: tokens used, model, timing
    created_at INTEGER NOT NULL
);

-- Themes
CREATE TABLE themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    author TEXT,
    description TEXT,
    tokens TEXT NOT NULL,     -- JSON: CSS variable key-value pairs
    custom_css TEXT,
    background_effect TEXT,   -- 'aurora' | 'particles' | 'vanta-waves' | etc.
    background_config TEXT,   -- JSON: effect-specific config
    is_default BOOLEAN DEFAULT 0,
    is_builtin BOOLEAN DEFAULT 0,
    created_at INTEGER NOT NULL
);

-- Settings
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,      -- JSON value
    updated_at INTEGER NOT NULL
);

-- Theme Pool (user-selected cycling themes)
CREATE TABLE theme_pool (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    theme_id TEXT NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    UNIQUE(position)
);
```

### 4.2 Rust Command Interface

```rust
// Characters
#[tauri::command] async fn get_characters(state: State<'_, AppState>) -> Result<Vec<Character>, String>;
#[tauri::command] async fn get_character(state: State<'_, AppState>, id: String) -> Result<Character, String>;
#[tauri::command] async fn create_character(state: State<'_, AppState>, character: NewCharacter) -> Result<Character, String>;
#[tauri::command] async fn update_character(state: State<'_, AppState>, id: String, update: UpdateCharacter) -> Result<Character, String>;
#[tauri::command] async fn delete_character(state: State<'_, AppState>, id: String) -> Result<(), String>;

// Chat Sessions
#[tauri::command] async fn get_sessions(state: State<'_, AppState>, character_id: String) -> Result<Vec<ChatSession>, String>;
#[tauri::command] async fn create_session(state: State<'_, AppState>, character_id: String) -> Result<ChatSession, String>;
#[tauri::command] async fn delete_session(state: State<'_, AppState>, id: String) -> Result<(), String>;

// Messages
#[tauri::command] async fn get_messages(state: State<'_, AppState>, session_id: String, limit: Option<i64>, offset: Option<i64>) -> Result<Vec<Message>, String>;
#[tauri::command] async fn send_message(app: AppHandle, state: State<'_, AppState>, session_id: String, content: String) -> Result<Message, String>;

// Themes
#[tauri::command] async fn get_themes(state: State<'_, AppState>) -> Result<Vec<Theme>, String>;
#[tauri::command] async fn apply_theme(state: State<'_, AppState>, theme_id: String) -> Result<(), String>;
#[tauri::command] async fn import_theme(state: State<'_, AppState>, path: String) -> Result<Theme, String>;

// LLM
#[tauri::command] async fn chat_completion(app: AppHandle, config: LLMConfig, messages: Vec<Message>) -> Result<String, String>;
#[tauri::command] async fn chat_completion_stream(app: AppHandle, config: LLMConfig, messages: Vec<Message>) -> Result<(), String>;

// Settings
#[tauri::command] async fn get_setting(state: State<'_, AppState>, key: String) -> Result<serde_json::Value, String>;
#[tauri::command] async fn set_setting(state: State<'_, AppState>, key: String, value: serde_json::Value) -> Result<(), String>;
```

### 4.3 Zustand Store Structure

```typescript
// src/stores/chatStore.ts
interface ChatState {
  messages: Message[];
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  isStreaming: boolean;
  loadMessages: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  createSession: (characterId: string) => Promise<void>;
}

// src/stores/themeStore.ts
interface ThemeState {
  current: Theme;
  themes: Theme[];
  themePool: string[];
  poolIndex: number;
  applyTheme: (themeId: string) => void;
  addToPool: (themeId: string) => void;
  removeFromPool: (themeId: string) => void;
  nextPoolTheme: () => Theme;
}

// src/stores/characterStore.ts
interface CharacterState {
  characters: Character[];
  current: Character | null;
  loadCharacters: () => Promise<void>;
  selectCharacter: (id: string) => Promise<void>;
}
```
---

## 5. Frontend Architecture

### 5.1 Directory Structure

`
src/
├── main.tsx                    # Entry point, LazyMotion setup
├── App.tsx                     # Root component, router
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   ├── Input.tsx
│   │   └── StatBar.tsx
│   ├── chat/                   # Chat-specific components
│   │   ├── ChatView.tsx        # Main chat layout
│   │   ├── DialogueBox.tsx     # Visual novel dialogue box
│   │   ├── MessageBubble.tsx   # Standard message bubble
│   │   ├── MessageList.tsx     # Scrollable message list
│   │   └── ChatInput.tsx       # Input area
│   ├── character/              # Character components
│   │   ├── CharacterSprite.tsx # Animated sprite
│   │   ├── CharacterCard.tsx   # Character info card
│   │   └── CharacterList.tsx   # Character selection
│   ├── effects/                # Visual effects
│   │   ├── ParticleBackground.tsx
│   │   ├── ScreenTransition.tsx
│   │   └── SakuraPetals.tsx
│   ├── theme/                  # Theme components
│   │   ├── ThemeProvider.tsx
│   │   ├── ThemeStore.tsx      # Theme browser/store
│   │   └── ThemePreview.tsx
│   └── layout/                 # Layout components
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── StatusBar.tsx
├── hooks/                      # Custom hooks
│   ├── useTypewriter.ts
│   ├── useMouseGlow.ts
│   └── useParticles.ts
├── stores/                     # Zustand stores
│   ├── chatStore.ts
│   ├── themeStore.ts
│   ├── characterStore.ts
│   └── settingsStore.ts
├── lib/                        # Utilities
│   ├── tauri.ts                # Tauri IPC wrappers
│   ├── theme.ts                # Theme utilities
│   └── validation.ts           # Zod schemas
├── styles/
│   └── globals.css             # Tailwind + CSS variables
├── types/
│   └── index.ts                # TypeScript types
└── assets/
    ├── sprites/                # Character sprites
    ├── backgrounds/            # Background images
    └── particles/              # Particle textures
`

### 5.2 Component Hierarchy

`
<App>
├── <ThemeProvider>
│   ├── <ParticleBackground />      # Atmospheric effects
│   ├── <Sidebar>
│   │   ├── <CharacterList />
│   │   └── <SessionList />
│   ├── <MainContent>
│   │   <AnimatePresence>
│   │   ├── <ScreenTransition>
│   │   │   ├── <CharacterSprite />  # Animated character
│   │   │   ├── <ChatView>
│   │   │   │   ├── <MessageList>
│   │   │   │   │   └── <DialogueBox /> / <MessageBubble />
│   │   │   │   └── <ChatInput />
│   │   │   └── <HUD>
│   │   │       ├── <StatBar />
│   │   │       └── <AffectionMeter />
│   │   </AnimatePresence>
│   └── <ThemeStore />               # Theme browser modal
`

### 5.3 Motion Integration

`	sx
// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LazyMotion, domAnimation } from 'motion/react';
import App from './App';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domAnimation} strict>
      <App />
    </LazyMotion>
  </StrictMode>
);
`

Use m.div instead of motion.div inside LazyMotion for smaller bundle size (~20KB initial vs ~46KB full).

---

## 6. Theming System

### 6.1 Theme Schema

`	ypescript
export interface Theme {
  id: string;
  name: string;
  author?: string;
  description?: string;
  tokens: ThemeTokens;
  customCss?: string;
  backgroundEffect?: BackgroundEffect;
  backgroundConfig?: Record<string, unknown>;
}

export interface ThemeTokens {
  '--ink-bg': string;           // RGB: '17 24 39'
  '--ink-surface': string;      // RGB: '31 41 55'
  '--ink-primary': string;      // RGB: '59 130 246'
  '--ink-accent': string;       // RGB: '168 85 247'
  '--ink-text': string;         // RGB: '249 250 251'
  '--ink-muted': string;        // RGB: '156 163 175'
  '--ink-user-bubble': string;
  '--ink-assistant-bubble': string;
  '--ink-font-display': string;
  '--ink-font-body': string;
  '--ink-radius': string;
  '--ink-chat-width': string;
}

export type BackgroundEffect = 'none' | 'aurora' | 'particles' | 'vanta-waves' | 'custom';
`

### 6.2 Theme Application

`	ypescript
// Global theme
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  Object.entries(theme.tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  let styleEl = document.getElementById('ink-custom-css') as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'ink-custom-css';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = theme.customCss ?? '';
}

// Per-character theme (scoped to container, no re-render)
export function applyCharacterTheme(el: HTMLElement, tokens: Partial<ThemeTokens>): void {
  Object.entries(tokens).forEach(([key, value]) => {
    el.style.setProperty(key, value);
  });
}

// Per-message theme (for theme pool feature)
export function applyMessageTheme(el: HTMLElement, theme: Theme): void {
  Object.entries(theme.tokens).forEach(([key, value]) => {
    el.style.setProperty(key.replace('--ink-', '--msg-'), value);
  });
}
`

### 6.3 Tailwind Configuration

`javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ink-bg': 'rgb(var(--ink-bg) / <alpha-value>)',
        'ink-surface': 'rgb(var(--ink-surface) / <alpha-value>)',
        'ink-primary': 'rgb(var(--ink-primary) / <alpha-value>)',
        'ink-accent': 'rgb(var(--ink-accent) / <alpha-value>)',
        'ink-text': 'rgb(var(--ink-text) / <alpha-value>)',
        'ink-muted': 'rgb(var(--ink-muted) / <alpha-value>)',
        'msg-bg': 'rgb(var(--msg-bg, var(--ink-surface)) / <alpha-value>)',
        'msg-text': 'rgb(var(--msg-text, var(--ink-text)) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--ink-font-display)', 'sans-serif'],
        body: ['var(--ink-font-body)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient-x': 'gradient-x 8s ease infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.94) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'neon-pulse': {
          '0%': { boxShadow: '0 0 5px var(--ink-accent), 0 0 10px var(--ink-accent)' },
          '100%': { boxShadow: '0 0 15px var(--ink-accent), 0 0 30px var(--ink-accent)' },
        },
      },
    },
  },
};
`

### 6.4 Theme Pool (Per-Message Themes)

`	ypescript
interface ThemeState {
  themePool: string[];  // Theme IDs
  poolIndex: number;
  addToPool: (themeId: string) => void;
  removeFromPool: (themeId: string) => void;
  getNextPoolTheme: () => Theme;
}

// Usage: each LLM reply gets a different theme from the pool
function onLLMReply(messageId: string) {
  const theme = themeStore.getState().getNextPoolTheme();
  messageStore.getState().updateMessage(messageId, { themeId: theme.id });
}
`

---

## 7. Visual Novel UI System

### 7.1 Dialogue Box

`	sx
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
`

### 7.2 Character Sprite

`	sx
import { AnimatePresence, m } from 'motion/react';

export function CharacterSprite({ src, position = 'center', isSpeaking, effect = 'none' }) {
  const positionStyles = {
    left: 'left-[15%]',
    center: 'left-1/2 -translate-x-1/2',
    right: 'left-[85%] -translate-x-1/2',
  };

  const effects = {
    none: {},
    shake: { x: [0, -8, 8, -8, 8, 0] },
    glow: { filter: 'drop-shadow(0 0 30px rgba(255,200,100,0.8))' },
    zoom: { scale: 1.1 },
  };

  return (
    <AnimatePresence mode="wait">
      <m.img
        key={src}
        src={src}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: isSpeaking ? 1.02 : 1, ...effects[effect] }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={bsolute bottom-0 h-[80vh] object-contain pointer-events-none }
      />
    </AnimatePresence>
  );
}
`

### 7.3 Particle Effects

`	sx
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export function ParticleBackground({ mood = 'none' }) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const options = useMemo(() => {
    const configs = {
      snow: { number: { value: 80 }, color: { value: '#fff' }, move: { enable: true, direction: 'bottom' } },
      sakura: { number: { value: 40 }, color: { value: ['#ffb7c5', '#ff9eb5'] }, shape: { type: 'image' } },
      firefly: { number: { value: 25 }, color: { value: '#ffd700' }, opacity: { animation: { enable: true } } },
      stars: { number: { value: 100 }, color: { value: '#fff' }, move: { enable: false } },
    };
    return { particles: configs[mood] };
  }, [mood]);

  if (!init || mood === 'none') return null;
  return <Particles className="pointer-events-none fixed inset-0 z-10" options={options} />;
}
`

### 7.4 Screen Transitions

`	sx
import { AnimatePresence, m } from 'motion/react';

export function ScreenTransition({ children, transitionKey, type = 'fade' }) {
  const variants = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    slide: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
    wipe: { initial: { clipPath: 'inset(0 100% 0 0)' }, animate: { clipPath: 'inset(0 0% 0 0)' }, exit: { clipPath: 'inset(0 0 0 100%)' } },
    zoom: { initial: { scale: 1.1, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 } },
  };

  return (
    <AnimatePresence mode="wait">
      <m.div key={transitionKey} variants={variants[type]} initial="initial" animate="animate" exit="exit"
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }} className="absolute inset-0">
        {children}
      </m.div>
    </AnimatePresence>
  );
}
`

### 7.5 HUD Components

`	sx
import { m } from 'motion/react';

export function StatBar({ label, value, max = 100, color = 'bg-rose-500' }) {
  return (
    <div className="w-48 space-y-1">
      <div className="flex justify-between text-xs uppercase tracking-wider text-white/80">
        <span>{label}</span><span>{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-black/40">
        <m.div
          initial={{ width: 0 }}
          animate={{ width: ${(value / max) * 100}% }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          className={h-full }
        />
      </div>
    </div>
  );
}
`

---

## 8. LLM Integration

### 8.1 Provider Configuration

`	ypescript
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'custom';
  baseUrl: string;
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
}
`

### 8.2 Rust HTTP Client

`ust
use reqwest;
use serde::{Deserialize, Serialize};

#[tauri::command]
pub async fn chat_completion_stream(
    app: tauri::AppHandle,
    config: LLMConfig,
    messages: Vec<ChatMessage>,
) -> Result<(), String> {
    let client = reqwest::Client::new();
    let response = client.post(format!("{}/chat/completions", config.base_url))
        .header("Authorization", format!("Bearer {}", config.api_key))
        .json(&serde_json::json!({
            "model": config.model,
            "messages": messages,
            "temperature": config.temperature,
            "stream": true,
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // Stream tokens via Tauri events
    let mut stream = response.bytes_stream();
    while let Some(chunk) = stream.next().await {
        // Parse SSE chunk and emit token
        app.emit("llm-token", token).unwrap();
    }
    app.emit("llm-complete", ()).unwrap();
    Ok(())
}
`

### 8.3 System Prompt Construction

`	ypescript
function buildSystemPrompt(character: Character, settings: Settings): string {
  return [
    You are .,
    character.personality,
    character.description,
    settings.globalPrompt,
  ].filter(Boolean).join('\n\n');
}
`

---

## 9. Plugin/Extension System (Future)

### 9.1 Plugin Manifest

`json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "entry": "index.js",
  "permissions": ["ui:sidebar", "ui:message", "api:generate"],
  "dependencies": []
}
`

### 9.2 Runtime Plugin Host

`	ypescript
interface PluginApi {
  registerMessageComponent: (component: React.FC<MessageProps>) => void;
  registerSidebarPanel: (panel: React.FC) => void;
  registerSettingTab: (tab: SettingTab) => void;
  on: (event: AppEvent, handler: (data: unknown) => void) => () => void;
}
`

---

## 10. Build and Distribution

### 10.1 Tauri Bundle Config

`json
{
  "identifier": "app.inkwell.chat",
  "bundle": {
    "active": true,
    "targets": ["nsis", "msi", "dmg", "appimage", "deb"],
    "windows": {
      "webviewInstallMode": { "type": "offlineInstaller" }
    }
  }
}
`

### 10.2 Auto-Update

`json
{
  "plugins": {
    "updater": {
      "pubkey": "...",
      "endpoints": ["https://releases.inkwell.app/{{target}}/{{arch}}/{{current_version}}"]
    }
  }
}
`

---

## 11. Development Workflow

### 11.1 Dev Commands

`ash
# Install dependencies
npm install

# Start dev server (frontend + Rust hot reload)
cargo tauri dev

# Build for production
cargo tauri build

# Run tests
cargo test
npm run test
`

### 11.2 Code Conventions

- **Rust**: ustfmt + clippy on save
- **TypeScript**: ESLint + Prettier
- **Components**: PascalCase, one component per file
- **Hooks**: use prefix, colocated with components
- **Stores**: Zustand slices, one store per domain

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Tauri v2 scaffolding
- [ ] SQLite database setup with migrations
- [ ] Basic Rust commands (CRUD for characters, sessions, messages)
- [ ] Zustand stores + Tauri IPC integration
- [ ] Basic React layout

### Phase 2: Theming (Week 2-3)
- [ ] CSS variable schema definition
- [ ] Tailwind config with theme tokens
- [ ] ThemeProvider + theme application
- [ ] Theme store (bundled themes)
- [ ] Per-character theme scoping

### Phase 3: Visual Novel UI (Week 3-4)
- [ ] DialogueBox with typewriter effect
- [ ] CharacterSprite with animations
- [ ] ScreenTransition component
- [ ] MessageList with visual novel mode
- [ ] ChatInput styled for VN aesthetic

### Phase 4: Effects and Polish (Week 4-5)
- [ ] tsParticles integration
- [ ] Particle presets (snow, sakura, firefly, stars)
- [ ] HUD components (StatBar, AffectionMeter)
- [ ] Theme Pool feature
- [ ] Advanced animations (shake, glow, zoom)

### Phase 5: LLM and Polish (Week 5-6)
- [ ] LLM provider integration (OpenAI, Anthropic, Ollama)
- [ ] Streaming responses via Tauri events
- [ ] System prompt construction from character cards
- [ ] Error handling and retry logic

### Phase 6: Distribution (Week 6-7)
- [ ] Auto-update setup
- [ ] GitHub Actions CI/CD
- [ ] Multi-platform builds (Windows, macOS, Linux)
- [ ] Signing and notarization

---

## Appendix A: MCP and Tooling Recommendations

### Recommended MCP Servers

| MCP | Purpose | Install |
|-----|---------|---------|
| @mui/mcp | MUI documentation lookup | 
px -y @mui/mcp@latest |
| mcp-server-sqlite | SQLite database inspection | uvx mcp-server-sqlite --db-path ./data/app.db |
| eact-context-mcp | React component tree inspection | 
px -y react-context-mcp@latest |
| cratedex | Rust crate documentation indexing | cargo install cratedex |

### Recommended Skills

| Skill | Purpose |
|-------|---------|
| codemap | Generate codebase structure maps |
| deepwork | Multi-phase implementation workflow |
| simplify | Code simplification and readability |

### Recommended Agents

| Agent | Use Case |
|-------|----------|
| @librarian | External documentation lookup (Tauri, Rust crates, React) |
| @explorer | Codebase search and discovery |
| @designer | UI/UX review and implementation |
| @fixer | Fast implementation of bounded tasks |
| @oracle | Architecture decisions and code review |

---

*Document generated: 2026-06-18*
*Inkwell v0.1.0 - Architecture Design Document*
