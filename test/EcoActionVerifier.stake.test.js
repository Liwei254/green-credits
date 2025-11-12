const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EcoActionVerifier - GCT Staking", function () {
  let token, verifier;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy GreenCreditToken
    const Token = await ethers.getContractFactory("GreenCreditToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    // Deploy EcoActionVerifier
    const Verifier = await ethers.getContractFactory("EcoActionVerifier");
    verifier = await Verifier.deploy(await token.getAddress());
    await verifier.waitForDeployment();

    // Transfer some tokens to users for testing
    await token.transfer(user1.address, ethers.parseUnits("1000", 18));
    await token.transfer(user2.address, ethers.parseUnits("500", 18));
  });

  describe("GCT Token Configuration", function () {
    it("should have gctToken set to token address in constructor", async function () {
      const gctToken = await verifier.gctToken();
      expect(gctToken).to.equal(await token.getAddress());
    });

    it("should allow owner to update gctToken address", async function () {
      const newTokenAddress = "0x1234567890123456789012345678901234567890";
      await verifier.setGCTToken(newTokenAddress);
      expect(await verifier.gctToken()).to.equal(newTokenAddress);
    });

    it("should reject zero address when setting gctToken", async function () {
      await expect(
        verifier.setGCTToken(ethers.ZeroAddress)
      ).to.be.revertedWith("Zero address");
    });

    it("should only allow owner to set gctToken", async function () {
      const newTokenAddress = "0x1234567890123456789012345678901234567890";
      await expect(
        verifier.connect(user1).setGCTToken(newTokenAddress)
      ).to.be.revertedWithCustomError(verifier, "OwnableUnauthorizedAccount");
    });
  });

  describe("Staking with GCT", function () {
    it("should allow user to stake GCT tokens", async function () {
      const stakeAmount = ethers.parseUnits("100", 18);
      
      // Approve verifier to spend tokens
      await token.connect(user1).approve(await verifier.getAddress(), stakeAmount);
      
      // Stake tokens
      await expect(verifier.connect(user1).stakeWithGCT(stakeAmount))
        .to.emit(verifier, "Staked")
        .withArgs(user1.address, await token.getAddress(), stakeAmount);

      // Check stake balance
      const userStake = await verifier.gctStakes(user1.address);
      expect(userStake).to.equal(stakeAmount);

      // Check token balance (should be transferred to verifier)
      const verifierBalance = await token.balanceOf(await verifier.getAddress());
      expect(verifierBalance).to.equal(stakeAmount);
    });

    it("should reject zero stake amount", async function () {
      await expect(
        verifier.connect(user1).stakeWithGCT(0)
      ).to.be.revertedWith("Zero stake");
    });

    it("should revert if user has not approved tokens", async function () {
      const stakeAmount = ethers.parseUnits("100", 18);
      
      // Try to stake without approval
      await expect(
        verifier.connect(user1).stakeWithGCT(stakeAmount)
      ).to.be.reverted; // SafeERC20 will revert
    });

    it("should revert if user tries to stake more than balance", async function () {
      const stakeAmount = ethers.parseUnits("2000", 18); // More than user1's 1000
      
      // Approve more than balance
      await token.connect(user1).approve(await verifier.getAddress(), stakeAmount);
      
      // Try to stake
      await expect(
        verifier.connect(user1).stakeWithGCT(stakeAmount)
      ).to.be.reverted;
    });

    it("should accumulate stakes from multiple deposits", async function () {
      const stakeAmount1 = ethers.parseUnits("50", 18);
      const stakeAmount2 = ethers.parseUnits("75", 18);
      
      // First stake
      await token.connect(user1).approve(await verifier.getAddress(), stakeAmount1);
      await verifier.connect(user1).stakeWithGCT(stakeAmount1);
      
      // Second stake
      await token.connect(user1).approve(await verifier.getAddress(), stakeAmount2);
      await verifier.connect(user1).stakeWithGCT(stakeAmount2);

      // Check total stake
      const userStake = await verifier.gctStakes(user1.address);
      expect(userStake).to.equal(stakeAmount1 + stakeAmount2);
    });

    it("should handle multiple users staking independently", async function () {
      const stake1 = ethers.parseUnits("100", 18);
      const stake2 = ethers.parseUnits("200", 18);
      
      // User1 stakes
      await token.connect(user1).approve(await verifier.getAddress(), stake1);
      await verifier.connect(user1).stakeWithGCT(stake1);
      
      // User2 stakes
      await token.connect(user2).approve(await verifier.getAddress(), stake2);
      await verifier.connect(user2).stakeWithGCT(stake2);

      // Check individual stakes
      expect(await verifier.gctStakes(user1.address)).to.equal(stake1);
      expect(await verifier.gctStakes(user2.address)).to.equal(stake2);
    });
  });

  describe("Withdrawing GCT Stakes", function () {
    beforeEach(async function () {
      // Setup: User1 stakes some tokens
      const stakeAmount = ethers.parseUnits("200", 18);
      await token.connect(user1).approve(await verifier.getAddress(), stakeAmount);
      await verifier.connect(user1).stakeWithGCT(stakeAmount);
    });

    it("should allow user to withdraw staked GCT", async function () {
      const withdrawAmount = ethers.parseUnits("100", 18);
      const initialBalance = await token.balanceOf(user1.address);

      await verifier.connect(user1).withdrawGCTStake(withdrawAmount);

      // Check stake reduced
      const remainingStake = await verifier.gctStakes(user1.address);
      expect(remainingStake).to.equal(ethers.parseUnits("100", 18));

      // Check tokens returned
      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance + withdrawAmount);
    });

    it("should allow user to withdraw entire stake", async function () {
      const stakeAmount = ethers.parseUnits("200", 18);
      
      await verifier.connect(user1).withdrawGCTStake(stakeAmount);

      // Check stake is zero
      expect(await verifier.gctStakes(user1.address)).to.equal(0);
    });

    it("should revert if user tries to withdraw more than staked", async function () {
      const withdrawAmount = ethers.parseUnits("300", 18); // More than staked

      await expect(
        verifier.connect(user1).withdrawGCTStake(withdrawAmount)
      ).to.be.revertedWith("Insufficient GCT stake");
    });

    it("should revert if user with no stake tries to withdraw", async function () {
      await expect(
        verifier.connect(user2).withdrawGCTStake(ethers.parseUnits("1", 18))
      ).to.be.revertedWith("Insufficient GCT stake");
    });

    it("should handle multiple partial withdrawals", async function () {
      const withdraw1 = ethers.parseUnits("50", 18);
      const withdraw2 = ethers.parseUnits("75", 18);
      
      await verifier.connect(user1).withdrawGCTStake(withdraw1);
      await verifier.connect(user1).withdrawGCTStake(withdraw2);

      // Check remaining stake
      const remainingStake = await verifier.gctStakes(user1.address);
      expect(remainingStake).to.equal(ethers.parseUnits("75", 18));
    });
  });

  describe("Edge Cases", function () {
    it("should handle very small stake amounts", async function () {
      const tinyAmount = 1n; // 1 wei
      
      await token.connect(user1).approve(await verifier.getAddress(), tinyAmount);
      await verifier.connect(user1).stakeWithGCT(tinyAmount);

      expect(await verifier.gctStakes(user1.address)).to.equal(tinyAmount);
    });

    it("should maintain separate balances for depositStake and stakeWithGCT", async function () {
      const gctStakeAmount = ethers.parseUnits("100", 18);
      
      // Stake with GCT
      await token.connect(user1).approve(await verifier.getAddress(), gctStakeAmount);
      await verifier.connect(user1).stakeWithGCT(gctStakeAmount);

      // Note: depositStake uses the old staking mechanism (stakeBalance)
      // Check that gctStakes and stakeBalance are separate
      expect(await verifier.gctStakes(user1.address)).to.equal(gctStakeAmount);
      expect(await verifier.stakeBalance(user1.address)).to.equal(0);
    });
  });

  describe("Integration with existing stake system", function () {
    it("should allow both old depositStake and new stakeWithGCT to coexist", async function () {
      const amount = ethers.parseUnits("100", 18);
      
      // Use old depositStake method
      await token.connect(user1).approve(await verifier.getAddress(), amount);
      await verifier.connect(user1).depositStake(amount);

      // Use new stakeWithGCT method
      await token.connect(user1).approve(await verifier.getAddress(), amount);
      await verifier.connect(user1).stakeWithGCT(amount);

      // Both should be tracked separately
      expect(await verifier.stakeBalance(user1.address)).to.equal(amount);
      expect(await verifier.gctStakes(user1.address)).to.equal(amount);
    });
  });
});
