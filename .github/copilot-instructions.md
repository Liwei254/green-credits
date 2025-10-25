# Copilot instructions: Green Credits dApp

Purpose: help AI coding agents work productively in this mono-repo (Hardhat + React/Vite + upload proxy) targeting Moonbase Alpha (chainId 1287).

## Architecture at a glance
- Smart contracts (Solidity, Hardhat):
  - `GreenCreditToken.sol`: ERC20 + Permit + Votes + Capped + Ownable. Owner mints; initial supply to deployer. Ownership is transferred to the verifier contract on deploy.
  - `EcoActionVerifier.sol`: Records eco-actions with optional IPFS proof CID; owner/verifiers can verify and mint rewards via token. Maintains `actions[]`, `totalEarned`, `isVerifier` allowlist. Events: `ActionSubmitted`, `ActionVerified`.
  - `DonationPool.sol`: Simple NGO allowlist; users donate GCT via `approve` + `donateTo(ngo, amount)`.
- Frontend (React + Vite + Tailwind + Ethers v6):
  - Minimal ABIs are defined in `frontend/src/utils/contract.ts`. Contracts are instantiated via `getContracts(provider, withSigner)` and addresses come from `.env`.
  - IPFS proofs uploaded via `frontend/src/utils/ipfs.ts`: prefers server proxy (w3up DID/UCAN) if `VITE_UPLOAD_PROXY_URL` is set; falls back to classic Web3.Storage token.
  - Network utilities in `frontend/src/utils/network.ts` ensure the wallet is on Moonbase.
- Upload proxy (Node/Express): `server/index.mjs` exposes `POST /upload` to Storacha/Web3.Storage using w3up. Keeps agent credentials server-side.

## Key workflows (commands run from each package)
- Contracts (repo root):
  - Compile: `npx hardhat compile`
  - Test: `npx hardhat test` (see `test/EcoActionVerifier.test.js` for Ethers v6 patterns)
  - Deploy to Moonbase: `npx hardhat run scripts/deploy.js --network moonbase` (uses `PRIVATE_KEY` from `.env` via `hardhat.config.ts`)
  - After deploy, copy printed addresses into `frontend/.env`.
- Frontend: `cd frontend && npm install`
  - Dev: `npm run dev`
  - Build: `npm run build`
- Upload proxy: `cd server && npm install`
  - Configure `.env` (see `server/.env.example`), then `npm start` to serve `/upload`.

## Conventions and patterns
- Ethers v6 everywhere. Use `BrowserProvider`, `Contract`, `parseUnits`. Keep frontend ABIs concise (string fragments) in `utils/contract.ts`.
- Feature flag: `VITE_VERIFIER_HAS_PROOF` toggles ABI shape for `submitAction`. If the contract includes `proofCid`, set it to `true`.
- Optional donation pool: if `VITE_DONATION_POOL_ADDRESS` is unset, the Donate UI will hide.
- Error UX via `react-hot-toast`; don’t throw raw errors in components—surface via toast.
- Network is Moonbase by default. Wallet connect adds/switches chain (see `components/WalletConnect.tsx`).

## Integration points (env & addresses)
- Root (Hardhat): `.env` should provide `PRIVATE_KEY` for `networks.moonbase.accounts`.
- Frontend `.env` (see `frontend/.env.example`):
  - `VITE_TOKEN_ADDRESS`, `VITE_VERIFIER_ADDRESS`, optional `VITE_DONATION_POOL_ADDRESS`
  - `VITE_VERIFIER_HAS_PROOF=true|false`
  - Prefer `VITE_UPLOAD_PROXY_URL=http://localhost:8787/upload`; legacy `VITE_WEB3_STORAGE_TOKEN` works only with classic API.
- Server `.env` (see `server/.env.example`): `PORT`, `W3UP_SPACE_DID`, `W3UP_AGENT` or `W3UP_AGENT_FILE`, `CORS_ORIGINS`.

## Example snippets
- Verify an action from the frontend:
  ```ts
  const { verifierWithSigner } = await getContracts(provider, true);
  await (await verifierWithSigner.verifyAction(0, parseUnits("10", 18))).wait();
  ```
- Submit an action with optional proof:
  ```ts
  const { cid } = await uploadProof(file);
  await (await verifierWithSigner.submitAction(desc, cid)).wait(); // if HAS_PROOF=true
  ```

## When modifying/adding features
- Changing contract interfaces requires updating the string ABI fragments in `frontend/src/utils/contract.ts` and bumping `VITE_VERIFIER_HAS_PROOF` if the signature changes.
- After redeploy, always update frontend `.env` addresses. The deploy script already transfers `GreenCreditToken` ownership to the verifier so `mint` works.
- Respect upload limits: frontend caps files at 8MB, proxy at 10MB; keep responses `{ cid, url }`.
- TypeChain types exist in `typechain-types/` for tests and scripts; the frontend intentionally uses minimal ABIs for bundle size.
