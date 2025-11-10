# Leaderboard Page Specifications (/leaderboard)

## Overview
The leaderboard showcases top contributors by GCT earnings, with virtualized lists for performance. Includes shareable deep links and filtering options.

## Low-Fidelity Wireframe (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: 🏆 Leaderboard                                      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Rank │ Contributor │ GCT Earned                         │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │  1   │ 🥇 0x1234... │ 1,250.50                          │ │
│ │  2   │ 🥈 0x5678... │ 980.25                            │ │
│ │  3   │ 🥉 0x9abc... │ 750.00                            │ │
│ │  4   │     0xabcd... │ 620.75                            │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 Your Rank: 42nd                                      │ │
│ │ 🎯 Share your achievement!                              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## High-Fidelity Mockup (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ 🏆 Leaderboard                                             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Top Contributors                                        │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🥇 1st Place                                        │ │ │
│ │ │ ┌─────────────────────────────────────────────────┐ │ │ │
│ │ │ │ 👤 0x742d35Cc6634C0532925a3b844Bc454e4438f44e   │ │ │ │
│ │ │ │ 🌟 1,250.50 GCT                                  │ │ │ │
│ │ │ │ ✅ 47 verified actions                            │ │ │ │
│ │ │ └─────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🥈 2nd Place                                        │ │ │
│ │ │ [Similar layout]                                    │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🥉 3rd Place                                        │ │ │
│ │ │ [Similar layout]                                    │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 4th Place                                           │ │ │
│ │ │ [Compact layout for 4th+]                           │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 Your Performance                                     │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Your Rank: 42nd of 1,247                             │ │ │
│ │ │ 🌟 89.50 GCT earned                                  │ │ │
│ │ │ ✅ 12 verified actions                               │ │ │
│ │ │ 📈 +15% vs last month                                │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🎯 Share Achievement                                 │ │ │
│ │ │ ┌─────────────────────────────────────────────────┐ │ │ │
│ │ │ │ Copy Link: /leaderboard?highlight=youraddress   │ │ │ │
│ │ │ │ [Copy] [Share on Twitter]                         │ │ │ │
│ │ │ └─────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏅 Recent Milestones                                    │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🎉 First 100 GCT: 0x1234... (2 days ago)            │ │ │
│ │ │ 🏆 Top 10: 0x5678... (1 week ago)                    │ │ │
│ │ │ 🌟 50+ Actions: 0x9abc... (3 days ago)              │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## High-Fidelity Mockup (Mobile)

```
┌─────────────────────┐
│ 🏆 Leaderboard      │
├─────────────────────┤
│ 🥇 1st              │
│ 0x742d...f44e       │
│ 1,250.50 GCT        │
│ 47 actions          │
├─────────────────────┤
│ 🥈 2nd              │
│ 0x8ba1...a72        │
│ 980.25 GCT          │
│ 38 actions          │
├─────────────────────┤
│ 🥉 3rd              │
│ 0x1234...890        │
│ 750.00 GCT          │
│ 29 actions          │
├─────────────────────┤
│ 4th 620.75 GCT      │
│ 5th 580.00 GCT      │
│ 6th 540.25 GCT      │
├─────────────────────┤
│ 📊 Your Rank        │
│ 42nd of 1,247       │
│ 89.50 GCT           │
│ +15% this month     │
├─────────────────────┤
│ 🎯 Share            │
│ [Copy Link]         │
└─────────────────────┘
```

## Interaction Specification

### On-Chain/Network Flows

1. **Data Loading**
   - Call `verifier.getActionCount()` for total actions
   - Iterate through actions to aggregate rewards by user
   - Calculate rankings and statistics
   - Load user-specific data for "Your Performance" section

2. **Ranking Calculation**
   - Sum rewards for verified actions per user
   - Sort by total GCT earned (descending)
   - Handle ties by earliest first action
   - Update rankings in real-time

3. **Deep Linking**
   - URL parameter `?highlight=address` to highlight specific user
   - Scroll to highlighted user on load
   - Shareable links for social media

4. **Performance Tracking**
   - Calculate user's rank among all contributors
   - Show comparison metrics (vs last month)
   - Track personal milestones and achievements

### Transaction Lifecycle
- Read-only page, no transactions
- Links may reference transaction explorers

### Error Handling
- Contract call failures: Show error toast with retry
- Network issues: Cached data with offline indicator
- Invalid addresses: Graceful fallback display

## Microcopy

### CTAs
- "🔄 Refresh Rankings" - Reload leaderboard data
- "📋 Copy Link" - Copy shareable deep link
- "🐦 Share on Twitter" - Open Twitter share dialog
- "🏆 View Your Profile" - Navigate to user profile (future)

### Status Messages
- "🥇 1st Place"
- "🥈 2nd Place"
- "🥉 3rd Place"
- "📊 Your Rank: {rank} of {total}"

### Achievement Messages
- "🎉 First 100 GCT earned!"
- "🏆 Reached top 10!"
- "🌟 50+ verified actions!"

### Loading States
- "Loading leaderboard..."
- "Calculating rankings..."
- "Fetching your stats..."

### Error Messages
- "Failed to load leaderboard. Please try again."
- "Unable to calculate rankings."

## Accessibility Checklist

### WCAG Contrast
- ✅ Rank badges: 4.5:1 minimum
- ✅ User addresses: 4.5:1 minimum
- ✅ Highlighted rows: 3:1 minimum contrast difference
- ✅ Achievement badges: 4.5:1 minimum

### Keyboard Navigation
- ✅ Tab: Navigate through leaderboard entries
- ✅ Enter: Expand/collapse detailed views
- ✅ Arrow keys: Scroll through virtualized list
- ✅ Home/End: Jump to top/bottom of list

### ARIA Labels
- ✅ Leaderboard: `role="table" aria-label="Top contributors leaderboard"`
- ✅ Rows: `role="row"`
- ✅ Cells: `role="cell"`
- ✅ Rank badges: `aria-label="Rank {number}"`
- ✅ Highlighted user: `aria-current="true"`

### Screen Reader Support
- ✅ Announcements: "Leaderboard with {count} contributors"
- ✅ Row reading: "Rank 1, address 0x742d..., 1250.50 GCT earned, 47 actions verified"
- ✅ Updates: Live region for rank changes
- ✅ Links: Descriptive link text

### Mobile Accessibility
- ✅ Touch targets: 44px minimum for interactive elements
- ✅ Swipe: Horizontal scroll for wide content
- ✅ Pull to refresh: Standard gesture
- ✅ VoiceOver: Proper table navigation

## Acceptance Criteria

### Functional Requirements
- [ ] Loads top 10 contributors by default
- [ ] Virtualized scrolling for performance
- [ ] Real-time rank calculations
- [ ] Deep linking with highlight parameter
- [ ] Shareable links work correctly
- [ ] Personal stats display accurately

### Performance
- [ ] Initial load < 2 seconds
- [ ] Smooth scrolling 60fps
- [ ] Memory efficient with 1000+ users
- [ ] Cached data for offline viewing

### User Experience
- [ ] Clear visual hierarchy (1st, 2nd, 3rd special treatment)
- [ ] Intuitive share functionality
- [ ] Helpful tooltips and explanations
- [ ] Responsive design works on all devices

### Accessibility
- [ ] Screen reader compatible table structure
- [ ] Keyboard navigable
- [ ] High contrast support
- [ ] Mobile gesture support

## Automated Test Ideas

### Unit Tests
- `Leaderboard.test.tsx`
  - Renders top contributors correctly
  - Handles user highlighting
  - Calculates ranks accurately
  - Error state handling

- `leaderboardUtils.test.js`
  - Ranking algorithm
  - Data aggregation logic
  - Deep link parsing
  - Share URL generation

### E2E Tests (Playwright)
- `leaderboard.spec.ts`
  - Load leaderboard page
  - Verify top 10 display
  - Test deep linking with highlight
  - Check share functionality
  - Validate virtual scrolling
  - Test responsive design

### Performance Tests
- `leaderboard-performance.spec.ts`
  - Load time with 1000 users
  - Scroll performance metrics
  - Memory usage over time
  - Deep link navigation speed

## Developer Notes

### Environment Flags
- No specific flags affect leaderboard directly
- All features available regardless of environment

### File Limits
- N/A (read-only page)

### Expected Proxy Responses
- N/A (read-only page)

### Minimal ABI Guidance
```typescript
// EcoActionVerifier ABI fragment
const verifierAbi = [
  "function getActionCount() view returns (uint256)",
  "function actions(uint256) view returns (tuple(address user, string description, string proofCid, uint256 reward, bool verified, uint256 timestamp, uint8 status, bytes32 methodologyId, bytes32 projectId, bytes32 baselineId, uint256 quantity, uint256 uncertaintyBps, uint256 durabilityYears, string metadataCid, bytes32 attestationUID))"
];
```

### Implementation Notes
- Use `react-window` for virtualized list
- Implement ranking cache with invalidation
- Add progressive loading for large leaderboards
- Consider leaderboard API for scaling (future)
- Add gamification elements (badges, streaks)
- Implement leaderboard tournaments (future)
- Add export functionality for top contributors
