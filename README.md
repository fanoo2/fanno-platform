# Fanno Platform

A comprehensive video communication and payment platform built with modern web technologies, providing real-time video/audio communication and integrated payment processing.

## 🏗️ Architecture

The Fanno Platform is organized as a monorepo with the following structure:

### Applications

- **Backend** (`apps/backend`): Express.js API server
  - LiveKit token generation for WebRTC rooms
  - Stripe payment session creation and webhook handling
  - Health monitoring endpoints
  - RESTful API for frontend communication

- **Admin** (`apps/admin`): React frontend application
  - WebRTC room management interface
  - Backend health monitoring
  - Payment integration UI
  - Administrative dashboard

### Packages

- **shared** (`packages/shared`): Common types and utilities
- **payments** (`packages/payments`): Stripe payment processing utilities
- **webrtc-client** (`packages/webrtc-client`): LiveKit client wrapper for room connections
- **design-system** (`packages/design-system`): Reusable React UI components
- **moderation** (`packages/moderation`): Content moderation features

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 9.0.0+

### Installation

```bash
# Install pnpm if not already installed
npm install -g pnpm@9.0.0

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development

```bash
# Start all applications in development mode
pnpm dev

# Start specific application
pnpm --filter @fanno/backend dev
pnpm --filter @fanno/admin dev
```

### Environment Configuration

Create `.env` files in the respective applications:

#### Backend (`apps/backend/.env`)
```env
PORT=5000
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
PUBLIC_WEB_URL=http://localhost:5173
OPENAI_API_KEY=sk-proj-your-openai-key
```

#### Admin (`apps/admin/.env`)
```env
VITE_API_BASE=http://localhost:5000
```

## 🔧 Development Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run linting (when configured)
pnpm lint

# Run tests (when configured)
pnpm test

# Start development servers
pnpm dev
```

## 📡 API Endpoints

### Backend API

- `GET /health` - Health check endpoint
- `POST /api/livekit/token` - Generate LiveKit access token
- `POST /payments/create-session` - Create Stripe checkout session
- `POST /payments/webhook` - Stripe webhook handler

### LiveKit Token Generation

```bash
curl -X POST http://localhost:5000/api/livekit/token \
  -H "Content-Type: application/json" \
  -d '{"identity": "user123", "roomName": "lobby"}'
```

### Payment Session Creation

```bash
curl -X POST http://localhost:5000/payments/create-session \
  -H "Content-Type: application/json"
```

## 🎥 WebRTC Features

The platform uses LiveKit for real-time communication:

- **Room Management**: Create and join video rooms
- **Token-based Authentication**: Secure access with JWT tokens
- **Multiple Participants**: Support for multi-user video calls
- **Screen Sharing**: Built-in screen sharing capabilities
- **Audio/Video Controls**: Mute, unmute, camera on/off

## 💳 Payment Integration

Stripe integration provides:

- **Checkout Sessions**: Secure payment processing
- **Webhook Handling**: Real-time payment status updates
- **Currency Support**: Multi-currency payment processing

## 🚢 Deployment

### Docker Deployment

Both applications include Dockerfiles for containerization:

```bash
# Build backend image
docker build -f apps/backend/Dockerfile -t fanno-backend .

# Build admin image  
docker build -f apps/admin/Dockerfile -t fanno-admin .
```

### Kubernetes Deployment

Helm charts are provided for Kubernetes deployment:

```bash
# Deploy backend
helm install fanno-backend infra/helm/backend

# Deploy admin
helm install fanno-admin infra/helm/admin
```

### GitHub Actions

The repository includes CI/CD workflows:

- **CI** (`.github/workflows/ci.yml`): Build and test on pull requests
- **Release** (`.github/workflows/release.yml`): Build and push Docker images on tags
- **Deploy** (`.github/workflows/deploy.yml`): Render Helm manifests for deployment

## 🔒 Security

### Environment Variables

Sensitive configuration is managed through environment variables. See `GITHUB_SECRETS.md` for required secrets in CI/CD.

### API Security

- LiveKit tokens with room-specific permissions
- Stripe webhook signature verification
- CORS configuration for cross-origin requests

## 🏃‍♂️ Performance

- **Monorepo Management**: Turborepo for optimized builds and caching
- **Package Management**: pnpm for efficient dependency resolution
- **Build Optimization**: TypeScript compilation with proper module resolution

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @fanno/backend test
```

## 📝 Contributing

1. Install dependencies: `pnpm install`
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes and test: `pnpm build && pnpm test`
4. Commit changes: `git commit -m "Add your feature"`
5. Push and create PR: `git push origin feature/your-feature`

## 🔧 Package Scripts

Each package includes standard scripts:

- `build`: Compile TypeScript to JavaScript
- `dev`: Start development server with hot reload
- `lint`: Run code linting (when configured)
- `test`: Run unit tests (when configured)

## 📂 Project Structure

```
fanno-platform/
├── apps/
│   ├── backend/           # Express.js API server
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── admin/             # React frontend
│       ├── src/
│       ├── Dockerfile  
│       └── package.json
├── packages/
│   ├── shared/            # Common utilities
│   ├── payments/          # Stripe integration
│   ├── webrtc-client/     # LiveKit wrapper
│   ├── design-system/     # UI components
│   └── moderation/        # Content moderation
├── infra/
│   └── helm/              # Kubernetes charts
├── .github/
│   └── workflows/         # CI/CD pipelines
├── package.json           # Root package configuration
├── turbo.json            # Turborepo configuration
└── pnpm-workspace.yaml   # Workspace configuration
```

## 📄 License

This project is private and proprietary to Fanno Platform.