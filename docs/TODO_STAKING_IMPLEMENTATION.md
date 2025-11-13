# GCT Staking Implementation Steps

## Step 1: Modify EcoActionVerifier.sol depositStake function ✅
- Changed `depositStake() external payable` to `depositStake(uint256 amount) external`
- Replaced `stakeBalance[msg.sender] += msg.value;` with `token.transferFrom(msg.sender, address(this), amount); stakeBalance[msg.sender] += amount;`
- Added require check for amount > 0

## Step 2: Modify EcoActionVerifier.sol withdrawStake function ✅
- Changed `withdrawStake(uint256 amount) external` to use `token.transfer(msg.sender, amount)` instead of `payable(msg.sender).transfer(amount)`

## Step 3: Update frontend/src/utils/contract.ts verifierAbi ✅
- Removed `payable` from `depositStake()` function signature
- Changed `depositStake() payable` to `depositStake(uint256 amount)`

## Step 4: Test staking functionality
- [ ] Run compilation to check for syntax errors
- [ ] Run existing tests to ensure no regressions
- [ ] Verify GCT token transfers work correctly

## Step 5: Update frontend components for token approvals ✅
- [x] Updated AdminVerify.tsx depositStakeFn to approve GCT tokens before staking
- [x] Changed UI labels from "DEV" to "GCT" for stake amounts
  