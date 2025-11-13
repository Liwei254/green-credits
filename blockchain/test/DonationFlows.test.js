const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Donation Flows", function () {
  let token, donationPool;
  let owner, donor1, donor2, ngo1, ngo2, nonNgo;

  beforeEach(async function () {
    [owner, donor1, donor2, ngo1, ngo2, nonNgo] = await ethers.getSigners();

    // Deploy token
    const Token = await ethers.getContractFactory("GreenCreditToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    // Deploy donation pool
    const DonationPool = await ethers.getContractFactory("DonationPool");
    donationPool = await DonationPool.deploy(await token.getAddress());
    await donationPool.waitForDeployment();

    // Mint tokens to donors
    await token.mint(donor1.address, ethers.parseUnits("1000", 18));
    await token.mint(donor2.address, ethers.parseUnits("1000", 18));

    // Set up NGOs
    await donationPool.setNGO(ngo1.address, true);
    await donationPool.setNGO(ngo2.address, true);
  });

  describe("NGO Management", function () {
    it("should allow owner to add NGO", async function () {
      expect(await donationPool.isNGO(ngo1.address)).to.be.true;
    });

    it("should allow owner to remove NGO", async function () {
      await donationPool.setNGO(ngo1.address, false);
      expect(await donationPool.isNGO(ngo1.address)).to.be.false;
    });

    it("should prevent non-owner from managing NGOs", async function () {
      await expect(
        donationPool.connect(donor1).setNGO(nonNgo.address, true)
      ).to.be.revertedWithCustomError(donationPool, "OwnableUnauthorizedAccount");
    });

    it("should reject zero address NGO", async function () {
      await expect(
        donationPool.setNGO(ethers.ZeroAddress, true)
      ).to.be.revertedWith("Zero address");
    });
  });

  describe("Donation Process", function () {
    it("should allow approved donation to NGO", async function () {
      const amount = ethers.parseUnits("100", 18);

      // Approve donation pool to spend tokens
      await token.connect(donor1).approve(await donationPool.getAddress(), amount);

      // Check initial balances
      const initialDonorBalance = await token.balanceOf(donor1.address);
      const initialNgoBalance = await token.balanceOf(ngo1.address);

      // Make donation
      await donationPool.connect(donor1).donateTo(ngo1.address, amount);

      // Check final balances
      expect(await token.balanceOf(donor1.address)).to.equal(initialDonorBalance - amount);
      expect(await token.balanceOf(ngo1.address)).to.equal(initialNgoBalance + amount);
    });

    it("should reject donation to non-approved NGO", async function () {
      const amount = ethers.parseUnits("100", 18);
      await token.connect(donor1).approve(await donationPool.getAddress(), amount);

      await expect(
        donationPool.connect(donor1).donateTo(nonNgo.address, amount)
      ).to.be.revertedWith("NGO not allowed");
    });

    it("should reject donation without approval", async function () {
      const amount = ethers.parseUnits("100", 18);
      await expect(
        donationPool.connect(donor1).donateTo(ngo1.address, amount)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
    });

    it("should reject zero amount donation", async function () {
      await expect(
        donationPool.connect(donor1).donateTo(ngo1.address, 0)
      ).to.be.revertedWith("Zero amount");
    });

    it("should handle multiple donations to same NGO", async function () {
      const amount1 = ethers.parseUnits("50", 18);
      const amount2 = ethers.parseUnits("75", 18);

      await token.connect(donor1).approve(await donationPool.getAddress(), amount1 + amount2);
      await donationPool.connect(donor1).donateTo(ngo1.address, amount1);
      await donationPool.connect(donor1).donateTo(ngo1.address, amount2);

      expect(await token.balanceOf(ngo1.address)).to.equal(amount1 + amount2);
    });

    it("should handle donations from multiple donors", async function () {
      const amount1 = ethers.parseUnits("100", 18);
      const amount2 = ethers.parseUnits("200", 18);

      await token.connect(donor1).approve(await donationPool.getAddress(), amount1);
      await token.connect(donor2).approve(await donationPool.getAddress(), amount2);

      await donationPool.connect(donor1).donateTo(ngo1.address, amount1);
      await donationPool.connect(donor2).donateTo(ngo1.address, amount2);

      expect(await token.balanceOf(ngo1.address)).to.equal(amount1 + amount2);
    });

    it("should handle donations to multiple NGOs", async function () {
      const amount = ethers.parseUnits("100", 18);

      await token.connect(donor1).approve(await donationPool.getAddress(), amount * 2n);

      await donationPool.connect(donor1).donateTo(ngo1.address, amount);
      await donationPool.connect(donor1).donateTo(ngo2.address, amount);

      expect(await token.balanceOf(ngo1.address)).to.equal(amount);
      expect(await token.balanceOf(ngo2.address)).to.equal(amount);
    });
  });

  describe("Event Emission", function () {
    it("should emit NGOToggled event", async function () {
      await expect(donationPool.setNGO(nonNgo.address, true))
        .to.emit(donationPool, "NGOToggled")
        .withArgs(nonNgo.address, true);
    });

    it("should emit DonationMade event", async function () {
      const amount = ethers.parseUnits("100", 18);
      await token.connect(donor1).approve(await donationPool.getAddress(), amount);

      const tx = await donationPool.connect(donor1).donateTo(ngo1.address, amount);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(donationPool, "DonationMade")
        .withArgs(donor1.address, ngo1.address, amount, block.timestamp);
    });
  });

  describe("Edge Cases", function () {
    it("should handle maximum token amount donation", async function () {
      const maxAmount = ethers.parseUnits("1000", 18); // Full balance
      await token.connect(donor1).approve(await donationPool.getAddress(), maxAmount);

      await donationPool.connect(donor1).donateTo(ngo1.address, maxAmount);
      expect(await token.balanceOf(donor1.address)).to.equal(0);
      expect(await token.balanceOf(ngo1.address)).to.equal(maxAmount);
    });

    it("should handle donation after NGO status change", async function () {
      const amount = ethers.parseUnits("100", 18);
      await token.connect(donor1).approve(await donationPool.getAddress(), amount);

      // Remove NGO status
      await donationPool.setNGO(ngo1.address, false);

      await expect(
        donationPool.connect(donor1).donateTo(ngo1.address, amount)
      ).to.be.revertedWith("NGO not allowed");
    });
  });
});
