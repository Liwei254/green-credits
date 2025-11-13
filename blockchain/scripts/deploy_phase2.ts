import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying Phase 2 contracts with:", deployer.address);

  // Get environment variables
  const TOKEN_ADDRESS = process.env.TOKEN;
  const VERIFIER_ADDRESS = process.env.VERIFIER;
  const BUFFER_BPS = process.env.BUFFER_BPS || "2000"; // 20% default
  const BUFFER_VAULT = process.env.BUFFER_VAULT || deployer.address;
  const CHALLENGE_WINDOW = process.env.CHALLENGE_WINDOW || String(2 * 24 * 60 * 60); // 2 days default
  const SUBMIT_STAKE_WEI = process.env.SUBMIT_STAKE_WEI || "0";
  const VERIFY_STAKE_WEI = process.env.VERIFY_STAKE_WEI || "0";
  const CHALLENGE_STAKE_WEI = process.env.CHALLENGE_STAKE_WEI || "0";

  if (!TOKEN_ADDRESS || !VERIFIER_ADDRESS) {
    console.error("❌ TOKEN and VERIFIER environment variables required");
    console.log("Usage: TOKEN=0x... VERIFIER=0x... npx hardhat run scripts/deploy_phase2.ts --network moonbase");
    process.exitCode = 1;
    return;
  }

  console.log("\n📋 Phase 2 Configuration:");
  console.log("  Token:", TOKEN_ADDRESS);
  console.log("  Verifier:", VERIFIER_ADDRESS);
  console.log("  Buffer BPS:", BUFFER_BPS);
  console.log("  Buffer Vault:", BUFFER_VAULT);
  console.log("  Challenge Window (sec):", CHALLENGE_WINDOW);
  console.log("  Submit Stake (wei):", SUBMIT_STAKE_WEI);
  console.log("  Verify Stake (wei):", VERIFY_STAKE_WEI);
  console.log("  Challenge Stake (wei):", CHALLENGE_STAKE_WEI);

  // Deploy RetirementRegistry
  const RetirementRegistry = await ethers.getContractFactory("RetirementRegistry");
  const retirementRegistry = await RetirementRegistry.deploy();
  await retirementRegistry.waitForDeployment();
  const registryAddr = await retirementRegistry.getAddress();
  console.log("\n✅ RetirementRegistry deployed:", registryAddr);

  // Configure EcoActionVerifier with Phase 2 settings
  console.log("\n⚙️  Configuring EcoActionVerifier...");
  const verifier = await ethers.getContractAt("EcoActionVerifier", VERIFIER_ADDRESS);
  
  const tx = await verifier.setConfig(
    false, // instantMint = false (enable delayed minting with challenge window)
    CHALLENGE_WINDOW,
    BUFFER_BPS,
    BUFFER_VAULT,
    SUBMIT_STAKE_WEI,
    VERIFY_STAKE_WEI,
    CHALLENGE_STAKE_WEI
  );
  await tx.wait();
  console.log("✅ EcoActionVerifier configured for Phase 2");

  console.log("\n📝 Copy these to frontend/.env:");
  console.log(`VITE_RETIREMENT_REGISTRY_ADDRESS=${registryAddr}`);
  console.log(`VITE_TOKEN_ADDRESS=${TOKEN_ADDRESS}`);
  console.log(`VITE_VERIFIER_ADDRESS=${VERIFIER_ADDRESS}`);
  console.log(`VITE_VERIFIER_V2=true`);
  
  console.log("\n✨ Phase 2 deployment complete!");
  console.log("\n💡 Next steps:");
  console.log("  1. Update frontend/.env with the addresses above");
  console.log("  2. Restart frontend dev server: cd frontend && npm run dev");
  console.log("  3. Test the Phase 2 features:");
  console.log("     - Submit action V2");
  console.log("     - Verify action (sets status=Verified, pending mint)");
  console.log("     - Challenge action (before window expires)");
  console.log("     - Resolve challenge");
  console.log("     - Finalize action (mints with buffer for removals)");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exitCode = 1;
});
