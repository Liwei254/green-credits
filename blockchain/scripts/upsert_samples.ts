import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("📝 Upserting sample entries with:", deployer.address);

  // Replace these addresses with your deployed contract addresses
  const METHODOLOGY_REGISTRY_ADDRESS = process.env.METHODOLOGY_REGISTRY_ADDRESS || "";
  const BASELINE_REGISTRY_ADDRESS = process.env.BASELINE_REGISTRY_ADDRESS || "";

  if (!METHODOLOGY_REGISTRY_ADDRESS || !BASELINE_REGISTRY_ADDRESS) {
    console.error("❌ Please set METHODOLOGY_REGISTRY_ADDRESS and BASELINE_REGISTRY_ADDRESS in .env");
    process.exit(1);
  }

  // Get contract instances
  const methodologyRegistry = await ethers.getContractAt(
    "MethodologyRegistry",
    METHODOLOGY_REGISTRY_ADDRESS
  );
  const baselineRegistry = await ethers.getContractAt(
    "BaselineRegistry",
    BASELINE_REGISTRY_ADDRESS
  );

  // Sample Methodology 1: Cookstove
  const methodId1 = ethers.id("Cookstove v1.2");
  console.log("\n🔍 Upserting Methodology: Cookstove v1.2");
  console.log("   ID:", methodId1);
  await methodologyRegistry.upsert(
    methodId1,
    "Clean Cookstove Distribution",
    "v1.2",
    "bafkreiexamplecookstovemethodology123", // placeholder CID
    true
  );
  console.log("✅ Methodology upserted");

  // Sample Methodology 2: Reforestation
  const methodId2 = ethers.id("Reforestation v2.0");
  console.log("\n🔍 Upserting Methodology: Reforestation v2.0");
  console.log("   ID:", methodId2);
  await methodologyRegistry.upsert(
    methodId2,
    "Native Forest Restoration",
    "v2.0",
    "bafkreiexamplereforestationmethod456", // placeholder CID
    true
  );
  console.log("✅ Methodology upserted");

  // Sample Project and Baseline
  const projectId1 = ethers.id("Project Kenya 001");
  const baselineId1 = ethers.id("Baseline Kenya 001 v1");
  console.log("\n🔍 Upserting Baseline: Kenya Project Baseline");
  console.log("   Project ID:", projectId1);
  console.log("   Baseline ID:", baselineId1);
  await baselineRegistry.upsert(
    baselineId1,
    projectId1,
    "v1.0",
    "bafkreiexamplebaselinekenya789", // placeholder CID
    true
  );
  console.log("✅ Baseline upserted");

  // Sample Project and Baseline 2
  const projectId2 = ethers.id("Project Amazon 002");
  const baselineId2 = ethers.id("Baseline Amazon 002 v1");
  console.log("\n🔍 Upserting Baseline: Amazon Project Baseline");
  console.log("   Project ID:", projectId2);
  console.log("   Baseline ID:", baselineId2);
  await baselineRegistry.upsert(
    baselineId2,
    projectId2,
    "v1.0",
    "bafkreiexamplebaselineamazon012", // placeholder CID
    true
  );
  console.log("✅ Baseline upserted");

  console.log("\n✨ Sample data upserted successfully!");
}

main().catch((err) => {
  console.error("❌ Upsert failed:", err);
  process.exitCode = 1;
});
