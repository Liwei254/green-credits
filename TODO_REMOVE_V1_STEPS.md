# Remove V1 Completely - Execution Steps

## Contract Changes
- [x] Remove legacy `submitAction` function from EcoActionVerifier.sol (already done)
- [x] Remove `verified` field from Action struct (already done, uses status and verifiedAt)
- [x] Update any references to `verified` field (already done)

## Frontend Changes
- [x] Remove `USE_V2` flag from contract.ts (not present)
- [x] Update contract ABI to only include V2 functions (already done)
- [x] Remove V1 conditional logic from ActionForm.tsx (already done)
- [x] Update contract.ts to always use V2 ABI (already done)

## Test Changes
- [ ] Update EcoActionVerifierV2.test.js to remove backward compatibility test and fix submitAction calls
- [ ] Update ActionSubmissionWithWithoutProof.test.js to use submitActionV2 instead of submitAction
- [ ] Remove EcoActionVerifier.test.js (V1 tests) - file does not exist

## Other Files
- [x] Check and update any scripts or docs referencing V1 (none found)
