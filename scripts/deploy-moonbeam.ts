import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts to Moonbeam Alpha with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "DEV");

  // Deploy GreenCreditToken
  console.log("\n📦 Deploying GreenCreditToken...");
  const Token = await ethers.getContractFactory("GreenCreditToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("✅ GreenCreditToken deployed to:", tokenAddr);

  // Deploy EcoActionVerifier
  console.log("\n📦 Deploying EcoActionVerifier...");
  const Verifier = await ethers.getContractFactory("EcoActionVerifier");
  const verifier = await Verifier.deploy(tokenAddr);
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log("✅ EcoActionVerifier deployed to:", verifierAddr);

  // Transfer token ownership to verifier (for minting rights)
  console.log("\n🔑 Transferring GreenCreditToken ownership to EcoActionVerifier...");
  await token.transferOwnership(verifierAddr);
  console.log("✅ Ownership transferred to verifier");

  // Deploy DonationPool
  console.log("\n📦 Deploying DonationPool...");
  const DonationPool = await ethers.getContractFactory("DonationPool");
  const pool = await DonationPool.deploy(tokenAddr);
  await pool.waitForDeployment();
  const poolAddr = await pool.getAddress();
  console.log("✅ DonationPool deployed to:", poolAddr);

  // Optional: Add deployer as NGO for demo purposes
  console.log("\n👤 Adding deployer as NGO for demo...");
  await pool.setNGO(deployer.address, true);
  console.log("✅ Deployer added as NGO");

  // Create deployment artifact
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deployment = {
    network: "moonbeam-alpha",
    chainId: 1287,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      GreenCreditToken: {
        address: tokenAddr,
        abi: [
          "function balanceOf(address) view returns (uint256)",
          "function approve(address spender, uint256 value) returns (bool)",
          "function transfer(address to, uint256 amount) returns (bool)",
          "function allowance(address owner, address spender) view returns (uint256)",
          "function totalSupply() view returns (uint256)",
          "function name() view returns (string)",
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
          "function depositStake(uint256 amount)",
          "function withdrawStake(uint256 amount)",
          "function stakeWithGCT(uint256 amount)",
          "function getActionCount() view returns (uint256)",
          "function actions(uint256) view returns (address user, string description, string proofCid, uint256 reward, uint256 timestamp, uint8 creditType, bytes32 methodologyId, bytes32 projectId, bytes32 baselineId, uint256 quantity, uint256 uncertaintyBps, uint256 durabilityYears, string metadataCid, bytes32 attestationUID, uint8 status, uint256 verifiedAt, uint256 rewardPending)",
          "function stakeBalance(address) view returns (uint256)",
          "function gctStakes(address) view returns (uint256)",
          "function owner() view returns (address)"
        ]
      },
      DonationPool: {
        address: poolAddr,
        abi: [
          "function donateTo(address ngo, uint256 amount)",
          "function isNGO(address ngo) view returns (bool)"
        ]
      }
    }
  };

  const artifactPath = path.join(deploymentsDir, "moonbeam.json");
  fs.writeFileSync(artifactPath, JSON.stringify(deployment, null, 2));
  console.log("\n📝 Deployment artifact saved to:", artifactPath);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Deployment Summary");
  console.log("=".repeat(60));
  console.log("Network:              Moonbeam Alpha (chainId 1287)");
  console.log("Deployer:            ", deployer.address);
  console.log("GreenCreditToken:    ", tokenAddr);
  console.log("EcoActionVerifier:   ", verifierAddr);
  console.log("DonationPool:        ", poolAddr);
  console.log("=".repeat(60));

  console.log("\n📋 Next Steps:");
  console.log("1. Update frontend/.env with the following:");
  console.log(`   VITE_TOKEN_ADDRESS=${tokenAddr}`);
  console.log(`   VITE_VERIFIER_ADDRESS=${verifierAddr}`);
  console.log(`   VITE_DONATION_POOL_ADDRESS=${poolAddr}`);
  console.log(`   VITE_GCT_ADDRESS=${tokenAddr}`);
  console.log(`   VITE_CHAIN_ID=1287`);
  console.log(`   VITE_VERIFIER_HAS_PROOF=true`);
  console.log("2. Build and deploy frontend to GitHub Pages");
  console.log("3. Configure DNS for green-credit.xyz");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
