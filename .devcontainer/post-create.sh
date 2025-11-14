#!/bin/bash
set -e

echo "🚀 Setting up Green Credits development environment..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm ci

# Install blockchain dependencies
echo "📦 Installing blockchain dependencies..."
cd blockchain && npm ci && cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm ci && cd ..

# Install server dependencies (if exists)
if [ -d "server" ]; then
  echo "📦 Installing server dependencies..."
  cd server && npm ci && cd ..
fi

echo "✅ Development environment setup complete!"
echo ""
echo "📋 Quick start commands:"
echo "  npm run blockchain:compile   - Compile smart contracts"
echo "  npm run blockchain:test      - Run contract tests"
echo "  npm run blockchain:node      - Start local Hardhat node"
echo "  npm run frontend:dev         - Start frontend dev server"
echo "  npm run server:start         - Start upload proxy server"
echo ""
echo "🔗 Useful URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Hardhat node: http://localhost:8545"
echo "  Upload proxy: http://localhost:8787"
