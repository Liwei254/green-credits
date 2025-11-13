# GREEN-CREDITS Monorepo Refactor TODO

## ✅ Completed Tasks
- [x] Moved blockchain files (contracts/, test/, artifacts/, cache/, logs/) to blockchain/
- [x] Moved scripts/ to blockchain/scripts/
- [x] Moved specs/ to docs/
- [x] Moved TODO files to docs/
- [x] Moved .env to blockchain/
- [x] Updated root package.json scripts to use npm workspaces
- [x] Updated .github/workflows/ci.yml for new paths
- [x] Created Dockerfiles for frontend, blockchain, and server
- [x] Created docker-compose.yml for orchestration

## 🔄 In Progress
- [ ] Test npm workspace commands
- [ ] Test docker-compose up
- [ ] Verify CI builds

## 📋 Remaining Tasks
- [ ] Update README.md with new structure and commands
- [ ] Clean up any remaining root-level artifacts/cache/logs
- [ ] Test all workspace commands work correctly
- [ ] Test Docker builds and orchestration
- [ ] Update deployment documentation
- [ ] Verify all paths in configs are correct

## 🐛 Known Issues
- Tests are failing due to Chai matcher issues (bigint comparisons, revertedWith, emit)
- Need to fix test assertions for Hardhat/Chai compatibility

## 📝 Notes
- Frontend: React/Vite (ESM) - ✅
- Blockchain: Hardhat (CJS) - ✅
- Server: Node.js/Express (ESM) - ✅
- Docker orchestration ready - ✅
