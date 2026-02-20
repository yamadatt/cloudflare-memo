# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Next.js 開発サーバー（Supabase は .env.local の値を使用）
npm run preview      # OpenNext ビルド + ローカル Workers 起動（.dev.vars を使用）
npm run deploy       # OpenNext ビルド + Cloudflare へデプロイ
npm test             # Vitest テスト実行
npm run lint         # ESLint
npx tsc --noEmit     # 型チェック

# テストを1ファイル指定して実行
npx vitest run __tests__/note-service.test.ts
```

## アーキテクチャ

**リクエストフロー:**
```
Page (app/) → Server Action (lib/actions.ts)
                → getRepository() (lib/db.ts)  ← Supabase クライアント生成
                  → note-service (lib/note-service.ts)  ← バリデーション + ビジネスロジック
                    → INotesRepository (lib/repository.ts)  ← Supabase 操作
```

**認証フロー:**
```
未ログインユーザーが書き込みルートにアクセス
  → middleware.ts が検知 → /login にリダイレクト
  → signInWithGoogle() → Supabase OAuth（Google）
  → /auth/callback でセッション確立 → / にリダイレクト
```

**依存性注入によるテスト分離:**
`INotesRepository` インターフェースを介して Supabase への依存を分離している。テストは `SupabaseNotesRepository` の代わりに `InMemoryNotesRepository`（`__tests__/helpers/`）を使うため、Supabase なしで動作する。新しいサービスロジックを書く場合は `note-service.ts` に追加し、リポジトリをDIで受け取る形にする。

**レイヤー責務:**
- `lib/env.ts` — 環境変数解決（Cloudflare context → process.env の順でフォールバック）
- `lib/db.ts` — Supabase クライアントを生成して `SupabaseNotesRepository` を返すファクトリ
- `lib/repository.ts` — `INotesRepository` インターフェース + `SupabaseNotesRepository` 実装
- `lib/note-service.ts` — バリデーション呼び出し + エラーハンドリング（`redirect` なし）
- `lib/actions.ts` — `'use server'`、`redirect` はここだけで行う
- `lib/auth-actions.ts` — `'use server'`、Google OAuth サインイン／アウト
- `lib/validations.ts` — 純粋関数、副作用なし
- `lib/supabase/server.ts` — Cookie ベースのサーバーサイド Supabase クライアント
- `middleware.ts` — 保護ルート（`/notes/new`、`/notes/:id/edit`）のアクセス制御

## Cloudflare 固有の制約

**必須パターン（破ると本番ビルドが壊れる）:**

```typescript
// getCloudflareContext は必ず async: true で呼ぶ（静的プリレンダリング対策）
const { env } = await getCloudflareContext({ async: true });

// Supabase にアクセスするページには必ず追加
export const dynamic = 'force-dynamic';

// export const runtime = 'edge' は絶対に使わない
// @opennextjs/cloudflare と非互換、Worker 全体がエッジで動くため不要
```

## 環境変数

| 変数 | 用途 |
|------|------|
| `SUPABASE_URL` | Supabase プロジェクト URL |
| `SUPABASE_ANON_KEY` | Supabase anon public key |

- `.dev.vars` — Cloudflare Workers 実行時（`npm run preview` / `deploy`）
- `.env.local` — Next.js 開発時（`npm run dev`）
- テンプレート: `.dev.vars.example`、`.env.local.example`

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
