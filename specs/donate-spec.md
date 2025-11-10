# Donate Page Specifications (/donate)

## Overview
The donate page enables users to contribute GCT tokens to verified NGOs through a two-step approve+donate flow with gas estimates and transaction lifecycle visualization.

## Low-Fidelity Wireframe (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: 💚 Donate to Causes                                │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ NGO List                                                │ │
│ │ [NGO 1] 1250.5 GCT received                             │ │
│ │ [NGO 2] 890.2 GCT received                              │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Donation Form                                           │ │
│ │ NGO Address: [input]                                    │ │
│ │ Amount: [input] GCT                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Step 1: Approve                                         │ │
│ │ [Approve Button]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Step 2: Donate                                          │ │
│ │ [Donate Button]                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## High-Fidelity Mockup (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ 💚 Donate to Causes                                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ How Your Donations Help                                  │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🌍 Green Earth Foundation                           │ │ │
│ │ │ 0x742d35Cc6634C0532925a3b844Bc454e4438f44e          │ │ │
│ │ │ 💰 1,250.50 GCT received                            │ │ │
│ │ │ 🌱 Reforestation projects worldwide                  │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🌊 Ocean Cleanup Initiative                         │ │ │
│ │ │ 0x8ba1f109551bD432803012645ac136ddd64DBA72          │ │ │
│ │ │ 💰 890.20 GCT received                              │ │ │
│ │ │ 🧹 Removing plastic from oceans                     │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💝 Make a Donation                                      │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🏢 NGO Address *                                     │ │ │
│ │ │ [Input] 0x1234...abcd                                │ │ │
│ │ │ Must be an allowlisted NGO address                   │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 💰 Amount to Donate *                                │ │ │
│ │ │ [Input] 5.00                                         │ │ │
│ │ │ GCT tokens                                           │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 💚 Donate                                            │ │ │
│ │ │ Estimated gas: 0.00123 ETH (23 gwei)                │ │ │
│ │ │ [Donate]                                             │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 Transaction Progress                                 │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Step 1: Approve Token Transfer                       │ │ │
│ │ │ ⏳ Pending...                                        │ │ │
│ │ │ Gas: 0.0008 ETH                                      │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Step 2: Complete Donation                            │ │ │
│ │ │ ⏸️ Waiting...                                        │ │ │
│ │ │ Gas: 0.00043 ETH                                     │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## High-Fidelity Mockup (Mobile)

```
┌─────────────────────┐
│ 💚 Donate           │
├─────────────────────┤
│ 🌍 NGO List         │
│ Green Earth         │
│ 1,250.50 GCT        │
│ 🌊 Ocean Cleanup    │
│ 890.20 GCT          │
├─────────────────────┤
│ 💝 Donate           │
│ NGO Address:        │
│ [Input]             │
│ Amount: 5.00 GCT    │
│ [Input]             │
├─────────────────────┤
│ 💚 Donate           │
│ Gas: 0.00123 ETH    │
│ [Donate]            │
├─────────────────────┤
│ 📊 Progress         │
│ 1. Approve ⏳       │
│ 2. Donate ⏸️        │
└─────────────────────┘
```

## Interaction Specification

### On-Chain/Network Flows

1. **Form Validation**
   - NGO address required and must be allowlisted
   - Amount must be positive number > 0
   - Check `pool.isNGO(ngoAddress)` for validation

2. **Gas Estimation**
   - Call `token.approve.estimateGas(poolAddress, amount)`
   - Call `pool.donateTo.estimateGas(ngoAddress, amount)`
   - Display total estimated cost before proceeding

3. **Approval Step**
   - Show confirmation modal with gas estimate
   - Execute `token.approve(poolAddress, amount)`
   - Wait for confirmation, show pending state
   - On success: Enable donate step, show success toast

4. **Donation Step**
   - Show confirmation modal with gas estimate
   - Execute `pool.donateTo(ngoAddress, amount)`
   - Wait for confirmation, show pending state
   - On success: Reset form, show success toast

5. **Error Handling**
   - Invalid NGO: "NGO address is not allowlisted"
   - Insufficient balance: "Insufficient GCT balance"
   - Transaction failure: Show error with retry option

### Transaction Lifecycle
```
Form Valid → Gas Estimate → Approval Modal → Approve Tx → Pending → Confirmed → Donation Modal → Donate Tx → Pending → Confirmed → Success
     ↓             ↓              ↓                ↓         ↓         ↓           ↓              ↓         ↓         ↓         ↓
  Error      Estimate Error    Cancel          Tx Error  Timeout   Confirm     Cancel        Tx Error  Timeout   Confirm   Toast
```

### Multi-Step Flow Visualization
- Stepper component showing current step
- Visual progress indicators (pending, confirmed, error)
- Gas estimates for each step
- Clear next action buttons

## Microcopy

### CTAs
- "💚 Donate" - Start donation flow
- "✅ Approve" - Confirm token approval
- "💝 Complete Donation" - Confirm final donation
- "🔄 Retry" - Retry failed transaction
- "❌ Cancel" - Cancel current flow

### Modal Titles
- "Step 1: Approve Token Transfer"
- "Step 2: Complete Donation"

### Modal Content
- "Allow the donation pool to spend {amount} GCT tokens on your behalf."
- "Send {amount} GCT tokens to the NGO."

### Success Toasts
- "Approval granted successfully!"
- "Donation sent successfully!"
- "Transaction confirmed: {txHash}"

### Error Toasts
- "Please fill in NGO address and amount"
- "NGO address is not allowlisted"
- "Insufficient GCT balance"
- "Transaction failed: {error}"

### Loading States
- "Estimating gas costs..."
- "Approving token transfer..."
- "Sending donation..."
- "Waiting for confirmation..."

## Accessibility Checklist

### WCAG Contrast
- ✅ Form labels: 4.5:1 minimum
- ✅ Step indicators: 3:1 minimum
- ✅ Progress states: 4.5:1 minimum
- ✅ Error messages: 4.5:1 minimum (red)

### Keyboard Navigation
- ✅ Tab order: NGO input → Amount input → Donate button → Modal buttons
- ✅ Enter: Submit forms and modals
- ✅ Escape: Close modals
- ✅ Arrow keys: Navigate stepper (if interactive)

### ARIA Labels
- ✅ Stepper: `role="progressbar" aria-valuenow="1" aria-valuemax="2"`
- ✅ Gas estimates: `aria-live="polite"`
- ✅ Transaction status: `aria-live="assertive"`
- ✅ Form validation: `aria-invalid`, `aria-describedby`

### Screen Reader Support
- ✅ Step announcements: "Step 1 of 2: Approve token transfer"
- ✅ Progress updates: "Approval pending... Confirmed"
- ✅ Form errors: Announced immediately
- ✅ Transaction links: Descriptive text

### Mobile Accessibility
- ✅ Touch targets: 44px minimum
- ✅ Modal overlays: Proper focus trapping
- ✅ Swipe: Stepper navigation
- ✅ VoiceOver: Clear step progression

## Acceptance Criteria

### Functional Requirements
- [ ] NGO allowlist validation works
- [ ] Two-step flow prevents accidental donations
- [ ] Gas estimates accurate and displayed
- [ ] Transaction lifecycle clearly visualized
- [ ] Form resets after successful donation
- [ ] VITE_DONATION_POOL_ADDRESS hides page when unset

### User Experience
- [ ] Clear step-by-step process
- [ ] Helpful gas cost information
- [ ] Intuitive progress indicators
- [ ] Error recovery paths
- [ ] Mobile-optimized flow

### Error Handling
- [ ] Invalid NGO addresses caught
- [ ] Insufficient balance detected
- [ ] Network errors handled gracefully
- [ ] Transaction failures provide retry

### Performance
- [ ] Gas estimation < 2 seconds
- [ ] Form validation instant
- [ ] Transaction submission < 5 seconds
- [ ] Memory efficient with multiple modals

## Automated Test Ideas

### Unit Tests
- `Donate.test.tsx`
  - Form validation logic
  - NGO allowlist checking
  - Gas estimation mocking
  - Stepper state management

- `donationFlow.test.js`
  - Approval transaction handling
  - Donation transaction handling
  - Error state recovery
  - Form reset logic

### E2E Tests (Playwright)
- `donate-flow.spec.ts`
  - Fill donation form
  - Complete approval step
  - Complete donation step
  - Verify success flow
  - Test error scenarios

- `donate-validation.spec.ts`
  - Invalid NGO address rejection
  - Insufficient balance handling
  - Form validation messages
  - Gas estimation display

### Visual Regression
- Stepper states: Initial, approval pending, donation pending, complete
- Modal states: Approval confirm, donation confirm
- Error states: Validation errors, transaction failures

## Developer Notes

### Environment Flags
- `VITE_DONATION_POOL_ADDRESS`: Required for page to be accessible; hides donate page if unset

### File Limits
- N/A (no file uploads)

### Expected Proxy Responses
- N/A (no proxy interactions)

### Minimal ABI Guidance
```typescript
// GreenCreditToken ABI fragment
const tokenAbi = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)"
];

// DonationPool ABI fragment
const poolAbi = [
  "function donateTo(address ngo, uint256 amount)",
  "function isNGO(address) view returns (bool)"
];
```

### Implementation Notes
- Use stepper component for multi-step flow
- Implement optimistic UI updates
- Add donation history tracking
- Consider ERC-2612 permit for gasless approvals (future)
- Add donation impact visualization
- Implement recurring donations (future)
- Add donation receipt generation
