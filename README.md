# 🌱 Green Credits dApp (Moonbeam x Polkadot)

## Table of Contents
- [Project Overview and Objectives](#project-overview-and-objectives)
- [Prerequisites](#prerequisites)
- [Dependencies and Technologies](#dependencies-and-technologies)
- [Setup Instructions](#setup-instructions)
- [Usage Instructions](#usage-instructions)
- [Upload Proxy Server](#upload-proxy-server)
- [Manual Testing](#manual-testing)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)
- [CI/CD Pipeline](#cicd-pipeline)
- [Demo](#demo)
- [License](#license)

## Project Overview and Objectives
Green Credits is a decentralized application (dApp) that rewards individuals and organizations with GreenCreditTokens (GCT) for verified eco-friendly actions. Built on Moonbeam—a Polkadot ecosystem parachain—it promotes environmental transparency and impact tracking. The platform integrates proof storage via IPFS (using Storacha or NFT.Storage) for auditability and encourages trust through multi-phase features that include staking, governance, and quadratic funding. The objective is to incentivize sustainable actions and foster a transparent carbon credit ecosystem.

## Prerequisites
- **Node.js**: Recommended LTS versions — Node 20.x or Node 22.x.
- **Package Manager**: npm (commands below use npm; yarn or pnpm can be used as well).
- **Browser Wallet**: MetaMask or Polkadot.js for interacting with the dApp.
- **Accounts**: Optional NFT.Storage or Web3.Storage account if using classic API tokens instead of the w3up proxy.

## Dependencies and Technologies
- **Blockchain**: Solidity smart contracts, deployed on Moonbeam (an EVM-compatible parachain).
- **Frontend**: React with TypeScript and Tailwind CSS.
- **Libraries**: ethers.js for Ethereum interaction, Polkadot.js for wallet integration.
- **Development Tools**: Hardhat for contract compilation, testing, and deployment.
- **IPFS Storage**: Uses NFT.Storage API via a secure proxy server for uploading proofs.
- **Backend**: Node.js API server for upload proxy and other backend functions.
- **Docker**: For local development and containerized deployments.

## Setup Instructions

### Quick Start

#### 🚀 Option A — One-command Local Development

```bash
git clone https://github.com/Liwei254/green-credits
cd green-credits
npm install
cd frontend && npm install && cd ..
cd server && npm install && cd ..
chmod +x run.sh
./run.sh
```

This will start:
- Local Hardhat blockchain node
- Deploy contracts locally
- Optionally seed demo data
- Start the upload proxy server
- Start the frontend dev server

Services will be available at:
- Hardhat Node: `http://localhost:8545`
- Upload Proxy Server: `http://localhost:8787`
- Frontend: `http://localhost:5173`

#### 📋 Option B — Manual Setup

1. Install dependencies in root, frontend, and server directories:

```bash
npm install
cd frontend && npm install && cd ..
cd server && npm install && cd ..
```

2. Configure environment variables:

- Root `.env` for Hardhat/deploy scripts (copy `.env.example` and update):

```env
PRIVATE_KEY=0xYourPrivateKey
```

- Frontend `.env` (copy `frontend/.env.example` and update deployed contract addresses)

- Server `.env` (copy `server/.env.example` and configure IPFS upload credentials)

3. Run services individually:

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
cd server && npm start
cd frontend && npm run dev
```

## Usage Instructions

- Connect your wallet (MetaMask/Polkadot.js) to the local or Moonbeam network.
- Mint and transfer GreenCreditTokens (GCT).
- Submit verified eco-actions with proof attached.
- View transparent on-chain leaderboards and balance dashboards.
- Stake and verify actions based on your role.
- Participate in governance and quadratic funding (phases 2 and 3).
- Retire carbon credit tokens and view attestations.

## Upload Proxy Server
Green Credits uses a backend upload proxy server to securely upload proof files to IPFS, preventing exposure of sensitive keys in the frontend.

Two options are available: the modern Storacha w3up proxy (recommended) and the classic NFT.Storage proxy. See [server/README.md](server/README.md) for full setup and usage instructions.

## Manual Testing
For thorough manual testing instructions including smart contracts, backend API, frontend integration, Docker deployment, and Moonbeam Alpha deployment, refer to [MANUAL_TEST_GUIDE.md](MANUAL_TEST_GUIDE.md).

## Deployment Guide
Detailed step-by-step deployment instructions for production are available in [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md). It covers environment setup, contract deployment and verification, frontend build and hosting, and post-deployment checks.

## Troubleshooting
- Ensure Node.js version compatibility (Node 20.x or 22.x recommended).
- Wallet network mismatches can cause errors; switch networks appropriately.
- Check environment variables if uploads or connections fail.
- For build or deployment errors, verify dependencies and network configuration.
- Refer to Hardhat, ethers.js, and Moonbeam docs for platform-specific guidance.

## CI/CD Pipeline

- **Frontend Deployment**: GitHub Actions build and deploy frontend to GitHub Pages with custom domain.
- **Backend Deployment**: Builds Docker images, pushes to container registry, triggers Render deployment.
- **Blockchain Deployment**: Compiles, tests, and deploys contracts to Moonbeam Alpha on push to main branch.

## Demo
- 🌐 Live App: [Coming Soon]
- 🎥 Demo Video: [Coming Soon]
- Network: Moonbeam Alpha (ChainID 1287)

## License
MIT - See [LICENSE](LICENSE) file in repository root.
