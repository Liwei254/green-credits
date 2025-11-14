const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EcoActionVerifier - GCT Staking", function () {
  let gct, usdc, verifier, owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("Mock USDC", "USDC", 6, ethers.parseUnits("1000000", 6));
    await usdc.waitForDeployment();

    // Deploy GCT
    const GCT = await ethers.getContractFactory("GreenCreditToken");
    gct = await GCT.deploy();
    await gct.waitForDeployment();

    // Deploy verifier
    const Verifier = await ethers.getContractFactory("EcoActionVerifier");
    verifier = await Verifier.deploy(await usdc.getAddress(), await gct.getAddress());
    await verifier.waitForDeployment();

    // Transfer some GCT to user1 for testing
    await gct.transfer(user1.address, ethers.parseUnits("1000", 18));
  });

  describe("stakeWithGCT", function () {
    it("should allow users to stake GCT tokens", async function () {
      const stakeAmount = ethers.parseUnits("100", 18);
      
      // Approve verifier to spend user's GCT
      await gct.connect(user1).approve(await verifier.getAddress(), stakeAmount);
      
      // Stake GCT
      await expect(verifier.connect(user1).stakeWithGCT(stakeAmount))
        .to.emit(verifier, "Staked")
        .withArgs(user1.address, await gct.getAddress(), stakeAmount);
      
      // Check stake balance
      expect(await verifier.gctStakes(user1.address)).to.equal(stakeAmount);
    });

    it("should revert when staking zero amount", async function () {
      await expect(
        verifier.connect(user1).stakeWithGCT(0)
      ).to.be.revertedWith("Cannot stake zero amount");
    });

    it("should revert when user has insufficient balance", async function () {
      const stakeAmount = ethers.parseUnits("10000", 18); // More than user has
      
      await gct.connect(user1).approve(await verifier.getAddress(), stakeAmount);
      
      // This should fail because user doesn't have enough tokens
      await expect(
        verifier.connect(user1).stakeWithGCT(stakeAmount)
      ).to.be.reverted;
    });

    it("should revert when user has not approved tokens", async function () {
      const stakeAmount = ethers.parseUnits("100", 18);
      
      // Don't approve, just try to stake
      await expect(
        verifier.connect(user1).stakeWithGCT(stakeAmount)
      ).to.be.reverted;
    });

    it("should accumulate stakes from multiple deposits", async function () {
      const stakeAmount1 = ethers.parseUnits("100", 18);
      const stakeAmount2 = ethers.parseUnits("50", 18);
      
      // First stake
      await gct.connect(user1).approve(await verifier.getAddress(), stakeAmount1);
      await verifier.connect(user1).stakeWithGCT(stakeAmount1);
      
      // Second stake
      await gct.connect(user1).approve(await verifier.getAddress(), stakeAmount2);
      await verifier.connect(user1).stakeWithGCT(stakeAmount2);
      
      // Check total stake
      expect(await verifier.gctStakes(user1.address)).to.equal(stakeAmount1 + stakeAmount2);
    });
  });

  describe("unstakeGCT", function () {
    beforeEach(async function () {
      // Stake some tokens first
      const stakeAmount = ethers.parseUnits("100", 18);
      await gct.connect(user1).approve(await verifier.getAddress(), stakeAmount);
      await verifier.connect(user1).stakeWithGCT(stakeAmount);
    });

    it("should allow users to unstake GCT tokens", async function () {
      const unstakeAmount = ethers.parseUnits("50", 18);
      const initialBalance = await gct.balanceOf(user1.address);
      
      await expect(verifier.connect(user1).unstakeGCT(unstakeAmount))
        .to.emit(verifier, "Unstaked")
        .withArgs(user1.address, await gct.getAddress(), unstakeAmount);
      
      // Check stake balance decreased
      expect(await verifier.gctStakes(user1.address)).to.equal(ethers.parseUnits("50", 18));
      
      // Check user received tokens
      expect(await gct.balanceOf(user1.address)).to.equal(initialBalance + unstakeAmount);
    });

    it("should revert when unstaking zero amount", async function () {
      await expect(
        verifier.connect(user1).unstakeGCT(0)
      ).to.be.revertedWith("Cannot unstake zero amount");
    });

    it("should revert when unstaking more than staked", async function () {
      const unstakeAmount = ethers.parseUnits("200", 18); // More than staked (100)
      
      await expect(
        verifier.connect(user1).unstakeGCT(unstakeAmount)
      ).to.be.revertedWith("Insufficient staked balance");
    });

    it("should allow unstaking entire stake", async function () {
      const stakeAmount = ethers.parseUnits("100", 18);
      const initialBalance = await gct.balanceOf(user1.address);
      
      await verifier.connect(user1).unstakeGCT(stakeAmount);
      
      // Check stake balance is zero
      expect(await verifier.gctStakes(user1.address)).to.equal(0);
      
      // Check user received all tokens back
      expect(await gct.balanceOf(user1.address)).to.equal(initialBalance + stakeAmount);
    });
  });

  describe("Multiple users staking", function () {
    it("should track stakes separately for different users", async function () {
      const stakeAmount1 = ethers.parseUnits("100", 18);
      const stakeAmount2 = ethers.parseUnits("200", 18);
      
      // Transfer GCT to user2
      await gct.transfer(user2.address, ethers.parseUnits("500", 18));
      
      // User1 stakes
      await gct.connect(user1).approve(await verifier.getAddress(), stakeAmount1);
      await verifier.connect(user1).stakeWithGCT(stakeAmount1);
      
      // User2 stakes
      await gct.connect(user2).approve(await verifier.getAddress(), stakeAmount2);
      await verifier.connect(user2).stakeWithGCT(stakeAmount2);
      
      // Check both stakes are tracked correctly
      expect(await verifier.gctStakes(user1.address)).to.equal(stakeAmount1);
      expect(await verifier.gctStakes(user2.address)).to.equal(stakeAmount2);
    });
  });
});
