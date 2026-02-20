# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Next.js 開発サーバー（D1 バインディングなし）
npm run preview      # OpenNext ビルド + ローカル Workers 起動（D1 あり）
npm run deploy       # OpenNext ビルド + Cloudflare へデプロイ
npm test             # Vitest テスト実行
npm run lint         # ESLint
npx tsc --noEmit     # 型チェック

# テストを1ファイル指定して実行
npx vitest run __tests__/note-service.test.ts

# D1 マイグレーション
npx wrangler d1 execute notes_db --file=./migrations/0001_create_notes.sql --local   # ローカル
npx wrangler d1 execute notes_db --file=./migrations/0001_create_notes.sql --remote  # 本番
```

## アーキテクチャ

**リクエストフロー:**
```
Page (app/) → Server Action (lib/actions.ts)
                → getRepository() (lib/db.ts)  ← getCloudflareContext で D1 取得
                  → note-service (lib/note-service.ts)  ← バリデーション + ビジネスロジック
                    → INotesRepository (lib/repository.ts)  ← D1 操作
```

**依存性注入によるテスト分離:**
`INotesRepository` インターフェースを介して D1 への依存を分離している。テストは `D1NotesRepository` の代わりに `InMemoryNotesRepository`（`__tests__/helpers/`）を使うため、D1 なしで動作する。新しいサービスロジックを書く場合は `note-service.ts` に追加し、リポジトリをDIで受け取る形にする。

**レイヤー責務:**
- `lib/db.ts` — `getCloudflareContext` でD1バインディングを取得するファクトリのみ
- `lib/repository.ts` — `INotesRepository` インターフェース + `D1NotesRepository` 実装
- `lib/note-service.ts` — バリデーション呼び出し + エラーハンドリング（`redirect` なし）
- `lib/actions.ts` — `'use server'`、`redirect` はここだけで行う
- `lib/validations.ts` — 純粋関数、副作用なし

## Cloudflare 固有の制約

**必須パターン（破ると本番ビルドが壊れる）:**

```typescript
// getCloudflareContext は必ず async: true で呼ぶ（静的プリレンダリング対策）
const { env } = await getCloudflareContext({ async: true });

// D1 にアクセスするページには必ず追加
export const dynamic = 'force-dynamic';

// export const runtime = 'edge' は絶対に使わない
// @opennextjs/cloudflare と非互換、Worker 全体がエッジで動くため不要
```

## デザインシステム

note.com スタイル。カラーは CSS 変数で管理（`app/globals.css`）。Tailwind クラスでは `var()` を直接インライン指定している（例: `text-[#08131a]`、`border-[rgba(8,19,26,0.14)]`）。

| 変数 | 値 | 用途 |
|---|---|---|
| `--foreground` | `#08131a` | 主テキスト |
| `--foreground-secondary` | `rgba(8,19,26,0.66)` | 副テキスト |
| `--foreground-muted` | `rgba(8,19,26,0.44)` | 薄テキスト・日付 |
| `--border` | `rgba(8,19,26,0.14)` | ボーダー全般 |
| `--accent` | `#41b883` | ボタン・フォーカス |
| `--danger` | `#e85d4a` | 削除ボタン |

フォント: Noto Sans JP（Google Fonts CDN）、`font-weight` は 400/700 のみ使用。

## デプロイ済み URL

https://cloudflare-notes-app.yamadatt.workers.dev
D1 database_id: `3aede7a5-8ad0-419c-87c6-e1c86e026182`（`wrangler.toml` 参照）
