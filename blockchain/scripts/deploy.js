async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Deploy USDC mock for local testing
  const MockUSDC = await ethers.getContractFactory("MockERC20");
  const usdc = await MockUSDC.deploy("Mock USDC", "USDC", 6, ethers.parseUnits("1000000", 6));
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();
  console.log("✅ Mock USDC:", usdcAddr);

  // Deploy GCT
  const GCT = await ethers.getContractFactory("GreenCreditToken");
  const gct = await GCT.deploy();
  await gct.waitForDeployment();
  const gctAddr = await gct.getAddress();
  console.log("✅ GreenCreditToken:", gctAddr);

  // Deploy verifier with USDC and GCT addresses
  const Verifier = await ethers.getContractFactory("EcoActionVerifier");
  const verifier = await Verifier.deploy(usdcAddr, gctAddr);
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log("✅ EcoActionVerifier:", verifierAddr);

  // Transfer GCT ownership to verifier (so only verified actions can mint)
  await gct.transferOwnership(verifierAddr);
  console.log("🔑 GCT Ownership transferred to verifier");

  // Donation pool
  const DonationPool = await ethers.getContractFactory("DonationPool");
  const pool = await DonationPool.deploy(gctAddr);
  await pool.waitForDeployment();
  const poolAddr = await pool.getAddress();
  console.log("✅ DonationPool:", poolAddr);

  // Optional: mark deployer as NGO for demo
  await pool.setNGO(deployer.address, true);
  console.log("✅ Added deployer as NGO for demo");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exitCode = 1;
});