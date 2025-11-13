/**
 * Green Credits - Demo Data Seeder
 * 
 * Seeds deployed contracts with demo data for development and testing:
 * - Adds sample verifiers
 * - Adds sample NGOs
 * - Deploys MockUSDC if needed
 * - Transfers mock tokens to demo addresses
 * - Creates sample methodologies and baselines
 * 
 * Safe to run multiple times (idempotent where possible)
 * 
 * Usage:
 *   npx hardhat run scripts/seedDemo.js --network localhost
 *   npx hardhat run scripts/seedDemo.js --network moonbase
 */

const hre = require("hardhat");
const { ethers } = hre;

// Demo addresses (Hardhat default accounts for localhost)
const DEMO_ADDRESSES = [
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Account #1
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Account #2
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Account #3
];

// Sample NGOs
const SAMPLE_NGOS = [
  {
    name: "Green Earth Foundation",
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Account #4
  },
  {
    name: "Ocean Cleanup Initiative",
    address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", // Account #5
  },
  {
    name: "Forest Restoration Project",
    address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9", // Account #6
  },
];

// Sample Methodologies
const SAMPLE_METHODOLOGIES = [
  {
    id: ethers.id("CDM-AR-ACM0001"),
    name: "Afforestation and Reforestation",
    version: "v3.0",
    cid: "bafkreidemo1afforestation",
    active: true,
  },
  {
    id: ethers.id("VM0042"),
    name: "Verified Carbon Standard - Blue Carbon",
    version: "v1.0",
    cid: "bafkreidemo2bluecarbon",
    active: true,
  },
  {
    id: ethers.id("RENEWABLE-ENERGY-001"),
    name: "Renewable Energy Deployment",
    version: "v2.1",
    cid: "bafkreidemo3renewable",
    active: true,
  },
];

// Sample Baselines
const SAMPLE_BASELINES = [
  {
    id: ethers.id("BASELINE-AF-2024"),
    name: "Afforestation Baseline 2024",
    version: "v1.0",
    cid: "bafkreibaselineaf2024",
    active: true,
  },
  {
    id: ethers.id("BASELINE-ENERGY-2024"),
    name: "Energy Efficiency Baseline 2024",
    version: "v1.0",
    cid: "bafkreibaselineenergy",
    active: true,
  },
];

async function main() {
  console.log("\n🌱 Green Credits - Demo Data Seeder");
  console.log("=====================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Running as:", deployer.address);
  console.log("Network:", hre.network.name);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  // Get contract addresses from environment or prompt
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || process.env.VITE_TOKEN_ADDRESS;
  const VERIFIER_ADDRESS = process.env.VERIFIER_ADDRESS || process.env.VITE_VERIFIER_ADDRESS;
  const POOL_ADDRESS = process.env.POOL_ADDRESS || process.env.VITE_DONATION_POOL_ADDRESS;
  const METHODOLOGY_ADDRESS = process.env.METHODOLOGY_REGISTRY_ADDRESS || process.env.VITE_METHODOLOGY_REGISTRY_ADDRESS;
  const BASELINE_ADDRESS = process.env.BASELINE_REGISTRY_ADDRESS || process.env.VITE_BASELINE_REGISTRY_ADDRESS;
  const USDC_ADDRESS = process.env.USDC_ADDRESS || process.env.VITE_MOCK_USDC_ADDRESS;

  if (!TOKEN_ADDRESS || !VERIFIER_ADDRESS) {
    console.error("❌ Missing required contract addresses!");
    console.error("Set TOKEN_ADDRESS and VERIFIER_ADDRESS environment variables");
    console.error("\nExample:");
    console.error("  TOKEN_ADDRESS=0x... VERIFIER_ADDRESS=0x... npx hardhat run scripts/seedDemo.js --network localhost");
    process.exit(1);
  }

  console.log("📍 Contract Addresses:");
  console.log("  Token:", TOKEN_ADDRESS);
  console.log("  Verifier:", VERIFIER_ADDRESS);
  if (POOL_ADDRESS) console.log("  Donation Pool:", POOL_ADDRESS);
  if (METHODOLOGY_ADDRESS) console.log("  Methodology Registry:", METHODOLOGY_ADDRESS);
  if (BASELINE_ADDRESS) console.log("  Baseline Registry:", BASELINE_ADDRESS);
  if (USDC_ADDRESS) console.log("  Mock USDC:", USDC_ADDRESS);
  console.log();

  // Connect to contracts
  const token = await ethers.getContractAt("GreenCreditToken", TOKEN_ADDRESS);
  const verifier = await ethers.getContractAt("EcoActionVerifier", VERIFIER_ADDRESS);
  
  let pool, methodologyRegistry, baselineRegistry, mockUSDC;
  
  if (POOL_ADDRESS) {
    pool = await ethers.getContractAt("DonationPool", POOL_ADDRESS);
  }
  
  if (METHODOLOGY_ADDRESS) {
    methodologyRegistry = await ethers.getContractAt("MethodologyRegistry", METHODOLOGY_ADDRESS);
  }
  
  if (BASELINE_ADDRESS) {
    baselineRegistry = await ethers.getContractAt("BaselineRegistry", BASELINE_ADDRESS);
  }

  // Step 1: Add Verifiers
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Step 1: Adding Sample Verifiers");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (const addr of DEMO_ADDRESSES) {
    try {
      const isVerifier = await verifier.isVerifier(addr);
      if (isVerifier) {
        console.log(`⏭️  ${addr} is already a verifier, skipping`);
      } else {
        const tx = await verifier.addVerifier(addr);
        await tx.wait();
        console.log(`✅ Added verifier: ${addr}`);
      }
    } catch (error) {
      console.log(`⚠️  Failed to add verifier ${addr}:`, error.message);
    }
  }

  // Step 2: Add NGOs (if DonationPool exists)
  if (pool) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Step 2: Adding Sample NGOs");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    for (const ngo of SAMPLE_NGOS) {
      try {
        const isAllowed = await pool.allowedNGOs(ngo.address);
        if (isAllowed) {
          console.log(`⏭️  ${ngo.name} (${ngo.address}) is already an NGO, skipping`);
        } else {
          const tx = await pool.setNGO(ngo.address, true);
          await tx.wait();
          console.log(`✅ Added NGO: ${ngo.name} (${ngo.address})`);
        }
      } catch (error) {
        console.log(`⚠️  Failed to add NGO ${ngo.name}:`, error.message);
      }
    }
  }

  // Step 3: Add Methodologies (if registry exists)
  if (methodologyRegistry) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Step 3: Adding Sample Methodologies");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    for (const method of SAMPLE_METHODOLOGIES) {
      try {
        // Check if methodology already exists
        const existing = await methodologyRegistry.get(method.id);
        if (existing.active) {
          console.log(`⏭️  ${method.name} already exists, skipping`);
        } else {
          const tx = await methodologyRegistry.upsert(
            method.id,
            method.name,
            method.version,
            method.cid,
            method.active
          );
          await tx.wait();
          console.log(`✅ Added methodology: ${method.name} (${method.version})`);
        }
      } catch (error) {
        console.log(`⚠️  Failed to add methodology ${method.name}:`, error.message);
      }
    }
  }

  // Step 4: Add Baselines (if registry exists)
  if (baselineRegistry) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Step 4: Adding Sample Baselines");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    for (const baseline of SAMPLE_BASELINES) {
      try {
        // Check if baseline already exists
        const existing = await baselineRegistry.get(baseline.id);
        if (existing.active) {
          console.log(`⏭️  ${baseline.name} already exists, skipping`);
        } else {
          const tx = await baselineRegistry.upsert(
            baseline.id,
            baseline.name,
            baseline.version,
            baseline.cid,
            baseline.active
          );
          await tx.wait();
          console.log(`✅ Added baseline: ${baseline.name} (${baseline.version})`);
        }
      } catch (error) {
        console.log(`⚠️  Failed to add baseline ${baseline.name}:`, error.message);
      }
    }
  }

  // Step 5: Deploy/Connect MockUSDC
  if (USDC_ADDRESS) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Step 5: Mock USDC Setup");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    try {
      mockUSDC = await ethers.getContractAt("MockERC20", USDC_ADDRESS);
      console.log(`✅ Connected to MockUSDC at ${USDC_ADDRESS}`);
      
      // Transfer some USDC to demo addresses
      const usdcAmount = ethers.parseUnits("1000", 6); // 1000 USDC (6 decimals)
      
      for (const addr of DEMO_ADDRESSES.slice(0, 3)) {
        try {
          const balance = await mockUSDC.balanceOf(addr);
          if (balance > 0) {
            console.log(`⏭️  ${addr} already has ${ethers.formatUnits(balance, 6)} USDC, skipping`);
          } else {
            const tx = await mockUSDC.transfer(addr, usdcAmount);
            await tx.wait();
            console.log(`✅ Transferred 1000 USDC to ${addr}`);
          }
        } catch (error) {
          console.log(`⚠️  Failed to transfer USDC to ${addr}:`, error.message);
        }
      }
    } catch (error) {
      console.log(`⚠️  MockUSDC not found or error: ${error.message}`);
    }
  }

  // Summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Demo Data Seeding Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📊 Summary:");
  console.log(`  ✓ Verifiers: ${DEMO_ADDRESSES.length} addresses`);
  if (pool) console.log(`  ✓ NGOs: ${SAMPLE_NGOS.length} organizations`);
  if (methodologyRegistry) console.log(`  ✓ Methodologies: ${SAMPLE_METHODOLOGIES.length} registered`);
  if (baselineRegistry) console.log(`  ✓ Baselines: ${SAMPLE_BASELINES.length} registered`);
  if (mockUSDC) console.log(`  ✓ Mock USDC: Distributed to demo accounts`);
  
  console.log("\n💡 Next Steps:");
  console.log("  1. Start the frontend: cd frontend && npm run dev");
  console.log("  2. Connect with one of the demo addresses");
  console.log("  3. Try submitting and verifying actions!");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error during seeding:", error);
    process.exit(1);
  });
