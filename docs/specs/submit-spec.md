# Submit Page Specifications (/submit)

## Overview
The submit page allows users to create and submit eco-actions with optional proof uploads. It supports both V1 and V2 action formats, with V2 including detailed carbon credit information.

## Low-Fidelity Wireframe (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: 🌱 Submit Eco-Action                               │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📝 Action Details                                       │ │
│ │ Description: [textarea]                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🌿 Carbon Credit Details                                │ │
│ │ Type: [dropdown]                                        │ │
│ │ Methodology: [input]                                    │ │
│ │ Project: [input]                                        │ │
│ │ Baseline: [input]                                       │ │
│ │ Quantity: [input] grams CO2e                            │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📸 Proof Upload                                         │ │
│ │ [Drag & drop area]                                      │ │
│ │ Progress: [0%]                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🌿 Submit Action                                        │ │
│ │ [Gas estimate: 0.001 ETH]                               │ │
│ │ [Submit button]                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## High-Fidelity Mockup (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ 🌱 Submit Eco-Action                                       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📝 Action Details                                       │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ What did you do? *                                   │ │ │
│ │ │ [Textarea - 120px height]                            │ │ │
│ │ │ Be specific so others can understand and verify...  │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🌿 Carbon Credit Details (V2)                           │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Credit Type *                                        │ │ │
│ │ │ □ Reduction □ Removal □ Avoidance                    │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Methodology *                                        │ │ │
│ │ │ [Input] e.g., Tree Planting v2.0                     │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Project Name *                                       │ │ │
│ │ │ [Input] e.g., Local Park Restoration                 │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Baseline *                                           │ │ │
│ │ │ [Input] e.g., Standard Urban Baseline                │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Impact Amount *                                      │ │ │
│ │ │ [Input] grams CO2e                                   │ │ │
│ │ │ 1 ton = 1,000,000 grams                              │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ ⚙️ Advanced Options                                  │ │ │
│ │ │ ▶ Uncertainty (optional)                             │ │ │
│ │ │ ▶ Durability (years, for removals)                   │ │ │
│ │ │ ▶ Extra Data File (optional)                         │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📸 Proof & Submission                                   │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Photo Proof (optional)                               │ │ │
│ │ │ ┌─────────────────────────────────────────────────┐ │ │ │
│ │ │ │ [Drag & drop area]                               │ │ │ │
│ │ │ │ 📸 Drag & drop a photo here, or click to select │ │ │ │
│ │ │ │ PNG, JPEG, WebP up to 8MB                        │ │ │ │
│ │ │ └─────────────────────────────────────────────────┘ │ │ │
│ │ │ □ Keep proof private (encrypted)                    │ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🌿 Submit Action                                    │ │ │
│ │ │ Estimated gas: 0.00123 ETH (23 gwei)               │ │ │
│ │ │ [Submit Action]                                     │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## High-Fidelity Mockup (Mobile)

```
┌─────────────────────┐
│ 🌱 Submit Action    │
├─────────────────────┤
│ 📝 Action Details   │
│ What did you do? *  │
│ [Textarea]          │
├─────────────────────┤
│ 🌿 Carbon Credits   │
│ Type: Reduction ▼   │
│ Methodology:        │
│ [Input]             │
│ Project:            │
│ [Input]             │
│ Baseline:           │
│ [Input]             │
│ Quantity:           │
│ [Input] grams       │
│ ⚙️ Advanced ▼       │
├─────────────────────┤
│ 📸 Proof Upload     │
│ [Drag area]         │
│ 📸 Drop photo here  │
│ Max 8MB             │
│ □ Private           │
├─────────────────────┤
│ 🌿 Submit           │
│ Gas: 0.00123 ETH    │
│ [Submit]            │
└─────────────────────┘
```

## Interaction Specification

### On-Chain/Network Flows

1. **Form Validation**
   - Required fields: description, methodology, project, baseline, quantity
   - Quantity must be positive number
   - File size validation: ≤8MB frontend, proxy handles up to 10MB

2. **Upload Flow**
   - If VITE_UPLOAD_PROXY_URL set: POST to proxy with file
   - Proxy response: `{ cid, url }`
   - Fallback to Web3.Storage if proxy fails and VITE_WEB3_STORAGE_TOKEN set
   - Show progress bar during upload
   - Allow retry on failure

3. **Gas Estimation**
   - Before submit: Call `verifier.submitActionV2.estimateGas()`
   - Display estimated cost in ETH and gwei
   - Update on form changes

4. **Transaction Submission**
   - Show confirmation modal with gas estimate
   - Submit transaction: `verifier.submitActionV2(...)`
   - Display pending state with tx hash link
   - On confirm: Navigate to /actions, show success toast

5. **Error Handling**
   - Upload failures: Clear retry option
   - Transaction failures: Show error toast with details
   - Network issues: Suggest chain switch if not on Moonbase

### Transaction Lifecycle
```
Form Valid → Gas Estimate → Confirmation Modal → Submit Tx → Pending → Confirmed → Success Toast → Navigate
     ↓             ↓              ↓                ↓         ↓         ↓           ↓            ↓
  Error      Estimate Error    Cancel          Tx Error  Timeout   Confirm     Toast       /actions
```

### Upload Progress States
- Uploading proof... (0-50%)
- Processing... (50-70%)
- Submitting action... (70-100%)

## Microcopy

### CTAs
- "🌿 Submit Action" - Primary submit button
- "📸 Select Photo" - File input trigger
- "🔄 Retry Upload" - On upload failure
- "❌ Cancel" - Cancel submission

### Confirmation Modal
- Title: "Confirm Action Submission"
- Body: "Submit this eco-action to the blockchain?"
- Details: "Gas estimate: {amount} ETH"
- Buttons: "Cancel" | "Submit Action"

### Success Toasts
- "Action submitted successfully!"
- "Proof uploaded to IPFS: {cid}"
- "Transaction confirmed: {txHash}"

### Error Toasts
- "Description is required"
- "Valid quantity is required (grams CO2e)"
- "File size exceeds 8MB limit"
- "Upload failed. Please try again."
- "Transaction failed: {error}"
- "Network error. Please check connection."

### Loading States
- "Estimating gas costs..."
- "Uploading proof... ({progress}%)"
- "Submitting action..."
- "Waiting for confirmation..."

## Accessibility Checklist

### WCAG Contrast
- ✅ Form labels: 4.5:1 minimum
- ✅ Error messages: 4.5:1 minimum (red on white)
- ✅ Progress indicators: 3:1 minimum
- ✅ Drag & drop area: Clear visual feedback

### Keyboard Navigation
- ✅ Tab order: Description → Type → Methodology → Project → Baseline → Quantity → Advanced → File → Private → Submit
- ✅ Enter: Submit form
- ✅ Space: Toggle checkboxes, activate buttons
- ✅ Arrow keys: Navigate dropdowns
- ✅ Escape: Close modals, cancel uploads

### ARIA Labels
- ✅ File input: `aria-describedby="file-help"`
- ✅ Progress bar: `aria-valuenow`, `aria-valuemax`, `role="progressbar"`
- ✅ Drag area: `aria-label="Drag and drop proof file here"`
- ✅ Gas estimate: `aria-live="polite"`
- ✅ Form validation: `aria-invalid`, `aria-describedby`

### Screen Reader Support
- ✅ Field descriptions: Announced with labels
- ✅ Upload progress: Screen reader announcements
- ✅ Form errors: Announced immediately
- ✅ Modal dialogs: Proper focus management
- ✅ Transaction status: Live region updates

### Mobile Accessibility
- ✅ Touch targets: 44px minimum
- ✅ Drag & drop: Touch alternatives
- ✅ File picker: Native mobile picker
- ✅ Form zoom: Prevents zoom on focus

## Acceptance Criteria

### Functional Requirements
- [ ] Form validates all required fields
- [ ] File upload respects 8MB limit
- [ ] Gas estimation updates on form changes
- [ ] Transaction shows pending/confirmed states
- [ ] Success navigates to /actions
- [ ] VITE_VERIFIER_HAS_PROOF hides proof section when false

### Upload Experience
- [ ] Drag & drop works on desktop
- [ ] Progress bar shows accurate progress
- [ ] Retry works after upload failure
- [ ] Proxy fallback to Web3.Storage
- [ ] File preview shows before upload

### Error Handling
- [ ] Clear error messages for validation
- [ ] Upload failures provide retry option
- [ ] Transaction failures show helpful errors
- [ ] Network errors suggest chain switch

### Performance
- [ ] Form validation instant
- [ ] Gas estimation < 2 seconds
- [ ] Upload progress smooth (60fps)
- [ ] Transaction submission < 5 seconds

## Automated Test Ideas

### Unit Tests
- `ActionForm.test.tsx`
  - Form validation logic
  - File size validation
  - Gas estimation mocking
  - State management

- `uploadProof.test.js`
  - Proxy upload success/failure
  - Web3.Storage fallback
  - Progress callback
  - Error handling

### E2E Tests (Playwright)
- `submit-action.spec.ts`
  - Fill form and submit (with proof)
  - Fill form and submit (without proof)
  - Upload file >8MB (rejection)
  - Upload failure with retry
  - Transaction confirmation flow
  - Navigation after success

- `submit-validation.spec.ts`
  - Required field validation
  - Quantity validation
  - File type validation
  - Gas estimation display

### Visual Regression
- Form states: Empty, filled, error
- Upload states: Drag over, uploading, complete
- Modal states: Confirmation, pending, success

## Developer Notes

### Environment Flags
- `VITE_VERIFIER_HAS_PROOF`: If false, hide proof upload section and adjust ABI
- `VITE_UPLOAD_PROXY_URL`: Use for uploads if present
- `VITE_WEB3_STORAGE_TOKEN`: Fallback upload method

### File Limits
- Frontend limit: 8MB
- Proxy limit: 10MB (handled by proxy)
- Supported types: image/png, image/jpeg, image/webp

### Expected Proxy Responses
```json
// Success
{
  "cid": "bafkreiexample123...",
  "url": "https://w3s.link/ipfs/bafkreiexample123..."
}

// Error
{
  "error": "File too large",
  "maxSize": "10485760"
}
```

### Minimal ABI Guidance
```typescript
// EcoActionVerifier ABI fragment
const verifierAbi = [
  "function submitActionV2(string desc, string proofCid, uint8 creditType, bytes32 methodologyId, bytes32 projectId, bytes32 baselineId, uint256 quantity, uint256 uncertainty, uint256 durability, string metadataCid) returns (uint256)",
  "function submitAction(string desc, string proofCid) returns (uint256)"
];

// With proof flag check
const submitFunction = VITE_VERIFIER_HAS_PROOF 
  ? "submitActionV2" 
  : "submitAction";
```

### Implementation Notes
- Use `react-dropzone` for drag & drop
- Implement resumable uploads for large files
- Add form persistence (localStorage) for draft recovery
- Use `react-hook-form` for validation
- Implement optimistic UI updates
- Add upload queue for multiple files (future)
- Consider IPFS pinning services for persistence
