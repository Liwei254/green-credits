import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying Phase 3 contracts with:", deployer.address);

  // Get environment variables
  const TOKEN_ADDRESS = process.env.TOKEN;
  const VERIFIER_ADDRESS = process.env.VERIFIER;
  const METHODOLOGY_REGISTRY_ADDRESS = process.env.METHODOLOGY_REGISTRY;
  const BASELINE_REGISTRY_ADDRESS = process.env.BASELINE_REGISTRY;
  const DONATION_POOL_ADDRESS = process.env.DONATION_POOL;
  
  // Timelock configuration (optional)
  const TIMELOCK_MIN_DELAY = process.env.TIMELOCK_MIN_DELAY ? parseInt(process.env.TIMELOCK_MIN_DELAY) : 0;
  const TIMELOCK_PROPOSERS = process.env.TIMELOCK_PROPOSERS ? process.env.TIMELOCK_PROPOSERS.split(',') : [];
  const TIMELOCK_EXECUTORS = process.env.TIMELOCK_EXECUTORS ? process.env.TIMELOCK_EXECUTORS.split(',') : [];
  const ENABLE_TIMELOCK = TIMELOCK_MIN_DELAY > 0 && TIMELOCK_PROPOSERS.length > 0;

  if (!TOKEN_ADDRESS || !VERIFIER_ADDRESS) {
    console.error("❌ TOKEN and VERIFIER environment variables required");
    console.log("Usage: TOKEN=0x... VERIFIER=0x... npx hardhat run scripts/deploy_phase3.ts --network moonbase");
    process.exitCode = 1;
    return;
  }

  console.log("\n📋 Phase 3 Configuration:");
  console.log("  Token:", TOKEN_ADDRESS);
  console.log("  Verifier:", VERIFIER_ADDRESS);
  console.log("  Methodology Registry:", METHODOLOGY_REGISTRY_ADDRESS || "N/A");
  console.log("  Baseline Registry:", BASELINE_REGISTRY_ADDRESS || "N/A");
  console.log("  Donation Pool:", DONATION_POOL_ADDRESS || "N/A");
  console.log("  Timelock Enabled:", ENABLE_TIMELOCK);
  if (ENABLE_TIMELOCK) {
    console.log("  Timelock Min Delay:", TIMELOCK_MIN_DELAY);
    console.log("  Timelock Proposers:", TIMELOCK_PROPOSERS);
    console.log("  Timelock Executors:", TIMELOCK_EXECUTORS);
  }

  // Deploy VerifierBadgeSBT
  console.log("\n📜 Deploying VerifierBadgeSBT...");
  const VerifierBadgeSBT = await ethers.getContractFactory("VerifierBadgeSBT");
  const badgeSBT = await VerifierBadgeSBT.deploy();
  await badgeSBT.waitForDeployment();
  const badgeSBTAddr = await badgeSBT.getAddress();
  console.log("✅ VerifierBadgeSBT:", badgeSBTAddr);

  // Deploy MatchingPoolQuadratic
  console.log("\n📜 Deploying MatchingPoolQuadratic...");
  const MatchingPoolQuadratic = await ethers.getContractFactory("MatchingPoolQuadratic");
  const matchingPool = await MatchingPoolQuadratic.deploy();
  await matchingPool.waitForDeployment();
  const matchingPoolAddr = await matchingPool.getAddress();
  console.log("✅ MatchingPoolQuadratic:", matchingPoolAddr);

  let timelockAddr = "";
  
  // Deploy TimelockController if enabled
  if (ENABLE_TIMELOCK) {
    console.log("\n📜 Deploying TimelockController...");
    const TimelockController = await ethers.getContractFactory("TimelockController");
    
    // Constructor: minDelay, proposers, executors, admin (deployer will be admin initially)
    const timelock = await TimelockController.deploy(
      TIMELOCK_MIN_DELAY,
      TIMELOCK_PROPOSERS,
      TIMELOCK_EXECUTORS,
      deployer.address
    );
    await timelock.waitForDeployment();
    timelockAddr = await timelock.getAddress();
    console.log("✅ TimelockController:", timelockAddr);

    // Transfer ownership of key contracts to timelock
    console.log("\n🔑 Transferring ownership to TimelockController...");
    
    // Transfer EcoActionVerifier ownership
    const verifier = await ethers.getContractAt("EcoActionVerifier", VERIFIER_ADDRESS);
    const verifierOwner = await verifier.owner();
    if (verifierOwner === deployer.address) {
      await (await verifier.transferOwnership(timelockAddr)).wait();
      console.log("  ✓ EcoActionVerifier ownership transferred");
    } else {
      console.log("  ⚠ EcoActionVerifier not owned by deployer, skipping");
    }

    // Transfer MethodologyRegistry ownership if provided
    if (METHODOLOGY_REGISTRY_ADDRESS) {
      try {
        const methodologyRegistry = await ethers.getContractAt("MethodologyRegistry", METHODOLOGY_REGISTRY_ADDRESS);
        const methodologyOwner = await methodologyRegistry.owner();
        if (methodologyOwner === deployer.address) {
          await (await methodologyRegistry.transferOwnership(timelockAddr)).wait();
          console.log("  ✓ MethodologyRegistry ownership transferred");
        } else {
          console.log("  ⚠ MethodologyRegistry not owned by deployer, skipping");
        }
      } catch (e) {
        console.log("  ⚠ Could not transfer MethodologyRegistry ownership:", (e as Error).message);
      }
    }

    // Transfer BaselineRegistry ownership if provided
    if (BASELINE_REGISTRY_ADDRESS) {
      try {
        const baselineRegistry = await ethers.getContractAt("BaselineRegistry", BASELINE_REGISTRY_ADDRESS);
        const baselineOwner = await baselineRegistry.owner();
        if (baselineOwner === deployer.address) {
          await (await baselineRegistry.transferOwnership(timelockAddr)).wait();
          console.log("  ✓ BaselineRegistry ownership transferred");
        } else {
          console.log("  ⚠ BaselineRegistry not owned by deployer, skipping");
        }
      } catch (e) {
        console.log("  ⚠ Could not transfer BaselineRegistry ownership:", (e as Error).message);
      }
    }

    // Transfer DonationPool ownership if provided
    if (DONATION_POOL_ADDRESS) {
      try {
        const donationPool = await ethers.getContractAt("DonationPool", DONATION_POOL_ADDRESS);
        const poolOwner = await donationPool.owner();
        if (poolOwner === deployer.address) {
          await (await donationPool.transferOwnership(timelockAddr)).wait();
          console.log("  ✓ DonationPool ownership transferred");
        } else {
          console.log("  ⚠ DonationPool not owned by deployer, skipping");
        }
      } catch (e) {
        console.log("  ⚠ Could not transfer DonationPool ownership:", (e as Error).message);
      }
    }

    // Transfer VerifierBadgeSBT ownership
    await (await badgeSBT.transferOwnership(timelockAddr)).wait();
    console.log("  ✓ VerifierBadgeSBT ownership transferred");

    // Transfer MatchingPoolQuadratic ownership
    await (await matchingPool.transferOwnership(timelockAddr)).wait();
    console.log("  ✓ MatchingPoolQuadratic ownership transferred");
  }

  console.log("\n📝 Copy these to frontend/.env:");
  console.log(`VITE_VERIFIER_BADGE_SBT_ADDRESS=${badgeSBTAddr}`);
  console.log(`VITE_MATCHING_POOL_ADDRESS=${matchingPoolAddr}`);
  if (ENABLE_TIMELOCK) {
    console.log(`VITE_TIMELOCK_CONTROLLER_ADDRESS=${timelockAddr}`);
  }
  console.log(`VITE_TOKEN_ADDRESS=${TOKEN_ADDRESS}`);
  console.log(`VITE_VERIFIER_ADDRESS=${VERIFIER_ADDRESS}`);
  if (METHODOLOGY_REGISTRY_ADDRESS) {
    console.log(`VITE_METHODOLOGY_REGISTRY_ADDRESS=${METHODOLOGY_REGISTRY_ADDRESS}`);
  }
  if (BASELINE_REGISTRY_ADDRESS) {
    console.log(`VITE_BASELINE_REGISTRY_ADDRESS=${BASELINE_REGISTRY_ADDRESS}`);
  }
  if (DONATION_POOL_ADDRESS) {
    console.log(`VITE_DONATION_POOL_ADDRESS=${DONATION_POOL_ADDRESS}`);
  }
  console.log(`VITE_VERIFIER_V2=true`);
  
  console.log("\n✨ Phase 3 deployment complete!");
  console.log("\n💡 Next steps:");
  console.log("  1. Update frontend/.env with the addresses above");
  console.log("  2. Restart frontend dev server: cd frontend && npm run dev");
  console.log("  3. Test the Phase 3 features:");
  console.log("     - Mint/revoke verifier badges (Admin → Reputation)");
  console.log("     - Adjust reputation scores");
  console.log("     - Create matching rounds and accept donations");
  console.log("     - Finalize rounds with match allocations");
  console.log("     - Retire credits");
  if (ENABLE_TIMELOCK) {
    console.log("\n⏰ Timelock governance is now active!");
    console.log("   All administrative changes must go through the timelock with the configured delay.");
  }
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exitCode = 1;
});
