# Green Credits Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Green Credits application to production. The application consists of Solidity smart contracts and a React frontend.

## Prerequisites

### System Requirements
- Node.js 18.x or 20.x
- npm or yarn
- Git
- A wallet with sufficient funds for deployment (Moonbeam mainnet)

### Environment Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd green-credits
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install && cd ..
```

## Contract Deployment

### 1. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Mainnet Deployment (Moonbeam)
PRIVATE_KEY=your_private_key_without_0x_prefix

# Contract Configuration
BUFFER_BPS=2000
BUFFER_VAULT=0x0000000000000000000000000000000000000000
CHALLENGE_WINDOW=172800
SUBMIT_STAKE_WEI=1000000000000000000
VERIFY_STAKE_WEI=5000000000000000000
CHALLENGE_STAKE_WEI=10000000000000000000

# Timelock Configuration (Optional)
TIMELOCK_MIN_DELAY=86400
TIMELOCK_PROPOSERS=0x1234...,0x5678...
TIMELOCK_EXECUTORS=0x9abc...,0xdef0...
```

### 2. Deploy Contracts
Run the mainnet deployment script:

```bash
npx hardhat run scripts/deploy_mainnet.ts --network moonbeam
```

This will deploy all contracts in sequence:
- GreenCreditToken
- EcoActionVerifier
- DonationPool
- MethodologyRegistry
- BaselineRegistry
- RetirementRegistry
- VerifierBadgeSBT
- MatchingPoolQuadratic
- TimelockController (if configured)

### 3. Verify Contracts
After deployment, verify contracts on Moonscan:

```bash
npx hardhat verify --network moonbeam <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Example verification commands will be provided in the deployment output.

## Frontend Deployment

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. Environment Configuration
Create a `.env` file in the `frontend` directory:

```env
VITE_TOKEN_ADDRESS=0x...
VITE_VERIFIER_ADDRESS=0x...
VITE_DONATION_POOL_ADDRESS=0x...
VITE_METHODOLOGY_REGISTRY_ADDRESS=0x...
VITE_BASELINE_REGISTRY_ADDRESS=0x...
VITE_RETIREMENT_REGISTRY_ADDRESS=0x...
VITE_VERIFIER_BADGE_SBT_ADDRESS=0x...
VITE_MATCHING_POOL_ADDRESS=0x...
VITE_TIMELOCK_CONTROLLER_ADDRESS=0x...
VITE_USDC_ADDRESS=0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b
```

### 3. Deploy to Hosting
Deploy the `frontend/dist` directory to your hosting provider:

#### Option A: Vercel
```bash
npm install -g vercel
cd frontend
vercel --prod
```

#### Option B: Netlify
```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod --dir=dist
```

#### Option C: Manual Upload
Upload the contents of `frontend/dist` to your web server.

## Post-Deployment Checklist

### Contract Verification
- [ ] All contracts deployed successfully
- [ ] Contract addresses saved
- [ ] Contracts verified on Moonscan
- [ ] Ownership transferred to TimelockController (if configured)

### Frontend Verification
- [ ] Frontend builds without errors
- [ ] Environment variables configured correctly
- [ ] Frontend deployed to production URL
- [ ] Wallet connection works
- [ ] Contract interactions function properly

### Testing
- [ ] Submit eco-action
- [ ] Verify action (admin only)
- [ ] Stake management functions
- [ ] Donation pool interactions
- [ ] Retirement registry functions

### Security
- [ ] Private keys secured
- [ ] Environment variables not committed to git
- [ ] Contract ownership properly configured
- [ ] Multi-sig setup for admin functions (recommended)

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Ensure all dependencies are installed
   - Check Node.js version compatibility
   - Verify environment variables are set

2. **Contract Deployment Issues**
   - Verify sufficient funds in deployment wallet
   - Check network connectivity
   - Confirm correct network configuration

3. **Frontend Issues**
   - Verify contract addresses are correct
   - Check browser console for errors
   - Ensure wallet is connected to correct network

### Support
For issues not covered here, check:
- Hardhat documentation
- Ethers.js documentation
- Moonbeam network documentation
- Project issue tracker

## Maintenance

### Regular Tasks
- Monitor contract events
- Update frontend for new features
- Backup deployment artifacts
- Monitor gas costs and optimize if needed

### Upgrades
- Use TimelockController for governance upgrades
- Test upgrades on testnet first
- Follow upgrade safety procedures
- Notify users of significant changes
