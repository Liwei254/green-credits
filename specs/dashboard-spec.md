# Dashboard Page Specifications (/dashboard)

## Overview
The dashboard provides users with an overview of their Green Credits activity, including token balance, verified actions, CO2 offset impact, and growth trends. It serves as the main landing page after wallet connection.

## Low-Fidelity Wireframe (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Green Credits Dashboard                             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ 💰 GCT      │ │ 🌍 Actions  │ │ 🌱 CO2      │             │
│ │ Balance     │ │ Verified    │ │ Offset     │             │
│ │ 1,234.56    │ │ 42          │ │ 12.3 kg     │             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📈 Token Growth Trend                                  │ │
│ │ [Chart Area - 300px height]                            │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🌕 Connected to Moonbeam Network                        │ │
│ │ Your impact is transparently recorded on the Polkadot   │ │
│ │ ecosystem, ensuring trust and immutability.             │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## High-Fidelity Mockup (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 Dashboard                                               │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    🌱 Impact Overview                   │ │
│ ├─────────────────┬─────────────────┬─────────────────────┤ │
│ │ 💰 GCT Balance  │ 🌍 Verified     │ 🌱 CO₂ Offset       │ │
│ │                 │ Actions         │                     │ │
│ │ 1,234.56        │ 42              │ 12.3 kg             │ │
│ │ +2.1% vs last   │ +3 this week    │ -0.8 kg this week   │ │
│ │ month           │                 │                     │ │
│ └─────────────────┴─────────────────┴─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 Token Growth & Activity                              │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [Recharts Line Chart]                                │ │ │
│ │ │ • X-axis: Time (Jan-Dec)                             │ │ │
│ │ │ • Y-axis: GCT Balance                                │ │ │
│ │ │ • Line: Green gradient                               │ │ │
│ │ │ • Interactive tooltips                               │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔗 Network Status                                       │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🌙 Moonbase Alpha Network                            │ │ │
│ │ │ ✓ Connected                                          │ │ │
│ │ │ Block: 4,567,890                                      │ │ │
│ │ │ Gas Price: 20 gwei                                   │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ Your impact is transparently recorded on the Polkadot   │ │
│ │ ecosystem, ensuring trust and immutability.             │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎯 Quick Actions                                        │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │ │
│ │ │ 🌱 Submit   │ │ 📋 Actions  │ │ 💚 Donate   │         │ │
│ │ │ Action      │ │ List        │ │            │         │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## High-Fidelity Mockup (Mobile)

```
┌─────────────────────┐
│ 🏠 Dashboard       │
├─────────────────────┤
│ 🌱 Impact Overview  │
├─────────────────────┤
│ 💰 GCT Balance      │
│ 1,234.56            │
│ +2.1% vs last month │
├─────────────────────┤
│ 🌍 Verified Actions │
│ 42                  │
│ +3 this week        │
├─────────────────────┤
│ 🌱 CO₂ Offset       │
│ 12.3 kg             │
│ -0.8 kg this week   │
├─────────────────────┤
│ 📊 Growth Chart     │
│ [Compact Chart]     │
├─────────────────────┤
│ 🔗 Network Status   │
│ 🌙 Moonbase Alpha   │
│ ✓ Connected         │
├─────────────────────┤
│ 🎯 Quick Actions    │
│ 🌱 Submit 📋 Actions│
│ 💚 Donate 🏆 Leader │
└─────────────────────┘
```

## Interaction Specification

### On-Chain/Network Flows

1. **Page Load**
   - Check wallet connection status
   - If connected: Load user data from contracts
   - If not connected: Redirect to home with connect prompt

2. **Data Loading**
   - Call `token.balanceOf(address)` for GCT balance
   - Call `verifier.getActionCount()` and iterate actions for user stats
   - Calculate CO2 offset: (total rewards / 1e18) * 0.1 kg per GCT
   - Load historical data for chart (mock or from events)

3. **Network Status**
   - Display current network (should be Moonbase Alpha)
   - Show gas price from `provider.getFeeData()`
   - Link to MoonScan for transaction history

4. **Quick Actions**
   - Navigate to respective pages
   - No on-chain interactions on dashboard itself

### Transaction Lifecycle
- No transactions initiated from dashboard
- All data is read-only

### Error Handling
- Network errors: Show toast "Failed to load dashboard data"
- Contract errors: Show toast "Unable to fetch user statistics"

## Microcopy

### CTAs
- "🌱 Submit Action" - Navigate to /submit
- "📋 View Actions" - Navigate to /actions
- "💚 Make Donation" - Navigate to /donate
- "🏆 View Leaderboard" - Navigate to /leaderboard

### Success Toasts
- "Dashboard data loaded successfully"

### Error Toasts
- "Failed to load dashboard data. Please check your connection."
- "Unable to fetch user statistics from blockchain."

### Loading States
- "Loading your impact data..."
- "Fetching network information..."

## Accessibility Checklist

### WCAG Contrast
- ✅ Primary text: 4.5:1 minimum (black on white)
- ✅ Secondary text: 4.5:1 minimum (gray-600 on white)
- ✅ Interactive elements: 3:1 minimum for non-text
- ✅ Charts: Colorblind-friendly palette with patterns

### Keyboard Navigation
- ✅ Tab order: Header → Stats cards → Chart → Network status → Quick actions
- ✅ Enter/Space: Activate quick action buttons
- ✅ Arrow keys: Navigate chart data points (if interactive)
- ✅ Skip links: "Skip to main content", "Skip to navigation"

### ARIA Labels
- ✅ Chart: `role="img" aria-label="Token growth chart showing balance over time"`
- ✅ Stats cards: `aria-labelledby` pointing to headings
- ✅ Network status: `aria-live="polite"` for dynamic updates
- ✅ Progress indicators: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

### Screen Reader Support
- ✅ Semantic HTML: `<main>`, `<section>`, `<article>`
- ✅ Alt text: For all icons and images
- ✅ Live regions: For loading states and dynamic content
- ✅ Focus management: Proper focus indicators (2px solid outline)

### Mobile Accessibility
- ✅ Touch targets: Minimum 44px height/width
- ✅ Swipe gestures: Chart pan/zoom if implemented
- ✅ VoiceOver/TalkBack: Proper rotor navigation

## Acceptance Criteria

### Functional Requirements
- [ ] Page loads within 3 seconds on fast connection
- [ ] All contract calls complete without errors
- [ ] Chart renders correctly with real data
- [ ] Network status updates in real-time
- [ ] Quick actions navigate to correct pages
- [ ] Responsive design works on all screen sizes

### User Experience
- [ ] Clear visual hierarchy with impact stats prominent
- [ ] Intuitive navigation to other sections
- [ ] Helpful tooltips on hover/focus
- [ ] Loading states prevent user confusion
- [ ] Error states provide clear recovery paths

### Performance
- [ ] Bundle size < 500KB (lazy load chart library)
- [ ] First contentful paint < 2 seconds
- [ ] Contract calls cached for 30 seconds
- [ ] Smooth animations (60fps)

## Automated Test Ideas

### Unit Tests
- `Dashboard.test.tsx`
  - Renders loading state initially
  - Displays balance after data load
  - Shows error state on contract failure
  - Calculates CO2 offset correctly
  - Handles wallet disconnection

- `useDashboardData.test.js`
  - Mocks contract calls
  - Tests data transformation
  - Error handling scenarios
  - Loading state management

### E2E Tests (Playwright)
- `dashboard.spec.ts`
  - Navigate to /dashboard when connected
  - Verify all stats display correctly
  - Test chart interactions
  - Check quick action navigation
  - Validate responsive design
  - Test network status updates

### Visual Regression
- Percy/Chromium screenshots
- Desktop and mobile breakpoints
- Loading and error states
- Chart rendering consistency

## Developer Notes

### Environment Flags
- No specific flags affect dashboard directly
- VITE_DONATION_POOL_ADDRESS: Controls donate quick action visibility

### File Limits
- N/A (no uploads on dashboard)

### Expected Proxy Responses
- N/A (read-only page)

### Minimal ABI Guidance
```typescript
// GreenCreditToken ABI fragment
const tokenAbi = [
  "function balanceOf(address) view returns (uint256)"
];

// EcoActionVerifier ABI fragment
const verifierAbi = [
  "function getActionCount() view returns (uint256)",
  "function actions(uint256) view returns (tuple(address user, string description, string proofCid, uint256 reward, bool verified, uint256 timestamp, uint8 status, bytes32 methodologyId, bytes32 projectId, bytes32 baselineId, uint256 quantity, uint256 uncertaintyBps, uint256 durabilityYears, string metadataCid, bytes32 attestationUID))"
];
```

### Implementation Notes
- Use `react-query` for data fetching and caching
- Lazy load `recharts` for bundle optimization
- Implement proper error boundaries
- Add skeleton loading components
- Use CSS Grid for responsive layout
- Consider virtual scrolling for large datasets (future)
