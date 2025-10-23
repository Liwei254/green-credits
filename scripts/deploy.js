async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Token
  const Token = await ethers.getContractFactory("GreenCreditToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("✅ GreenCreditToken:", tokenAddr);

  // Verifier
  const Verifier = await ethers.getContractFactory("EcoActionVerifier");
  const verifier = await Verifier.deploy(tokenAddr);
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log("✅ EcoActionVerifier:", verifierAddr);

  // Ownership to verifier (so only verified actions can mint)
  await token.transferOwnership(verifierAddr);
  console.log("🔑 Ownership transferred to verifier");

  // Donation pool
  const DonationPool = await ethers.getContractFactory("DonationPool");
  const pool = await DonationPool.deploy(tokenAddr);
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