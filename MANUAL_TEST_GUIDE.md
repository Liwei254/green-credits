# MANUAL TEST GUIDE: Green-Credits USDC + GCT Refactoring

This guide provides step-by-step instructions to manually test the refactored Green-Credits project with USDC staking and GCT rewards on Moonbeam Alpha.

## Prerequisites

- Node.js 22.x installed
- Docker and Docker Compose installed
- MetaMask or Polkadot.js wallet for Moonbeam testing
- GitHub repository cloned

## 1. Test Smart Contracts Locally

### Start Local Hardhat Node

```bash
cd blockchain
npx hardhat node
```

**Expected Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...
```

### Deploy Contracts Locally

In a new terminal:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

**Expected Output:**
```
✅ Mock USDC: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ GreenCreditToken: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
✅ EcoActionVerifier: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
✅ DonationPool: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
✅ Added deployer as NGO for demo
```

### Manual Contract Interaction

Connect to Hardhat console:

```bash
cd blockchain
npx hardhat console --network localhost
```

**Test USDC Staking:**

```javascript
// Get contract instances
const usdc = await ethers.getContractAt("MockERC20", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
const verifier = await ethers.getContractAt("EcoActionVerifier", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");

// Mint USDC to user
await usdc.mint("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", ethers.parseUnits("1000", 6));
console.log("USDC balance:", await usdc.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"));

// Approve and stake USDC
await usdc.connect(await ethers.getSigner("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")).approve(verifier.target, ethers.parseUnits("100", 6));
await verifier.connect(await ethers.getSigner("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")).depositStake(ethers.parseUnits("100", 6));

// Check stake balance
console.log("Stake balance:", await verifier.usdStakeBalance("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"));
```

**Expected Output:**
```
USDC balance: 1000000000n
Stake balance: 100000000n
```

**Test Action Submission and Verification:**

```javascript
// Submit action
await verifier.connect(await ethers.getSigner("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")).submitActionV2(
  "Planted 100 trees",
  "bafkreiproof123",
  1, // Removal
  ethers.id("method1"),
  ethers.id("project1"),
  ethers.id("baseline1"),
  1000000, // 1 ton CO2e
  500, // 5% uncertainty
  25, // 25 years durability
  "bafkreimetadata123"
);

// Verify action
await verifier.verifyAction(0, ethers.parseUnits("100", 18));

// Check GCT balance
const gct = await ethers.getContractAt("GreenCreditToken", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
console.log("GCT balance:", await gct.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"));
```

**Expected Output:**
```
GCT balance: 110000000000000000000n  // 110 GCT (100 + 10% buffer)
```

## 2. Test the Backend

### Run Server Locally

```bash
cd server
npm install
npm start
```

**Expected Output:**
```
Server running on port 8787
```

### Test API Endpoints

**Health Check:**
```bash
curl http://localhost:8787/health
```

**Expected Response:**
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

**Upload File (if applicable):**
```bash
curl -X POST -F "file=@test.jpg" http://localhost:8787/upload
```

**Expected Response:**
```json
{"cid":"bafkreihash123","url":"https://ipfs.io/ipfs/bafkreihash123"}
```

## 3. Test the Frontend Integration

### Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

**Expected Output:**
```
Vite dev server running at http://localhost:5173
```

### Set Environment Variables

Create `.env.local`:

```env
VITE_ECO_ACTION_VERIFIER_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
VITE_GCT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_USDC_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_RPC_URL=http://127.0.0.1:8545
```

### Test Frontend Flows

1. **Connect Wallet:** Click "Connect Wallet" button
   - **Expected:** MetaMask popup, wallet connects

2. **Check Balances:** Navigate to Dashboard
   - **Expected:** Shows USDC and GCT balances

3. **Stake USDC:** Use staking interface
   - **Expected:** Transaction prompt, stake balance updates

4. **Submit Action:** Fill form and submit
   - **Expected:** Transaction succeeds, action appears in list

5. **Verify Action:** As admin/verifier
   - **Expected:** GCT minted, balance increases

**Console Logs to Check:**
```
Connected to wallet: 0x7099...
USDC balance: 1000.0
GCT balance: 0.0
Staking 100 USDC...
Action submitted: tx_hash_123
Action verified: tx_hash_456
GCT balance: 110.0
```

## 4. Test Dockerized Full System

### Run Docker Compose

```bash
docker-compose up --build
```

**Expected Output:**
```
Starting green-credits_blockchain_1 ... done
Starting green-credits_server_1 ... done
Starting green-credits_frontend_1 ... done
```

### Verify Services

**Check container status:**
```bash
docker ps
```

**Expected Output:**
```
CONTAINER ID   IMAGE                    STATUS          PORTS
abc123         green-credits_frontend   Up 30 seconds   0.0.0.0:3000->80/tcp
def456         green-credits_server    Up 30 seconds   0.0.0.0:8080->8787/tcp
ghi789         green-credits_blockchain Up 30 seconds   0.0.0.0:8545->8545/tcp
```

**Check logs:**
```bash
docker-compose logs blockchain
docker-compose logs server
docker-compose logs frontend
```

**Test URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080/health
- Blockchain: http://localhost:8545 (JSON-RPC)

## 5. Test Moonbeam Alpha Deployment

### Deploy to Moonbeam Alpha

```bash
cd blockchain
export PRIVATE_KEY=your_private_key
npx hardhat run scripts/deploy.js --network moonbeamAlpha
```

**Expected Output:**
```
✅ Mock USDC: 0x123...
✅ GreenCreditToken: 0x456...
✅ EcoActionVerifier: 0x789...
✅ DonationPool: 0xABC...
```

### Verify on Moonbeam Explorer

Visit https://moonbase.moonscan.io/ and search for contract addresses.

### Update Frontend for Alpha

Create `.env.production`:

```env
VITE_ECO_ACTION_VERIFIER_ADDRESS=0x789...
VITE_GCT_ADDRESS=0x456...
VITE_USDC_ADDRESS=0x123...
VITE_RPC_URL=https://rpc.api.moonbeam.network
```

### Test with Polkadot.js Wallet

1. Connect to Moonbeam Alpha network
2. Import account with private key
3. Use frontend at https://green-credit.xyz
4. Execute staking and verification flows

**Expected Events on Explorer:**
- USDC Transfer events for staking
- GCT Mint events for rewards
- ActionSubmittedV2 events

## 6. Expected Results Summary

### Smart Contract Tests
- ✅ All Hardhat tests pass
- ✅ USDC staking works with 6 decimals
- ✅ GCT minting works with 18 decimals
- ✅ Buffer calculations correct (10% for removals)

### Backend Tests
- ✅ Health endpoint returns 200 OK
- ✅ File upload returns IPFS CID
- ✅ Error handling for invalid requests

### Frontend Tests
- ✅ Wallet connection successful
- ✅ Balance displays update correctly
- ✅ Transaction confirmations work
- ✅ UI reflects blockchain state

### Docker Tests
- ✅ All containers start successfully
- ✅ Services communicate properly
- ✅ No port conflicts

### Moonbeam Tests
- ✅ Contracts deploy successfully
- ✅ Transactions confirm on network
- ✅ Frontend integrates with live contracts

## 7. Sample Outputs

### Hardhat Test Output
```
EcoActionVerifier V2
  ✅ should submit action with V2 fields and verify
  ✅ should allow setting attestation UID

EcoActionVerifier Phase 2
  ✅ should set Phase 2 configuration
  ✅ should allow depositing stake
  ✅ should verify action without immediate mint
  ✅ should resolve challenge as upheld

12 passing (5s)
```

### Contract Deployment Logs
```
Compiling 4 Solidity files...
Successfully compiled 4 Solidity files.
Deploying contracts...
✅ Mock USDC deployed at: 0x123...
✅ GCT deployed at: 0x456...
✅ Verifier deployed at: 0x789...
```

### Frontend Console Logs
```
Wallet connected: 0x7099...
Loading balances...
USDC: 1000.0, GCT: 0.0
Staking initiated...
Transaction confirmed: 0xabc...
Balances updated: USDC: 900.0, GCT: 0.0
```

### API Response Examples
```json
{
  "status": "ok",
  "data": {
    "cid": "bafkreihash123",
    "size": 1024000
  }
}
```

This guide covers all critical testing scenarios for the USDC + GCT refactored Green-Credits system.
