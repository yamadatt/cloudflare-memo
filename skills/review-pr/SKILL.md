---
name: review-pr
description: GitHub CLI（gh）でPull Requestをレビューし、重要度付きの指摘、確認事項、最終判定（APPROVE/COMMENT/REQUEST_CHANGES）を作成する。PRレビュー依頼、差分レビュー、レビューコメント作成、`gh pr review` 実行が求められたときに使う。調査結果とレビュー結論は毎回PRコメントへ必ず追記する。MCPは使わない。
---

# PRレビュー

この手順で、再現性のあるPRレビューを実施する。
レビュー操作は GitHub CLI（`gh`）を使い、MCPは使わない。

## 手順

1. レビュー対象を確定する。
- PR番号またはPR URLを確定する。
- 目的（最終承認前レビュー、差し戻しレビューなど）を確認する。

2. PRコンテキストを収集する。
- `scripts/collect_review_context.sh <pr-number>` を実行する。
- PR概要、説明文、変更ファイル、CI結果、既存レビューを確認する。

3. 差分を精査する。
- `gh pr diff <pr-number>` と変更ファイル単位のコードを確認する。
- 仕様不整合、バグ、回帰リスク、セキュリティ、性能、テスト不足を優先して確認する。

4. 指摘を重要度付きで整理する。
- `must`: マージ前に必須修正（不具合・破壊的変更・重大リスク）。
- `should`: 修正推奨（保守性・可読性・軽微な挙動リスク）。
- `nit`: 任意改善（表現・微調整）。
- 各指摘に「根拠」「影響」「修正方針」を入れる。
- 可能な限り `path:line` 形式の参照を入れる。

5. レビュー結論を決める。
- `must` が1件でもあれば `REQUEST_CHANGES`。
- `must` がなく、問題なしなら `APPROVE`。
- 判断保留や質問中心なら `COMMENT`。

6. GitHub CLI でレビュー結果を必ず投稿する（省略不可）。
- 調査結果（PR概要/差分/CI/既存レビューの要点）とレビュー結論（指摘一覧、最終判定）をMarkdownにまとめる。
- `gh pr comment <pr-number> --body-file <file>` を必ず実行し、PRコメントへ追記する。
- 最終判定に応じて必要なら追加で実行する。
  - 承認: `gh pr review <pr-number> --approve --body-file <file>`
  - 差し戻し: `gh pr review <pr-number> --request-changes --body-file <file>`
  - コメントのみレビュー: `gh pr review <pr-number> --comment --body-file <file>`
- 投稿後はPRコメントURL（必要なら review URL も）を取得し、ユーザーへの返答に含める。

## 出力形式

以下の順で返す:
1. 指摘一覧（重要度順: must → should → nit）
2. 確認事項・質問
3. 最終判定（APPROVE / COMMENT / REQUEST_CHANGES）
4. 投稿用レビュー本文（Markdown）
