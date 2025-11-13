import { ethers } from "hardhat";

// 🔧 Temporary patch for Hardhat provider (avoids ENS lookups)
(ethers.provider as any).resolveName = async (name: string) => {
  // If it's already an address, return it
  if (ethers.isAddress(name)) return name;
  // Otherwise return the name as-is (no ENS resolution)
  return name;
};

// Environment variables with defaults
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "";
const VERIFIER_ADDRESS = process.env.VERIFIER_ADDRESS || "";
const POOL_ADDRESS = process.env.DONATION_POOL_ADDRESS || "";
const METHODOLOGY_REGISTRY_ADDRESS = process.env.METHODOLOGY_REGISTRY_ADDRESS || "";
const BASELINE_REGISTRY_ADDRESS = process.env.BASELINE_REGISTRY_ADDRESS || "";
const RETIREMENT_REGISTRY_ADDRESS = process.env.RETIREMENT_REGISTRY_ADDRESS || "";
const VERIFIER_BADGE_SBT_ADDRESS = process.env.VERIFIER_BADGE_SBT_ADDRESS || "";
const MATCHING_POOL_ADDRESS = process.env.MATCHING_POOL_ADDRESS || "";

// Phase 2 configuration
const BUFFER_BPS = parseInt(process.env.BUFFER_BPS || "2000");
const BUFFER_VAULT = process.env.BUFFER_VAULT || "";
const CHALLENGE_WINDOW_SECS = parseInt(process.env.CHALLENGE_WINDOW || "172800");
const SUBMIT_STAKE_WEI = process.env.SUBMIT_STAKE_WEI || "1000000000000000000"; // 1 GLMR in wei
const VERIFY_STAKE_WEI = process.env.VERIFY_STAKE_WEI || "5000000000000000000"; // 5 GLMR in wei
const CHALLENGE_STAKE_WEI = process.env.CHALLENGE_STAKE_WEI || "10000000000000000000"; // 10 GLMR in wei

// Phase 3 configuration
const TIMELOCK_MIN_DELAY = parseInt(process.env.TIMELOCK_MIN_DELAY || "86400");
const TIMELOCK_PROPOSERS = process.env.TIMELOCK_PROPOSERS ? process.env.TIMELOCK_PROPOSERS.split(",") : [];
const TIMELOCK_EXECUTORS = process.env.TIMELOCK_EXECUTORS ? process.env.TIMELOCK_EXECUTORS.split(",") : [];

async function main() {
  console.log("🚀 Starting Green Credits MAINNET Deployment (All Phases)\n");

  // 🚨 MAINNET SAFETY CHECKS
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== BigInt(1284)) {
    throw new Error("❌ This script is for Moonbeam MAINNET only! Current chainId: " + network.chainId);
  }

  console.log("✅ Confirmed: Deploying to Moonbeam Mainnet (Chain ID: 1284)");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "GLMR\n");

  // Validate required environment variables
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required for mainnet deployment");
  }

  // Confirm deployment with user
  console.log("⚠️  MAINNET DEPLOYMENT WARNING ⚠️");
  console.log("This will deploy contracts to Moonbeam mainnet with real GLMR costs!");
  console.log("Make sure you have:");
  console.log("- Sufficient GLMR for deployment and initial operations");
  console.log("- Verified all contract code and parameters");
  console.log("- Tested on testnet first");
  console.log("- Backup of all important data\n");

  // Phase 1: Deploy Core Contracts
  console.log("📦 Phase 1: Deploying Core Contracts...");

  // Deploy GreenCreditToken
  const Token = await ethers.getContractFactory("GreenCreditToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ GreenCreditToken deployed to:", tokenAddress);

  // Deploy EcoActionVerifier
  const Verifier = await ethers.getContractFactory("EcoActionVerifier");
  const verifier = await Verifier.deploy(tokenAddress);
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("✅ EcoActionVerifier deployed to:", verifierAddress);

  // Deploy DonationPool
  const Pool = await ethers.getContractFactory("DonationPool");
  const pool = await Pool.deploy(tokenAddress);
  await pool.waitForDeployment();
  const poolAddress = await pool.getAddress();
  console.log("✅ DonationPool deployed to:", poolAddress);

  // Deploy MethodologyRegistry
  const MethodologyRegistry = await ethers.getContractFactory("MethodologyRegistry");
  const methodologyRegistry = await MethodologyRegistry.deploy();
  await methodologyRegistry.waitForDeployment();
  const methodologyAddress = await methodologyRegistry.getAddress();
  console.log("✅ MethodologyRegistry deployed to:", methodologyAddress);

  // Deploy BaselineRegistry
  const BaselineRegistry = await ethers.getContractFactory("BaselineRegistry");
  const baselineRegistry = await BaselineRegistry.deploy();
  await baselineRegistry.waitForDeployment();
  const baselineAddress = await baselineRegistry.getAddress();
  console.log("✅ BaselineRegistry deployed to:", baselineAddress);

  // Phase 2: Deploy Retirement Registry and Configure Phase 2
  console.log("\n📦 Phase 2: Deploying Retirement Registry & Configuring Trust Features...");

  // Deploy RetirementRegistry
  const RetirementRegistry = await ethers.getContractFactory("RetirementRegistry");
  const retirementRegistry = await RetirementRegistry.deploy();
  await retirementRegistry.waitForDeployment();
  const retirementAddress = await retirementRegistry.getAddress();
  console.log("✅ RetirementRegistry deployed to:", retirementAddress);

  // Configure EcoActionVerifier for Phase 2
  console.log("⚙️ Configuring EcoActionVerifier for Phase 2...");

  // Set buffer configuration and challenge settings in one call
  const bufferVault = BUFFER_VAULT || deployer.address;
  await verifier.setConfig(
    false, // instantMint = false (enable delayed minting)
    CHALLENGE_WINDOW_SECS,
    BUFFER_BPS,
    bufferVault,
    SUBMIT_STAKE_WEI,
    VERIFY_STAKE_WEI,
    CHALLENGE_STAKE_WEI
  );
  console.log(`✅ EcoActionVerifier configured: instantMint=false, window=${CHALLENGE_WINDOW_SECS}s, buffer=${BUFFER_BPS}bps, stakes: ${SUBMIT_STAKE_WEI}/${VERIFY_STAKE_WEI}/${CHALLENGE_STAKE_WEI} wei`);

  // Phase 3: Deploy Advanced Contracts
  console.log("\n📦 Phase 3: Deploying Governance & Quadratic Funding Contracts...");

  // ✅ VerifierBadgeSBT
  const VerifierBadgeSBT = await ethers.getContractFactory("VerifierBadgeSBT");
  const badgeSBT = await VerifierBadgeSBT.deploy();
  await badgeSBT.waitForDeployment();
  const badgeAddress = await badgeSBT.getAddress();
  console.log("✅ VerifierBadgeSBT deployed to:", badgeAddress);

  // ✅ MatchingPoolQuadratic
  const MatchingPool = await ethers.getContractFactory("MatchingPoolQuadratic");
  const matchingPool = await MatchingPool.deploy();
  await matchingPool.waitForDeployment();
  const matchingAddress = await matchingPool.getAddress();
  console.log("✅ MatchingPoolQuadratic deployed to:", matchingAddress);

  // ✅ Deploy TimelockController (Optional)
  let timelockAddress = "";
  console.log("\n🔐 Checking Timelock configuration...");

  console.log("🧩 Timelock parameters:", {
    TIMELOCK_MIN_DELAY,
    TIMELOCK_PROPOSERS,
    TIMELOCK_EXECUTORS,
  });

  // Validate arrays
  const proposers = Array.isArray(TIMELOCK_PROPOSERS)
    ? TIMELOCK_PROPOSERS.filter((a) => ethers.isAddress(a))
    : [];
  const executors = Array.isArray(TIMELOCK_EXECUTORS)
    ? TIMELOCK_EXECUTORS.filter((a) => ethers.isAddress(a))
    : [];

  if (TIMELOCK_MIN_DELAY > 0 && proposers.length > 0 && executors.length > 0) {
    console.log("✅ Valid Timelock parameters found. Proceeding with deployment...");
    const TimelockController = await ethers.getContractFactory("TimelockController");

    // 🧠 Explicit argument check — ensures ethers doesn’t confuse an address with overrides
    const args = [
      TIMELOCK_MIN_DELAY,
      proposers,
      executors,
      deployer.address, // ✅ Admin address
    ];
    console.log("📤 Deploying TimelockController with args:", args);

    const timelock = await TimelockController.deploy(...args);
    await timelock.waitForDeployment();
    timelockAddress = await timelock.getAddress();
    console.log("✅ TimelockController deployed to:", timelockAddress);

    // ✅ Ownership transfers
    console.log("🔄 Transferring ownerships to TimelockController...");
    await verifier.transferOwnership(timelockAddress);
    console.log("✅ EcoActionVerifier ownership transferred");
    await badgeSBT.transferOwnership(timelockAddress);
    console.log("✅ VerifierBadgeSBT ownership transferred");
    await matchingPool.transferOwnership(timelockAddress);
    console.log("✅ MatchingPoolQuadratic ownership transferred");
    await methodologyRegistry.transferOwnership(timelockAddress);
    console.log("✅ MethodologyRegistry ownership transferred");
    await baselineRegistry.transferOwnership(timelockAddress);
    console.log("✅ BaselineRegistry ownership transferred");
    await retirementRegistry.transferOwnership(timelockAddress);
    console.log("✅ RetirementRegistry ownership transferred");
  } else {
    console.log("⚠️ Skipping Timelock deployment — check your .env values for TIMELOCK_* variables.");
  }

  // ✅ Final Output
  console.log("\n🎉 MAINNET Deployment Complete! Contract Addresses:");
  console.log("==================================================");
  console.log(`TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`VERIFIER_ADDRESS=${verifierAddress}`);
  console.log(`DONATION_POOL_ADDRESS=${poolAddress}`);
  console.log(`METHODOLOGY_REGISTRY_ADDRESS=${methodologyAddress}`);
  console.log(`BASELINE_REGISTRY_ADDRESS=${baselineAddress}`);
  console.log(`RETIREMENT_REGISTRY_ADDRESS=${retirementAddress}`);
  console.log(`VERIFIER_BADGE_SBT_ADDRESS=${badgeAddress}`);
  console.log(`MATCHING_POOL_ADDRESS=${matchingAddress}`);
  if (timelockAddress) {
    console.log(`TIMELOCK_CONTROLLER_ADDRESS=${timelockAddress}`);
  }
  console.log("==================================================");

  console.log("\n📝 Next Steps:");
  console.log("1️⃣ Copy the addresses above to your production .env file");
  console.log("2️⃣ Verify contracts on Moonscan: https://moonbeam.moonscan.io/");
  console.log("3️⃣ Update frontend/src/utils/contract.ts with new addresses");
  console.log("4️⃣ Test frontend with mainnet contracts");
  console.log("5️⃣ Deploy frontend to production hosting");

  if (timelockAddress) {
    console.log("\n⚠️  Important: Contract ownership transferred to TimelockController");
    console.log(`Timelock address: ${timelockAddress}`);
    console.log(`Minimum delay: ${TIMELOCK_MIN_DELAY} seconds`);
    console.log("Set up Gnosis Safe to control the TimelockController");
  }

  console.log("\n🔍 Verification Commands:");
  console.log(`npx hardhat verify --network moonbeam ${tokenAddress}`);
  console.log(`npx hardhat verify --network moonbeam ${verifierAddress} ${tokenAddress}`);
  console.log(`npx hardhat verify --network moonbeam ${poolAddress} ${tokenAddress}`);
  // Add more verification commands as needed
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Mainnet deployment failed:", error);
    process.exit(1);
  });
