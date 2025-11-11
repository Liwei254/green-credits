# TODO: Implement GCT Token Staking in EcoActionVerifier

## Overview
Replace native DEV (GLMR) staking with GCT token staking in the EcoActionVerifier contract. This involves modifying deposit/withdraw functions to use ERC20 transfers instead of payable ETH transfers.

## Tasks
- [ ] Modify EcoActionVerifier.sol depositStake function to use GCT transferFrom
- [ ] Modify EcoActionVerifier.sol withdrawStake function to use GCT transfer
- [ ] Update frontend/src/utils/contract.ts verifierAbi to remove payable from staking functions
- [ ] Test staking functionality with GCT tokens
- [ ] Update deployment script if needed for GCT staking configuration

## Files to Modify
- contracts/EcoActionVerifier.sol
- frontend/src/utils/contract.ts
- scripts/deploy_mainnet.ts (if stake amounts need adjustment)

## Notes
- Stake balances remain in uint256 (same units as before, assuming 18 decimals)
- Constructor already accepts tokenAddress
- setConfig function can remain unchanged
- Frontend will need to handle token approvals for staking
