# Migration from Storacha (w3up) to NFT.storage

## Overview
Migrate the IPFS storage implementation from Storacha (w3up) to NFT.storage across frontend and server components.

## Current State
- Frontend: Uses @storacha/client with delegation-based authentication
- Server: Has both Storacha (index.mjs) and NFT.storage (upload.js) implementations
- Environment: Uses Storacha-specific variables (W3UP_SPACE_DID, W3UP_AGENT_FILE)

## Migration Status
- [x] Frontend package.json updated: @storacha/client → nft.storage
- [x] Frontend ipfs.ts updated: Storacha client → NFT.storage API
- [x] Server package.json updated: @storacha/client removed, nft.storage kept
- [x] Server index.mjs updated: Storacha → NFT.storage implementation
- [x] Dependencies installed for both frontend and server
- [x] Documentation updated (README.md)
- [x] Server starts successfully (requires NFT_STORAGE_TOKEN env var)
- [ ] Environment variables need updating (server/.env)
- [ ] Testing required (server starts but needs token for uploads)

## Migration Steps

### Frontend Changes
- [ ] Update frontend/package.json: Replace @storacha/client with nft.storage
- [ ] Update frontend/src/utils/ipfs.ts: Replace Storacha client with NFT.storage API
- [ ] Remove Storacha-specific environment variables (VITE_STORACHA_DELEGATION)
- [ ] Add NFT.storage token environment variable (VITE_NFT_STORAGE_TOKEN)

### Server Changes
- [ ] Update server/package.json: Remove @storacha/client, keep nft.storage
- [ ] Update server/index.mjs: Replace Storacha implementation with NFT.storage
- [ ] Update environment variables: Replace W3UP_* with NFT_STORAGE_TOKEN
- [ ] Update server scripts and documentation

### Configuration Updates
- [ ] Update .env files with new variables
- [ ] Update README.md and deployment guides
- [ ] Update Docker configurations if needed

### Testing
- [ ] Test file uploads work with NFT.storage
- [ ] Verify CID generation and gateway URLs
- [ ] Test both direct upload and proxy upload methods

## Environment Variables Changes

### Before (Storacha)
```
VITE_STORACHA_DELEGATION=<base64-encoded-delegation>
VITE_UPLOAD_PROXY_URL=<server-url>
W3UP_SPACE_DID=<space-did>
W3UP_AGENT_FILE=<agent-file-path>
```

### After (NFT.storage)
```
VITE_NFT_STORAGE_TOKEN=<nft-storage-api-token>
VITE_UPLOAD_PROXY_URL=<server-url>
NFT_STORAGE_TOKEN=<nft-storage-api-token>
```

## Files to Modify
- frontend/package.json
- frontend/src/utils/ipfs.ts
- server/package.json
- server/index.mjs
- server/.env (if accessible)
- README.md
- docs/DEPLOYMENT_GUIDE.md
