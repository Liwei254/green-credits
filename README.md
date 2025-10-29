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
   - Set contract addresses from deployment outputs:
     - `VITE_TOKEN_ADDRESS`
     - `VITE_VERIFIER_ADDRESS`
     - `VITE_METHODOLOGY_REGISTRY_ADDRESS`
     - `VITE_BASELINE_REGISTRY_ADDRESS`
     - `VITE_DONATION_POOL_ADDRESS`
     - `VITE_RETIREMENT_REGISTRY_ADDRESS` (Phase 2)
     - `VITE_VERIFIER_BADGE_SBT_ADDRESS` (Phase 3)
     - `VITE_MATCHING_POOL_ADDRESS` (Phase 3)
   - Set `VITE_VERIFIER_V2=true` to enable Phase 2+ features
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

## Testing (Moonbase)

Run Hardhat tests locally:
```bash
npm test
```

Tests cover:
- Phase 1: Basic submit/verify with V2 fields
- Phase 2: Configuration, stakes, delayed minting, challenges, buffer allocation, oracle reports, retirements
- Phase 3: Verifier badges (mint/revoke/soulbound), reputation management, quadratic matching rounds, donations, finalization, verifier tracking

## Demo
- 🌐 [Live App](#) (Coming Soon)
- 🎥 [Demo Video](#) (Coming Soon)
- 📄 Network: Moonbase Alpha (ChainID 1287)
