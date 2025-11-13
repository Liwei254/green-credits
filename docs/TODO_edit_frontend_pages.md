# TODO: Edit Frontend Pages for Green Credits dApp

## Overview
Edit the stated frontend pages to meet the hard requirements and directives. Ensure all pages use modern TypeScript, React, Tailwind CSS, Ethers v6, gas estimates, upload limits, and other specified features.

## Pages to Edit
- /dashboard
- /submit
- /actions
- /leaderboard
- /donate
- /matching
- /governance
- /admin/registry
- /admin/reputation
- /retirement

## Hard Requirements to Implement
- Use Ethers v6 for all blockchain interactions
- Implement gas estimates for all on-chain transactions
- Add upload progress indicators for file uploads (max 8MB, proxy 10MB)
- Implement toast lifecycle management (loading, success, error)
- Add wallet connect flow with chain-switch behavior
- Ensure mobile-responsive design
- Implement accessibility features (WCAG contrast, keyboard nav, ARIA)
- Add confirmation modals for critical actions
- Use modern async/await patterns
- Implement proper error handling and user feedback

## Deliverables to Produce for Each Page
- Low-fidelity wireframe + one high-fidelity mockup (desktop + mobile)
- Interaction spec for all on-chain and network-dependent flows
- Microcopy for CTAs, confirmation modals, success & error toasts
- Accessibility checklist
- Acceptance criteria + automated test ideas (unit & E2E)
- Developer notes (env flags, file limits, proxy responses, minimal ABI)

## Steps
1. Update Dashboard component to use DashboardNew
2. Update ActionForm to use ActionFormNew
3. Update ActionsList to use ActionsListNew
4. Update Leaderboard to use LeaderboardNew
5. Update Donate to use DonateNew
6. Update MatchingPool to use MatchingPoolNew
7. Ensure all components have gas estimates
8. Add upload progress to all upload flows
9. Implement toast lifecycles
10. Add accessibility features
11. Produce deliverables for each page
12. Test all pages for compliance

## Status
- [ ] Step 1: Update Dashboard
- [ ] Step 2: Update ActionForm
- [ ] Step 3: Update ActionsList
- [ ] Step 4: Update Leaderboard
- [ ] Step 5: Update Donate
- [ ] Step 6: Update MatchingPool
- [ ] Step 7: Add gas estimates to all components
- [ ] Step 8: Add upload progress indicators
- [ ] Step 9: Implement toast lifecycles
- [ ] Step 10: Add accessibility features
- [ ] Step 11: Produce deliverables
- [ ] Step 12: Testing
