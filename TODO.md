# USDC Staking + GCT Rewards Refactor Plan

## 1. Smart Contract Refactoring
- [ ] Refactor EcoActionVerifier.sol to use USDC for staking and GCT for rewards
- [ ] Add IERC20 interface for USDC
- [ ] Add usdStakeBalance[user] mapping
- [ ] Update staking functions to use USDC
- [ ] Update verifyAction, submitActionV2, challengeAction to require USDC stake
- [ ] Ensure GCT minting for rewards

## 2. Test Fixes
- [ ] Fix BigInt comparisons in all test files (use expect(actual).to.equal(expected))
- [ ] Update staking logic to use USDC in tests
- [ ] Mock USDC deployments in tests
- [ ] Ensure GCT minting logic is properly tested
- [ ] Fix challenge window tests
- [ ] Fix buffer mint tests

## 3. Deployment Scripts
- [ ] Update deploy.js to deploy USDC mock locally
- [ ] Use Moonbeam Alpha USDC address for mainnet deployments
- [ ] Deploy GCT and pass both addresses to EcoActionVerifier
- [ ] Ensure all scripts are CommonJS (.js or .cjs)

## 4. CI/CD Updates
- [ ] Add Node 22 setup
- [ ] Add frontend build step
- [ ] Add GitHub Pages deployment for green-credit.xyz
- [ ] Ensure blockchain compile and test steps

## 5. Monorepo Structure
- [ ] Move everything into proper workspaces (already done)
- [ ] Fix all path references
- [ ] Update docker-compose.yml
- [ ] Ensure docker build works

## 6. Final Checks
- [ ] Run npm run test and ensure all pass
- [ ] Run docker-compose up --build end-to-end
- [ ] Verify frontend deploys to GitHub Pages
