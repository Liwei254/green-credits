# Retirement Page Specifications (/retirement)

## Overview
The retirement page allows users to permanently retire verified carbon credits, selecting actions and specifying beneficiaries with type-to-confirm safety measures.

## Low-Fidelity Wireframe (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: 🏆 Retire Credits                                  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Select Actions to Retire                                │ │
│ │ [Action 1] [checkbox]                                   │ │
│ │ [Action 2] [checkbox]                                   │ │
│ │ [Retire Button]                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Retirement Details                                      │ │
│ │ Reason: [textarea]                                      │ │
│ │ Beneficiary: [input]                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## High-Fidelity Mockup (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ 🏆 Retire Credits                                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Select Actions to Retire                                │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Action #1234                                         │ │ │
│ │ │ 🌱 Planted 5 trees in local park                     │ │ │
│ │ │ ├──────────────────────────────────────────────────┤ │ │ │
│ │ │ │ □ Select for retirement                            │ │ │ │
│ │ │ │ Grams to retire: [Input] 500000                    │ │ │ │
│ │ │ │ = 0.5 tons CO2e                                    │ │ │ │
│ │ │ └──────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Action #1233                                         │ │ │
│ │ │ 🌱 Organized community clean-up                      │ │ │
│ │ │ ├──────────────────────────────────────────────────┤ │ │ │
│ │ │ │ □ Select for retirement                            │ │ │ │
│ │ │ │ Grams to retire: [Input] 250000                    │ │ │ │
│ │ │ │ = 0.25 tons CO2e                                   │ │ │ │
│ │ │ └──────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Retirement Details                                      │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Reason for Retirement *                               │ │ │
│ │ │ [Textarea] Carbon offset for company operations 2024 │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Beneficiary *                                         │ │ │
│ │ │ [Input] Acme Corp                                     │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Total to Retire: 0.75 tons CO2e                      │ │ │
│ │ │ (750,000 grams)                                      │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🏆 Retire Credits                                     │ │ │
│ │ │ ⚠️ This action cannot be undone                      │ │ │
│ │ │ Estimated gas: 0.00234 ETH (25 gwei)                 │ │ │
│ │ │ [Retire Credits]                                      │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Last Retirement: Serial #ABC123                         │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📜 My Retirements                                       │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Serial: ABC123                                       │ │ │
│ │ │ Actions: #1234, #1233                                │ │ │
│ │ │ Total: 0.75 tons                                     │ │ │
│ │ │ Date: 2024-01-15                                     │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## High-Fidelity Mockup (Mobile)

```
┌─────────────────────┐
│ 🏆 Retire Credits    │
├─────────────────────┤
│ Select Actions      │
│ Action #1234        │
│ 🌱 Planted trees    │
│ □ Select            │
│ Grams: 500000       │
│ = 0.5 tons          │
├─────────────────────┤
│ Action #1233        │
│ 🌱 Clean-up event   │
│ □ Select            │
│ Grams: 250000       │
│ = 0.25 tons         │
├─────────────────────┤
│ Retirement Details  │
│ Reason:             │
│ [Textarea]          │
│ Beneficiary:        │
│ [Input]             │
│ Total: 0.75 tons    │
├─────────────────────┤
│ 🏆 Retire           │
│ ⚠️ Cannot undo      │
│ Gas: 0.00234 ETH    │
│ [Retire]            │
├─────────────────────┤
│ Last: Serial ABC123 │
├─────────────────────┤
│ 📜 My History       │
│ ABC123: 0.75 tons   │
│ 2024-01-15          │
└─────────────────────┘
```

## Interaction Specification

### On-Chain/Network Flows

1. **Action Selection**
   - Load user's finalized actions
   - Allow quantity specification per action
   - Calculate total retirement amount
   - Validate selections

2. **Retirement Execution**
   - Show type-to-confirm modal
   - Require typing "RETIRE" to confirm
   - Execute retirement transaction
   - Generate unique serial number

3. **Post-Retirement**
   - Display retirement receipt
   - Update action statuses
   - Add to retirement history

### Transaction Lifecycle
- Select Actions → Enter Details → Type Confirm → Transaction → Receipt

### Error Handling
- No actions selected
- Invalid quantities
- Missing beneficiary/reason
- Transaction failures

## Microcopy

### CTAs
- "🏆 Retire Credits" - Execute retirement
- "Type 'RETIRE' to confirm" - Safety confirmation
- "📄 View Receipt" - Show retirement details

### Confirmation Modal
- Title: "Confirm Credit Retirement"
- Warning: "This action permanently removes credits from circulation"
- Input: "Type 'RETIRE' to confirm"
- Button: "Retire Credits"

### Success Toasts
- "Credits retired successfully! Serial: {serial}"
- "Retirement receipt generated"

### Error Toasts
- "Please select at least one action"
- "Please provide reason and beneficiary"
- "Confirmation text must be 'RETIRE'"

### Loading States
- "Loading your actions..."
- "Retiring credits..."
- "Generating receipt..."

## Accessibility Checklist

### WCAG Contrast
- ✅ Checkboxes: 3:1 minimum
- ✅ Warning text: 4.5:1 minimum (red)
- ✅ Confirmation modal: 4.5:1 minimum

### Keyboard Navigation
- ✅ Tab: Action selection → Quantity inputs → Details → Retire
- ✅ Space: Toggle checkboxes
- ✅ Enter: Submit forms
- ✅ Escape: Close modals

### ARIA Labels
- ✅ Checkboxes: `aria-describedby` for action details
- ✅ Quantity inputs: `aria-labelledby` action headings
- ✅ Confirmation: `aria-live="assertive"`
- ✅ Serial numbers: `aria-label="Retirement serial number"`

### Screen Reader Support
- ✅ Action selection: Clear announcements
- ✅ Quantity calculations: Live updates
- ✅ Confirmation modal: Focus management
- ✅ Retirement history: Structured lists

### Mobile Accessibility
- ✅ Touch targets: 44px minimum
- ✅ Swipe: Action list scrolling
- ✅ Text input: Mobile keyboards
- ✅ Modal focus: Proper trapping

## Acceptance Criteria

### Functional Requirements
- [ ] Only finalized actions shown
- [ ] Quantity validation per action
- [ ] Type-to-confirm safety measure
- [ ] Unique serial number generation
- [ ] Retirement history tracking

### User Experience
- [ ] Clear action selection UI
- [ ] Helpful quantity guidance
- [ ] Strong irreversible action warnings
- [ ] Receipt generation and display

### Error Handling
- [ ] Selection validation
- [ ] Quantity limits checking
- [ ] Confirmation text validation
- [ ] Transaction error recovery

### Performance
- [ ] Action loading < 3 seconds
- [ ] Quantity calculation instant
- [ ] Transaction submission < 5 seconds

## Automated Test Ideas

### Unit Tests
- `Retirement.test.tsx`
  - Action selection logic
  - Quantity validation
  - Type-to-confirm validation
  - Serial number generation

### E2E Tests (Playwright)
- `retirement-flow.spec.ts`
  - Select actions and quantities
  - Fill retirement details
  - Type confirmation and submit
  - Verify receipt generation

### Visual Regression
- Action selection states
- Confirmation modal
- Retirement receipt

## Developer Notes

### Environment Flags
- No specific flags affect retirement

### File Limits
- N/A

### Expected Proxy Responses
- N/A

### Minimal ABI Guidance
```typescript
// RetirementRegistry ABI fragment
const retirementAbi = [
  "function retire(uint256[] actionIds, uint256[] grams, string reason, string beneficiary)",
  "function getRetirement(uint256 serial) view returns (tuple(uint256 serial, uint256[] actionIds, uint256[] grams, string reason, string beneficiary, uint256 timestamp))",
  "function getRetirementsByAccount(address account) view returns (uint256[])"
];
```

### Implementation Notes
- Implement type-to-confirm for safety
- Add retirement receipt PDF generation
- Consider retirement batching (future)
- Add retirement impact visualization
- Implement retirement verification (future)
