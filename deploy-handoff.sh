#!/usr/bin/env bash
# Deploy this prototype to GitHub Pages at jualzate87/handoff.
#
# Builds the app with the correct base path, force-pushes the static output to
# the gh-pages branch, and pushes main. Run this from your own terminal -
# pushing to github.com is blocked by intuit-git-push-guard in an agent
# session, so this script must be run manually.
#
# One-time setup (skip if already done):
#   git remote add handoff https://github.com/jualzate87/handoff.git
#   Then on https://github.com/jualzate87/handoff/settings/pages:
#     Source: Deploy from a branch → Branch: gh-pages / (root)
#
# Live URL: https://jualzate87.github.io/handoff/

set -euo pipefail
cd "$(dirname "$0")"

BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo detached)"
if [ "$BRANCH" != "main" ]; then
  echo "Refusing to deploy from branch '$BRANCH' — switch to main first." >&2
  exit 1
fi

if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  echo "Uncommitted changes present — commit or stash before deploying." >&2
  exit 1
fi

BASE_PATH="/handoff/"

REMOTE="${DEPLOY_REMOTE:-handoff}"
if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "Remote '$REMOTE' not found. Add the GitHub repo:" >&2
  echo "  git remote add handoff https://github.com/jualzate87/handoff.git" >&2
  exit 1
fi

echo "==> Pushing main to $REMOTE"
git push -u "$REMOTE" main

echo "==> Building with GitHub Pages base path ($BASE_PATH)"
VITE_BASE_PATH="$BASE_PATH" npx vite build --mode production

if ! grep -q "${BASE_PATH}assets/" dist/index.html; then
  echo "Build output missing $BASE_PATH asset paths — check vite.config.ts" >&2
  exit 1
fi

echo "==> Publishing dist/ to gh-pages"
REPO_ROOT="$(pwd)"
WORKTREE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/ptg-innovate-handoff-gh-pages.XXXXXX")"
cleanup() {
  git worktree remove --force "$WORKTREE_DIR" 2>/dev/null || true
  rm -rf "$WORKTREE_DIR"
}
trap cleanup EXIT

# mktemp already created WORKTREE_DIR, but `git worktree add` requires the
# target path not to exist yet.
rmdir "$WORKTREE_DIR"

git worktree add -f "$WORKTREE_DIR" "$REMOTE/gh-pages" 2>/dev/null || \
git worktree add -f "$WORKTREE_DIR" gh-pages 2>/dev/null || {
  git worktree add -f --detach "$WORKTREE_DIR"
  (cd "$WORKTREE_DIR" && git checkout --orphan gh-pages && git rm -rf . >/dev/null 2>&1 || true)
}

find "$WORKTREE_DIR" -mindepth 1 -maxdepth 1 -not -name '.git' -exec rm -rf {} +
cp -r "$REPO_ROOT/dist/." "$WORKTREE_DIR/"
# Prevent Jekyll from stripping underscore-prefixed assets on GitHub Pages
touch "$WORKTREE_DIR/.nojekyll"
# SPA fallback for GitHub Pages
cp "$REPO_ROOT/dist/index.html" "$WORKTREE_DIR/404.html" 2>/dev/null || true
cd "$WORKTREE_DIR"
git add -A
git commit -m "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)" --allow-empty
git push "$REMOTE" HEAD:gh-pages --force
cd "$REPO_ROOT"

echo "==> Done. Site will be live at https://jualzate87.github.io/handoff/"
echo "    (first deploy: confirm Pages source = gh-pages branch in repo settings)"
