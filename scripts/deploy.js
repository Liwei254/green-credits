async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Token = await ethers.getContractFactory("GreenCreditToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log("✅ GreenCreditToken:", await token.getAddress());

  const Verifier = await ethers.getContractFactory("EcoActionVerifier");
  const verifier = await Verifier.deploy(await token.getAddress());
  await verifier.waitForDeployment();
  console.log("✅ EcoActionVerifier:", await verifier.getAddress());

  await token.transferOwnership(await verifier.getAddress());
  console.log("✅ Ownership transferred to verifier");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exitCode = 1;
});