#!/bin/bash

###############################################################################
# Green Credits - Local Development Launcher
# 
# This script orchestrates a complete local development environment:
# 1. Starts a local Hardhat node
# 2. Deploys contracts to localhost
# 3. Starts the upload proxy server
# 4. Starts the frontend dev server
#
# Prerequisites:
# - Node.js 16+ installed
# - All dependencies installed (npm install in root, frontend/, server/)
# - .env files configured (see .env.example in root, frontend/.env.example, server/.env.example)
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Check if running from project root
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check dependencies
print_step "Step 1: Checking Dependencies"

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

print_info "Node version: $(node --version)"
print_info "NPM version: $(npm --version)"

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    print_warning "Root dependencies not installed. Running npm install..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    print_warning "Frontend dependencies not installed. Running npm install..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "server/node_modules" ]; then
    print_warning "Server dependencies not installed. Running npm install..."
    cd server && npm install && cd ..
fi

print_success "All dependencies installed"

# Check environment files
print_step "Step 2: Checking Environment Configuration"

if [ ! -f ".env" ]; then
    print_warning ".env file not found in root. Please copy .env.example to .env and configure it."
    cp .env.example .env
    print_info "Created .env from .env.example. Please edit it with your settings."
fi

if [ ! -f "frontend/.env" ]; then
    print_warning "frontend/.env not found. You'll need to configure it after deployment."
    print_info "See frontend/.env.example for required variables."
fi

if [ ! -f "server/.env" ]; then
    print_warning "server/.env not found. Upload server may not work without it."
    print_info "See server/.env.example and server/README.md for setup instructions."
fi

print_success "Environment files checked"

# Create log directory
mkdir -p logs

# Function to cleanup on exit
cleanup() {
    print_step "Shutting Down Services"
    print_info "Stopping all services..."
    
    # Kill all background processes started by this script
    if [ ! -z "$HARDHAT_PID" ]; then
        kill $HARDHAT_PID 2>/dev/null || true
    fi
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Also kill by port if needed
    pkill -f "hardhat node" 2>/dev/null || true
    pkill -f "node.*server" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    print_success "All services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Hardhat Node
print_step "Step 3: Starting Hardhat Local Node"

print_info "Starting local blockchain on http://localhost:8545..."
npx hardhat node > logs/hardhat-node.log 2>&1 &
HARDHAT_PID=$!

# Wait for node to be ready
print_info "Waiting for Hardhat node to initialize..."
sleep 5

if ! curl -s http://localhost:8545 > /dev/null 2>&1; then
    print_error "Hardhat node failed to start. Check logs/hardhat-node.log"
    cleanup
    exit 1
fi

print_success "Hardhat node running (PID: $HARDHAT_PID)"
print_info "Logs: logs/hardhat-node.log"

# Deploy contracts to localhost
print_step "Step 4: Deploying Contracts to Localhost"

print_info "Compiling contracts..."
npx hardhat compile

print_info "Deploying contracts to localhost..."
npx hardhat run scripts/deploy.js --network localhost > logs/deploy.log 2>&1

if [ $? -ne 0 ]; then
    print_error "Contract deployment failed. Check logs/deploy.log"
    cat logs/deploy.log
    cleanup
    exit 1
fi

print_success "Contracts deployed successfully"
print_info "Contract addresses logged to logs/deploy.log"
cat logs/deploy.log

print_warning "📝 Remember to copy contract addresses to frontend/.env:"
grep "✅" logs/deploy.log | grep -E "0x[a-fA-F0-9]+" || true

# Optional: Seed demo data
print_step "Step 5: Seeding Demo Data (Optional)"

if [ -f "scripts/seedDemo.js" ]; then
    read -p "Do you want to seed demo data? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Seeding demo data..."
        npx hardhat run scripts/seedDemo.js --network localhost
        print_success "Demo data seeded"
    else
        print_info "Skipping demo data seeding"
    fi
else
    print_info "Demo seed script not found, skipping"
fi

# Start Upload Server
print_step "Step 6: Starting Upload Proxy Server"

if [ -f "server/.env" ]; then
    print_info "Starting upload server on http://localhost:8787..."
    cd server && npm start > ../logs/upload-server.log 2>&1 &
    SERVER_PID=$!
    cd ..
    
    sleep 2
    
    if ps -p $SERVER_PID > /dev/null; then
        print_success "Upload server running (PID: $SERVER_PID)"
        print_info "Logs: logs/upload-server.log"
    else
        print_warning "Upload server failed to start. Check logs/upload-server.log"
        print_info "Continuing without upload server..."
    fi
else
    print_warning "server/.env not found. Skipping upload server."
    print_info "To enable uploads, configure server/.env (see server/README.md)"
fi

# Start Frontend Dev Server
print_step "Step 7: Starting Frontend Dev Server"

if [ -f "frontend/.env" ]; then
    print_info "Starting frontend on http://localhost:5173..."
    cd frontend && npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    sleep 3
    
    if ps -p $FRONTEND_PID > /dev/null; then
        print_success "Frontend dev server running (PID: $FRONTEND_PID)"
        print_info "Logs: logs/frontend.log"
    else
        print_error "Frontend failed to start. Check logs/frontend.log"
        cleanup
        exit 1
    fi
else
    print_error "frontend/.env not found. Cannot start frontend."
    print_info "Create frontend/.env with contract addresses from logs/deploy.log"
    cleanup
    exit 1
fi

# Summary
print_step "🎉 Green Credits Development Environment Ready!"

echo -e "${GREEN}All services are running:${NC}"
echo -e "  🔗 Hardhat Node:      http://localhost:8545"
echo -e "  📦 Upload Server:     http://localhost:8787"
echo -e "  🌐 Frontend:          http://localhost:5173"
echo ""
echo -e "${YELLOW}Logs are available in:${NC}"
echo -e "  📝 Hardhat:   logs/hardhat-node.log"
echo -e "  📝 Contracts: logs/deploy.log"
echo -e "  📝 Server:    logs/upload-server.log"
echo -e "  📝 Frontend:  logs/frontend.log"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running and show logs
tail -f logs/frontend.log
