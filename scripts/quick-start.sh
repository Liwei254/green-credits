#!/bin/bash
# Quick Start Script for Green Credits Development

set -e

echo "🚀 Green Credits - Quick Start"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the repository root"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

echo ""
echo "🔨 Compiling smart contracts..."
npm run blockchain:compile

echo ""
echo "🧪 Running tests..."
npm run blockchain:test

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "  For local development:"
echo "  1. Terminal 1: npm run blockchain:node"
echo "  2. Terminal 2: cd blockchain && npx hardhat run scripts/deploy-moonbeam.ts --network localhost"
echo "  3. Terminal 3: npm run frontend:dev"
echo ""
echo "  For production deployment to Moonbeam Alpha:"
echo "  1. Create .env file with DEPLOYER_PRIVATE_KEY and MOONBEAM_ALPHA_RPC"
echo "  2. Get DEV tokens from https://faucet.moonbeam.network/"
echo "  3. Run: cd blockchain && npx hardhat run scripts/deploy-moonbeam.ts --network moonbeamAlpha"
echo ""
echo "  For Docker Compose:"
echo "  docker-compose up -d"
echo ""
echo "📖 See DEPLOY.md for detailed instructions"
