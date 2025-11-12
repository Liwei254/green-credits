# Deployment Guide - Green Credits dApp

This guide explains how to deploy the Green Credits dApp to Moonbeam Alpha and set up GitHub Pages hosting.

## Prerequisites

1. **Wallet Setup**
   - MetaMask or compatible wallet with DEV tokens on Moonbase Alpha
   - Get test DEV tokens from [Moonbeam Faucet](https://faucet.moonbeam.network/)

2. **Environment Setup**
   - Node.js 18.x or 20.x
   - npm or yarn package manager

3. **API Keys (Optional)**
   - Moonscan API key for contract verification (optional)
   - Web3.Storage token or w3up credentials for IPFS uploads (optional)

## Step 1: Configure Environment Variables

### Root Directory (.env)

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your deployment credentials:

```env
# Deployment private key (wallet with DEV tokens)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Network configuration
MOONBEAM_ALPHA_RPC=https://rpc.api.moonbase.moonbeam.network

# Optional: Moonscan API key for contract verification
MOONSCAN_API_KEY=your_moonscan_api_key
```

### Frontend (.env)

Create `frontend/.env`:

```bash
cd frontend
cp .env.example .env
```

**Note:** Contract addresses will be populated after deployment in Step 2.

### Upload Proxy Server (Optional)

If using the upload proxy for IPFS:

```bash
cd server
cp .env.example .env
# Configure W3UP credentials as needed
```

## Step 2: Deploy Smart Contracts to Moonbeam Alpha

### Install Dependencies

```bash
npm install
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy to Moonbase Alpha

```bash
npx hardhat run scripts/deploy-moonbeam.ts --network moonbasealpha
```

The deployment script will:
- Deploy `GreenCreditToken` (GCT)
- Deploy `EcoActionVerifier`
- Deploy `DonationPool`
- Transfer GCT ownership to EcoActionVerifier (for minting rights)
- Generate `deployments/moonbeam.json` with contract addresses

**Save the output!** You'll need the contract addresses for the next step.

Example output:
```
✅ GreenCreditToken: 0xABCD...1234
✅ EcoActionVerifier: 0xEFGH...5678
✅ DonationPool: 0xIJKL...9012
```

### Verify Contracts on Moonscan (Optional)

```bash
npx hardhat verify --network moonbasealpha <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Step 3: Configure Frontend

Update `frontend/.env` with deployed contract addresses:

```env
# Core contracts (required)
VITE_TOKEN_ADDRESS=0xYourGreenCreditTokenAddress
VITE_VERIFIER_ADDRESS=0xYourEcoActionVerifierAddress
VITE_GCT_ADDRESS=0xYourGreenCreditTokenAddress

# Optional
VITE_DONATION_POOL_ADDRESS=0xYourDonationPoolAddress

# Network configuration
VITE_CHAIN_ID=1287
VITE_VERIFIER_HAS_PROOF=true
VITE_VERIFIER_V2=true

# IPFS upload
VITE_UPLOAD_PROXY_URL=http://localhost:8787/upload
```

## Step 4: Test Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173 and test:
- Wallet connection
- Network switching to Moonbase Alpha
- Contract interactions
- IPFS uploads (if configured)

## Step 5: Build Frontend for Production

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`.

Verify the CNAME file exists:
```bash
cat frontend/dist/CNAME
# Should output: green-credit.xyz
```

## Step 6: Deploy to GitHub Pages

### Automatic Deployment (Recommended)

Push to the `main` branch:

```bash
git add .
git commit -m "Deploy to Moonbeam Alpha"
git push origin main
```

The GitHub Actions workflow will:
1. Run tests
2. Build frontend
3. Deploy to GitHub Pages (gh-pages branch)
4. Configure custom domain (green-credit.xyz)

### Manual Deployment

If needed, deploy manually:

```bash
cd frontend
npm run build

# Install gh-pages if not already installed
npm install -g gh-pages

# Deploy to gh-pages branch
gh-pages -d dist -m "Deploy to GitHub Pages"
```

## Step 7: Configure DNS for Custom Domain

### GitHub Pages Configuration

1. Go to your repository on GitHub
2. Settings → Pages
3. Verify:
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `/ (root)`
   - Custom domain: `green-credit.xyz`

### DNS Configuration (Domain Registrar)

Configure DNS records for `green-credit.xyz`:

**Option A: Using A Records (Recommended)**

```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153

Type: CNAME
Name: www
Value: <your-github-username>.github.io
```

**Option B: Using CNAME Record**

```
Type: CNAME
Name: @
Value: <your-github-username>.github.io
```

### Verify DNS Propagation

```bash
dig green-credit.xyz +noall +answer
```

Wait 24-48 hours for full DNS propagation.

## Step 8: Enable HTTPS

GitHub Pages automatically provisions SSL certificates for custom domains.

1. Wait for DNS propagation
2. GitHub → Settings → Pages → Enforce HTTPS (check box)

## Verification Checklist

- [ ] Smart contracts deployed to Moonbase Alpha
- [ ] Contract addresses added to `frontend/.env`
- [ ] Frontend builds successfully
- [ ] CNAME file exists in build output
- [ ] GitHub Actions workflow passes
- [ ] Site accessible at https://green-credit.xyz
- [ ] Wallet connects to Moonbase Alpha
- [ ] Contract interactions work
- [ ] HTTPS enabled

## Troubleshooting

### Deployment Fails

- Ensure wallet has sufficient DEV tokens
- Check private key is correct in `.env`
- Verify network RPC is accessible

### Frontend Build Fails

- Check Node.js version (18.x or 20.x)
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for missing environment variables

### GitHub Pages Not Updating

- Check GitHub Actions workflow status
- Verify gh-pages branch exists
- Ensure GITHUB_TOKEN has proper permissions

### Custom Domain Not Working

- Verify DNS records are correct
- Wait for DNS propagation (24-48 hours)
- Check CNAME file exists in deployed files
- Verify GitHub Pages custom domain setting

### Contract Interactions Fail

- Ensure MetaMask is on Moonbase Alpha (chainId 1287)
- Check contract addresses in frontend `.env`
- Verify contracts are deployed and ownership transferred
- Check browser console for detailed errors

## Additional Resources

- [Moonbeam Documentation](https://docs.moonbeam.network/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Ethers.js v6 Documentation](https://docs.ethers.org/v6/)

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review contract events and transaction logs on Moonscan

## Maintenance

### Updating Contracts

1. Make changes to contracts
2. Test thoroughly: `npx hardhat test`
3. Deploy new versions
4. Update frontend `.env` with new addresses
5. Rebuild and redeploy frontend

### Updating Frontend

1. Make changes to frontend code
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Push to main branch (auto-deploys via CI/CD)

### Monitoring

- Monitor contract interactions on [Moonbase Moonscan](https://moonbase.moonscan.io/)
- Check GitHub Actions for deployment status
- Review application logs in browser console
