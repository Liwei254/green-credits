# Remove V1 Completely - TODO List

## Contract Changes
- [x] Remove legacy `submitAction` function from EcoActionVerifier.sol
- [x] Remove `verified` field from Action struct
- [x] Update any references to `verified` field

## Frontend Changes
- [x] Remove `USE_V2` flag from contract.ts
- [x] Update contract ABI to only include V2 functions
- [x] Remove V1 conditional logic from ActionForm.tsx
- [x] Update contract.ts to always use V2 ABI

## Test Changes
- [x] Remove EcoActionVerifier.test.js (V1 tests)
- [x] Update EcoActionVerifierV2.test.js to remove backward compatibility test

## Other Files
- [x] Check and update any scripts or docs referencing V1
