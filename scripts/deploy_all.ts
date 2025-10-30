import { ethers } from "hardhat";

// Environment variables with defaults
const TOKEN_ADDRESS = process.env.TOKEN || "";
const VERIFIER_ADDRESS = process.env.VERIFIER || "";
const POOL_ADDRESS = process.env.DONATION_POOL || "";
const METHODOLOGY_REGISTRY_ADDRESS = process.env.METHODOLOGY_REGISTRY || "";
const BASELINE_REGISTRY_ADDRESS = process.env.BASELINE_REGISTRY || "";

// Phase 2 configuration
const BUFFER_BPS = parseInt(process.env.BUFFER_BPS || "2000");
const BUFFER_VAULT = process.env.BUFFER_VAULT || "";
const CHALLENGE_WINDOW_SECS = parseInt(process.env.CHALLENGE_WINDOW || "172800");
const SUBMIT_STAKE_WEI = process.env.SUBMIT_STAKE_WEI || "0";
const VERIFY_STAKE_WEI = process.env.VERIFY_STAKE_WEI || "0";
const CHALLENGE_STAKE_WEI = process.env.CHALLENGE_STAKE_WEI || "0";

// Phase 3 configuration
const TIMELOCK_MIN_DELAY = parseInt(process.env.TIMELOCK_MIN_DELAY || "86400");
const TIMELOCK_PROPOSERS = process.env.TIMELOCK_PROPOSERS ? process.env.TIMELOCK_PROPOSERS.split(",") : [];
const TIMELOCK_EXECUTORS = process.env.TIMELOCK_EXECUTORS ? process.env.TIMELOCK_EXECUTORS.split(",") : [];

async function main() {
  console.log("🚀 Starting Green Credits Full Deployment (All Phases)\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "DEV\n");

  // Validate required environment variables
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }

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

  // Set buffer configuration
  if (BUFFER_VAULT) {
    await verifier.setBufferConfig(BUFFER_BPS, BUFFER_VAULT);
    console.log(`✅ Buffer config set: ${BUFFER_BPS} BPS to ${BUFFER_VAULT}`);
  }

  // Set challenge window and stakes
  await verifier.setChallengeConfig(CHALLENGE_WINDOW_SECS, SUBMIT_STAKE_WEI, VERIFY_STAKE_WEI, CHALLENGE_STAKE_WEI);
  console.log(`✅ Challenge config set: ${CHALLENGE_WINDOW_SECS}s window, stakes: ${SUBMIT_STAKE_WEI}/${VERIFY_STAKE_WEI}/${CHALLENGE_STAKE_WEI} wei`);

  // Phase 3: Deploy Advanced Contracts
  console.log("\n📦 Phase 3: Deploying Governance & Quadratic Funding Contracts...");

  // Deploy VerifierBadgeSBT
  const VerifierBadgeSBT = await ethers.getContractFactory("VerifierBadgeSBT");
  const badgeSBT = await VerifierBadgeSBT.deploy();
  await badgeSBT.waitForDeployment();
  const badgeAddress = await badgeSBT.getAddress();
  console.log("✅ VerifierBadgeSBT deployed to:", badgeAddress);

  // Deploy MatchingPoolQuadratic
  const MatchingPool = await ethers.getContractFactory("MatchingPoolQuadratic");
  const matchingPool = await MatchingPool.deploy(tokenAddress);
  await matchingPool.waitForDeployment();
  const matchingAddress = await matchingPool.getAddress();
  console.log("✅ MatchingPoolQuadratic deployed to:", matchingAddress);

  // Deploy TimelockController (optional)
  let timelockAddress = "";
  if (TIMELOCK_MIN_DELAY > 0 && TIMELOCK_PROPOSERS.length > 0 && TIMELOCK_EXECUTORS.length > 0) {
    const TimelockController = await ethers.getContractFactory("TimelockController");
    const timelock = await TimelockController.deploy(TIMELOCK_MIN_DELAY, TIMELOCK_PROPOSERS, TIMELOCK_EXECUTORS, deployer.address);
    await timelock.waitForDeployment();
    timelockAddress = await timelock.getAddress();
    console.log("✅ TimelockController deployed to:", timelockAddress);

    // Transfer ownerships to timelock
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
  }

  // Final output
  console.log("\n🎉 Deployment Complete! Contract Addresses:");
  console.log("========================================");
  console.log(`VITE_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`VITE_VERIFIER_ADDRESS=${verifierAddress}`);
  console.log(`VITE_DONATION_POOL_ADDRESS=${poolAddress}`);
  console.log(`VITE_METHODOLOGY_REGISTRY_ADDRESS=${methodologyAddress}`);
  console.log(`VITE_BASELINE_REGISTRY_ADDRESS=${baselineAddress}`);
  console.log(`VITE_RETIREMENT_REGISTRY_ADDRESS=${retirementAddress}`);
  console.log(`VITE_VERIFIER_BADGE_SBT_ADDRESS=${badgeAddress}`);
  console.log(`VITE_MATCHING_POOL_ADDRESS=${matchingAddress}`);
  if (timelockAddress) {
    console.log(`VITE_TIMELOCK_CONTROLLER_ADDRESS=${timelockAddress}`);
  }
  console.log("========================================");

  console.log("\n📝 Next Steps:");
  console.log("1. Copy the addresses above to your frontend/.env file");
  console.log("2. Add VITE_VERIFIER_V2=true to enable Phase 2+ features");
  console.log("3. Run: cd frontend && npm run build");
  console.log("4. Deploy the frontend/dist folder to your hosting provider");

  if (timelockAddress) {
    console.log("\n⚠️  Important: Contract ownership transferred to TimelockController");
    console.log(`Timelock address: ${timelockAddress}`);
    console.log(`Minimum delay: ${TIMELOCK_MIN_DELAY} seconds`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
