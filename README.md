# Современный музыкальный плеер на Tauri

Кроссплатформенный desktop музыкальный плеер с архитектурой **Rust** (backend) + **React + TypeScript** (frontend).

Поддерживает несколько источников музыки, настраиваемые темы, продвинутое управление аудио и современный интерфейс для пользователей любого уровня.

---

## Основные возможности

- **Мульти-провайдер система** – Yandex Music, Spotify, SoundCloud, Last.fm
- **Настраиваемый интерфейс** – полная кастомизация через TOML конфиги
- **Высокая производительность** – Rust backend с оптимизированным React frontend
- **Продвинутый аудио движок** – построен на Rodio для качественного воспроизведения
- **Hot-reload конфигов** – изменение настроек на лету
- **Системная интеграция** – работа в трее, медиа-клавиши
- **Профессиональное управление** – очереди, плейлисты, библиотека

**Текущий статус**: активная стадия переписывания — собрана инфраструктура (Tauri + Rust backend, React + Tailwind frontend, Rodio аудио движок, конфиги), UI запускается, но интеграции с музыкальными сервисами и расширенные элементы плеера ещё в разработке.

---

## Требования

1. **Rust toolchain** (stable) – [rustup.rs](https://rustup.rs)
2. **Node.js** ≥ 18 + **pnpm**
3. **Tauri CLI** – установите версию, соответствующую Cargo.toml:

```bash
cargo install tauri-cli --version "^1.5"
```

**Linux**: дополнительно установите зависимости из [документации Tauri](https://tauri.app/v1/guides/getting-started/prerequisites#installing).

---

## Быстрый старт

### Установка

```bash
git clone https://github.com/username/music-player-tauri.git
cd music-player-tauri
pnpm install
```

### Разработка

```bash
# Терминал 1: React dev server
pnpm run dev

# Терминал 2: Tauri в режиме разработки
cargo tauri dev
```

### Сборка

```bash
pnpm run build
cargo tauri build
```

Результат сборки: `src-tauri/target/release/bundle/`

---

## Структура проекта

```
├── src/                    # Rust backend
│   ├── main.rs            # Точка входа Tauri
│   ├── audio.rs           # Аудио движок (Rodio)
│   ├── config.rs          # Управление конфигурацией
│   ├── types.rs           # Общие типы данных
│   └── providers/         # Интеграции с музыкальными сервисами
├── web/                   # React frontend
│   └── src/               # Исходники UI
├── Cargo.toml             # Rust зависимости
├── package.json           # Node.js зависимости
└── tauri.conf.json        # Конфигурация Tauri
```

---

## Конфигурация

Файл конфигурации: `~/.config/music-player-tauri/config.toml`

```toml
default_volume = 0.75

[provider_tokens]
yandex_music = "your_token"
spotify = "your_token"
soundcloud = "your_token"
lastfm = "your_token"

[theme]
name = "dark"
primary_color = "#6366f1"
background = "#0f172a"
```

Изменения применяются автоматически без перезапуска приложения.

---

## Разработка

### Команды

```bash
# Frontend
pnpm run dev          # Dev server
pnpm run build        # Production build

# Backend
cargo test            # Тесты
cargo clippy          # Анализ кода
cargo fmt             # Форматирование

# Полное приложение
cargo tauri dev       # Разработка с hot-reload
cargo tauri build     # Production сборка
```

### Документация

- [DEVELOPMENT.md](DEVELOPMENT.md) – Подробный гайд по разработке
- [PROVIDERS.md](PROVIDERS.md) – Добавление новых музыкальных провайдеров
- [THEMES.md](THEMES.md) – Создание и настройка тем
- [API.md](API.md) – Документация внутреннего API

---

## Лицензия

MIT License – см. файл [LICENSE](LICENSE)

---

## Благодарности

[Tauri](https://tauri.app/) • [Rodio](https://github.com/RustAudio/rodio) • [React](https://reactjs.org/) • [Vite](https://vitejs.dev/) • [Tailwind CSS](https://tailwindcss.com/)
