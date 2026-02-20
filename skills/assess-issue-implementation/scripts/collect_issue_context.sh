#!/usr/bin/env bash
set -euo pipefail

issue_number="${1:-}"

if [ -z "$issue_number" ]; then
  echo "使い方: $0 <issue-number>" >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "エラー: gh コマンドが見つかりません" >&2
  exit 1
fi

printf "# ISSUE検討コンテキスト\n\n"

printf "## Issue概要（JSON）\n"
gh issue view "$issue_number" \
  --json number,title,author,assignees,labels,state,createdAt,updatedAt,url,milestone \
  --jq '.'
printf "\n\n"

printf "## Issue本文\n"
gh issue view "$issue_number" --json body --jq '.body'
printf "\n\n"

printf "## Issueコメント（JSON）\n"
gh issue view "$issue_number" --json comments --jq '.comments'
printf "\n\n"

printf "## 関連PR候補（Issue番号検索）\n"
gh pr list --state all --search "$issue_number" --limit 30 --json number,title,state,url --jq '.' || true
printf "\n"
