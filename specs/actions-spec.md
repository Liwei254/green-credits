# Actions List Page Specifications (/actions)

## Overview
The actions list displays all submitted eco-actions with verification status, rewards, and detailed carbon credit information. It provides filtering, sorting, and virtualized scrolling for performance.

## Low-Fidelity Wireframe (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: 📋 Actions List                                    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Search/Filter Bar]                                     │ │
│ │ Status: All ⏳ Pending ✅ Verified 🏆 Finalized          │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Action #1234                                            │ │
│ │ 🌱 Planted 5 trees in local park                        │ │
│ │ By: 0x1234...abcd                                       │ │
│ │ Status: ✅ Verified +100 GCT                            │ │
│ │ 📎 View Proof                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Action #1233                                            │ │
│ │ 🌱 Organized community clean-up                         │ │
│ │ By: 0x5678...efgh                                       │ │
│ │ Status: ⏳ Pending                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## High-Fidelity Mockup (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Actions List                                            │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔍 Search actions...                                    │ │
│ │ ├─────────────────────────────────────────────────────┤ │ │
│ │ │ Status: All ▼ | My Actions □ | Verified □ | Pending □│ │ │
│ │ │ Sort: Newest ▼ | Oldest | Most Rewarded              │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Action #1234                                        │ │ │
│ │ │ 🌱 Planted 5 trees in local park                    │ │ │
│ │ │ ├──────────────────────────────────────────────────┤ │ │ │
│ │ │ │ ✅ Verified by 0x742d...f44e                      │ │ │ │
│ │ │ │ on 2024-01-15 14:30                               │ │ │ │
│ │ │ │ +100.00 GCT rewarded                              │ │ │ │
│ │ │ └──────────────────────────────────────────────────┘ │ │ │
│ │ │ ├──────────────────────────────────────────────────┤ │ │ │
│ │ │ │ 🌿 Carbon Credit Details                         │ │ │ │
│ │ │ │ Quantity: 500,000 gCO2e (0.5 tons)               │ │ │ │
│ │ │ │ Type: Removal                                     │ │ │ │
│ │ │ │ Methodology: Tree Planting v2.0                  │ │ │ │
│ │ │ └──────────────────────────────────────────────────┘ │ │ │
│ │ │ ┌──────────────────────────────────────────────────┤ │ │ │
│ │ │ │ 📎 View Proof                                     │ │ │ │
│ │ │ │ 📄 Metadata                                       │ │ │ │
│ │ │ │ 🔗 View on MoonScan                                │ │ │ │
│ │ │ └──────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Action #1233                                        │ │ │
│ │ │ 🌱 Organized community clean-up                     │ │ │
│ │ │ ├──────────────────────────────────────────────────┤ │ │ │
│ │ │ │ ⏳ Pending verification                            │ │ │ │
│ │ │ │ Submitted 2 hours ago                             │ │ │ │
│ │ │ └──────────────────────────────────────────────────┘ │ │ │
│ │ │ ┌──────────────────────────────────────────────────┤ │ │ │
│ │ │ │ 🔗 View on MoonScan                                │ │ │ │
│ │ │ └──────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## High-Fidelity Mockup (Mobile)

```
┌─────────────────────┐
│ 📋 Actions          │
├─────────────────────┤
│ 🔍 Search...        │
│ Status: All ▼       │
├─────────────────────┤
│ Action #1234        │
│ 🌱 Planted trees    │
│ ✅ Verified         │
│ +100 GCT            │
│ 📎 Proof            │
├─────────────────────┤
│ Action #1233        │
│ 🌱 Clean-up event   │
│ ⏳ Pending          │
│ 2h ago              │
├─────────────────────┤
│ Load More...        │
└─────────────────────┘
```

## Interaction Specification

### On-Chain/Network Flows

1. **Data Loading**
   - Call `verifier.getActionCount()` for total count
   - Load last 50 actions initially
   - Load more on scroll (pagination)
   - Resolve ENS for verifiers if available

2. **Filtering & Sorting**
   - Status filter: All, Pending, Verified, Finalized
   - User filter: All actions, My actions only
   - Sort: Newest, Oldest, Most rewarded
   - Real-time filtering without new contract calls

3. **Action Details**
   - Click action: Expand/collapse details
   - View proof: Open IPFS link in new tab
   - View metadata: Open IPFS link in new tab
   - View on MoonScan: Open transaction explorer

4. **Real-time Updates**
   - Poll for new actions every 30 seconds
   - Update verification status automatically
   - Show loading indicators for updates

### Transaction Lifecycle
- Read-only page, no transactions initiated
- Links to external explorers for transaction details

### Error Handling
- Contract call failures: Show error toast, retry option
- Network issues: Offline indicator, retry when back online
- ENS resolution failures: Fallback to address display

## Microcopy

### CTAs
- "🔄 Refresh" - Reload actions list
- "📎 View Proof" - Open IPFS proof
- "📄 Metadata" - Open IPFS metadata
- "🔗 View on MoonScan" - Open explorer
- "Load More" - Pagination button

### Status Messages
- "⏳ Pending verification"
- "✅ Verified by {verifier}"
- "🏆 Finalized"
- "❌ Rejected"

### Loading States
- "Loading actions..."
- "Refreshing..."
- "Loading more actions..."

### Empty States
- "🌱 No actions yet. Be the first to submit!"
- "No actions match your filters."

### Error Messages
- "Failed to load actions. Please try again."
- "Unable to verify action status."

## Accessibility Checklist

### WCAG Contrast
- ✅ Action cards: 3:1 minimum border contrast
- ✅ Status badges: 4.5:1 minimum
- ✅ Links: 4.5:1 minimum with focus indicators
- ✅ Filter controls: 3:1 minimum

### Keyboard Navigation
- ✅ Tab: Navigate action cards and links
- ✅ Enter/Space: Expand/collapse actions
- ✅ Arrow keys: Navigate filter options
- ✅ Page Up/Down: Scroll action list
- ✅ Home/End: Jump to top/bottom

### ARIA Labels
- ✅ Action cards: `role="article"`
- ✅ Status badges: `aria-label="Verification status: verified"`
- ✅ Links: Descriptive `aria-label` attributes
- ✅ Filters: `aria-expanded`, `aria-controls`
- ✅ Loading states: `aria-live="polite"`

### Screen Reader Support
- ✅ Action announcements: "Action 1234 by address, verified, rewarded 100 GCT"
- ✅ Status updates: Live region for status changes
- ✅ Filter changes: Announced filter results
- ✅ Pagination: "Loaded 50 more actions"

### Mobile Accessibility
- ✅ Touch targets: 44px minimum
- ✅ Swipe: Horizontal scroll for filters
- ✅ Pull to refresh: Standard mobile gesture
- ✅ Voice commands: "Show my actions"

## Acceptance Criteria

### Functional Requirements
- [ ] Loads last 50 actions on page load
- [ ] Infinite scroll loads more actions
- [ ] Filters work without page reload
- [ ] Sorting updates display instantly
- [ ] External links open in new tabs
- [ ] Real-time status updates

### Performance
- [ ] Initial load < 3 seconds
- [ ] Scroll performance 60fps
- [ ] Memory usage stable with 1000+ actions
- [ ] Lazy load images and proofs

### User Experience
- [ ] Clear visual distinction between statuses
- [ ] Intuitive expand/collapse behavior
- [ ] Helpful tooltips on hover
- [ ] Smooth animations and transitions

### Accessibility
- [ ] Screen reader compatible
- [ ] Keyboard navigable
- [ ] High contrast support
- [ ] Mobile gesture support

## Automated Test Ideas

### Unit Tests
- `ActionsList.test.tsx`
  - Renders loading state
  - Displays actions correctly
  - Filter functionality
  - Sort functionality
  - Error state handling

- `useActionsData.test.js`
  - Contract call mocking
  - Data transformation
  - Pagination logic
  - Real-time updates

### E2E Tests (Playwright)
- `actions-list.spec.ts`
  - Load actions list
  - Filter by status
  - Sort by different criteria
  - Expand action details
  - Click external links
  - Infinite scroll behavior
  - Real-time updates

### Performance Tests
- `actions-performance.spec.ts`
  - Load time with 100 actions
  - Scroll performance
  - Memory usage over time
  - Filter operation speed

## Developer Notes

### Environment Flags
- No specific flags affect actions list directly
- VITE_VERIFIER_HAS_PROOF: May affect proof display logic

### File Limits
- N/A (no uploads, only links to existing files)

### Expected Proxy Responses
- N/A (read-only page)

### Minimal ABI Guidance
```typescript
// EcoActionVerifier ABI fragment
const verifierAbi = [
  "function getActionCount() view returns (uint256)",
  "function actions(uint256) view returns (tuple(address user, string description, string proofCid, uint256 reward, bool verified, uint256 timestamp, uint8 status, bytes32 methodologyId, bytes32 projectId, bytes32 baselineId, uint256 quantity, uint256 uncertaintyBps, uint256 durabilityYears, string metadataCid, bytes32 attestationUID))",
  "function verifierOfAction(uint256) view returns (address)"
];
```

### Implementation Notes
- Use `react-window` or `react-virtualized` for performance
- Implement optimistic updates for status changes
- Add action caching with `react-query`
- Use `IntersectionObserver` for infinite scroll
- Consider service worker for offline action viewing
- Add action bookmarking/favoriting (future feature)
- Implement action search with full-text indexing
