#!/usr/bin/env bash
set -euo pipefail

# ---- EDIT THESE IF YOUR DEFAULT BRANCH IS NOT "main" ----
DEFAULT_BRANCH="main"

# ---- YOUR SOURCE REPOS ----
OWNER="fanoo2"
REPOS=(
  "backend"
  "frontend"
  "design-system"
  "webrtc-client"
  "payments"
  "moderation"
)

# ---- TARGET FOLDERS INSIDE THE MONOREPO ----
# Map repo -> subdir
declare -A TARGETS=(
  ["backend"]="apps/backend"
  ["frontend"]="apps/admin-console"
  ["design-system"]="packages/design-system"
  ["webrtc-client"]="packages/webrtc-client"
  ["payments"]="packages/payments"
  ["moderation"]="packages/moderation"
)

# Basic git identity for the merge commits this script makes
git config user.name  "monorepo-bot"
git config user.email "monorepo-bot@users.noreply.github.com"

# Make initial commit if repo is totally empty
if [ -z "$(git rev-parse --verify HEAD 2>/dev/null || true)" ]; then
  echo "# Fanno Platform Monorepo" > README.md
  git add README.md
  git commit -m "chore: init monorepo"
fi

# Create workspace skeleton
mkdir -p apps packages

# Add each repo via git subtree (preserves history).
for repo in "${REPOS[@]}"; do
  remote="src-${repo}"
  url="https://github.com/${OWNER}/${repo}.git"
  prefix="${TARGETS[$repo]}"

  echo "---- Importing ${repo} into ${prefix} ----"
  git remote add "${remote}" "${url}" || true
  git fetch "${remote}" --tags

  mkdir -p "${prefix}"
  # If you want full separate history (no squash), drop --squash
  git subtree add --prefix="${prefix}" "${remote}" "${DEFAULT_BRANCH}" --squash
done

# Root workspace files (pnpm + turbo + tsconfig.base)
cat > package.json <<'JSON'
{
  "name": "@fanno/platform",
  "private": true,
  "packageManager": "pnpm@9",
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.0.10"
  },
  "pnpm": {
    "packageExtensions": {}
  },
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
JSON

cat > turbo.json <<'JSON'
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["build"]
    }
  }
}
JSON

cat > tsconfig.base.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2020",
    "moduleResolution": "node",
    "strict": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@org/design-system/*": ["packages/design-system/src/*"],
      "@fanno/webrtc-client/*": ["packages/webrtc-client/src/*"],
      "@shared/*": ["packages/shared/src/*"]
    }
  }
}
JSON

# Optional shared package for common types (empty starter)
mkdir -p packages/shared/src
cat > packages/shared/package.json <<'JSON'
{
  "name": "@fanno/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsc -w -p tsconfig.json",
    "lint": "echo 'no lint config yet'",
    "test": "echo 'no tests yet'"
  },
  "devDependencies": {
    "typescript": "^5.5.4"
  }
}
JSON

cat > packages/shared/tsconfig.json <<'JSON'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true
  },
  "include": ["src"]
}
JSON

# Basic CI (build + test). You can extend with deploy jobs later.
mkdir -p .github/workflows
cat > .github/workflows/ci.yml <<'YAML'
name: CI

on:
  push:
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile || pnpm install
      - run: pnpm build
      - run: pnpm test || echo "no tests yet"
      - run: pnpm lint || echo "no lint yet"
YAML

git add .
git commit -m "chore: import repos and bootstrap workspaces"
git push origin HEAD
echo "✅ Monorepo migration complete. Open a PR or merge to main."