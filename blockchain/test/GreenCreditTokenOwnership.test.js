const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GreenCreditToken - Ownership Transfer", function () {
  let token;
  let owner, newOwner, user1, user2;

  beforeEach(async function () {
    [owner, newOwner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("GreenCreditToken");
    token = await Token.deploy();
    await token.waitForDeployment();
  });

  describe("Initial Ownership", function () {
    it("should set deployer as initial owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("should allow owner to mint tokens", async function () {
      const amount = ethers.parseUnits("1000", 18);
      await token.mint(user1.address, amount);
      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });

    it("should prevent non-owner from minting", async function () {
      const amount = ethers.parseUnits("1000", 18);
      await expect(
        token.connect(user1).mint(user2.address, amount)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });

  describe("Ownership Transfer", function () {
    it("should transfer ownership to new owner", async function () {
      await token.transferOwnership(newOwner.address);
      expect(await token.owner()).to.equal(newOwner.address);
    });

    it("should allow new owner to mint tokens", async function () {
      await token.transferOwnership(newOwner.address);
      const amount = ethers.parseUnits("1000", 18);
      await token.connect(newOwner).mint(user1.address, amount);
      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });

    it("should prevent old owner from minting after transfer", async function () {
      await token.transferOwnership(newOwner.address);
      const amount = ethers.parseUnits("1000", 18);
      await expect(
        token.mint(user1.address, amount)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("should emit OwnershipTransferred event", async function () {
      await expect(token.transferOwnership(newOwner.address))
        .to.emit(token, "OwnershipTransferred")
        .withArgs(owner.address, newOwner.address);
    });

      it("should handle transfer to zero address", async function () {
        await expect(
          token.transferOwnership(ethers.ZeroAddress)
        ).to.be.revertedWithCustomError(token, "OwnableInvalidOwner");
      });

    it("should prevent non-owner from transferring ownership", async function () {
      await expect(
        token.connect(user1).transferOwnership(newOwner.address)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });

  describe("Renounce Ownership", function () {
    it("should allow owner to renounce ownership", async function () {
      await token.renounceOwnership();
      expect(await token.owner()).to.equal(ethers.ZeroAddress);
    });

    it("should prevent minting after renouncing ownership", async function () {
      await token.renounceOwnership();
      const amount = ethers.parseUnits("1000", 18);
      await expect(
        token.mint(user1.address, amount)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("should prevent non-owner from renouncing ownership", async function () {
      await expect(
        token.connect(user1).renounceOwnership()
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });

  describe("Voting and Governance", function () {
    it("should delegate votes to owner initially", async function () {
      // Skip: GreenCreditToken doesn't implement voting delegation
      this.skip();
    });

    it("should transfer voting power on ownership transfer", async function () {
      // Skip: GreenCreditToken doesn't implement voting delegation
      this.skip();
    });

    it("should allow delegation of votes", async function () {
      // Skip: GreenCreditToken doesn't implement voting delegation
      this.skip();
    });
  });
});
