# TODO: Implement Data & Metrics to Track Adoption

## Metrics to Track
- Number of actions submitted per day
- Number of actions verified per day
- Total GCT minted per period
- Donations completed & amount per NGO
- Conversion: visitors -> connected wallets -> submitted actions -> verified actions

## Steps to Complete
- [x] Analyze existing contracts for event emission (EcoActionVerifier, GreenCreditToken, DonationPool).
- [x] Add or enhance events in EcoActionVerifier.sol for action submissions and verifications with timestamps.
- [x] Add events in GreenCreditToken.sol for minting with timestamps.
- [x] Add events in DonationPool.sol for donations with NGO details.
- [x] Create a MetricsTracker.sol contract to aggregate and query metrics on-chain.
- [x] Add frontend analytics for conversion tracking (visitors -> wallets -> actions).
- [x] Implement daily aggregation functions in MetricsTracker.
- [x] Test metrics tracking with sample data.
- [ ] Add metrics dashboard or API endpoints for retrieving data.
- [ ] Integrate metrics tracking with frontend analytics.
- [ ] Deploy MetricsTracker contract and connect to existing contracts.
