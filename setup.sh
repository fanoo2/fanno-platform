#!/bin/bash

# Fanno Platform Development Setup
echo "🚀 Setting up Fanno Platform for development..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@9.0.0
fi

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install

# Copy environment files if they don't exist
if [ ! -f "apps/backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp apps/backend/.env.example apps/backend/.env
    echo "⚠️  Please edit apps/backend/.env with your actual API keys"
fi

if [ ! -f "apps/admin/.env" ]; then
    echo "📝 Creating admin .env file..."
    cp apps/admin/.env.example apps/admin/.env
fi

# Build packages
echo "🔨 Building packages..."
pnpm build

# Run tests
echo "🧪 Running tests..."
pnpm test

echo ""
echo "✅ Setup complete!"
echo ""
echo "🏃‍♂️ Next steps:"
echo "1. Edit apps/backend/.env with your API keys"
echo "2. Run 'pnpm dev' to start development servers"
echo "3. Open http://localhost:5173 for the admin interface"
echo "4. Backend API will be available at http://localhost:5000"
echo ""
echo "📚 Available commands:"
echo "  pnpm dev       - Start development servers"
echo "  pnpm build     - Build all packages"
echo "  pnpm test      - Run tests"
echo "  pnpm lint      - Run code linting"
echo "  pnpm format    - Format code with Prettier"