#!/usr/bin/env bash
set -euo pipefail

base_ref="${1:-origin/main}"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "エラー: Gitリポジトリではありません" >&2
  exit 1
fi

branch="$(git rev-parse --abbrev-ref HEAD)"

if merge_base="$(git merge-base HEAD "$base_ref" 2>/dev/null)"; then
  :
else
  echo "警告: $base_ref との merge-base を取得できないため、初回コミットを使用します" >&2
  merge_base="$(git rev-list --max-parents=0 HEAD | tail -n 1)"
fi

commit_subjects="$(git log --pretty=%s "$merge_base"..HEAD || true)"
issue_candidates="$(
  {
    printf "%s\n" "$branch"
    printf "%s\n" "$commit_subjects"
  } | grep -Eo '#[0-9]+' | sort -u || true
)"
closing_keywords="$(
  printf "%s\n" "$commit_subjects" | grep -Eio '(close[sd]?|fix(e[sd])?|resolve[sd]?)\s+#([0-9]+)' || true
)"

printf "# PRコンテキスト\n\n"
printf "## ブランチ\n- head: %s\n- base: %s\n- merge-base: %s\n\n" "$branch" "$base_ref" "$merge_base"

printf "## コミット\n"
git log --oneline "$merge_base"..HEAD || true
printf "\n"

printf "## 関連Issue候補\n"
if [ -n "$issue_candidates" ]; then
  printf "%s\n" "$issue_candidates"
else
  printf "(候補なし)\n"
fi
printf "\n"

printf "## Issueクローズキーワード候補\n"
if [ -n "$closing_keywords" ]; then
  printf "%s\n" "$closing_keywords"
else
  printf "(候補なし)\n"
fi
printf "\n"

printf "## 変更ファイル（name-status）\n"
git diff --name-status "$merge_base"...HEAD || true
printf "\n"

printf "## 差分統計\n"
git diff --stat "$merge_base"...HEAD || true
printf "\n"

printf "## ワーキングツリー状態\n"
git status --short
