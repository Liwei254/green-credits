# TODO: Implement DAO Governance System

## Overview
Replace single-owner governance with decentralized DAO using Gnosis Safe multisig and Snapshot voting.

## Steps to Complete

### Phase 1: Infrastructure Setup
- [ ] Create Gnosis Safe multisig wallet on Moonbase Alpha testnet
- [ ] Fund the Safe with DEV tokens for gas and operations
- [ ] Create Snapshot space for off-chain voting
- [ ] Draft and publish test proposal on Snapshot

### Phase 2: Documentation & Planning
- [ ] Document current owner private keys and transfer plan
- [ ] Create docs/GOVERNANCE_EXECUTION.md with governance processes
- [ ] Create calldata helper script for proposal generation
- [ ] Add FAQ section explaining DAO governance

### Phase 3: Frontend Implementation
- [ ] Add Governance page to frontend with proposal creation/voting
- [ ] Create three proposal templates:
  - Parameter change proposal
  - Verifier management proposal
  - NGO approval proposal
- [ ] Update Admin UI with Governance links and navigation
- [ ] Deploy updated frontend to testnet

### Phase 4: Testing & Execution
- [ ] Run dry-run proposal simulation
- [ ] Execute test proposal via Gnosis Safe
- [ ] Verify proposal execution on-chain
- [ ] Test governance flows end-to-end

### Phase 5: Security & Finalization
- [ ] Secure repository (remove any hardcoded secrets/keys)
- [ ] Update deployment scripts for DAO ownership transfer
- [ ] Document emergency procedures and backup plans
- [ ] Create governance monitoring dashboard
