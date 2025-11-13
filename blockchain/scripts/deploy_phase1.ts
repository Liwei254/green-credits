import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying Phase 1 contracts with:", deployer.address);

  // Deploy GreenCreditToken
  const Token = await ethers.getContractFactory("GreenCreditToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("✅ GreenCreditToken:", tokenAddr);

  // Deploy MethodologyRegistry
  const MethodologyRegistry = await ethers.getContractFactory("MethodologyRegistry");
  const methodologyRegistry = await MethodologyRegistry.deploy();
  await methodologyRegistry.waitForDeployment();
  const methodologyAddr = await methodologyRegistry.getAddress();
  console.log("✅ MethodologyRegistry:", methodologyAddr);

  // Deploy BaselineRegistry
  const BaselineRegistry = await ethers.getContractFactory("BaselineRegistry");
  const baselineRegistry = await BaselineRegistry.deploy();
  await baselineRegistry.waitForDeployment();
  const baselineAddr = await baselineRegistry.getAddress();
  console.log("✅ BaselineRegistry:", baselineAddr);

  // Deploy EcoActionVerifier
  const Verifier = await ethers.getContractFactory("EcoActionVerifier");
  const verifier = await Verifier.deploy(tokenAddr);
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log("✅ EcoActionVerifier:", verifierAddr);

  // Transfer token ownership to verifier (so only verified actions can mint)
  await token.transferOwnership(verifierAddr);
  console.log("🔑 Token ownership transferred to verifier");

  console.log("\n📝 Copy these to frontend/.env:");
  console.log(`VITE_TOKEN_ADDRESS=${tokenAddr}`);
  console.log(`VITE_VERIFIER_ADDRESS=${verifierAddr}`);
  console.log(`VITE_METHODOLOGY_REGISTRY_ADDRESS=${methodologyAddr}`);
  console.log(`VITE_BASELINE_REGISTRY_ADDRESS=${baselineAddr}`);
  console.log(`VITE_VERIFIER_V2=true`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exitCode = 1;
});
