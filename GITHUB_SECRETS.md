# GitHub Actions Secrets Configuration

This document lists the required GitHub Actions secrets that need to be configured in the repository settings for the platform to function properly.

## Required Secrets

### LiveKit Configuration
- **LIVEKIT_URL**: `wss://fanno-1s7jndnl.livekit.cloud/`
- **LIVEKIT_API_KEY**: `APIjCjk8gybWtYv`
- **LIVEKIT_API_SECRET**: `5WXXakL3GvYAW0mNXBqDW8YwQX6hoJYrVotShmh9o7J`

### Stripe Configuration
- **STRIPE_PUBLISHABLE_KEY**: `pk_live_51QtdXvLZLs8GOs1hdkny7f4aGUuq08TL4tD7J8Zwa5fEcZjG5IMg7QFnnjPlajrSwkcqSC8Slz2LZ2IKrEHz0i3S00aPVDFZ43`
- **STRIPE_SECRET_KEY**: `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`
- **STRIPE_WEBHOOK_SECRET**: `whsec_qHGN9NbCIgTm2tLvzEdrLsdvRTSVN31z`

### Application Configuration
- **PUBLIC_WEB_URL**: (To be set based on deployment environment)

### OpenAI Configuration
- **OPENAI_API_KEY**: `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`

## How to Add Secrets

1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each secret with the exact name and value listed above

## Workflows That Use These Secrets

- CI/CD pipelines may reference these secrets for deployment and testing
- The release workflow builds and pushes Docker images
- The Helm deployment workflow renders manifests for deployment

## Security Note

These secrets contain sensitive production credentials and should be handled with care. Ensure they are only accessible to authorized personnel and workflows.