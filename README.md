# Fanno Platform Monorepo

This repository contains the Fanno Platform monorepo migration script and workspace configuration.

## Monorepo Migration

To migrate the existing separate repositories into this monorepo, use the provided migration script:

### Usage

1. Open a Codespace or clone this repository locally
2. Review and edit the configuration variables in `migrate-to-monorepo.sh` if needed:
   - `DEFAULT_BRANCH`: Change if your source repositories use a branch other than "main"
   - `OWNER`: GitHub organization/user (currently set to "fanoo2")
   - `REPOS`: List of repository names to import
   - `TARGETS`: Mapping of repository names to their target directories in the monorepo

3. Run the migration script:
   ```bash
   ./migrate-to-monorepo.sh
   ```

### What the Migration Script Does

The script will:
- Import each specified repository as a git subtree (preserving history)
- Create the monorepo workspace structure (`apps/` and `packages/`)
- Set up pnpm workspaces configuration
- Configure Turborepo for efficient builds and caching
- Create TypeScript base configuration with path mappings
- Set up a shared package for common types
- Create GitHub Actions CI workflow
- Commit all changes and push to the current branch

### Repository Structure After Migration

```
fanno-platform/
├── apps/
│   ├── backend/          # Imported from fanoo2/backend
│   └── admin-console/    # Imported from fanoo2/frontend
├── packages/
│   ├── design-system/    # Imported from fanoo2/design-system
│   ├── webrtc-client/    # Imported from fanoo2/webrtc-client
│   ├── payments/         # Imported from fanoo2/payments
│   ├── moderation/       # Imported from fanoo2/moderation
│   └── shared/           # Common types and utilities
├── package.json          # Root workspace configuration
├── turbo.json            # Turborepo pipeline configuration
├── tsconfig.base.json    # Base TypeScript configuration
└── .github/workflows/ci.yml  # CI/CD pipeline
```

### Development Commands

After migration, you can use these commands:

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Build all packages and apps
pnpm build

# Run tests across all workspaces
pnpm test

# Lint all code
pnpm lint
```