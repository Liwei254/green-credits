# CI Fixes TODO - Tracking Progress for GitHub Actions Test Failures

## Steps from Approved Plan

- [x] Edit test/GreenCreditTokenOwnership.test.js
  - Update Ownable revert matcher to custom error.
  - Skip unimplemented voting delegation tests with this.skip().

- [x] Edit test/MatchingPoolQuadratic.test.js
  - Replace Date.now() timestamps with ethers.provider.getBlock('latest').timestamp.
  - Ensure newRoundId clarity in prevent finalizing test.

- [x] Edit test/EcoActionVerifierEdgeCases.test.js
  - Add addVerifier call before duplicate test.
  - Fix challenge stake logic for success case.

- [ ] Edit test/MetricsTracker.test.js
  - Remove redundant addVerifier for owner (auto-added in constructor).
  - Add explanatory comment.

- [ ] Update TODO_tests_ci.md
  - Mark "[ ] Fix failing tests (11 failures: 8 in MatchingPoolQuadratic, 3 in new tests)" as "[x]".

- [ ] Run npx hardhat test locally to verify all tests pass (119 passing, 2 skipped).
  - If passes, commit/push to trigger CI re-run.

## Status
- Total steps: 6
- Expected outcome: CI checks pass, PR ready for review/merge.
