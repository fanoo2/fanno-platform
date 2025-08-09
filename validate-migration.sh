#!/usr/bin/env bash
# Simple validation script to test migrate-to-monorepo.sh without executing the migration

set -euo pipefail

echo "🔍 Validating monorepo migration script..."

# Check if script exists and is executable
if [[ ! -f "migrate-to-monorepo.sh" ]]; then
    echo "❌ migrate-to-monorepo.sh not found"
    exit 1
fi

if [[ ! -x "migrate-to-monorepo.sh" ]]; then
    echo "❌ migrate-to-monorepo.sh is not executable"
    exit 1
fi

# Check script syntax
echo "📝 Checking script syntax..."
if bash -n migrate-to-monorepo.sh; then
    echo "✅ Script syntax is valid"
else
    echo "❌ Script syntax error"
    exit 1
fi

# Check if required tools are available
echo "🔧 Checking required tools..."

required_tools=("git" "mkdir" "cat")
for tool in "${required_tools[@]}"; do
    if command -v "$tool" >/dev/null 2>&1; then
        echo "✅ $tool is available"
    else
        echo "❌ $tool is not available"
        exit 1
    fi
done

# Validate script configuration
echo "⚙️  Validating script configuration..."

# Extract and validate variables from the script
default_branch=$(grep '^DEFAULT_BRANCH=' migrate-to-monorepo.sh | cut -d'"' -f2)
owner=$(grep '^OWNER=' migrate-to-monorepo.sh | cut -d'"' -f2)

if [[ -n "$default_branch" ]]; then
    echo "✅ DEFAULT_BRANCH is set to: $default_branch"
else
    echo "❌ DEFAULT_BRANCH is not set"
    exit 1
fi

if [[ -n "$owner" ]]; then
    echo "✅ OWNER is set to: $owner"
else
    echo "❌ OWNER is not set"
    exit 1
fi

# Check if REPOS array is defined
if grep -q "REPOS=(" migrate-to-monorepo.sh; then
    echo "✅ REPOS array is defined"
    repos_count=$(grep -A 10 "REPOS=(" migrate-to-monorepo.sh | grep '".*"' | wc -l)
    echo "📊 Found $repos_count repositories to import"
else
    echo "❌ REPOS array is not defined"
    exit 1
fi

# Check if TARGETS mapping is defined
if grep -q "declare -A TARGETS=(" migrate-to-monorepo.sh; then
    echo "✅ TARGETS mapping is defined"
else
    echo "❌ TARGETS mapping is not defined"
    exit 1
fi

echo ""
echo "🎉 All validations passed! The migration script is ready to use."
echo ""
echo "To run the migration:"
echo "  ./migrate-to-monorepo.sh"
echo ""
echo "⚠️  WARNING: This will modify your git repository and fetch remote repositories."
echo "   Make sure you have committed any local changes before running."