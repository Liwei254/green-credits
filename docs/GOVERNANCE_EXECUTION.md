# Green Credits DAO Governance Execution Guide

## Overview
This document outlines the governance processes for the Green Credits platform, which uses a hybrid DAO approach combining Gnosis Safe multisig for execution with Snapshot for community voting.

## Governance Structure

### 1. Gnosis Safe Multisig
- **Purpose**: Secure execution of approved proposals
- **Threshold**: 2/3 majority required for execution
- **Signers**: Core team + community representatives
- **Network**: Moonbeam Mainnet (Chain ID: 1284)
- **Mainnet Safe Address**: [To be determined after deployment]

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

Green Credits provides `scripts/encodeCalldata.js` (also available as `scripts/generate-calldata.js`) to generate transaction calldata for governance actions.

#### Usage Examples

```bash
# Add a new verifier
node scripts/encodeCalldata.js add-verifier 0x1234567890abcdef1234567890abcdef12345678

# Remove a verifier
node scripts/encodeCalldata.js remove-verifier 0x1234567890abcdef1234567890abcdef12345678

# Add an oracle
node scripts/encodeCalldata.js add-oracle 0x1234567890abcdef1234567890abcdef12345678

# Remove an oracle
node scripts/encodeCalldata.js remove-oracle 0x1234567890abcdef1234567890abcdef12345678

# Approve NGO for donations
node scripts/encodeCalldata.js approve-ngo 0x1234567890abcdef1234567890abcdef12345678

# Reject/Remove NGO
node scripts/encodeCalldata.js reject-ngo 0x1234567890abcdef1234567890abcdef12345678

# Update system parameters
node scripts/encodeCalldata.js parameter-change \
  --instant-mint false \
  --challenge-window 172800 \
  --buffer-bps 2000 \
  --buffer-vault 0xYourBufferVaultAddress \
  --submit-stake 0.01 \
  --verify-stake 0.05 \
  --challenge-stake 0.1

# Mint verifier badge (address, tokenId, level)
node scripts/encodeCalldata.js mint-badge 0x1234567890abcdef1234567890abcdef12345678 1 3

# Adjust reputation (positive to increase, negative to decrease)
node scripts/encodeCalldata.js adjust-reputation 0x1234567890abcdef1234567890abcdef12345678 100

# Resolve challenge (actionId, challengeIdx, upheld, loserSlashTo)
node scripts/encodeCalldata.js resolve-challenge 42 0 true 0x0000000000000000000000000000000000000000
```

#### Output Format

The script outputs JSON with all necessary details for Gnosis Safe execution:

```json
{
  "target": "0x979279bE56f6e10E30384D567007849DF73ae745",
  "value": 0,
  "calldata": "0x9b19251a0000000000000000000000001234567890abcdef1234567890abcdef12345678",
  "description": "Add new verifier: 0x1234567890abcdef1234567890abcdef12345678"
}
```

Copy this output to include in your Snapshot proposal and use for Gnosis Safe transaction creation.

### Setting Contract Addresses

Set contract addresses via environment variables:

```bash
export VITE_VERIFIER_ADDRESS=0xYourVerifierAddress
export VITE_DONATION_POOL_ADDRESS=0xYourDonationPoolAddress
export VITE_VERIFIER_BADGE_SBT_ADDRESS=0xYourBadgeAddress
# ... then run the script
node scripts/encodeCalldata.js add-verifier 0x...
```

Or pass them inline:

```bash
VITE_VERIFIER_ADDRESS=0x... node scripts/encodeCalldata.js add-verifier 0x...
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
