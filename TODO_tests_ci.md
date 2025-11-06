# TODO: Implement Security/Developer Tasks - Tests & CI

## Steps to Complete
- [x] Scan existing test files in `test/` directory to assess current coverage.
- [x] Expand tests for `verifyAction` edge cases (e.g., invalid proofs, expired actions, unauthorized verifiers).
- [x] Add tests for ownership transfer of token (GreenCreditToken.sol).
- [x] Add tests for donation flows (DonationPool.sol interactions).
- [x] Add tests for action submission with/without proof (EcoActionVerifier.sol).
- [x] Check for existing CI setup in `.github/workflows`.
- [x] Create GitHub Actions workflow for running tests on push and PRs.
- [x] Run tests locally to ensure they pass (109 passing, 11 failing - some existing issues in MatchingPoolQuadratic).
- [ ] Verify CI workflow triggers correctly.
- [x] Fix failing tests (11 failures: 8 in MatchingPoolQuadratic, 3 in new tests).
