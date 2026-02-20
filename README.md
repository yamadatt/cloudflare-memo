# cloudflare-notes-app

Cloudflare Workers + D1 + Next.js App Router で構築したシンプルなメモ帳アプリ。

**デプロイ済みURL:** https://cloudflare-notes-app.yamadatt.workers.dev

## 機能

- ノートの一覧表示
- ノートの新規作成
- ノートの詳細表示
- ノートの編集
- ノートの削除（確認ダイアログあり）

## 技術スタック

| 役割 | 技術 |
|------|------|
| フロントエンド | Next.js 15 (App Router) |
| ランタイム | Cloudflare Workers |
| データベース | Cloudflare D1 (SQLite) |
| スタイリング | TailwindCSS |
| 言語 | TypeScript |
| CF アダプター | @opennextjs/cloudflare |

## ディレクトリ構成

```
cloudflare-memo/
├── app/
│   ├── layout.tsx              # ルートレイアウト
│   ├── page.tsx                # ノート一覧ページ (/)
│   ├── not-found.tsx           # カスタム 404 ページ
│   ├── error.tsx               # エラーバウンダリ
│   └── notes/
│       ├── new/page.tsx        # ノート作成ページ (/notes/new)
│       └── [id]/
│           ├── page.tsx        # ノート詳細ページ (/notes/:id)
│           └── edit/page.tsx   # ノート編集ページ (/notes/:id/edit)
├── components/
│   ├── NoteCard.tsx            # ノートカード（一覧用）
│   ├── NoteForm.tsx            # 作成・編集フォーム
│   └── DeleteButton.tsx        # 削除ボタン（確認ダイアログ付き）
├── lib/
│   ├── types.ts                # 型定義
│   ├── db.ts                   # D1 CRUD 操作
│   ├── validations.ts          # 入力バリデーション
│   └── actions.ts              # Server Actions
├── migrations/
│   └── 0001_create_notes.sql  # D1 スキーマ
├── open-next.config.ts         # OpenNext 設定
└── wrangler.toml               # Cloudflare Workers 設定
```

## セットアップ

### 前提条件

- Node.js 18 以上
- Cloudflare アカウント
- wrangler CLI（`npm install -g wrangler` でもインストール可）

### 手順

**1. 依存関係のインストール**

```bash
npm install
```

**2. Cloudflare へログイン**

```bash
npx wrangler login
```

**3. D1 データベースの作成**

```bash
npx wrangler d1 create notes_db
```

出力に含まれる `database_id` を `wrangler.toml` に設定する。

```toml
[[d1_databases]]
binding = "DB"
database_name = "notes_db"
database_id = "<出力された database_id>"
```

**4. マイグレーションの実行**

```bash
# リモート（本番）
npx wrangler d1 execute notes_db --file=./migrations/0001_create_notes.sql --remote

# ローカル開発用
npx wrangler d1 execute notes_db --file=./migrations/0001_create_notes.sql --local
```

**5. デプロイ**

```bash
npm run deploy
```

## ローカル開発

```bash
# Next.js 開発サーバー（D1 なし・ビルド確認用）
npm run dev

# Cloudflare Workers ローカルエミュレーション（D1 バインディングあり）
npm run preview
```

`npm run preview` はローカルの D1 に対して動作する。事前に `--local` フラグでマイグレーションを適用しておくこと。

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

D1 を使うページは静的生成を無効化しないとビルドエラーになる。

```typescript
export const dynamic = 'force-dynamic';
```

### `export const runtime = 'edge'` は使用しない

`@opennextjs/cloudflare` はページ単位の edge runtime 宣言と非互換。Worker 全体が Cloudflare エッジで動作するため不要。
