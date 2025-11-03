# Green Credits DAO Governance Execution Guide

## Overview
This document outlines the governance processes for the Green Credits platform, which uses a hybrid DAO approach combining Gnosis Safe multisig for execution with Snapshot for community voting.

## Governance Structure

### 1. Gnosis Safe Multisig
- **Purpose**: Secure execution of approved proposals
- **Threshold**: 2/3 majority required for execution
- **Signers**: Core team + community representatives
- **Network**: Moonbase Alpha (testnet) initially, Moonbeam (mainnet) eventually

### 2. Snapshot Voting
- **Purpose**: Community signaling and proposal approval
- **Voting Power**: Based on GCT token holdings
- **Quorum**: 10% of total token supply
- **Duration**: 7 days for proposal voting

### 3. Proposal Types

#### Type A: Parameter Changes
- Challenge window duration
- Stake requirements (submit/verify/challenge)
- Buffer percentages
- Reward multipliers

#### Type B: Role Management
- Adding/removing verifiers
- Adding/removing oracles
- NGO approval/rejection

#### Type C: System Upgrades
- Contract upgrades
- New feature deployment
- Protocol parameter changes

## Proposal Lifecycle

### Phase 1: Proposal Creation
1. **Draft Proposal**: Create detailed proposal with rationale, impact assessment, and implementation details
2. **Snapshot Vote**: Submit to Snapshot for community approval (7-day voting period)
3. **Quorum Check**: Must reach 10% participation quorum

### Phase 2: Execution Preparation
1. **Calldata Generation**: Use helper script to generate execution calldata
2. **Safe Transaction**: Create transaction in Gnosis Safe
3. **Multi-sig Approval**: Collect required signatures (2/3 threshold)

### Phase 3: Execution
1. **Dry Run**: Test execution on forked network
2. **Live Execution**: Execute via Gnosis Safe on mainnet
3. **Verification**: Confirm on-chain execution
4. **Communication**: Announce results to community

## Emergency Procedures

### Critical Issues
- **Immediate Threat**: Pause protocol via emergency multisig
- **Security Breach**: Execute emergency migration
- **Governance Attack**: Use backup multisig for recovery

### Emergency Multisig
- **Separate Safe**: Independent of main governance
- **Higher Threshold**: 3/4 majority required
- **Limited Scope**: Only emergency functions

## Helper Scripts

### Calldata Generation
```bash
# Generate calldata for parameter change
npm run governance:calldata -- --type parameter --function setConfig --params [...]

# Generate calldata for role management
npm run governance:calldata -- --type role --action addVerifier --address 0x...
```

### Proposal Validation
```bash
# Validate proposal before submission
npm run governance:validate -- --proposal-id 123
```

## FAQ

### Q: How do I create a proposal?
A: Draft your proposal following the templates, submit to Snapshot, and engage community for discussion.

### Q: What voting power do I have?
A: Voting power equals your GCT token balance at the proposal snapshot block.

### Q: How long does execution take?
A: Snapshot voting (7 days) + multisig approval (hours-days) + execution.

### Q: What happens if a proposal fails?
A: It can be resubmitted with modifications after community feedback.

### Q: Can anyone execute approved proposals?
A: Only Gnosis Safe signers can execute. Community approval is required first.

## Security Considerations

- **Private Keys**: Never share private keys; use hardware wallets for multisig
- **Transaction Review**: All multisig transactions require manual review
- **Timelocks**: Critical changes have built-in delays
- **Audits**: Regular security audits of governance contracts

## Monitoring

- **Proposal Status**: Track via Snapshot and Safe UI
- **Execution Confirmations**: Monitor on-chain transactions
- **Community Feedback**: Regular governance calls and updates

## Contact

For governance questions: governance@greencredits.org
Emergency contact: emergency@greencredits.org
