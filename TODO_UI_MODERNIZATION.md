# UI/UX Modernization Plan - Align Internal Pages with Landing Page Design

## Overview
Transform all internal pages from light theme to dark theme with glassmorphism effects, green accents, and modern animations to match the landing page aesthetic.

## Current Status
- Landing page: ✅ Dark theme with glassmorphism, green accents, animations
- Internal pages: ❌ Light theme with traditional cards

## Pages to Modernize

### 1. Dashboard Page ✅
- [ ] Update background to dark theme
- [ ] Apply glassmorphism to stat cards
- [ ] Add animated icons with rotation effects
- [ ] Enhance chart visualizations with green accents
- [ ] Modernize network status section
- [ ] Update quick action buttons with hover scale effects
- [ ] Add motion animations for page load

### 2. Submit Action Page ✅
- [ ] Transform background to dark theme
- [ ] Redesign form cards with glass effect
- [ ] Update file upload area with better visual feedback
- [ ] Style form inputs with dark backgrounds and green focus
- [ ] Enhance advanced options section with collapsible glass design
- [ ] Improve progress indicators and gas estimation displays
- [ ] Add smooth transitions and micro-interactions

### 3. Actions List Page ✅
- [ ] Apply dark background with glassmorphic card containers
- [ ] Update action cards with hover effects and smooth transitions
- [ ] Enhance status badges with modern styling and animations
- [ ] Improve filter tabs with glass effect background
- [ ] Add loading skeleton animations
- [ ] Style verifier information sections with accent colors
- [ ] Modernize carbon credit details display

### 4. Leaderboard Page ✅
- [ ] Implement dark theme with gradient background
- [ ] Redesign leaderboard cards with glassmorphism and depth
- [ ] Enhance rank badges with animated gradients and glow effects
- [ ] Update timeframe filters with modern toggle design
- [ ] Add podium-style visual treatment for top three contributors
- [ ] Improve empty state with engaging visuals
- [ ] Integrate smooth fade-in animations for list items

### 5. Donate Page ✅
- [ ] Convert to dark theme with glass effect containers
- [ ] Modernize NGO impact cards with hover animations
- [ ] Redesign donation form with dark inputs and green accents
- [ ] Enhance modal dialogs with glassmorphic styling
- [ ] Update transaction stepper with modern progress indicators
- [ ] Improve gas estimation display with visual hierarchy
- [ ] Add smooth transitions between form states and modals

### 6. Registry Page (Admin) ✅
- [ ] Apply consistent dark theme across admin interface
- [ ] Redesign methodology and baseline registry forms with glass cards
- [ ] Update form inputs to match design system
- [ ] Enhance submit buttons with hover effects and loading states
- [ ] Improve section headers with better visual hierarchy
- [ ] Add subtle animations for form interactions
- [ ] Style help text and labels with appropriate contrast

### 7. Reputation Page (Admin) ✅
- [ ] Transform admin interface to dark glassmorphic design
- [ ] Redesign badge management cards with improved spacing
- [ ] Update form inputs with dark theme styling
- [ ] Enhance action buttons with hover states and animations
- [ ] Improve info sections with color-coded backgrounds
- [ ] Add visual feedback for loading and success states
- [ ] Modernize ownership warning with styled alert components

### 8. Retirement Page ✅
- [ ] Implement dark theme background with gradient effects
- [ ] Redesign action selection cards with glassmorphism
- [ ] Update checkbox interactions with smooth animations
- [ ] Enhance retirement details form with modern styling
- [ ] Improve sidebar cards with glass effect and better hierarchy
- [ ] Modernize retirement history display with timeline aesthetics
- [ ] Add smooth transitions for card selections and form interactions

## Global Component Updates ✅
- [ ] Update all page headers to use consistent gradient text effects
- [ ] Standardize button styles across all pages with hover animations
- [ ] Ensure all cards use the same glass effect and border styling
- [ ] Apply consistent color palette for success, warning, error states
- [ ] Implement uniform loading states and skeleton screens
- [ ] Add page transition animations similar to landing page
- [ ] Ensure all typography follows landing page font hierarchy

## Implementation Strategy
1. Update design-system.css with enhanced dark theme variables
2. Modify PageLayout component to use dark background by default
3. Update each page component systematically
4. Test all pages for visual consistency
5. Add smooth transitions and animations

## Files to Modify
- frontend/src/styles/design-system.css
- frontend/src/components/PageLayout.tsx
- frontend/src/pages/Dashboard.tsx
- frontend/src/components/ActionForm.tsx
- frontend/src/components/ActionsList.tsx
- frontend/src/components/Leaderboard.tsx
- frontend/src/components/Donate.tsx
- frontend/src/components/AdminRegistry.tsx
- frontend/src/components/AdminReputation.tsx
- frontend/src/pages/Retirement.tsx
- All other internal page components

## Testing
- [ ] Visual consistency across all pages
- [ ] Dark theme applied correctly
- [ ] Glassmorphism effects working
- [ ] Green accent colors consistent
- [ ] Animations and transitions smooth
- [ ] Accessibility maintained
- [ ] Mobile responsiveness preserved
