const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VerifierBadgeSBT", function () {
  let badgeSBT;
  let owner, verifier1, verifier2, nonOwner;

  beforeEach(async function () {
    [owner, verifier1, verifier2, nonOwner] = await ethers.getSigners();

    const VerifierBadgeSBT = await ethers.getContractFactory("VerifierBadgeSBT");
    badgeSBT = await VerifierBadgeSBT.deploy();
  });

  describe("Badge Minting", function () {
    it("should mint a badge to a verifier", async function () {
      await badgeSBT.connect(owner).mint(verifier1.address, 1, 3);
      
      expect(await badgeSBT.ownerOf(1)).to.equal(verifier1.address);
      expect(await badgeSBT.levelOf(1)).to.equal(3);
      expect(await badgeSBT.tokenOfOwner(verifier1.address)).to.equal(1);
    });

    it("should prevent minting multiple badges to same address", async function () {
      await badgeSBT.connect(owner).mint(verifier1.address, 1, 3);
      
      await expect(
        badgeSBT.connect(owner).mint(verifier1.address, 2, 5)
      ).to.be.revertedWith("Address already has badge");
    });

    it("should prevent non-owner from minting", async function () {
      await expect(
        badgeSBT.connect(nonOwner).mint(verifier1.address, 1, 3)
      ).to.be.revertedWithCustomError(badgeSBT, "OwnableUnauthorizedAccount");
    });

    it("should prevent minting with duplicate token ID", async function () {
      await badgeSBT.connect(owner).mint(verifier1.address, 1, 3);
      
      await expect(
        badgeSBT.connect(owner).mint(verifier2.address, 1, 5)
      ).to.be.revertedWith("Token ID already exists");
    });
  });

  describe("Badge Revocation", function () {
    beforeEach(async function () {
      await badgeSBT.connect(owner).mint(verifier1.address, 1, 3);
    });

    it("should revoke a badge", async function () {
      await badgeSBT.connect(owner).revoke(1);
      
      expect(await badgeSBT.tokenOfOwner(verifier1.address)).to.equal(0);
      expect(await badgeSBT.levelOf(1)).to.equal(0);
    });

    it("should prevent non-owner from revoking", async function () {
      await expect(
        badgeSBT.connect(nonOwner).revoke(1)
      ).to.be.revertedWithCustomError(badgeSBT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Reputation Management", function () {
    it("should increase reputation", async function () {
      await badgeSBT.connect(owner).increaseReputation(verifier1.address, 100);
      expect(await badgeSBT.reputationOf(verifier1.address)).to.equal(100);

      await badgeSBT.connect(owner).increaseReputation(verifier1.address, 50);
      expect(await badgeSBT.reputationOf(verifier1.address)).to.equal(150);
    });

    it("should decrease reputation", async function () {
      await badgeSBT.connect(owner).increaseReputation(verifier1.address, 200);
      await badgeSBT.connect(owner).decreaseReputation(verifier1.address, 75);
      expect(await badgeSBT.reputationOf(verifier1.address)).to.equal(125);
    });

    it("should allow negative reputation", async function () {
      await badgeSBT.connect(owner).decreaseReputation(verifier1.address, 50);
      expect(await badgeSBT.reputationOf(verifier1.address)).to.equal(-50);
    });

    it("should prevent non-owner from adjusting reputation", async function () {
      await expect(
        badgeSBT.connect(nonOwner).increaseReputation(verifier1.address, 100)
      ).to.be.revertedWithCustomError(badgeSBT, "OwnableUnauthorizedAccount");

      await expect(
        badgeSBT.connect(nonOwner).decreaseReputation(verifier1.address, 100)
      ).to.be.revertedWithCustomError(badgeSBT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Soulbound Properties", function () {
    beforeEach(async function () {
      await badgeSBT.connect(owner).mint(verifier1.address, 1, 3);
    });

    it("should prevent transfers", async function () {
      await expect(
        badgeSBT.connect(verifier1).transferFrom(verifier1.address, verifier2.address, 1)
      ).to.be.revertedWith("Soulbound: token cannot be transferred");
    });

    it("should prevent approvals", async function () {
      await expect(
        badgeSBT.connect(verifier1).approve(verifier2.address, 1)
      ).to.be.revertedWith("Soulbound: approvals not allowed");
    });

    it("should prevent setApprovalForAll", async function () {
      await expect(
        badgeSBT.connect(verifier1).setApprovalForAll(verifier2.address, true)
      ).to.be.revertedWith("Soulbound: approvals not allowed");
    });

    it("should return zero for getApproved", async function () {
      expect(await badgeSBT.getApproved(1)).to.equal(ethers.ZeroAddress);
    });

    it("should return false for isApprovedForAll", async function () {
      expect(await badgeSBT.isApprovedForAll(verifier1.address, verifier2.address)).to.be.false;
    });
  });
});
