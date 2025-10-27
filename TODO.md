# TODO: Reorganize Top Section (Hero + Navbar) for Professional Layout

## Tasks
- [ ] Update `frontend/src/App.tsx`:
  - Change header background to theme-aware (bg-[var(--card-bg)]/80)
  - Restructure header: Top row logo+badge left, Connect Wallet right; Second row nav centered
  - Add sticky behavior (sticky top-0 z-50)
  - Remove mobile nav duplication; make nav always below on mobile
  - Adjust padding/spacing (16-24px vertical, 48-64px horizontal)
- [ ] Update `frontend/src/components/WalletConnect.tsx`:
  - Show pill badge when connected (truncated address + green checkmark)
  - Update button styles: green disconnected, emerald connected, red error
  - Add hover effects: scale-up + glow
- [ ] Update `frontend/src/index.css`:
  - Add theme-aware header styles (dark bg #0D1117)
  - Enhance nav link hover (underline/glow green)
  - Add shimmer animation for polkadot-badge on hover
  - Responsive adjustments (nav below on mobile)

## Followup Steps
- [ ] Run development server to test layout, responsiveness, dark mode
- [ ] Verify hover effects and sticky behavior
- [ ] Add scroll behavior or refinements if needed
