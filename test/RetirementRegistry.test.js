const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RetirementRegistry", function () {
  let registry;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const RetirementRegistry = await ethers.getContractFactory("RetirementRegistry");
    registry = await RetirementRegistry.deploy();
  });

  it("should retire credits and generate serial", async function () {
    const actionIds = [1, 2, 3];
    const grams = [100000, 200000, 150000]; // CO2e in grams
    const reason = "Carbon neutral initiative";
    const beneficiary = "Company XYZ";

    const tx = await registry.connect(user1).retire(actionIds, grams, reason, beneficiary);
    const receipt = await tx.wait();

    // Check event
    const event = receipt.logs.find(log => {
      try {
        return registry.interface.parseLog(log).name === "Retired";
      } catch {
        return false;
      }
    });
    expect(event).to.not.be.undefined;

    // Should return serial 1
    const serial = 1;
    const retirement = await registry.getRetirement(serial);
    
    expect(retirement.serial).to.equal(serial);
    expect(retirement.account).to.equal(user1.address);
    expect(retirement.actionIds.length).to.equal(3);
    expect(retirement.actionIds[0]).to.equal(1);
    expect(retirement.actionIds[1]).to.equal(2);
    expect(retirement.actionIds[2]).to.equal(3);
    expect(retirement.grams[0]).to.equal(100000);
    expect(retirement.grams[1]).to.equal(200000);
    expect(retirement.grams[2]).to.equal(150000);
    expect(retirement.reason).to.equal(reason);
    expect(retirement.beneficiary).to.equal(beneficiary);
  });

  it("should track retirements by account", async function () {
    // User1 retires twice
    await registry.connect(user1).retire([1], [100000], "First", "Beneficiary A");
    await registry.connect(user1).retire([2], [200000], "Second", "Beneficiary B");
    
    // User2 retires once
    await registry.connect(user2).retire([3], [300000], "Third", "Beneficiary C");

    const user1Retirements = await registry.getRetirementsByAccount(user1.address);
    const user2Retirements = await registry.getRetirementsByAccount(user2.address);

    expect(user1Retirements.length).to.equal(2);
    expect(user1Retirements[0]).to.equal(1);
    expect(user1Retirements[1]).to.equal(2);

    expect(user2Retirements.length).to.equal(1);
    expect(user2Retirements[0]).to.equal(3);
  });

  it("should increment serial numbers", async function () {
    await registry.connect(user1).retire([1], [100000], "First", "A");
    await registry.connect(user2).retire([2], [200000], "Second", "B");
    await registry.connect(user1).retire([3], [300000], "Third", "C");

    const count = await registry.getRetirementCount();
    expect(count).to.equal(3);

    const retirement1 = await registry.getRetirement(1);
    const retirement2 = await registry.getRetirement(2);
    const retirement3 = await registry.getRetirement(3);

    expect(retirement1.serial).to.equal(1);
    expect(retirement2.serial).to.equal(2);
    expect(retirement3.serial).to.equal(3);
  });

  it("should reject empty action arrays", async function () {
    await expect(
      registry.connect(user1).retire([], [], "Empty", "Beneficiary")
    ).to.be.revertedWith("No actions provided");
  });

  it("should reject mismatched array lengths", async function () {
    await expect(
      registry.connect(user1).retire([1, 2], [100000], "Mismatch", "Beneficiary")
    ).to.be.revertedWith("Length mismatch");
  });

  it("should reject invalid serial in getRetirement", async function () {
    await expect(
      registry.getRetirement(999)
    ).to.be.revertedWith("Invalid serial");
  });

  it("should handle multiple actions in single retirement", async function () {
    const actionIds = [10, 20, 30, 40, 50];
    const grams = [50000, 75000, 100000, 125000, 150000];
    
    await registry.connect(user1).retire(actionIds, grams, "Bulk retirement", "Organization");
    
    const retirement = await registry.getRetirement(1);
    expect(retirement.actionIds.length).to.equal(5);
    expect(retirement.grams.length).to.equal(5);
    
    let totalGrams = 0;
    for (let i = 0; i < grams.length; i++) {
      totalGrams += grams[i];
      expect(retirement.grams[i]).to.equal(grams[i]);
    }
    expect(totalGrams).to.equal(500000);
  });
});
