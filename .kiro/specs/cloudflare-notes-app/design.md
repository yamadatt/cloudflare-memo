# 設計書

## 概要

本システムは、Cloudflareインフラストラクチャ上で動作するシンプルなメモ帳Webアプリケーションです。Next.js App Routerをフロントエンドフレームワークとして使用し、Cloudflare Workers上でホストされ、Cloudflare D1データベースでデータを永続化します。

主な機能：
- ノートのCRUD操作（作成、読み取り、更新、削除）
- サーバーサイドレンダリングによる高速な初期表示
- TailwindCSSによるレスポンシブなUI
- 包括的なエラーハンドリング

## アーキテクチャ

### システム構成

```
┌─────────────────────────────────────────┐
│         ユーザーブラウザ                  │
└────────────────┬────────────────────────┘
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────┐
│      Cloudflare Workers                  │
│  ┌───────────────────────────────────┐  │
│  │   Next.js App Router              │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Pages (RSC)                │  │  │
│  │  │  - app/page.tsx             │  │  │
│  │  │  - app/notes/[id]/page.tsx  │  │  │
│  │  │  - app/notes/new/page.tsx   │  │  │
│  │  │  - app/notes/[id]/edit/...  │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Server Actions             │  │  │
│  │  │  - createNote()             │  │  │
│  │  │  - updateNote()             │  │  │
│  │  │  - deleteNote()             │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│                  ▼                       │
│  ┌───────────────────────────────────┐  │
│  │   Database Layer                  │  │
│  │   - db.ts (D1 client wrapper)     │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼───────────────────────┘
                   │ SQL
                   ▼
┌─────────────────────────────────────────┐
│      Cloudflare D1 Database              │
│      (SQLite-compatible)                 │
└─────────────────────────────────────────┘
```

### 技術スタック

- **フロントエンド**: Next.js 14+ (App Router)
- **ランタイム**: Cloudflare Workers
- **データベース**: Cloudflare D1 (SQLite)
- **スタイリング**: TailwindCSS
- **言語**: TypeScript

### デプロイメント

Cloudflare Workersへのデプロイは、Next.jsの`@cloudflare/next-on-pages`アダプターを使用して行います。これにより、Next.jsアプリケーションがCloudflare Workersで実行可能な形式に変換されます。

## コンポーネントとインターフェース

### データモデル

#### Note型

```typescript
interface Note {
  id: string;           // UUID v4形式の一意識別子
  title: string;        // ノートのタイトル（必須、1文字以上）
  content: string;      // ノートの本文（空文字列可）
  createdAt: string;    // ISO 8601形式のタイムスタンプ
  updatedAt: string;    // ISO 8601形式のタイムスタンプ
}
```

#### CreateNoteInput型

```typescript
interface CreateNoteInput {
  title: string;        // 1文字以上の文字列
  content: string;      // 任意の文字列
}
```

#### UpdateNoteInput型

```typescript
interface UpdateNoteInput {
  id: string;           // 更新対象のノートID
  title: string;        // 1文字以上の文字列
  content: string;      // 任意の文字列
}
```

### データベース層

#### データベーススキーマ

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
```

#### データベース操作関数

**db.ts**

```typescript
// D1データベースインスタンスの取得
function getDatabase(): D1Database

// すべてのノートを取得（作成日時の降順）
async function getAllNotes(): Promise<Note[]>

// IDでノートを取得
async function getNoteById(id: string): Promise<Note | null>

// 新しいノートを作成
async function createNote(input: CreateNoteInput): Promise<Note>

// ノートを更新
async function updateNote(input: UpdateNoteInput): Promise<Note>

// ノートを削除
async function deleteNote(id: string): Promise<void>
```

### Server Actions

Next.js App RouterのServer Actionsを使用して、クライアントからサーバー側の処理を呼び出します。

**actions/notes.ts**

```typescript
'use server'

// ノート作成アクション
async function createNoteAction(formData: FormData): Promise<ActionResult>

// ノート更新アクション
async function updateNoteAction(formData: FormData): Promise<ActionResult>

// ノート削除アクション
async function deleteNoteAction(id: string): Promise<ActionResult>

// アクション結果型
type ActionResult = 
  | { success: true; noteId: string }
  | { success: false; error: string }
```

### ページコンポーネント

#### ノート一覧ページ (app/page.tsx)

- サーバーコンポーネントとして実装
- `getAllNotes()`を呼び出してノート一覧を取得
- ノートが存在しない場合は「ノートがありません」メッセージを表示
- 各ノートをカード形式で表示（タイトル、作成日時）
- 新規作成ボタンを配置

#### ノート詳細ページ (app/notes/[id]/page.tsx)

- サーバーコンポーネントとして実装
- `getNoteById(id)`を呼び出してノートを取得
- ノートが存在しない場合は`notFound()`を呼び出して404ページを表示
- タイトル、本文、作成日時、更新日時を表示
- 編集ボタンと削除ボタンを配置
- 削除ボタンはクライアントコンポーネントで実装（確認ダイアログ用）

#### ノート作成ページ (app/notes/new/page.tsx)

- サーバーコンポーネントとして実装
- フォームコンポーネントを含む
- タイトルと本文の入力フィールド
- `createNoteAction`を使用してフォーム送信を処理
- バリデーションエラーを表示

#### ノート編集ページ (app/notes/[id]/edit/page.tsx)

- サーバーコンポーネントとして実装
- `getNoteById(id)`で既存データを取得
- フォームに既存のタイトルと本文を初期値として設定
- `updateNoteAction`を使用してフォーム送信を処理
- バリデーションエラーを表示

### UIコンポーネント

#### NoteCard (components/NoteCard.tsx)

- ノート一覧で使用するカードコンポーネント
- タイトル、作成日時を表示
- クリックで詳細ページに遷移

#### NoteForm (components/NoteForm.tsx)

- ノート作成・編集で使用するフォームコンポーネント
- タイトル入力フィールド（必須）
- 本文入力フィールド（textarea）
- 送信ボタンとキャンセルボタン
- エラーメッセージ表示領域

#### DeleteButton (components/DeleteButton.tsx)

- クライアントコンポーネント
- 削除確認ダイアログを表示
- `deleteNoteAction`を呼び出し

### バリデーション

#### validateNoteInput関数

```typescript
function validateNoteInput(title: string, content: string): ValidationResult

type ValidationResult = 
  | { valid: true }
  | { valid: false; errors: { title?: string; content?: string } }
```

バリデーションルール：
- タイトル：1文字以上の文字列（空白のみは不可）
- 本文：制限なし（空文字列可）

## データモデル

### データベーステーブル設計

#### notesテーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | TEXT | PRIMARY KEY | UUID v4形式の一意識別子 |
| title | TEXT | NOT NULL | ノートのタイトル |
| content | TEXT | NOT NULL DEFAULT '' | ノートの本文 |
| created_at | TEXT | NOT NULL | ISO 8601形式の作成日時 |
| updated_at | TEXT | NOT NULL | ISO 8601形式の更新日時 |

インデックス：
- `idx_notes_created_at`: created_atカラムの降順インデックス（一覧表示の高速化）

### データフロー

#### ノート作成フロー

```
1. ユーザーがフォームに入力
2. フォーム送信 → createNoteAction()
3. バリデーション実行
4. UUID生成、タイムスタンプ生成
5. createNote() → D1にINSERT
6. 成功時：一覧ページにリダイレクト
7. 失敗時：エラーメッセージを表示
```

#### ノート更新フロー

```
1. 詳細ページで編集ボタンクリック
2. 編集ページで既存データを表示
3. ユーザーが変更を入力
4. フォーム送信 → updateNoteAction()
5. バリデーション実行
6. 更新タイムスタンプ生成
7. updateNote() → D1でUPDATE
8. 成功時：詳細ページにリダイレクト
9. 失敗時：エラーメッセージを表示
```

#### ノート削除フロー

```
1. 詳細ページで削除ボタンクリック
2. 確認ダイアログ表示
3. ユーザーが確認
4. deleteNoteAction() → D1でDELETE
5. 成功時：一覧ページにリダイレクト
6. 失敗時：エラーメッセージを表示
```

### 環境設定

#### wrangler.toml

```toml
name = "cloudflare-notes-app"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "notes_db"
database_id = "<your-database-id>"
```

#### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Workers用の設定
}

module.exports = nextConfig
```

## 正確性プロパティ


プロパティとは、システムのすべての有効な実行において真であるべき特性や動作のことです。本質的には、システムが何をすべきかについての形式的な記述です。プロパティは、人間が読める仕様と機械で検証可能な正確性保証との橋渡しとなります。

### プロパティ1: ノート一覧の完全性

*任意の*ノートセットに対して、一覧ページはすべてのノートを表示し、各ノートにはタイトルと作成日時が含まれている必要があります。

**検証: 要件 1.1, 1.2**

### プロパティ2: ノート詳細の完全性

*任意の*有効なノートに対して、詳細ページはタイトル、本文、作成日時を含むすべての情報を表示する必要があります。

**検証: 要件 3.1, 3.2, 3.3, 3.4**

### プロパティ3: タイトルバリデーション

*任意の*空白のみで構成された文字列に対して、ノート作成または更新操作は拒否され、エラーメッセージが表示される必要があります。

**検証: 要件 2.4, 4.5**

### プロパティ4: ノート作成のラウンドトリップ

*任意の*有効なタイトルと本文に対して、ノートを作成した後にデータベースから取得すると、同じタイトルと本文を持つノートが返される必要があります。

**検証: 要件 2.5, 6.5**

### プロパティ5: ノート更新のラウンドトリップ

*任意の*既存のノートと有効な新しいタイトル・本文に対して、ノートを更新した後にデータベースから取得すると、新しいタイトルと本文を持つノートが返される必要があります。

**検証: 要件 4.3, 6.5**

### プロパティ6: ノート削除の完全性

*任意の*既存のノートに対して、削除操作を実行した後にそのIDでノートを取得しようとすると、ノートが見つからない結果が返される必要があります。

**検証: 要件 5.2**

### プロパティ7: ID一意性

*任意の*複数のノート作成操作に対して、生成されるすべてのIDは一意である必要があります。

**検証: 要件 6.2**

### プロパティ8: タイムスタンプの記録

*任意の*ノート作成操作に対して、作成されたノートには有効なISO 8601形式のcreatedAtとupdatedAtタイムスタンプが設定されている必要があります。

**検証: 要件 6.3**

### プロパティ9: 更新タイムスタンプの変更

*任意の*ノート更新操作に対して、更新後のupdatedAtタイムスタンプは更新前のupdatedAtタイムスタンプよりも新しい必要があります。

**検証: 要件 6.4**

### プロパティ10: 編集フォームの初期値

*任意の*既存のノートに対して、編集ページのフォームには既存のタイトルと本文が初期値として設定されている必要があります。

**検証: 要件 4.2**

### プロパティ11: エラー時のフォームデータ保持

*任意の*バリデーションエラーまたは保存エラーが発生した場合、フォームにはユーザーが入力したデータが保持されている必要があります。

**検証: 要件 2.7, 4.6**

### プロパティ12: データベースエラーハンドリング

*任意の*データベース接続エラーまたは操作エラーに対して、システムはユーザーフレンドリーなエラーメッセージを表示する必要があります。

**検証: 要件 9.1, 9.3**

### プロパティ13: バリデーションエラーメッセージ

*任意の*バリデーションエラーに対して、システムは具体的なエラーメッセージをフォームの近くに表示する必要があります。

**検証: 要件 9.2**

## エラーハンドリング

### エラーの種類と処理

#### バリデーションエラー

- **タイトルが空**: 「タイトルを入力してください」
- **タイトルが空白のみ**: 「タイトルを入力してください」
- エラーメッセージはフォームの上部に赤色で表示
- フォームの入力値は保持される

#### データベースエラー

- **接続エラー**: 「データベースに接続できませんでした。しばらくしてから再度お試しください。」
- **クエリエラー**: 「データの処理中にエラーが発生しました。」
- エラーはコンソールにログ出力
- ユーザーには一般的なエラーメッセージを表示

#### 404エラー

- 存在しないノートIDでアクセスした場合
- Next.jsの`notFound()`関数を使用
- カスタム404ページを表示（「ノートが見つかりませんでした」）

#### ネットワークエラー

- Server Actionの呼び出し失敗時
- 「通信エラーが発生しました。インターネット接続を確認してください。」
- リトライボタンを表示

### エラーログ

すべてのエラーは以下の形式でログに記録：

```typescript
console.error('[Error Type]', {
  message: string,
  timestamp: string,
  context: object,
  stack?: string
})
```

## テスト戦略

### デュアルテストアプローチ

本システムでは、ユニットテストとプロパティベーステストの両方を使用して包括的なテストカバレッジを実現します。

- **ユニットテスト**: 特定の例、エッジケース、エラー条件を検証
- **プロパティベーステスト**: すべての入力にわたる普遍的なプロパティを検証

両者は補完的であり、包括的なカバレッジに必要です。ユニットテストは具体的なバグを捕捉し、プロパティテストは一般的な正確性を検証します。

### ユニットテスト

**テスト対象**:
- 特定の例（例: 特定のタイトルと本文でノートを作成）
- エッジケース（例: 空のノートリスト、存在しないID）
- エラー条件（例: データベース接続失敗）
- コンポーネント間の統合ポイント

**テストフレームワーク**: Vitest

**例**:
```typescript
// 空のノートリストの表示
test('空のノートリストで「ノートがありません」メッセージを表示', async () => {
  const notes = []
  const html = await renderNoteList(notes)
  expect(html).toContain('ノートがありません')
})

// 存在しないIDでの404エラー
test('存在しないノートIDで404を返す', async () => {
  const result = await getNoteById('non-existent-id')
  expect(result).toBeNull()
})
```

### プロパティベーステスト

**テスト対象**:
- すべての入力にわたって成り立つ普遍的なプロパティ
- ランダム化による包括的な入力カバレッジ

**テストライブラリ**: fast-check (TypeScript用のプロパティベーステストライブラリ)

**設定**:
- 各プロパティテストは最低100回の反復を実行
- 各テストには設計書のプロパティを参照するタグを付ける
- タグ形式: `Feature: cloudflare-notes-app, Property {番号}: {プロパティテキスト}`

**例**:
```typescript
import fc from 'fast-check'

// Feature: cloudflare-notes-app, Property 4: ノート作成のラウンドトリップ
test('任意の有効なタイトルと本文でノート作成のラウンドトリップが成功', () => {
  fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // 有効なタイトル
      fc.string(), // 任意の本文
      async (title, content) => {
        const created = await createNote({ title, content })
        const retrieved = await getNoteById(created.id)
        
        expect(retrieved).not.toBeNull()
        expect(retrieved!.title).toBe(title)
        expect(retrieved!.content).toBe(content)
      }
    ),
    { numRuns: 100 }
  )
})

// Feature: cloudflare-notes-app, Property 3: タイトルバリデーション
test('任意の空白のみの文字列でバリデーションエラーが発生', () => {
  fc.assert(
    fc.asyncProperty(
      fc.string().filter(s => s.trim().length === 0), // 空白のみの文字列
      fc.string(), // 任意の本文
      async (title, content) => {
        const result = await validateNoteInput(title, content)
        expect(result.valid).toBe(false)
        expect(result.errors?.title).toBeDefined()
      }
    ),
    { numRuns: 100 }
  )
})

// Feature: cloudflare-notes-app, Property 7: ID一意性
test('複数のノート作成で一意のIDが生成される', () => {
  fc.assert(
    fc.asyncProperty(
      fc.array(
        fc.record({
          title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          content: fc.string()
        }),
        { minLength: 2, maxLength: 10 }
      ),
      async (noteInputs) => {
        const createdNotes = await Promise.all(
          noteInputs.map(input => createNote(input))
        )
        const ids = createdNotes.map(note => note.id)
        const uniqueIds = new Set(ids)
        
        expect(uniqueIds.size).toBe(ids.length)
      }
    ),
    { numRuns: 100 }
  )
})
```

### 統合テスト

- Next.jsページコンポーネントのエンドツーエンドテスト
- Playwright または Cypress を使用
- 主要なユーザーフローをテスト（作成→表示→編集→削除）

### テストカバレッジ目標

- ユニットテスト: 80%以上のコードカバレッジ
- プロパティベーステスト: すべての正確性プロパティをカバー
- 統合テスト: すべての主要ユーザーフローをカバー

### CI/CD統合

- すべてのテストはGitHub Actionsで自動実行
- プルリクエストごとにテストを実行
- テスト失敗時はマージをブロック
