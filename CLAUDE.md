# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 開発サーバー起動 (localhost:5173)
npm run build    # 型チェック + プロダクションビルド
npm run preview  # ビルド済み成果物をローカルでプレビュー
```

## Architecture

React 18 + Vite + TypeScript + Tailwind CSS v4。サーバー不要のクライアントサイドアプリ。

**状態管理:** `src/store/AppContext.tsx` が Context + useReducer でグローバル状態を管理。`reducer.ts` に全アクション定義。状態変更のたびに `localStorage`（キー `hatake_v2`）へ自動保存。

**写真のみ IndexedDB に保存**（localStorage の 5MB 上限を避けるため）。`src/hooks/usePhotos.ts` が IndexedDB CRUD を担当。

**複数畑の管理:** `AppState.fields[]` に畑一覧を持ち、`activeFieldId` で選択中の畑を管理。各畑は `plots`（グリッド区画）・`gridCols`・`gridRows` を内包する。

**区画データ (`PlotData`) は畑の Field オブジェクト内の `plots` に保持**（同じ作物を複数区画に異なる日付で植えられるため、作物オブジェクトに日付を持たせない設計）。

## Data Model

```
AppState
├── fields: Field[]          # 畑一覧（plots を内包）
├── activeFieldId: string
├── crops: Crop[]            # fieldId で畑に紐付け
├── logs: Log[]              # 収穫量・費用フィールドあり
└── events: HatakeEvent[]
```

全型定義は `src/types.ts` に集約。

## Key Files

| パス | 役割 |
|------|------|
| `src/types.ts` | 全型定義 |
| `src/store/reducer.ts` | 全 CRUD アクション |
| `src/store/AppContext.tsx` | Context Provider + `useApp()` フック |
| `src/store/storage.ts` | localStorage 読み書き・デフォルト状態生成 |
| `src/utils/constants.ts` | LOG_TYPES・STATUS_LABELS 定数 |
| `src/utils/cellLabel.ts` | `"0-1"` → `"A2"` 変換 |

## Tailwind CSS v4 Notes

- `@import "tailwindcss"` を `src/index.css` で使用（v3 の `@tailwind` ディレクティブではない）
- `vite.config.ts` で `@tailwindcss/vite` プラグインを使用
- ダークテーマ固定。CSS 変数の代わりに Tailwind の任意値（`bg-[#1a1a2e]` 等）でカラー指定

## TypeScript Notes

`verbatimModuleSyntax` が有効。型のみのインポートは必ず `import type` を使用すること。
