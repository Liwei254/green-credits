# 🌱 Green Credits dApp (Moonbeam x Polkadot)

## Overview
Green Credits dApp rewards individuals and organizations with GreenCreditTokens (GCT) for verified eco-friendly actions. Built on Moonbeam, it promotes environmental transparency and impact tracking in the Polkadot ecosystem.

## Features

### Phase 1 (Deployed)
- Mint & transfer GCT tokens
- Submit verified eco-actions
- Transparent on-chain leaderboard
- Wallet connect (MetaMask/Polkadot.js)
- Live balance and reward dashboard
- V2 typed actions with methodology/baseline tracking

### Phase 2 (Trust & Anti-Greenwashing)
- **Challenge Window**: Delayed minting with configurable challenge period
- **Stakes & Slashing**: Configurable stake requirements for submit/verify/challenge operations
- **Durability Buffer**: Automatic buffer allocation for removal credits (e.g., 20% to buffer vault)
- **Oracle Reports**: Attach IPFS CIDs with audit data (NDVI, LCA, etc.) to actions
- **Retirement Ledger**: Track credit retirements with unique serials and beneficiaries

## Tech Stack
- Solidity (Smart Contracts)
- Moonbeam (EVM-compatible parachain)
- React + TypeScript + Tailwind CSS
- Ethers.js + Polkadot.js
- Hardhat (deployment)
- **IPFS Storage**: Storacha/Web3.Storage w3up (DID/UCAN) via secure proxy server

## Setup

### 1. Smart Contract Deployment

#### Phase 1 Deployment (Moonbase Alpha)
1. Clone repo: `git clone https://github.com/Liwei254/green-credits`
2. Install deps: `npm install`
3. Compile: `npx hardhat compile`
4. Create `.env` with your `PRIVATE_KEY`
5. Deploy Phase 1 contracts:
   ```bash
   npx hardhat run scripts/deploy_phase1.ts --network moonbase
   ```
6. Note the contract addresses printed

#### Phase 2 Configuration (Moonbase Alpha)
After Phase 1 deployment, configure Phase 2 features:

```bash
TOKEN=0xYourTokenAddress \
VERIFIER=0xYourVerifierAddress \
BUFFER_BPS=2000 \
BUFFER_VAULT=0xYourBufferVaultAddress \
CHALLENGE_WINDOW=$((2*24*60*60)) \
SUBMIT_STAKE_WEI=0 \
VERIFY_STAKE_WEI=0 \
CHALLENGE_STAKE_WEI=0 \
npx hardhat run scripts/deploy_phase2.ts --network moonbase
```

**Configuration Parameters:**
- `BUFFER_BPS`: Basis points for buffer (2000 = 20%), max 10000
- `BUFFER_VAULT`: Address to receive buffer allocations for removal credits
- `CHALLENGE_WINDOW`: Seconds before finalization allowed (e.g., 172800 = 2 days)
- `SUBMIT_STAKE_WEI`: Wei required in stake balance to submit actions (0 = no requirement)
- `VERIFY_STAKE_WEI`: Wei required to verify actions (0 = no requirement)
- `CHALLENGE_STAKE_WEI`: Wei required to challenge actions (0 = no requirement)

The script will:
- Deploy `RetirementRegistry` contract
- Configure `EcoActionVerifier` with Phase 2 parameters
- Print addresses to add to frontend `.env`

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
   - Set contract addresses from deployment outputs
   - Set `VITE_VERIFIER_V2=true` to enable Phase 2 features
   - Set `VITE_RETIREMENT_REGISTRY_ADDRESS` (from Phase 2 deployment)
   - Set `VITE_UPLOAD_PROXY_URL=http://localhost:8787/upload` (if using proxy)
4. Start dev server: `npm run dev`

## Phase 2 Usage Flows

### Trust & Anti-Greenwashing Workflow

#### Setup (Admin/Owner):
1. **Configure Phase 2**: Set challenge window, buffer %, and stake requirements via `deploy_phase2.ts`
2. **Add Oracles**: Use contract owner account to call `addOracle(address)` for trusted auditors
3. **Fund Buffer Vault**: Ensure buffer vault address can receive tokens

#### Submit & Verify:
1. **Deposit Stakes** (if required): Users and verifiers deposit DEV via `depositStake()`
2. **Submit Action V2**: User submits with full methodology/baseline/quantity data
3. **Verify Action**: Verifier reviews and calls `verifyAction(actionId, reward)`
   - With `instantMint=false`, action status becomes `Verified` (no immediate mint)
   - `rewardPending` is recorded for later minting

#### Challenge & Resolve:
4. **Challenge Window Opens**: After verification, others can challenge within the configured window
5. **Submit Challenge**: Challenger provides evidence CID via `challengeAction(actionId, evidenceCid)`
6. **Owner Resolves**: Owner reviews and calls `resolveChallenge(actionId, idx, upheld, loserSlashTo)`
   - If **upheld**: action will be rejected at finalization (no mint)
   - If **dismissed**: action proceeds normally

#### Finalize:
7. **Finalize Action**: After challenge window expires (and no unresolved challenges), anyone calls `finalizeAction(actionId)`
   - For **Removal** credits: mints `(100 - bufferBps)%` to user, `bufferBps%` to buffer vault
   - For **Reduction/Avoidance** credits: mints full reward to user
   - Action status becomes `Finalized`

#### Oracle Audit:
8. **Attach Reports**: Oracles attach IPFS CIDs with audit data (NDVI, LCA) via `attachOracleReport(actionId, cid)`
9. **View Reports**: Anyone can query `getOracleReports(actionId)` to review attached audits

#### Retirement:
10. **Retire Credits**: Users call `RetirementRegistry.retire(actionIds[], grams[], reason, beneficiary)`
    - Returns unique serial for the retirement
    - Tracks retired credits by account

## Testing (Moonbase)

Run Hardhat tests locally:
```bash
npm test
```

Tests cover:
- Phase 1: Basic submit/verify with V2 fields
- Phase 2: Configuration, stakes, delayed minting, challenges, buffer allocation, oracle reports, retirements

## Demo
- 🌐 [Live App](#) (Coming Soon)
- 🎥 [Demo Video](#) (Coming Soon)
- 📄 Network: Moonbase Alpha (ChainID 1287)
