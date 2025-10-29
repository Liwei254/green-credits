# Phase 1 Upgrades: Trustable Accounting Primitives

## Overview

Phase 1 introduces trustable accounting primitives to the Green Credits dApp, addressing market trust concerns by adding essential metadata and governance hooks to carbon credit tracking. This upgrade is **backwards compatible** with existing actions.

## New Features

### 1. Registry Contracts

#### MethodologyRegistry.sol
Manages carbon credit methodologies with IPFS-backed documentation.

**Struct:**
```solidity
struct Methodology {
    string name;
    string version;
    string cid;       // IPFS CID
    bool active;
}
```

**Functions:**
- `upsert(bytes32 id, string name, string version, string cid, bool active)` - Owner only
- `get(bytes32 id)` - Returns methodology details

**Event:**
- `MethodologyUpserted(bytes32 indexed id, string name, string version, string cid, bool active)`

#### BaselineRegistry.sol
Manages project baselines with IPFS-backed documentation.

**Struct:**
```solidity
struct Baseline {
    bytes32 projectId;
    string version;
    string cid;       // IPFS CID
    bool active;
}
```

**Functions:**
- `upsert(bytes32 id, bytes32 projectId, string version, string cid, bool active)` - Owner only
- `get(bytes32 id)` - Returns baseline details

**Event:**
- `BaselineUpserted(bytes32 indexed id, bytes32 projectId, string version, string cid, bool active)`

### 2. Enhanced EcoActionVerifier

#### New Types
```solidity
enum CreditType { Reduction, Removal, Avoidance }
```

#### Extended Action Struct
The Action struct now includes V2 fields for trustable accounting:
- `creditType` - Type of carbon credit (Reduction, Removal, Avoidance)
- `methodologyId` - Reference to methodology registry
- `projectId` - Project identifier
- `baselineId` - Reference to baseline registry
- `quantity` - Amount in grams CO2e
- `uncertaintyBps` - Uncertainty in basis points (100 = 1%)
- `durabilityYears` - For removal credits, expected permanence
- `metadataCid` - IPFS CID for additional metadata
- `attestationUID` - External attestation linkage

#### New Functions

**submitActionV2**
```solidity
function submitActionV2(
    string memory description,
    string memory proofCid,
    CreditType creditType,
    bytes32 methodologyId,
    bytes32 projectId,
    bytes32 baselineId,
    uint256 quantity,
    uint256 uncertaintyBps,
    uint256 durabilityYears,
    string memory metadataCid
) external
```

**setAttestation**
```solidity
function setAttestation(uint256 actionId, bytes32 uid) external onlyVerifier
```

**Legacy Support**
The original `submitAction(string, string)` function remains and automatically fills V2 fields with defaults for backward compatibility.

#### New Event
```solidity
event ActionSubmittedV2(
    address indexed user,
    uint256 indexed actionId,
    CreditType creditType,
    bytes32 methodologyId,
    bytes32 projectId,
    bytes32 baselineId,
    uint256 quantity,
    uint256 timestamp
)
```

### 3. Frontend Enhancements

#### V2 Mode Toggle
Set `VITE_VERIFIER_V2=true` in `.env` to enable V2 features.

#### Enhanced ActionForm
When V2 is enabled, the form includes:
- Credit Type selector (Reduction/Removal/Avoidance)
- Methodology label (hashed to bytes32 ID)
- Project label (hashed to bytes32 ID)
- Baseline label (hashed to bytes32 ID)
- Quantity in grams CO2e
- Uncertainty percentage (optional)
- Durability years (for removals, optional)
- Metadata file upload (JSON, optional)

#### Enhanced ActionsList
Displays V2 fields when available:
- Credit type badge
- Quantity in grams CO2e
- Uncertainty percentage
- Durability years
- Methodology ID (truncated)
- Baseline ID (truncated)
- Metadata link
- Attestation indicator

#### New AdminRegistry Page
Owner-only interface for managing registries:
- **Methodology Registry Section**: Upsert methodology entries
- **Baseline Registry Section**: Upsert baseline entries
- Accessible at `/admin/registry`

## Deployment

### 1. Deploy Phase 1 Contracts

```bash
npm run deploy:phase1
```

This deploys:
- GreenCreditToken
- MethodologyRegistry
- BaselineRegistry
- EcoActionVerifier (with V2 support)

And transfers token ownership to the verifier.

### 2. Update Frontend Configuration

Copy the output addresses to `frontend/.env`:
```env
VITE_TOKEN_ADDRESS=0x...
VITE_VERIFIER_ADDRESS=0x...
VITE_METHODOLOGY_REGISTRY_ADDRESS=0x...
VITE_BASELINE_REGISTRY_ADDRESS=0x...
VITE_VERIFIER_V2=true
```

### 3. (Optional) Upsert Sample Data

```bash
# Set registry addresses in .env
METHODOLOGY_REGISTRY_ADDRESS=0x...
BASELINE_REGISTRY_ADDRESS=0x...

# Run upsert script
npm run upsert:samples
```

## Usage Examples

### Registry Management

#### Upsert a Methodology
```javascript
import { ethers, id as ethersId } from "ethers";

const methodologyId = ethersId("Cookstove v1.2");
await methodologyRegistry.upsert(
  methodologyId,
  "Clean Cookstove Distribution",
  "v1.2",
  "bafkreiexample123...",
  true
);
```

#### Upsert a Baseline
```javascript
const projectId = ethersId("Project Kenya 001");
const baselineId = ethersId("Baseline Kenya 001 v1");
await baselineRegistry.upsert(
  baselineId,
  projectId,
  "v1.0",
  "bafkreiexample456...",
  true
);
```

### Submit V2 Action

```javascript
const methodologyId = ethersId("Cookstove v1.2");
const projectId = ethersId("Project Kenya 001");
const baselineId = ethersId("Baseline Kenya 001 v1");

await verifier.submitActionV2(
  "Installed 10 clean cookstoves",
  "proofCID",
  0, // CreditType.Reduction
  methodologyId,
  projectId,
  baselineId,
  1000000, // 1 ton = 1,000,000 grams CO2e
  500, // 5% uncertainty
  0, // Not a removal
  "metadataCID"
);
```

### Set Attestation

```javascript
const attestationUID = ethersId("attestation-12345");
await verifier.setAttestation(actionId, attestationUID);
```

## Data Formats

### Quantity
- Stored in **grams of CO2 equivalent (gCO2e)**
- 1 kg = 1,000 grams
- 1 ton = 1,000,000 grams

### Uncertainty
- Stored in **basis points**
- 100 basis points = 1%
- 500 basis points = 5%

### Durability
- Stored in **years**
- Applies only to removal credits
- Set to 0 for reductions and avoidances

### IDs
- All IDs are **bytes32** hashes
- Generated using `ethers.id(label)` (keccak256)
- Example: `ethers.id("Cookstove v1.2")`

## Backward Compatibility

Phase 1 maintains full backward compatibility:

1. **Legacy submitAction** still works and fills V2 fields with defaults
2. **Existing actions** remain valid and verifiable
3. **Frontend gracefully handles** both V1 and V2 actions
4. **V2 features are opt-in** via environment variable

## Testing

```bash
# Run all tests (including V2 tests)
npm test

# Expected output:
# ✓ EcoActionVerifier - legacy test
# ✓ EcoActionVerifier V2 - submitActionV2 and verify
# ✓ EcoActionVerifier V2 - setAttestation
# ✓ EcoActionVerifier V2 - backward compatibility
# ✓ EcoActionVerifier V2 - registry integration
```

## Future Phases

This Phase 1 implementation sets the foundation for:

- **Phase 2**: Role-based registrars (not just owner)
- **Phase 3**: Attestation provenance tracking
- **Phase 4**: Challenge and slash mechanisms
- **Phase 5**: Credit tokenization and marketplace

## Notes

- **Owner privileges**: Registry upserts require contract ownership
- **Verifier role**: `setAttestation` requires verifier role
- **IPFS CIDs**: Store methodology and baseline documents on IPFS
- **Gas optimization**: IDs are hashed client-side to save gas
- **Immutability**: Actions are append-only; V2 fields cannot be modified after submission

## Support

For issues or questions, please refer to the repository documentation or open an issue on GitHub.
