const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Use real USDC on Moonbeam, mock for local testing
  let usdcAddr;
  if (process.env.USDC_ADDRESS) {
    usdcAddr = process.env.USDC_ADDRESS;
    console.log("✅ Using real USDC:", usdcAddr);
  } else {
    // Deploy USDC mock for local testing
    const MockUSDC = await ethers.getContractFactory("MockERC20");
    const usdc = await MockUSDC.deploy("Mock USDC", "USDC", 6, ethers.parseUnits("1000000", 6));
    await usdc.waitForDeployment();
    usdcAddr = await usdc.getAddress();
    console.log("✅ Mock USDC:", usdcAddr);
  }

  // Use real GCT if provided, otherwise deploy new one
  let gctAddr;
  if (process.env.GCT_ADDRESS) {
    gctAddr = process.env.GCT_ADDRESS;
    console.log("✅ Using real GCT:", gctAddr);
  } else {
    // Deploy GCT
    const GCT = await ethers.getContractFactory("GreenCreditToken");
    const gct = await GCT.deploy();
    await gct.waitForDeployment();
    gctAddr = await gct.getAddress();
    console.log("✅ GreenCreditToken:", gctAddr);
  }

  // Deploy verifier with USDC and GCT addresses
  const Verifier = await ethers.getContractFactory("EcoActionVerifier");
  const verifier = await Verifier.deploy(usdcAddr, gctAddr);
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log("✅ EcoActionVerifier:", verifierAddr);

  // Transfer GCT ownership to verifier (so only verified actions can mint)
  if (!process.env.GCT_ADDRESS) {
    await gct.transferOwnership(verifierAddr);
    console.log("🔑 GCT Ownership transferred to verifier");
  }

  // Donation pool
  const DonationPool = await ethers.getContractFactory("DonationPool");
  const pool = await DonationPool.deploy(gctAddr);
  await pool.waitForDeployment();
  const poolAddr = await pool.getAddress();
  console.log("✅ DonationPool:", poolAddr);

  // Optional: mark deployer as NGO for demo
  await pool.setNGO(deployer.address, true);
  console.log("✅ Added deployer as NGO for demo");

  // Save deployment addresses
  const fs = require('fs');
  const path = require('path');
  const network = process.env.HARDHAT_NETWORK || 'hardhat';
  const deploymentsDir = path.join(__dirname, '..', 'deployments');

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentData = {
    network,
    usdc: usdcAddr,
    gct: gctAddr,
    verifier: verifierAddr,
    donationPool: poolAddr,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(deploymentsDir, `${network}.json`),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log(`📝 Deployment addresses saved to deployments/${network}.json`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exitCode = 1;
});