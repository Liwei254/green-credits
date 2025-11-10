# Green Credits dApp UI/UX Improvement Plan

## Overview
Improve the frontend pages for the Green Credits dApp according to the provided directives. Each page needs comprehensive UI/UX enhancements including wireframes, interaction specs, microcopy, accessibility, acceptance criteria, and developer notes.

## Pages to Improve
1. /dashboard - User overview with balances, actions, and impact metrics
2. /submit - Action submission form with proof upload
3. /actions - List of all submitted actions with verification status
4. /leaderboard - Top contributors ranking
5. /donate - Donation flow to NGOs with approval + donate steps
6. /matching - Quadratic funding pool management
7. /governance - DAO proposals and voting
8. /admin/registry - Methodology and baseline registry management
9. /admin/reputation - Verifier badge and reputation management
10. /retirement - Credit retirement with type-to-confirm

## Key Requirements
- Use Ethers v6 (BrowserProvider, Contract, parseUnits)
- Show gas/gas fee estimates before confirm
- Upload: 8MB frontend limit, 10MB proxy limit, proxy fallback to Web3.Storage
- Environment flags: VITE_VERIFIER_HAS_PROOF, VITE_UPLOAD_PROXY_URL, VITE_WEB3_STORAGE_TOKEN, VITE_DONATION_POOL_ADDRESS
- Wallet: check connection and network, suggest Moonbase Alpha switch
- Donation: explicit approve + donate two-step UX
- Admin: batch CSV operations, audit logs
- Error UX: react-hot-toast style toasts
- Transaction lifecycle: submitted → pending → confirmed with tx links
- Robust upload: drag/drop, preview, progress, clear limits, retry
- Multi-step flows: approve+donate, retirement burns with type-to-confirm
- Admin safeguards: preview CSV, validation, multi-confirm for destructive actions
- Lazy-load heavy components, minimal ABIs

## Deliverables per Page
For each page, provide:
- Low-fidelity wireframe + one high-fidelity mockup (desktop + mobile)
- Interaction spec for on-chain/network flows
- Microcopy for CTAs, modals, toasts
- Accessibility checklist (WCAG contrast, keyboard nav, ARIA)
- Acceptance criteria + automated test ideas (unit & E2E)
- Developer notes (env flags, file limits, proxy responses, minimal ABI)

## Implementation Steps
1. Analyze current components and identify gaps
2. Create wireframes and mockups for each page
3. Define interaction specs and microcopy
4. Develop accessibility checklists
5. Write acceptance criteria and test ideas
6. Compile developer notes
7. Update components with improvements
8. Add unit tests and E2E scenarios

## Current Component Status
- Dashboard: Basic stats, chart, network info
- ActionForm: Submit form with drag/drop upload, V2 fields
- ActionsList: Virtualized list with verification status
- Leaderboard: Top 10 contributors
- Donate: Two-step approve+donate with gas estimates
- MatchingPool: Admin controls for quadratic funding
- Governance: Proposal creation and voting (demo)
- AdminRegistry: Upsert methodology/baseline
- AdminReputation: Mint/revoke badges, adjust reputation
- Retirement: Select actions, retire with beneficiary

## Next Steps
1. Create detailed specs for each page
2. Get user approval on specs
3. Implement improvements
4. Test thoroughly
