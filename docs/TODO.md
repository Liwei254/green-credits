# GREEN-CREDITS Monorepo Refactor TODO

## Current Status
- [x] Analyze current structure
- [x] Create comprehensive plan
- [x] Get user approval

## Move Files to Proper Locations
- [ ] Move root-level contracts/ to blockchain/contracts/ (merge)
- [ ] Move root-level test/ to blockchain/test/ (merge)
- [ ] Move root-level artifacts/ to blockchain/artifacts/ (merge)
- [ ] Move root-level cache/ to blockchain/cache/ (merge)
- [ ] Move root-level logs/ to blockchain/logs/ (merge)
- [ ] Move root-level scripts/ to blockchain/scripts/ (merge)
- [ ] Move specs/ contents to docs/
- [ ] Move TODO files and DEPLOYMENT_GUIDE.md to docs/
- [ ] Move .env to blockchain/ (keep .env.example at root)

## Update Configuration Files
- [ ] Update root package.json scripts to use workspace commands
- [ ] Update .github/workflows/ci.yml for new paths
- [ ] Update README.md paths if necessary

## Add Docker Support
- [ ] Create Dockerfile for frontend/
- [ ] Create Dockerfile for blockchain/
- [ ] Create Dockerfile for server/
- [ ] Create docker-compose.yml at root

## Testing & Verification
- [ ] Test npm workspace commands
- [ ] Test docker-compose up
- [ ] Verify CI builds
- [ ] Clean up any redundant files
