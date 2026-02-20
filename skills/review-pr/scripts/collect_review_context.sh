#!/usr/bin/env bash
set -euo pipefail

pr_number="${1:-}"

if [ -z "$pr_number" ]; then
  echo "使い方: $0 <pr-number>" >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "エラー: gh コマンドが見つかりません" >&2
  exit 1
fi

printf "# PRレビューコンテキスト\n\n"

printf "## PR概要（JSON）\n"
gh pr view "$pr_number" \
  --json number,title,author,baseRefName,headRefName,isDraft,state,mergeStateStatus,reviewDecision,url,additions,deletions,changedFiles \
  --jq '.'
printf "\n\n"

printf "## PR本文\n"
gh pr view "$pr_number" --json body --jq '.body'
printf "\n\n"

printf "## 変更ファイル一覧\n"
gh pr diff "$pr_number" --name-only || true
printf "\n"

printf "## CIチェック\n"
gh pr checks "$pr_number" || true
printf "\n"

printf "## 既存レビュー（JSON）\n"
gh pr view "$pr_number" --json reviews --jq '.reviews'
printf "\n"
