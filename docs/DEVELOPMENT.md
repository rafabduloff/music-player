# Руководство по разработке

## Установка окружения

- Установить Rust: https://rustup.rs
- Установить Node.js (версия ≥18) и pnpm
- Установить Tauri CLI:
  ```bash
  cargo install tauri-cli --version "^1.5"
  ```
- На Linux установить зависимости из https://tauri.app/v1/guides/getting-started/prerequisites#installing

## Запуск в режиме разработки

1. В одном терминале:
   ```bash
   pnpm run dev
   ```
2. В другом терминале:
   ```bash
   cargo tauri dev
   ```

## Сборка production

```bash
pnpm run build
cargo tauri build
```

Результат сборки находится в `src-tauri/target/release/bundle/`.

## Основные команды

- `cargo test` – запуск тестов
- `cargo clippy` – статический анализ кода
- `cargo fmt` – автоформатирование

---

## Структура проекта

- `src/` – Rust backend
- `web/src/` – React frontend
- Конфиги: `.env`, `tauri.conf.json`
- Зависимости: `Cargo.toml`, `package.json`
