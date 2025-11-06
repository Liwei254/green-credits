const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("EcoActionVerifier Phase 2", function () {
  let token, verifier;
  let owner, user, verifierAccount, challenger, oracle, bufferVault;

  // Helper function to submit action with V2 signature
  async function submitAction(signer, description, proofCid) {
    return await verifier.connect(signer).submitActionV2(
      description,
      proofCid,
      0, // CreditType.Reduction
      ethers.id("test-methodology"),
      ethers.id("test-project"),
      ethers.id("test-baseline"),
      1000000, // quantity in grams
      0, // uncertaintyBps
      0, // durabilityYears
      "" // metadataCid
    );
  }

  beforeEach(async function () {
    [owner, user, verifierAccount, challenger, oracle, bufferVault] = await ethers.getSigners();

    // Deploy token
    const Token = await ethers.getContractFactory("GreenCreditToken");
    token = await Token.deploy();

    // Deploy verifier
    const Verifier = await ethers.getContractFactory("EcoActionVerifier");
    verifier = await Verifier.deploy(await token.getAddress());

    // Transfer token ownership to verifier
    await token.transferOwnership(await verifier.getAddress());

    // Add verifier and oracle
    await verifier.addVerifier(verifierAccount.address);
    await verifier.addOracle(oracle.address);
  });

  describe("Configuration", function () {
    it("should set Phase 2 configuration", async function () {
      const challengeWindow = 2 * 24 * 60 * 60; // 2 days
      const bufferBps = 2000; // 20%
      const submitStake = ethers.parseEther("0.1");
      const verifyStake = ethers.parseEther("0.2");
      const challengeStake = ethers.parseEther("0.3");

      await verifier.setConfig(
        false, // instantMint
        challengeWindow,
        bufferBps,
        bufferVault.address,
        submitStake,
        verifyStake,
        challengeStake
      );

      expect(await verifier.instantMint()).to.equal(false);
      expect(await verifier.challengeWindowSecs()).to.equal(challengeWindow);
      expect(await verifier.bufferBps()).to.equal(bufferBps);
      expect(await verifier.bufferVault()).to.equal(bufferVault.address);
      expect(await verifier.submitStakeWei()).to.equal(submitStake);
      expect(await verifier.verifyStakeWei()).to.equal(verifyStake);
      expect(await verifier.challengeStakeWei()).to.equal(challengeStake);
    });

    it("should reject buffer BPS > 10000", async function () {
      await expect(
        verifier.setConfig(false, 0, 10001, bufferVault.address, 0, 0, 0)
      ).to.be.revertedWith("Buffer bps too high");
    });
  });

  describe("Stake Management", function () {
    it("should allow depositing stake", async function () {
      const amount = ethers.parseEther("1");
      await verifier.connect(user).depositStake({ value: amount });
      expect(await verifier.stakeBalance(user.address)).to.equal(amount);
    });

    it("should allow withdrawing stake", async function () {
      const amount = ethers.parseEther("1");
      await verifier.connect(user).depositStake({ value: amount });

      const balanceBefore = await ethers.provider.getBalance(user.address);
      const tx = await verifier.connect(user).withdrawStake(amount);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(user.address);

      expect(await verifier.stakeBalance(user.address)).to.equal(0);
      expect(balanceAfter).to.be.closeTo(balanceBefore + amount - gasCost, ethers.parseEther("0.001"));
    });

    it("should reject insufficient stake withdrawal", async function () {
      await expect(
        verifier.connect(user).withdrawStake(ethers.parseEther("1"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Delayed Minting Flow", function () {
    beforeEach(async function () {
      const challengeWindow = 2 * 24 * 60 * 60;
      await verifier.setConfig(false, challengeWindow, 0, ethers.ZeroAddress, 0, 0, 0);
    });

    it("should verify action without immediate mint", async function () {
      await submitAction(user, "Test action", "cidhere");
      const reward = ethers.parseEther("10");
      await verifier.connect(verifierAccount).verifyAction(0, reward);

      const action = await verifier.actions(0);
      expect(action.status).to.equal(1);
      expect(action.rewardPending).to.equal(reward);

      const balance = await token.balanceOf(user.address);
      expect(balance).to.equal(0);
    });

    it("should finalize action after challenge window", async function () {
      await submitAction(user, "Test action", "cidhere");
      const reward = ethers.parseEther("10");
      await verifier.connect(verifierAccount).verifyAction(0, reward);

      await time.increase(2 * 24 * 60 * 60 + 1);
      await verifier.finalizeAction(0);

      const action = await verifier.actions(0);
      expect(action.status).to.equal(2);
      const balance = await token.balanceOf(user.address);
      expect(balance).to.equal(reward);
    });

    it("should reject finalize before challenge window", async function () {
      await submitAction(user, "Test action", "cidhere");
      await verifier.connect(verifierAccount).verifyAction(0, ethers.parseEther("10"));
      await expect(verifier.finalizeAction(0)).to.be.revertedWith("Challenge window not passed");
    });
  });

  describe("Challenge Mechanism", function () {
    beforeEach(async function () {
      const challengeWindow = 2 * 24 * 60 * 60;
      await verifier.setConfig(false, challengeWindow, 0, ethers.ZeroAddress, 0, 0, 0);
    });

    it("should allow challenging a verified action", async function () {
      await submitAction(user, "Test action", "cidhere");
      await verifier.connect(verifierAccount).verifyAction(0, ethers.parseEther("10"));
      await verifier.connect(challenger).challengeAction(0, "evidence-cid");

      const challenges = await verifier.getChallenges(0);
      expect(challenges.length).to.equal(1);
      expect(challenges[0].challenger).to.equal(challenger.address);
      expect(challenges[0].evidenceCid).to.equal("evidence-cid");
      expect(challenges[0].resolved).to.equal(false);
    });

    it("should reject challenge after window", async function () {
      await submitAction(user, "Test action", "cidhere");
      await verifier.connect(verifierAccount).verifyAction(0, ethers.parseEther("10"));
      await time.increase(2 * 24 * 60 * 60 + 1);
      await expect(
        verifier.connect(challenger).challengeAction(0, "evidence-cid")
      ).to.be.revertedWith("Challenge window passed");
    });

    it("should resolve challenge as upheld and reject action", async function () {
      await submitAction(user, "Test action", "cidhere");
      await verifier.connect(verifierAccount).verifyAction(0, ethers.parseEther("10"));
      await verifier.connect(challenger).challengeAction(0, "evidence-cid");
      await verifier.resolveChallenge(0, 0, true, ethers.ZeroAddress);

      const challenges = await verifier.getChallenges(0);
      expect(challenges[0].resolved).to.equal(true);
      expect(challenges[0].upheld).to.equal(true);

      await time.increase(2 * 24 * 60 * 60 + 1);
      await verifier.finalizeAction(0);

      const action = await verifier.actions(0);
      expect(action.status).to.equal(3);
      const balance = await token.balanceOf(user.address);
      expect(balance).to.equal(0);
    });

    it("should resolve challenge as dismissed and allow finalize", async function () {
      await submitAction(user, "Test action", "cidhere");
      await verifier.connect(verifierAccount).verifyAction(0, ethers.parseEther("10"));
      await verifier.connect(challenger).challengeAction(0, "evidence-cid");
      await verifier.resolveChallenge(0, 0, false, ethers.ZeroAddress);

      await time.increase(2 * 24 * 60 * 60 + 1);
      await verifier.finalizeAction(0);

      const action = await verifier.actions(0);
      expect(action.status).to.equal(2);
      const balance = await token.balanceOf(user.address);
      expect(balance).to.equal(ethers.parseEther("10"));
    });
  });

  describe("Buffer Minting for Removals", function () {
    beforeEach(async function () {
      const bufferBps = 2000;
      await verifier.setConfig(true, 0, bufferBps, bufferVault.address, 0, 0, 0);
    });

    it("should mint with buffer for removal credits", async function () {
      const methodologyId = ethers.id("Test Method");
      const projectId = ethers.id("Test Project");
      const baselineId = ethers.id("Test Baseline");

      await verifier.connect(user).submitActionV2(
        "Tree planting",
        "proof-cid",
        1,
        methodologyId,
        projectId,
        baselineId,
        1000000,
        500,
        25,
        "metadata-cid"
      );

      const reward = ethers.parseEther("100");
      await verifier.connect(verifierAccount).verifyAction(0, reward);

      const userBalance = await token.balanceOf(user.address);
      const bufferBalance = await token.balanceOf(bufferVault.address);
      expect(userBalance).to.equal(ethers.parseEther("80"));
      expect(bufferBalance).to.equal(ethers.parseEther("20"));
    });

    it("should not apply buffer for reduction credits", async function () {
      const methodologyId = ethers.id("Test Method");
      const projectId = ethers.id("Test Project");
      const baselineId = ethers.id("Test Baseline");

      await verifier.connect(user).submitActionV2(
        "Energy efficiency",
        "proof-cid",
        0,
        methodologyId,
        projectId,
        baselineId,
        1000000,
        500,
        0,
        "metadata-cid"
      );

      const reward = ethers.parseEther("100");
      await verifier.connect(verifierAccount).verifyAction(0, reward);

      const userBalance = await token.balanceOf(user.address);
      const bufferBalance = await token.balanceOf(bufferVault.address);
      expect(userBalance).to.equal(reward);
      expect(bufferBalance).to.equal(0);
    });
  });

  describe("Oracle Reports", function () {
    it("should allow oracle to attach report", async function () {
      await submitAction(user, "Test action", "cidhere");

      await verifier.connect(oracle).attachOracleReport(0, "report-cid-1");
      await verifier.connect(oracle).attachOracleReport(0, "report-cid-2");

      const reports = await verifier.getOracleReports(0);
      expect(reports.length).to.equal(2);
      expect(reports[0]).to.equal("report-cid-1");
      expect(reports[1]).to.equal("report-cid-2");
    });

    it("should reject non-oracle attaching report", async function () {
      await submitAction(user, "Test action", "cidhere");
      await expect(
        verifier.connect(user).attachOracleReport(0, "report-cid")
      ).to.be.revertedWith("Not oracle");
    });
  });

  describe("Backward Compatibility", function () {
    it("should work with instant mint by default", async function () {
      await submitAction(user, "Test action", "cidhere");

      const reward = ethers.parseEther("10");
      await verifier.connect(verifierAccount).verifyAction(0, reward);

      const action = await verifier.actions(0);
      expect(action.status).to.equal(2);

      const balance = await token.balanceOf(user.address);
      expect(balance).to.equal(reward);
    });

    it("should maintain Phase 1 fields for legacy submit", async function () {
      await submitAction(user, "Legacy action", "legacy-cid");

      const action = await verifier.actions(0);
      expect(action.user).to.equal(user.address);
      expect(action.description).to.equal("Legacy action");
      expect(action.proofCid).to.equal("legacy-cid");
      expect(action.status).to.equal(0);
    });
  });
});
