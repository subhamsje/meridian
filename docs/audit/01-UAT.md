---
status: testing
phase: 01-workstation
source: [docs/audit/UI-REVIEW.md, docs/architecture/FRONTEND_ARCHITECTURE.md]
started: 2026-11-25T21:02:00Z
updated: 2026-11-25T21:04:45Z
---

## Current Test

number: 3
name: Institutional Workstation Demo Onboarding (/app)
expected: |
  Opening /app presents the authentication view. Clicking "Launch Flagship Demo" or using the Lead Analyst demo credentials authenticates successfully, persists the session token in localStorage, and loads the active institutional investigation workspace with the sidebar roster.
awaiting: user response

## Tests

### 1. Executive Landing Page & Architecture Preview Switcher
expected: Visiting (/) renders the executive masthead without overflow. Clicking preview tabs ("Knowledge Graph", "Adversarial Debate", "Valuation Engine", "Claim Provenance") updates the view with accessible tab indicators.
result: pass

### 2. Standalone Flagship Demo Dossier (/demo)
expected: Navigating to /demo or clicking "Launch Flagship Demo" renders NVIDIA Corporation's 19-section audited memorandum, including Monte Carlo stress-testing grids, supply chain chokepoint graph, and cryptographic SHA-256 provenance badges.
result: pass

### 3. Institutional Workstation Demo Onboarding (/app)
expected: Opening /app and clicking "Launch Flagship Demo" or using one-click credentials auto-authenticates without error and loads the active institutional investigation workspace.
result: [pending]

### 4. Mobile & Tablet Navigation Drawer
expected: Resizing viewport to tablet/mobile (< 1024px) reveals the hamburger menu. Tapping opens the slide-over sidebar with accessible "New" and "Close" buttons (`aria-label`), and tapping close dismisses the drawer cleanly.
result: [pending]

### 5. Adversarial Debate View & Mobile Segmented Control
expected: In the Workstation Debate tab on mobile, the segmented switcher between "Live Debate" and "Specialists" renders with distinct background contrast (white active pill on stone container) rather than blending into the container.
result: [pending]

## Summary

total: 5
passed: 2
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps

<!-- YAML format for plan-phase --gaps consumption -->
