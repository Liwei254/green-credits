const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MetricsTracker", function () {
  let metrics, token, verifier, donationPool;
  let owner, user1, user2, ngo1, ngo2;

  // Helper: convert timestamp to YYYYMMDD format
  function getDateFromTimestamp(timestamp) {
    const year = Math.floor(timestamp / 31536000) + 1970;
    const month = Math.floor((timestamp % 31536000) / 2629743) + 1;
    const day = Math.floor((timestamp % 2629743) / 86400) + 1;
    return year * 10000 + month * 100 + day;
  }

  // Helper to submit an action (Phase 2+ compatible)
  async function submitAction(signer, description, proofCid) {
    return await verifier.connect(signer).submitActionV2(
      description,
      proofCid,
      0,
      ethers.id("test-methodology"),
      ethers.id("test-project"),
      ethers.id("test-baseline"),
      1000000,
      0,
      0,
      ""
    );
  }

  beforeEach(async function () {
    [owner, user1, user2, ngo1, ngo2] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockERC20");
    usdc = await MockUSDC.deploy("Mock USDC", "USDC", 6, ethers.parseUnits("1000000", 6));

    const Token = await ethers.getContractFactory("GreenCreditToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    const Verifier = await ethers.getContractFactory("EcoActionVerifier");
    verifier = await Verifier.deploy(await usdc.getAddress(), await token.getAddress());

    // Mint tokens to users before transferring ownership
    await usdc.mint(user1.address, ethers.parseUnits("1000", 6));
    await usdc.mint(user2.address, ethers.parseUnits("1000", 6));
    await token.mint(user1.address, ethers.parseEther("10"));
    await token.mint(user2.address, ethers.parseEther("10"));

    await verifier.waitForDeployment();
    await token.transferOwnership(await verifier.getAddress());

    const DonationPool = await ethers.getContractFactory("DonationPool");
    donationPool = await DonationPool.deploy(await token.getAddress());
    await donationPool.waitForDeployment();

    const MetricsTracker = await ethers.getContractFactory("MetricsTracker");
    metrics = await MetricsTracker.deploy();
    await metrics.waitForDeployment();

    await donationPool.connect(owner).setNGO(ngo1.address, true);
    await donationPool.connect(owner).setNGO(ngo2.address, true);
  });

  describe("Daily Metrics Tracking", function () {
    it("should track action submissions", async function () {
      await token.connect(user1).approve(await verifier.getAddress(), ethers.parseEther("1"));
      await verifier.connect(user1).depositStake(ethers.parseEther("1"));
      await submitAction(user1, "Test action", "");

      await metrics.connect(owner).trackActionSubmission(user1.address);
      const latestBlock = await ethers.provider.getBlock("latest");
      const date = getDateFromTimestamp(latestBlock.timestamp);

      const dailyMetrics = await metrics.getDailyMetrics(date);
      expect(dailyMetrics.actionsSubmitted).to.equal(1);
    });

    it("should track action verifications", async function () {
      await token.connect(user1).approve(await verifier.getAddress(), ethers.parseEther("1"));
      await verifier.connect(user1).depositStake(ethers.parseEther("1"));
      await submitAction(user1, "Test action", "");
      await verifier.connect(owner).verifyAction(0, ethers.parseUnits("100", 18));

      await metrics.connect(owner).trackActionVerification(user1.address);
      await metrics.connect(owner).trackGCTMint(user1.address, ethers.parseUnits("100", 18));

      const latestBlock = await ethers.provider.getBlock("latest");
      const date = getDateFromTimestamp(latestBlock.timestamp);

      const dailyMetrics = await metrics.getDailyMetrics(date);
      expect(dailyMetrics.actionsVerified).to.equal(1);
    });

    it("should track GCT minting", async function () {
      await metrics.connect(owner).trackGCTMint(user1.address, ethers.parseUnits("500", 18));

      const latestBlock = await ethers.provider.getBlock("latest");
      const date = getDateFromTimestamp(latestBlock.timestamp);

      const dailyMetrics = await metrics.getDailyMetrics(date);
      expect(dailyMetrics.gctMinted).to.equal(ethers.parseUnits("500", 18));
    });

    it("should track donations", async function () {
      await metrics.connect(owner).trackDonation(user1.address, ngo1.address, ethers.parseUnits("500", 18));

      const latestBlock = await ethers.provider.getBlock("latest");
      const date = getDateFromTimestamp(latestBlock.timestamp);

      const dailyMetrics = await metrics.getDailyMetrics(date);
      expect(dailyMetrics.donationsCount).to.equal(1);
      expect(dailyMetrics.donationsAmount).to.equal(ethers.parseUnits("500", 18));
    });

    it("should aggregate multiple events in same day", async function () {
      await metrics.connect(owner).trackActionSubmission(user1.address);
      await metrics.connect(owner).trackActionSubmission(user1.address);
      await metrics.connect(owner).trackActionSubmission(user1.address);

      await metrics.connect(owner).trackActionVerification(user1.address);
      await metrics.connect(owner).trackActionVerification(user1.address);
      await metrics.connect(owner).trackActionVerification(user1.address);

      await metrics.connect(owner).trackGCTMint(user1.address, ethers.parseUnits("50", 18));
      await metrics.connect(owner).trackGCTMint(user1.address, ethers.parseUnits("75", 18));
      await metrics.connect(owner).trackGCTMint(user1.address, ethers.parseUnits("100", 18));

      await metrics.connect(owner).trackDonation(user1.address, ngo1.address, ethers.parseUnits("300", 18));
      await metrics.connect(owner).trackDonation(user1.address, ngo2.address, ethers.parseUnits("400", 18));

      const latestBlock = await ethers.provider.getBlock("latest");
      const date = getDateFromTimestamp(latestBlock.timestamp);
      const dailyMetrics = await metrics.getDailyMetrics(date);

      expect(dailyMetrics.actionsSubmitted).to.equal(3);
      expect(dailyMetrics.actionsVerified).to.equal(3);
      expect(dailyMetrics.gctMinted).to.equal(ethers.parseUnits("225", 18));
      expect(dailyMetrics.donationsCount).to.equal(2);
      expect(dailyMetrics.donationsAmount).to.equal(ethers.parseUnits("700", 18));
    });
  });

  describe("NGO-Specific Metrics", function () {
    it("should track donations per NGO", async function () {
      await metrics.connect(owner).trackDonation(user1.address, ngo1.address, ethers.parseUnits("300", 18));
      await metrics.connect(owner).trackDonation(user1.address, ngo2.address, ethers.parseUnits("400", 18));
      await metrics.connect(owner).trackDonation(user1.address, ngo1.address, ethers.parseUnits("200", 18));

      const ngo1Metrics = await metrics.getNGOMetrics(ngo1.address);
      const ngo2Metrics = await metrics.getNGOMetrics(ngo2.address);

      expect(ngo1Metrics.donationsCount).to.equal(2);
      expect(ngo1Metrics.totalAmount).to.equal(ethers.parseUnits("500", 18));
      expect(ngo2Metrics.donationsCount).to.equal(1);
      expect(ngo2Metrics.totalAmount).to.equal(ethers.parseUnits("400", 18));
    });
  });

  describe("Conversion Funnel Metrics", function () {
    it("should track visitor connections", async function () {
      await metrics.connect(owner).trackVisitor();
      await metrics.connect(owner).trackWalletConnection(user1.address);

      const conversionMetrics = await metrics.getConversionMetrics();
      expect(conversionMetrics.visitors).to.equal(1);
      expect(conversionMetrics.wallets).to.equal(1);
    });

    it("should track action submissions", async function () {
      await metrics.connect(owner).trackActionSubmission(user1.address);
      await metrics.connect(owner).trackActionVerification(user1.address);

      const conversionMetrics = await metrics.getConversionMetrics();
      expect(conversionMetrics.submitted).to.equal(1);
      expect(conversionMetrics.verified).to.equal(1);
    });

    it("should calculate conversion rates", async function () {
      for (let i = 0; i < 10; i++) await metrics.connect(owner).trackVisitor();
      for (let i = 0; i < 5; i++) await metrics.connect(owner).trackWalletConnection(user1.address);
      for (let i = 0; i < 3; i++) await metrics.connect(owner).trackActionSubmission(user1.address);
      for (let i = 0; i < 2; i++) await metrics.connect(owner).trackActionVerification(user1.address);

      const [walletConv, submitConv, verifyConv] = await metrics.getConversionRates();

      expect(walletConv).to.equal(5000);
      expect(submitConv).to.equal(6000);
      expect(verifyConv).to.equal(6666);
    });
  });

  describe("Batch Updates", function () {
    it("should handle batch metric updates", async function () {
      const dates = [20240101, 20240102, 20240103];
      const submitted = [10, 20, 15];
      const verified = [8, 18, 12];
      const minted = [
        ethers.parseUnits("1000", 18),
        ethers.parseUnits("2000", 18),
        ethers.parseUnits("1500", 18)
      ];
      const donationCounts = [5, 10, 8];
      const donationAmounts = [
        ethers.parseUnits("500", 18),
        ethers.parseUnits("1000", 18),
        ethers.parseUnits("800", 18)
      ];

      await metrics.connect(owner).batchUpdateMetrics(
        dates,
        submitted,
        verified,
        minted,
        donationCounts,
        donationAmounts
      );

      for (let i = 0; i < dates.length; i++) {
        const dailyMetrics = await metrics.getDailyMetrics(dates[i]);
        expect(dailyMetrics.actionsSubmitted).to.equal(submitted[i]);
        expect(dailyMetrics.actionsVerified).to.equal(verified[i]);
        expect(dailyMetrics.gctMinted).to.equal(minted[i]);
        expect(dailyMetrics.donationsCount).to.equal(donationCounts[i]);
        expect(dailyMetrics.donationsAmount).to.equal(donationAmounts[i]);
      }
    });
  });
});
