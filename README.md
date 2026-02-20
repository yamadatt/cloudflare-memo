# cloudflare-notes-app

Cloudflare Workers + Supabase + Next.js App Router で構築したメモ帳アプリ。
閲覧は誰でもできるが、書き込み・編集はログイン（Google OAuth）が必要。

**デプロイ済みURL:** https://cloudflare-notes-app.yamadatt.workers.dev

## 機能

- ノートの一覧表示（未ログインでも閲覧可）
- ノートの新規作成（ログイン必須）
- ノートの詳細表示
- ノートの編集（ログイン必須）
- ノートの削除（確認ダイアログあり）
- Google アカウントでのログイン／ログアウト

## 技術スタック

| 役割 | 技術 |
|------|------|
| フロントエンド | Next.js 15 (App Router) |
| ランタイム | Cloudflare Workers |
| データベース | Supabase (PostgreSQL) |
| 認証 | Supabase Auth (Google OAuth) |
| スタイリング | TailwindCSS |
| 言語 | TypeScript |
| CF アダプター | @opennextjs/cloudflare |

## ディレクトリ構成

```
cloudflare-memo/
├── app/
│   ├── layout.tsx                  # ルートレイアウト（ヘッダー・認証状態表示）
│   ├── page.tsx                    # ノート一覧ページ (/)
│   ├── not-found.tsx               # カスタム 404 ページ
│   ├── error.tsx                   # エラーバウンダリ
│   ├── login/
│   │   └── page.tsx                # ログインページ (/login)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts            # OAuth コールバック (/auth/callback)
│   └── notes/
│       ├── new/page.tsx            # ノート作成ページ (/notes/new)
│       └── [id]/
│           ├── page.tsx            # ノート詳細ページ (/notes/:id)
│           └── edit/page.tsx       # ノート編集ページ (/notes/:id/edit)
├── components/
│   ├── NoteCard.tsx                # ノートカード（一覧用）
│   ├── NoteForm.tsx                # 作成・編集フォーム
│   └── DeleteButton.tsx            # 削除ボタン（確認ダイアログ付き）
├── lib/
│   ├── types.ts                    # 型定義
│   ├── env.ts                      # 環境変数解決（Cloudflare context → process.env）
│   ├── db.ts                       # リポジトリファクトリ
│   ├── repository.ts               # INotesRepository + SupabaseNotesRepository 実装
│   ├── note-service.ts             # バリデーション + ビジネスロジック
│   ├── validations.ts              # 純粋関数バリデーション
│   ├── actions.ts                  # ノート操作 Server Actions
│   ├── auth-actions.ts             # 認証 Server Actions（サインイン／アウト）
│   └── supabase/
│       └── server.ts               # サーバーサイド Supabase クライアント
├── middleware.ts                    # 認証ミドルウェア（保護ルート制御）
├── open-next.config.ts             # OpenNext 設定
└── wrangler.toml                   # Cloudflare Workers 設定
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
未ログインユーザーが /notes/new or /notes/:id/edit にアクセス
  → middleware.ts が検知 → /login にリダイレクト
  → Googleでログインボタン → signInWithGoogle() → Supabase OAuth
  → /auth/callback でセッション確立 → / にリダイレクト
```

**依存性注入によるテスト分離:**
`INotesRepository` インターフェースを介して Supabase への依存を分離している。
テストは `InMemoryNotesRepository`（`__tests__/helpers/`）を使うため、Supabase なしで動作する。

**保護ルート:**
- `/notes/new` — ログイン必須
- `/notes/:id/edit` — ログイン必須

## セットアップ

### 前提条件

- Node.js 18 以上
- Cloudflare アカウント
- Supabase アカウント
- wrangler CLI（`npm install -g wrangler` でもインストール可）

### 手順

**1. 依存関係のインストール**

```bash
npm install
```

**2. Supabase プロジェクトの作成**

[Supabase ダッシュボード](https://supabase.com/dashboard) でプロジェクトを作成し、
`Settings > API` から以下の値を取得する。

- `SUPABASE_URL`（Project URL）
- `SUPABASE_ANON_KEY`（anon public key）

**3. Supabase でテーブルを作成**

Supabase ダッシュボードの SQL Editor で以下を実行する。

```sql
CREATE TABLE notes (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
```

**4. Google OAuth の設定**

Supabase ダッシュボードの `Authentication > Providers > Google` を有効にし、
Google Cloud Console で OAuth クライアントを作成してクライアント ID とシークレットを登録する。

Supabase の `Authentication > URL Configuration` に以下を追加する。

```
https://<your-workers-subdomain>.workers.dev/auth/callback
```

**5. 環境変数の設定**

```bash
cp .dev.vars.example .dev.vars
cp .env.local.example .env.local
```

`.dev.vars`（Cloudflare Workers / `npm run preview` 用）と
`.env.local`（`npm run dev` 用）の両方に同じ値を設定する。

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

**6. Cloudflare へログイン**

```bash
npx wrangler login
```

**7. デプロイ**

```bash
npm run deploy
```

## 環境変数の解決順序

環境変数の読み取りは `lib/env.ts` で共通化しており、次の順で解決する。

1. `getCloudflareContext({ async: true })` で取得した Cloudflare 環境変数
2. `process.env`（`next dev` の `.env.local` など）

### 使い分け

- `.dev.vars`: Cloudflare/OpenNext 実行時（`npm run preview` / `deploy`）向け
- `.env.local`: Next.js 開発体験（`npm run dev`）向け
- どちらにも同じ値を置いて問題ない

## ローカル開発

```bash
# Next.js 開発サーバー
npm run dev

# Cloudflare Workers ローカルエミュレーション
npm run preview
```

## スクリプト一覧

| コマンド | 内容 |
|----------|------|
| `npm run dev` | Next.js 開発サーバー起動 |
| `npm run build` | Next.js プロダクションビルド |
| `npm run preview` | OpenNext ビルド → ローカル Workers 起動 |
| `npm run deploy` | OpenNext ビルド → Cloudflare にデプロイ |
| `npm run lint` | ESLint 実行 |
| `npm test` | Vitest テスト実行 |

## GitHub Actions（CI/CD）

### ワークフロー構成

- CI: `.github/workflows/ci.yml`
  - トリガー: `pull_request`（main向け）、`push`（main）、`workflow_dispatch`
  - 実行内容: `npm ci` → `npm run test` → `npm run build`
- Deploy: `.github/workflows/deploy.yml`
  - トリガー: `CI` の `workflow_run`（`push main` 由来で成功時）または `workflow_dispatch`
  - 実行内容: `npm ci` → `npm run deploy`
- 両ワークフローで `Kesin11/actions-timeline@v2` を利用し、ジョブの実行時間を可視化

### GitHub Secrets

GitHub Actions の `Deploy` 実行前に、リポジトリ Secrets に以下を設定する。

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## データベーススキーマ

```sql
CREATE TABLE notes (
  id         TEXT PRIMARY KEY,   -- UUID v4
  title      TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,      -- ISO 8601
  updated_at TEXT NOT NULL       -- ISO 8601
);

CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
```

## 実装上の注意点

### `getCloudflareContext` は非同期モードで呼び出す

ビルド時の静的プリレンダリングで失敗するため、`async: true` オプションが必要。

```typescript
// NG
const { env } = getCloudflareContext();

// OK
const { env } = await getCloudflareContext({ async: true });
```

### `export const dynamic = 'force-dynamic'` を DB アクセスページに追加する

Supabase を使うページは静的生成を無効化しないとビルドエラーになる。

```typescript
export const dynamic = 'force-dynamic';
```

### `export const runtime = 'edge'` は使用しない

`@opennextjs/cloudflare` はページ単位の edge runtime 宣言と非互換。Worker 全体が Cloudflare エッジで動作するため不要。
