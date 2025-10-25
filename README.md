# 🌱 Green Credits dApp (Moonbeam x Polkadot)

## Overview
Green Credits dApp rewards individuals and organizations with GreenCreditTokens (GCT) for verified eco-friendly actions. Built on Moonbeam, it promotes environmental transparency and impact tracking in the Polkadot ecosystem.

## Features
- Mint & transfer GCT tokens
- Submit verified eco-actions
- Transparent on-chain leaderboard
- Wallet connect (MetaMask/Polkadot.js)
- Live balance and reward dashboard

## Tech Stack
- Solidity (Smart Contracts)
- Moonbeam (EVM-compatible parachain)
- React + TypeScript + Tailwind CSS
- Ethers.js + Polkadot.js
- Hardhat (deployment)
- **IPFS Storage**: Storacha/Web3.Storage w3up (DID/UCAN) via secure proxy server

## Setup

### 1. Smart Contract Deployment
1. Clone repo: `git clone https://github.com/yourname/green-credits-dapp`
2. Install deps: `npm install`
3. Compile: `npx hardhat compile`
4. Deploy contract: `npx hardhat run scripts/deploy.js --network moonbase`

### 2. Upload Proxy Server (Recommended)
For secure IPFS uploads using Storacha/Web3.Storage with DID/UCAN:

1. Navigate to server: `cd server`
2. Install dependencies: `npm install`
3. Configure environment: `cp .env.example .env` (see [server/README.md](server/README.md) for details)
4. Start the proxy: `npm start`

See **[server/README.md](server/README.md)** for complete setup instructions including how to export your Storacha agent credentials.

### 3. Frontend
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Configure environment: `cp .env.example .env`
   - Set contract addresses from deployment
   - Set `VITE_UPLOAD_PROXY_URL=http://localhost:8787/upload` (if using proxy)
4. Start dev server: `npm run dev`

## Demo (Pending)
- 🌐 [Live App](#)
- 🎥 [Demo Video](#)
