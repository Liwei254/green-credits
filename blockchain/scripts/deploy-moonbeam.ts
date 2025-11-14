import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying contracts to Moonbeam Alpha with:", deployer.address);
  console.log("📊 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "DEV");

  // Deploy Mock USDC for testing (on testnet)
  console.log("\n📦 Deploying Mock USDC...");
  const MockUSDC = await ethers.getContractFactory("MockERC20");
  const usdc = await MockUSDC.deploy("Mock USDC", "USDC", 6, ethers.parseUnits("1000000", 6));
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();
  console.log("✅ Mock USDC deployed at:", usdcAddr);

  // Deploy GreenCreditToken (GCT)
  console.log("\n📦 Deploying Green Credit Token (GCT)...");
  const GCT = await ethers.getContractFactory("GreenCreditToken");
  const gct = await GCT.deploy();
  await gct.waitForDeployment();
  const gctAddr = await gct.getAddress();
  console.log("✅ GreenCreditToken deployed at:", gctAddr);

  // Deploy EcoActionVerifier
  console.log("\n📦 Deploying EcoActionVerifier...");
  const Verifier = await ethers.getContractFactory("EcoActionVerifier");
  const verifier = await Verifier.deploy(usdcAddr, gctAddr);
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log("✅ EcoActionVerifier deployed at:", verifierAddr);

  // Transfer GCT ownership to verifier (so only verified actions can mint)
  console.log("\n🔑 Transferring GCT ownership to verifier...");
  try {
    const tx = await gct.transferOwnership(verifierAddr);
    await tx.wait();
    console.log("✅ GCT ownership transferred to verifier");
  } catch (error) {
    console.log("⚠️  Warning: Could not transfer ownership:", error);
  }

  // Deploy DonationPool
  console.log("\n📦 Deploying DonationPool...");
  const DonationPool = await ethers.getContractFactory("DonationPool");
  const pool = await DonationPool.deploy(gctAddr);
  await pool.waitForDeployment();
  const poolAddr = await pool.getAddress();
  console.log("✅ DonationPool deployed at:", poolAddr);

  // Optional: mark deployer as NGO for demo
  try {
    const tx = await pool.setNGO(deployer.address, true);
    await tx.wait();
    console.log("✅ Added deployer as NGO for demo");
  } catch (error) {
    console.log("⚠️  Warning: Could not add NGO:", error);
  }

  // Prepare deployment artifact with minimal ABIs
  const deploymentData = {
    network: "moonbeam-alpha",
    chainId: 1287,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      GreenCreditToken: {
        address: gctAddr,
        abi: [
          "function balanceOf(address) view returns (uint256)",
          "function approve(address spender, uint256 value) returns (bool)",
          "function allowance(address owner, address spender) view returns (uint256)",
          "function transfer(address to, uint256 amount) returns (bool)",
          "function symbol() view returns (string)",
          "function decimals() view returns (uint8)"
        ]
      },
      EcoActionVerifier: {
        address: verifierAddr,
        abi: [
          "function submitActionV2(string description, string proofCid, uint8 creditType, bytes32 methodologyId, bytes32 projectId, bytes32 baselineId, uint256 quantity, uint256 uncertaintyBps, uint256 durabilityYears, string metadataCid)",
          "function verifyAction(uint256 actionId, uint256 reward)",
          "function finalizeAction(uint256 actionId)",
          "function stakeWithGCT(uint256 amount)",
          "function unstakeGCT(uint256 amount)",
          "function depositStake(uint256 amount)",
          "function withdrawStake(uint256 amount)",
          "function getActionCount() view returns (uint256)",
          "function actions(uint256) view returns (address user, string description, string proofCid, uint256 reward, uint256 timestamp, uint8 creditType, bytes32 methodologyId, bytes32 projectId, bytes32 baselineId, uint256 quantity, uint256 uncertaintyBps, uint256 durabilityYears, string metadataCid, bytes32 attestationUID, uint8 status, uint256 verifiedAt, uint256 rewardPending)",
          "function gctStakes(address) view returns (uint256)",
          "function usdStakeBalance(address) view returns (uint256)",
          "function gctToken() view returns (address)"
        ]
      },
      DonationPool: {
        address: poolAddr,
        abi: [
          "function donateTo(address ngo, uint256 amount)",
          "function isNGO(address ngo) view returns (bool)"
        ]
      },
      MockUSDC: {
        address: usdcAddr,
        abi: [
          "function balanceOf(address) view returns (uint256)",
          "function approve(address spender, uint256 value) returns (bool)",
          "function decimals() view returns (uint8)"
        ]
      }
    }
  };

  // Write deployment artifact
  const deploymentsDir = path.join(__dirname, "../../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const outputPath = path.join(deploymentsDir, "moonbeam.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
  console.log("\n📝 Deployment artifact written to:", outputPath);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   GreenCreditToken (GCT):", gctAddr);
  console.log("   EcoActionVerifier:     ", verifierAddr);
  console.log("   DonationPool:          ", poolAddr);
  console.log("   MockUSDC (testnet):    ", usdcAddr);
  console.log("\n📌 Next steps:");
  console.log("   1. Update frontend/.env with these addresses:");
  console.log(`      VITE_GCT_ADDRESS=${gctAddr}`);
  console.log(`      VITE_TOKEN_ADDRESS=${gctAddr}`);
  console.log(`      VITE_VERIFIER_ADDRESS=${verifierAddr}`);
  console.log(`      VITE_DONATION_POOL_ADDRESS=${poolAddr}`);
  console.log(`      VITE_USDC_ADDRESS=${usdcAddr}`);
  console.log("   2. Set VITE_CHAIN_ID=1287 for Moonbeam Alpha");
  console.log("   3. Configure DNS for green-credit.xyz in GitHub Pages");
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
