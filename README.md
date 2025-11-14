# 🌱 Green Credits dApp (Moonbeam x Polkadot)

## Prerequisites

- Node.js: recommended LTS versions — Node 16.x or Node 20.x. Note: the upload proxy (w3up) recommends Node 18+ for native Blob support; Node 20 is a safe choice if you run both Hardhat and the upload proxy locally.
- npm (or pnpm/yarn) — commands below use npm.
- A browser wallet (MetaMask or Polkadot.js) for demo flows.
- Optional: NFT.Storage or Web3.Storage account if you will use classic API tokens instead of the w3up proxy.

## Overview
Green Credits dApp rewards individuals and organizations with GreenCreditTokens (GCT) for verified eco-friendly actions. Built on Moonbeam, it promotes environmental transparency and impact tracking and integrates proof storage via IPFS (Storacha / NFT.Storage) for auditability.

## Features

### Phase 1 (Deployed)
- Mint & transfer GCT tokens
- Submit verified eco-actions
- Transparent on-chain leaderboard
- Wallet connect (MetaMask/Polkadot.js)
- Live balance and reward dashboard
- V2 typed actions with methodology/baseline tracking
- **GCT Staking**: Stake GCT tokens in the verifier contract with approve+stake flow

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
- **IPFS Storage**: Storacha/Web3.Storage w3up (DID/UCAN) via secure proxy server or NFT.Storage as a simpler alternative

## Required environment variables

Root `.env` (Hardhat / deploy scripts)
- `PRIVATE_KEY` (required for deploying to Moonbase / testnets)
  - Example: `PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE`

Frontend `frontend/.env`
- `VITE_RPC` (required for demo on Moonbase): `https://rpc.api.moonbase.moonbeam.network`
- `VITE_TOKEN_ADDRESS` (set after deployment)
- `VITE_VERIFIER_ADDRESS` (set after deployment)
- `VITE_DONATION_POOL_ADDRESS` (optional)
- `VITE_UPLOAD_PROXY_URL` (optional) e.g. `http://localhost:8787/upload`
- `VITE_VERIFIER_HAS_PROOF` (true|false) — set `true` if your verifier contract accepts a proof CID

Server `server/.env`
- `PORT` (default `8787`)
- `W3UP_SPACE_DID` or `NFT_STORAGE_TOKEN` (one required for upload functionality)
- `W3UP_AGENT_FILE` or `W3UP_AGENT` (path or inline JSON) — required for w3up mode
- `CORS_ORIGINS` (comma-separated allowed origins)

> Note: Do not commit any `.env` files. Use `.env.example` for placeholders and add `.env` to `.gitignore`.

## Quick Start

### 🚀 Quick Start Script (Recommended)

```bash
# Clone and enter directory
git clone https://github.com/Liwei254/green-credits
cd green-credits

# Run quick start script
bash scripts/quick-start.sh
```

The script will install dependencies, compile contracts, and run tests. For deployment instructions, see **[DEPLOY.md](./DEPLOY.md)**.

### 🚀 Option A — One-command Local Development (if `run.sh` is present)

```bash
# Clone and enter directory
git clone https://github.com/Liwei254/green-credits
cd green-credits

# Install dependencies (root, frontend, server)
npm install
cd frontend && npm install && cd ..
cd server && npm install && cd ..

# Start everything (Hardhat node, deploy, upload proxy, frontend)
# Ensure run.sh is executable: chmod +x run.sh
./run.sh
```

The `run.sh` script will:
1. ✅ Start a local Hardhat node
2. ✅ Deploy contracts to `localhost`
3. ✅ Optionally seed demo data
4. ✅ Start the upload proxy server
5. ✅ Start the frontend dev server

Services will be available at:
- 🔗 Hardhat Node: `http://localhost:8545`
- 📦 Upload Server: `http://localhost:8787`
- 🌐 Frontend: `http://localhost:5173`

Press `Ctrl+C` to stop all services.

### 📋 Option B — Manual Setup Steps

If you prefer to run services individually, follow these steps.

#### 1. Install Dependencies
```bash
npm install
cd frontend && npm install && cd ..
cd server && npm install && cd ..
```

#### 2. Configure Environment Files
```bash
# Root .env (for Hardhat)
cp .env.example .env
# Edit and add your PRIVATE_KEY

# Frontend .env
cp frontend/.env.example frontend/.env
# Will be populated after contract deployment

# Server .env (for IPFS uploads)
cp server/.env.example server/.env
# Configure W3UP or NFT.Storage credentials
```

#### 3. Start Local Hardhat Node
```bash
npx hardhat node
# Leave running in terminal 1
```

#### 4. Deploy Contracts (in new terminal)
```bash
npx hardhat run scripts/deploy.js --network localhost
# Copy contract addresses to frontend/.env
```

#### 5. Seed Demo Data (optional)
```bash
TOKEN_ADDRESS=0x... VERIFIER_ADDRESS=0x... npx hardhat run scripts/seedDemo.js --network localhost
```

#### 6. Start Upload Server
```bash
cd server && npm start
# Leave running in terminal 2
```

#### 7. Start Frontend
```bash
cd frontend && npm run dev
# Leave running in terminal 3
```

## Smoke Test (Quick validation after starting services)

1. Visit `http://localhost:5173`.
2. Connect your wallet and ensure it is set to the local Hardhat network.
3. Submit a simple action (with or without proof depending on `VITE_VERIFIER_HAS_PROOF`).
4. As owner/verifier, call `verifyAction` on the action and confirm token minting.
5. Approve MockUSDC and call `donateTo()` in DonationPool; confirm DonationMade event and balances.
6. Test upload proxy: `curl -F "file=@path/to/img.jpg" http://localhost:8787/upload` should return `{ cid, url }`.

## Setup

### Moonbase Alpha Deployment
Deploy all phases in one command:

1. **Clone and Install**
   ```bash
   git clone https://github.com/Liwei254/green-credits
   cd green-credits
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Configure Environment**
   Create `.env` file in root directory:
   ```env
   PRIVATE_KEY=0xYourPrivateKeyHere

   # Optional: Phase 2 Configuration
   BUFFER_BPS=2000  # 20% buffer for removal credits
   BUFFER_VAULT=0xYourBufferVaultAddress  # Address to receive buffer funds
   CHALLENGE_WINDOW=172800  # 2 days challenge window (seconds)
   SUBMIT_STAKE_WEI=0  # Wei required to submit actions
   VERIFY_STAKE_WEI=0  # Wei required to verify actions
   CHALLENGE_STAKE_WEI=0  # Wei required to challenge actions

   # Optional: Phase 3 Governance
   TIMELOCK_MIN_DELAY=86400  # 1 day delay (0 = disabled)
   TIMELOCK_PROPOSERS=0xYourAddress,0xAnotherAddress  # Comma-separated
   TIMELOCK_EXECUTORS=0xYourAddress,0xAnotherAddress  # Comma-separated
   ```

3. **Deploy All Phases (optional .ts script example)**
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy_all.ts --network moonbase
   ```

4. **Configure Frontend**
   Copy contract addresses into `frontend/.env` (use deployed addresses):
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
   VITE_VERIFIER_HAS_PROOF=true
   ```

5. **Build and Run Frontend**
   ```bash
   cd frontend
   npm run build
   npm run dev
   ```

### Manual Phase-by-Phase Deployment

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

## Upload Proxy Server (Recommended)

See `server/README.md` for detailed instructions supporting both Storacha w3up (recommended) and the classic NFT.Storage API.

## Frontend

1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Configure environment: `cp .env.example .env` and populate contract addresses
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

### Phase 3 (Governance, Reputation & Quadratic Funding)

Phase 3 introduces deeper trust mechanisms, verifier accountability, quadratic funding for impact projects, and enhanced privacy features.

#### Deployment (Moonbase Alpha)
After Phase 1 and Phase 2 are deployed, configure Phase 3:

```bash
TOKEN=0xYourTokenAddress \
VERIFIER=0xYourVerifierAddress \
METHODOLOGY_REGISTRY=0xYourMethodologyAddress \
BASELINE_REGISTRY=0xYourBaselineAddress \
DONATION_POOL=0xYourDonationPoolAddress \
TIMELOCK_MIN_DELAY=86400 \
TIMELOCK_PROPOSERS=0xProposer1,0xProposer2 \
TIMELOCK_EXECUTORS=0xExecutor1,0xExecutor2 \
npx hardhat run scripts/deploy_phase3.ts --network moonbase
```

**Configuration Parameters:**
- `TIMELOCK_MIN_DELAY`: Seconds before timelock operations execute (e.g., 86400 = 1 day, 0 = disabled)
- `TIMELOCK_PROPOSERS`: Comma-separated addresses that can propose timelock operations
- `TIMELOCK_EXECUTORS`: Comma-separated addresses that can execute timelock operations (use 0x0 for anyone)

The script will:
- Deploy `VerifierBadgeSBT` (soulbound NFT badges with reputation tracking)
- Deploy `MatchingPoolQuadratic` (quadratic funding rounds)
- Optionally deploy `TimelockController` and transfer ownership of core contracts
- Print addresses to add to frontend `.env`

#### Key Features

**1. Verifier Reputation & Badges**
- Soulbound NFT badges (non-transferable) for verifiers
- On-chain reputation scores (can be positive or negative)
- Owner/Timelock can mint/revoke badges and adjust reputation
- Verifier address recorded for each verified action

**2. Quadratic Matching Pool**
- Create funding rounds with start/end times and matching budgets
- Projects register to receive donations
- Donors contribute GCT tokens to projects
- Admin calculates quadratic formula off-chain and submits match allocations
- Upon finalization, both direct donations and matches are distributed

**3. Privacy & Duplicate Detection**
- EXIF data automatically stripped from uploaded images (toggle available)
- Perceptual hash (dHash) computed client-side and included in metadata
- Helps detect duplicate submissions without storing PII

**4. Retirement UI**
- Select finalized actions to retire
- Specify custom grams CO2e per action
- Provide reason and beneficiary information
- Receive unique retirement serial on-chain

**5. Governance via Timelock**
- Optional TimelockController for safer config changes
- Ownership of key contracts can be transferred to timelock
- All admin operations subject to configurable delay
- Proposers can queue operations, executors can execute after delay

#### Usage Flows

**Mint Verifier Badges (Admin → Reputation)**
1. Navigate to Admin → Reputation
2. Enter verifier address, token ID, and level (1-10)
3. Mint badge (soulbound, non-transferable)
4. Adjust reputation scores as needed (increase/decrease)

**Create Quadratic Funding Round (Admin → Matching)**
1. Navigate to Matching page
2. Set start/end dates and matching budget
3. Create round
4. Activate round
5. Add projects with their beneficiary addresses

**Donate to Projects (User → Matching)**
1. Navigate to Matching page
2. Select active round and project
3. Approve and donate GCT tokens
4. Contributions recorded on-chain

**Finalize Round (Admin → Matching)**
1. Wait for round to end
2. Calculate quadratic formula off-chain
3. Submit project IDs and match allocations (comma-separated)
4. Contract disburses both direct donations and matching funds

**Retire Credits (User → Retirement)**
1. Navigate to Retirement page
2. Select finalized actions
3. Specify grams CO2e per action (or use defaults)
4. Provide reason and beneficiary
5. Submit retirement transaction
6. Receive unique serial number

**Attach Attestations (Verifier → Admin)**
1. After verifying an action, navigate to Admin
2. Enter action ID
3. Provide attestation UID (EAS, Sign Protocol, etc.)
4. Attach UID to link external attestations

## Governance & Calldata Example

Use `scripts/encodeCalldata.js` to generate calldata for multisig execution.

Example:
```bash
# Generate calldata for addVerifier
node scripts/encodeCalldata.js add-verifier 0xVerifierAddress
# Example output (hex): 0x3c...
# In Gnosis Safe UI: create tx, target = EcoActionVerifier address, value = 0, data = 0x3c...
```

See `docs/GOVERNANCE_EXECUTION.md` for full guidance and templates.

## Tests

Run Hardhat tests locally:
```bash
npx hardhat test
```

## Troubleshooting (top issues)
- **Node version warnings or errors**: Use Node 16 or Node 20. Run `nvm use 16` or `nvm use 20` if you use nvm.
- **Wallet shows wrong network**: Ensure MetaMask/network is set to the local Hardhat chain or Moonbase RPC. Use the wallet to switch networks.
- **Upload CORS errors**: Ensure `CORS_ORIGINS` in `server/.env` includes your frontend URL.
- **Missing artifacts or stale ABI**: Run `npx hardhat compile` and rebuild the frontend.
- **Tests failing on CI with Node version**: Ensure GitHub Actions uses Node 16 or 20 in the workflow.

> **Security note — DO NOT COMMIT SECRETS**
> - Never commit `.env` or agent-export.json files. Use `.env.example` only.
> - For CI deploys, store secrets in GitHub Secrets and never hardcode private keys in code.
> - Add the following to `.gitignore`:
>
> ```gitignore
> .env
> server/agent-export.json
> ```

## Scripts Reference
- `scripts/quick-start.sh` - Setup script: install deps, compile, test
- `run.sh` - One-command local development environment (if present)
- `blockchain/scripts/deploy.js` - Deploy core contracts
- `blockchain/scripts/deploy-moonbeam.ts` - **NEW**: Deploy to Moonbeam Alpha with artifact generation
- `blockchain/scripts/deploy-mock-usdc.js` - Deploy MockUSDC for testing
- `blockchain/scripts/seedDemo.js` - Populate contracts with demo data
- `blockchain/scripts/encodeCalldata.js` - Generate governance transaction calldata
- `blockchain/scripts/deploy_all.ts` - Deploy all phases at once (optional .ts variant)
- `blockchain/scripts/deploy_phase1.ts` - Deploy Phase 1 contracts (optional)
- `blockchain/scripts/deploy_phase2.ts` - Configure Phase 2 features (optional)
- `blockchain/scripts/deploy_phase3.ts` - Deploy Phase 3 governance (optional)

For detailed deployment instructions, see **[DEPLOY.md](./DEPLOY.md)**.

## Demo
- 🌐 [Live App](#) (Coming Soon)
- 🎥 [Demo Video](#) (Coming Soon)
- 📄 Network: Moonbase Alpha (ChainID 1287)

## License
MIT - See LICENSE file in repository root
