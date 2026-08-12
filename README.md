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

---

## セットアップ手順（ゼロから動かす）

このアプリを自分の環境で動かすには、以下の 3 つの外部サービスのアカウントが必要です。

| サービス | 用途 | 費用 |
|---------|------|------|
| [Supabase](https://supabase.com) | データベース・認証 | 無料枠あり |
| [Google Cloud Console](https://console.cloud.google.com) | OAuth クライアント | 無料 |
| [Cloudflare](https://cloudflare.com) | Workers（本番デプロイ時のみ） | 無料枠あり |

### 前提条件

- **Node.js 18 以上**（`node -v` で確認）
- **git**（`git --version` で確認）
- 上記 3 サービスのアカウント

---

### Step 1: リポジトリをクローンして依存関係をインストール

```bash
git clone https://github.com/<your-username>/cloudflare-memo.git
cd cloudflare-memo
npm install
```

> **Fork して使う場合:** GitHub でこのリポジトリを Fork してから、Fork 先の URL でクローンしてください。

---

### Step 2: Supabase プロジェクトを作成する

1. [Supabase ダッシュボード](https://supabase.com/dashboard) にログインし、**New project** をクリック
2. プロジェクト名・データベースパスワード・リージョン（例: `Northeast Asia (Tokyo)`）を入力して作成
3. 作成後、**Project Settings > API** を開き、以下の値をメモする

| 設定値 | 場所 | 変数名 |
|--------|------|--------|
| Project URL | Project Settings > API > Project URL | `SUPABASE_URL` |
| anon public key | Project Settings > API > Project API keys | `SUPABASE_ANON_KEY` |

---

### Step 3: Supabase でテーブルを作成する

Supabase ダッシュボードの **SQL Editor** を開き、以下の SQL を実行する。

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

**確認:** Table Editor に `notes` テーブルが表示されれば OK。

---

### Step 4: Google OAuth を設定する

#### 4-1. Google Cloud Console でプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com) を開く
2. 画面上部のプロジェクト選択から **新しいプロジェクト** を作成
3. **APIs & Services > OAuth consent screen** を開き、以下を設定する
   - User Type: `External`
   - アプリ名・サポートメール・デベロッパーメールを入力して保存

#### 4-2. OAuth クライアント ID を作成

1. **APIs & Services > Credentials > Create Credentials > OAuth client ID** を選択
2. Application type: `Web application`
3. **Authorized redirect URIs** に以下を追加する

   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

   > `<your-project-ref>` は Supabase の Project URL の `https://` 以降 `.supabase.co` までの部分（例: `abcdefghijklmn`）

4. 作成後に表示される **Client ID** と **Client Secret** をメモする

#### 4-3. Supabase に Google の認証情報を登録

1. Supabase ダッシュボードの **Authentication > Providers > Google** を開く
2. **Enable Sign in with Google** をオンにする
3. Google Cloud Console でメモした **Client ID** と **Client Secret** を入力して保存

#### 4-4. Supabase に Redirect URL を追加

1. **Authentication > URL Configuration > Redirect URLs** を開く
2. 以下を追加する（ローカル開発用）

   ```
   http://localhost:3000/auth/callback
   ```

   本番デプロイ後は以下も追加する

   ```
   https://<your-workers-subdomain>.workers.dev/auth/callback
   ```

---

### Step 5: 環境変数を設定する

テンプレートファイルをコピーして、実際の値を記入する。

```bash
cp .dev.vars.example .dev.vars
cp .env.local.example .env.local
```

`.dev.vars`（`npm run preview` 用）と `.env.local`（`npm run dev` 用）の両方に同じ値を設定する。

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **注意:** `.dev.vars` と `.env.local` はどちらも `.gitignore` に含まれているため、誤って Git にコミットされることはありません。

---

### Step 6: ローカルで動作確認する

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いて以下を確認する。

- [ ] ノート一覧が表示される（初回は空でOK）
- [ ] 「ログイン」ボタンをクリックして Google アカウントでログインできる
- [ ] ログイン後にノートを新規作成できる

---

### Step 7: Cloudflare Workers にデプロイする（任意）

ローカルで動作確認できたら、本番環境にデプロイする。

#### 7-1. wrangler.toml のプロジェクト名を変更する

`wrangler.toml` を開き、`name` を任意の名前に変更する（Cloudflare のサブドメインになる）。

```toml
name = "your-app-name"   # ← 好きな名前に変更
```

#### 7-2. Wrangler でログインする

```bash
npx wrangler login
```

ブラウザが開くので Cloudflare アカウントで認証する。

#### 7-3. Supabase のシークレットキーを Cloudflare に登録する

`SUPABASE_ANON_KEY` は機密情報のため、`wrangler secret` で登録する。

```bash
npx wrangler secret put SUPABASE_ANON_KEY
```

プロンプトが表示されたら、Supabase の anon key を貼り付けて Enter。

#### 7-4. wrangler.toml に SUPABASE_URL を記載する

`wrangler.toml` の `[vars]` セクションを自分のプロジェクト URL に更新する。

```toml
[vars]
SUPABASE_URL = "https://your-project-ref.supabase.co"
```

#### 7-5. デプロイする

```bash
npm run deploy
```

成功すると `https://<your-app-name>.<your-subdomain>.workers.dev` にアクセスできるようになる。

#### 7-6. Supabase に本番 URL を追加する

Step 4-4 の手順で、本番 URL を Redirect URLs に追加する。

```
https://<your-app-name>.<your-subdomain>.workers.dev/auth/callback
```

---

## トラブルシューティング

### ログイン後に `/auth/callback` でエラーになる

**原因:** Supabase の Redirect URLs に登録した URL と実際のコールバック URL が一致していない。

**対処:** Supabase ダッシュボードの **Authentication > URL Configuration > Redirect URLs** に以下が登録されているか確認する。

- ローカル: `http://localhost:3000/auth/callback`
- 本番: `https://<your-workers-subdomain>.workers.dev/auth/callback`

---

### `Error: supabase URL is required` が出る

**原因:** 環境変数が正しく設定されていない。

**対処:**
- `npm run dev` の場合 → `.env.local` を確認
- `npm run preview` の場合 → `.dev.vars` を確認
- 本番（Workers）の場合 → `wrangler.toml` の `[vars]` と `wrangler secret` を確認

---

### `npm run deploy` が失敗する

**原因:** Wrangler にログインしていないか、`name` が他のプロジェクトと競合している。

**対処:**
1. `npx wrangler login` でログイン済みか確認
2. `wrangler.toml` の `name` をユニークな名前に変更する

---

### Google ログインで `redirect_uri_mismatch` エラーになる

**原因:** Google Cloud Console の Authorized redirect URIs に登録した URL と、Supabase のコールバック URL が一致していない。

**対処:** Google Cloud Console の OAuth クライアント設定で、以下が登録されているか確認する。

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

---

## ローカル開発

```bash
# Next.js 開発サーバー（.env.local を使用）
npm run dev

# Cloudflare Workers をローカルでエミュレーション（.dev.vars を使用）
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

---

## GitHub Actions（CI/CD）

### ワークフロー構成

- CI: `.github/workflows/ci.yml`
  - トリガー: `pull_request`（main向け）、`push`（main）、`workflow_dispatch`
  - 実行内容: `npm ci` → `npm run test` → `npm run build`
- Deploy: `.github/workflows/deploy.yml`
  - トリガー: `CI` の `workflow_run`（`push main` 由来で成功時）または `workflow_dispatch`
  - 実行内容: `npm ci` → `npm run deploy`
- 両ワークフローで `Kesin11/actions-timeline@v2` を利用し、ジョブの実行時間を可視化

### GitHub Secrets の設定

GitHub Actions の `Deploy` 実行前に、リポジトリの **Settings > Secrets and variables > Actions** に以下を設定する。

| Secret 名 | 取得元 |
|-----------|--------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare ダッシュボード > My Profile > API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare ダッシュボード > Workers & Pages > アカウント ID |
| `SUPABASE_URL` | Supabase > Project Settings > API > Project URL |
| `SUPABASE_ANON_KEY` | Supabase > Project Settings > API > anon public key |

> **CLOUDFLARE_API_TOKEN の作成:** Cloudflare の **My Profile > API Tokens > Create Token** で、テンプレート「`Edit Cloudflare Workers`」を選択して作成する。

---

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

---

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

## 環境変数の解決順序

環境変数の読み取りは `lib/env.ts` で共通化しており、次の順で解決する。

1. `getCloudflareContext({ async: true })` で取得した Cloudflare 環境変数
2. `process.env`（`next dev` の `.env.local` など）

### 使い分け

- `.dev.vars`: Cloudflare/OpenNext 実行時（`npm run preview` / `deploy`）向け
- `.env.local`: Next.js 開発体験（`npm run dev`）向け
- どちらにも同じ値を置いて問題ない
