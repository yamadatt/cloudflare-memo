# 不要コード調査レポート（全体監査）

調査日: 2026-02-21
調査対象: `app/`, `components/`, `lib/`, `__tests__/`, `middleware.ts`, `package.json`

---

## サマリー

| 区分 | 件数 |
|------|------|
| 削除可能なデッドコード | 1件 |
| 意図的設計（対応不要） | 2件 |
| 問題なし | その他すべて |

コードベース全体は**非常にクリーン**な状態です。

---

## 削除可能なデッドコード

### 1. `components/NewNoteHeaderButton.tsx` — 未使用コンポーネント

**問題**: コンポーネントが定義されているが、アプリケーション内のどこからもインポート・使用されていない。

**確認方法**:
```
grep -r "NewNoteHeaderButton" . → 定義箇所のみヒット、import箇所なし
```

**推奨アクション**: **ファイルごと削除可**

---

## 意図的設計（対応不要）

### 1. `lib/validations.ts` L4 — `_content` パラメータと ESLint 無効化コメント

```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function validateNoteInput(
  title: string,
  _content: string  // 本文は現在制限なし
): ValidationResult
```

**判断**: 将来のバリデーション拡張を想定した意図的な設計。ESLint コメントで適切に管理されている。対応不要。

---

### 2. `lib/actions.ts` L36, L59 — `redirect()` 後の到達不能コード

```typescript
redirect('/');
// ↑ Next.js の redirect() は例外を throw するため、以降のコードは実行されない
```

**判断**: Next.js の仕様に基づく意図的な設計。対応不要。

---

## 調査済み・問題なし

### コンポーネント

| ファイル | 状態 |
|---------|------|
| `components/NoteForm.tsx` | ✅ 使用中 |
| `components/NoteCard.tsx` | ✅ 使用中 |
| `components/DeleteButton.tsx` | ✅ 使用中 |

### lib/

| ファイル | 状態 |
|---------|------|
| `lib/types.ts` | ✅ 全型が使用中（Note, CreateNoteInput, UpdateNoteInput, ValidationResult, ActionResult） |
| `lib/repository.ts` | ✅ インターフェース・実装ともに使用中 |
| `lib/note-service.ts` | ✅ 使用中 |
| `lib/actions.ts` | ✅ 使用中 |
| `lib/auth-actions.ts` | ✅ 使用中 |
| `lib/validations.ts` | ✅ 使用中 |
| `lib/db.ts` | ✅ 使用中 |
| `lib/env.ts` | ✅ 使用中 |
| `lib/auth.ts` | ✅ 使用中 |
| `lib/supabase/server.ts` | ✅ 使用中 |

### package.json 依存パッケージ

| パッケージ | 用途 | 状態 |
|-----------|------|------|
| `framer-motion` | アニメーション | ✅ 使用中 |
| `lucide-react` | アイコン | ✅ 使用中 |
| `react-markdown` | Markdownレンダリング | ✅ 使用中 |
| `remark-gfm` | GFM拡張 | ✅ 使用中 |
| `@supabase/supabase-js` | DB・Auth | ✅ 使用中 |
| `@supabase/ssr` | SSR対応 | ✅ 使用中 |
| `@opennextjs/cloudflare` | デプロイ | ✅ 使用中 |

### その他

| 観点 | 結果 |
|------|------|
| コメントアウトされたコード | なし |
| TODO / FIXME コメント | なし |
| 重複実装 | なし |
| リファクタリング残骸 | なし |
| テストファイルの健全性 | 問題なし |

---

## 推奨アクション

```
components/NewNoteHeaderButton.tsx を削除する
```

これ以外の対応は不要です。
