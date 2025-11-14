# Deployment Guide - Green Credits to Moonbeam Alpha

This guide covers deploying the Green Credits smart contracts to Moonbeam Alpha testnet (chainId 1287) and configuring the frontend for GitHub Pages with custom domain.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Smart Contract Deployment](#smart-contract-deployment)
- [Frontend Configuration](#frontend-configuration)
- [GitHub Pages Setup](#github-pages-setup)
- [DNS Configuration](#dns-configuration)
- [Local Testing](#local-testing)

## Prerequisites

Before deploying, ensure you have:

1. **Node.js 18+** installed
2. **A wallet with DEV tokens** on Moonbeam Alpha testnet
   - Get DEV tokens from: https://faucet.moonbeam.network/
3. **Your private key** (never commit this!)
4. **RPC endpoint** (default: https://rpc.api.moonbase.moonbeam.network)

## Smart Contract Deployment

### Step 1: Configure Environment

Create or update `.env` file in the root directory:

```bash
# Required for deployment
DEPLOYER_PRIVATE_KEY=your_private_key_here
MOONBEAM_ALPHA_RPC=https://rpc.api.moonbase.moonbeam.network

# Optional
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

⚠️ **Security**: Never commit your `.env` file or private keys to git!

### Step 2: Install Dependencies

```bash
# From project root
npm ci
```

### Step 3: Compile Contracts

```bash
npm run blockchain:compile
```

### Step 4: Deploy to Moonbeam Alpha

```bash
# From blockchain directory
cd blockchain
npx hardhat run scripts/deploy-moonbeam.ts --network moonbeamAlpha
```

Or from root:
```bash
npm run blockchain:deploy:moonbase
```

### Step 5: Save Deployment Addresses

The deployment script will:
1. Deploy GreenCreditToken (GCT)
2. Deploy EcoActionVerifier
3. Deploy DonationPool
4. Transfer GCT ownership to verifier
5. Write deployment artifact to `deployments/moonbeam.json`
6. Print all contract addresses

**Important**: Copy the printed addresses - you'll need them for frontend configuration!

Example output:
```
✅ GreenCreditToken deployed at: 0xABC...123
✅ EcoActionVerifier deployed at: 0xDEF...456
✅ DonationPool deployed at: 0x789...XYZ
```

## Frontend Configuration

### Step 1: Update Frontend Environment

Create or update `frontend/.env`:

```bash
# Network Configuration
VITE_CHAIN_ID=1287

# Contract Addresses (from deployment output)
VITE_TOKEN_ADDRESS=0xYourGreenCreditTokenAddress
VITE_GCT_ADDRESS=0xYourGreenCreditTokenAddress
VITE_VERIFIER_ADDRESS=0xYourEcoActionVerifierAddress
VITE_DONATION_POOL_ADDRESS=0xYourDonationPoolAddress

# Feature Flags
VITE_VERIFIER_HAS_PROOF=true
VITE_VERIFIER_V2=true

# Upload Configuration (optional)
VITE_UPLOAD_PROXY_URL=http://localhost:8787/upload
```

### Step 2: Build Frontend

```bash
# From project root
npm run frontend:build
```

The build output will be in `frontend/dist/`

### Step 3: Test Locally

```bash
npm run frontend:preview
```

Visit http://localhost:4173 to test the built frontend locally.

## GitHub Pages Setup

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. The CI/CD workflow will automatically deploy on push to `main`

### Step 2: Set Environment Variables (Optional)

If you want to deploy contracts from CI/CD:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add repository secrets:
   - `DEPLOYER_PRIVATE_KEY`: Your wallet private key (testnet only!)

### Step 3: Verify Deployment

After pushing to `main`:
1. Check the **Actions** tab for workflow status
2. Once complete, your site will be available at:
   - https://[username].github.io/green-credits/
   - https://green-credit.xyz (after DNS setup)

## DNS Configuration

To use the custom domain `green-credit.xyz`:

### Step 1: Configure DNS Provider

Add these DNS records at your domain registrar:

**For Apex Domain (green-credit.xyz):**
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

**For www subdomain (optional):**
```
Type: CNAME
Name: www
Value: [username].github.io
```

### Step 2: Verify CNAME File

The file `frontend/public/CNAME` should contain:
```
green-credit.xyz
```

This file is automatically included in the build and tells GitHub Pages which custom domain to use.

### Step 3: Enable HTTPS

After DNS propagation (may take 24-48 hours):
1. Go to **Settings** → **Pages**
2. Check **Enforce HTTPS**

## Local Testing

### Test with Local Hardhat Node

#### Terminal 1 - Start Hardhat Node
```bash
npm run blockchain:node
```

#### Terminal 2 - Deploy Contracts
```bash
cd blockchain
npx hardhat run scripts/deploy-moonbeam.ts --network localhost
```

#### Terminal 3 - Start Frontend
```bash
npm run frontend:dev
```

Visit http://localhost:5173

### Test with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:5173
- Hardhat node: http://localhost:8545
- Upload proxy: http://localhost:8787

## Verification

### Verify Contracts on Moonscan

```bash
cd blockchain
npx hardhat verify --network moonbeamAlpha <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Example:
```bash
npx hardhat verify --network moonbeamAlpha 0xABC...123 "0xUSDC_ADDRESS" "0xGCT_ADDRESS"
```

## Troubleshooting

### Deployment Fails

1. **Insufficient funds**: Get more DEV from faucet
2. **Nonce too high**: Wait a few seconds and retry
3. **Gas estimation failed**: Increase gas limit in hardhat.config.cjs

### Frontend Issues

1. **Wrong network**: Check MetaMask is on Moonbase Alpha (chainId 1287)
2. **Contract not found**: Verify addresses in frontend/.env
3. **Tx fails**: Check contract ownership and approvals

### GitHub Pages Not Updating

1. Check Actions tab for build errors
2. Verify `frontend/public/CNAME` exists
3. Clear browser cache
4. Check DNS propagation: https://dnschecker.org/

## Support

- **Moonbeam Docs**: https://docs.moonbeam.network/
- **Hardhat Docs**: https://hardhat.org/docs
- **GitHub Pages**: https://docs.github.com/en/pages

## Security Notes

- ⚠️ Never commit private keys
- ✅ Use `.env` for sensitive data
- ✅ Use testnet for development
- ✅ Audit contracts before mainnet deployment
- ✅ Use hardware wallets for production deployments
