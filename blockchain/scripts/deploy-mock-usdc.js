/**
 * Green Credits - Mock USDC Deployment Script
 * 
 * Deploys a MockERC20 token to simulate USDC stablecoin for:
 * - Demo donations in the donation pool
 * - Testing token interactions
 * - Development environment setup
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-mock-usdc.js --network localhost
 *   npx hardhat run scripts/deploy-mock-usdc.js --network moonbase
 * 
 * The mock token will have:
 * - Name: "Mock USDC"
 * - Symbol: "USDC"
 * - Decimals: 6 (matching real USDC)
 * - Initial Supply: 1,000,000 USDC to deployer
 */

const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("\n💵 Deploying Mock USDC Token");
  console.log("====================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  console.log("Network:", hre.network.name);
  console.log();

  // Check if MockERC20 contract exists
  let MockERC20;
  try {
    MockERC20 = await ethers.getContractFactory("MockERC20");
  } catch (error) {
    console.error("❌ MockERC20 contract not found!");
    console.error("Create contracts/MockERC20.sol with ERC20 implementation");
    console.error("\nExample contract:");
    console.error(`
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
    `);
    process.exit(1);
  }

  console.log("📦 Deploying MockERC20...");
  
  const name = "Mock USDC";
  const symbol = "USDC";
  const decimals = 6;
  const initialSupply = ethers.parseUnits("1000000", decimals); // 1 million USDC

  const mockUSDC = await MockERC20.deploy(name, symbol, decimals, initialSupply);
  await mockUSDC.waitForDeployment();
  
  const mockUSDCAddress = await mockUSDC.getAddress();

  console.log("\n✅ MockERC20 deployed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  console.log("📍 Contract Details:");
  console.log("  Address:", mockUSDCAddress);
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Decimals:", decimals);
  console.log("  Initial Supply:", ethers.formatUnits(initialSupply, decimals), symbol);
  console.log("  Deployer Balance:", ethers.formatUnits(initialSupply, decimals), symbol);
  
  console.log("\n💡 Next Steps:");
  console.log("  1. Add to frontend/.env:");
  console.log(`     VITE_MOCK_USDC_ADDRESS=${mockUSDCAddress}`);
  console.log();
  console.log("  2. Use in seedDemo.js:");
  console.log(`     USDC_ADDRESS=${mockUSDCAddress} npx hardhat run scripts/seedDemo.js --network ${hre.network.name}`);
  console.log();
  console.log("  3. Transfer tokens to test accounts:");
  console.log(`     await mockUSDC.transfer("0xRecipientAddress", ethers.parseUnits("1000", 6))`);
  console.log();

  // Verify contract on block explorer (only for public networks)
  if (hre.network.name === "moonbase") {
    console.log("📝 To verify on Moonscan:");
    console.log(`   npx hardhat verify --network moonbase ${mockUSDCAddress} "${name}" "${symbol}" ${decimals} ${initialSupply}`);
    console.log();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
