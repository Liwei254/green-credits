const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MetricsTracker", function () {
  let metrics, token, verifier, donationPool;
  let owner, user1, user2, ngo1, ngo2;

  beforeEach(async function () {
    [owner, user1, user2, ngo1, ngo2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("GreenCreditToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    const Verifier = await ethers.getContractFactory("EcoActionVerifier");
    verifier = await Verifier.deploy(await token.getAddress());
    await verifier.waitForDeployment();
    // Transfer token ownership so verifier can mint tokens
    await token.transferOwnership(await verifier.getAddress());

    const DonationPool = await ethers.getContractFactory("DonationPool");
    donationPool = await DonationPool.deploy(await token.getAddress());
    await donationPool.waitForDeployment();

    const MetricsTracker = await ethers.getContractFactory("MetricsTracker");
    metrics = await MetricsTracker.deploy();
    await metrics.waitForDeployment();

    // Setup donation pool
    await donationPool.connect(owner).setNGO(ngo1.address, true);
    await donationPool.connect(owner).setNGO(ngo2.address, true);
    
    // Note: owner is already added as verifier in EcoActionVerifier constructor
  });

  describe("Daily Metrics Tracking", function () {
    it("should track action submissions", async function () {
      await verifier.connect(user1).depositStake({ value: ethers.parseEther("1") });
      await verifier.connect(user1).submitAction("Test action", "");

      // Manually track the submission
      const date = Math.floor(Date.now() / 1000 / 86400) * 86400;
      await metrics.connect(owner).trackActionSubmission(user1.address);
      
      const dailyMetrics = await metrics.getDailyMetrics(date);
      expect(dailyMetrics.actionsSubmitted).to.equal(1);
    });

    it("should track action verifications", async function () {
      await verifier.connect(user1).depositStake({ value: ethers.parseEther("1") });
      await verifier.connect(user1).submitAction("Test action", "");
      await verifier.connect(owner).verifyAction(0, ethers.parseUnits("100", 18));

      // Manually track the verification
      const date = Math.floor(Date.now() / 1000 / 86400) * 86400;
      await metrics.connect(owner).trackActionVerification(user1.address);
      await metrics.connect(owner).trackGCTMint(user1.address, ethers.parseUnits("100", 18));
      
      const dailyMetrics = await metrics.getDailyMetrics(date);
      expect(dailyMetrics.actionsVerified).to.equal(1);
    });

    it("should track GCT minting", async function () {
      // Manually track minting
      const date = Math.floor(Date.now() / 1000 / 86400) * 86400;
      await metrics.connect(owner).trackGCTMint(user1.address, ethers.parseUnits("500", 18));

      const dailyMetrics = await metrics.getDailyMetrics(date);
      expect(dailyMetrics.gctMinted).to.equal(ethers.parseUnits("500", 18));
    });

    it("should track donations", async function () {
      // Manually track donation
      const date = Math.floor(Date.now() / 1000 / 86400) * 86400;
      await metrics.connect(owner).trackDonation(user1.address, ngo1.address, ethers.parseUnits("500", 18));

      const dailyMetrics = await metrics.getDailyMetrics(date);
      expect(dailyMetrics.donationsCount).to.equal(1);
      expect(dailyMetrics.donationsAmount).to.equal(ethers.parseUnits("500", 18));
    });

    it("should aggregate multiple events in same day", async function () {
      const date = Math.floor(Date.now() / 1000 / 86400) * 86400;
      
      // Manually track multiple submissions
      await metrics.connect(owner).trackActionSubmission(user1.address);
      await metrics.connect(owner).trackActionSubmission(user1.address);
      await metrics.connect(owner).trackActionSubmission(user1.address);

      // Manually track multiple verifications
      await metrics.connect(owner).trackActionVerification(user1.address);
      await metrics.connect(owner).trackActionVerification(user1.address);
      await metrics.connect(owner).trackActionVerification(user1.address);
      
      // Manually track minting
      await metrics.connect(owner).trackGCTMint(user1.address, ethers.parseUnits("50", 18));
      await metrics.connect(owner).trackGCTMint(user1.address, ethers.parseUnits("75", 18));
      await metrics.connect(owner).trackGCTMint(user1.address, ethers.parseUnits("100", 18));

      // Manually track donations
      await metrics.connect(owner).trackDonation(user1.address, ngo1.address, ethers.parseUnits("300", 18));
      await metrics.connect(owner).trackDonation(user1.address, ngo2.address, ethers.parseUnits("400", 18));

      const dailyMetrics = await metrics.getDailyMetrics(date);

      expect(dailyMetrics.actionsSubmitted).to.equal(3);
      expect(dailyMetrics.actionsVerified).to.equal(3);
      expect(dailyMetrics.gctMinted).to.equal(ethers.parseUnits("225", 18)); // 50 + 75 + 100
      expect(dailyMetrics.donationsCount).to.equal(2);
      expect(dailyMetrics.donationsAmount).to.equal(ethers.parseUnits("700", 18)); // 300 + 400
    });
  });

  describe("NGO-Specific Metrics", function () {
    it("should track donations per NGO", async function () {
      // Manually track donations
      await metrics.connect(owner).trackDonation(user1.address, ngo1.address, ethers.parseUnits("300", 18));
      await metrics.connect(owner).trackDonation(user1.address, ngo2.address, ethers.parseUnits("400", 18));
      await metrics.connect(owner).trackDonation(user1.address, ngo1.address, ethers.parseUnits("200", 18));

      const ngo1Metrics = await metrics.getNGOMetrics(ngo1.address);
      const ngo2Metrics = await metrics.getNGOMetrics(ngo2.address);

      expect(ngo1Metrics.donationsCount).to.equal(2);
      expect(ngo1Metrics.totalAmount).to.equal(ethers.parseUnits("500", 18)); // 300 + 200
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
      // Setup: 10 visitors, 5 wallets, 3 submissions, 2 verifications
      for (let i = 0; i < 10; i++) {
        await metrics.connect(owner).trackVisitor();
      }
      for (let i = 0; i < 5; i++) {
        await metrics.connect(owner).trackWalletConnection(user1.address);
      }
      for (let i = 0; i < 3; i++) {
        await metrics.connect(owner).trackActionSubmission(user1.address);
      }
      for (let i = 0; i < 2; i++) {
        await metrics.connect(owner).trackActionVerification(user1.address);
      }

      const [walletConv, submitConv, verifyConv] = await metrics.getConversionRates();

      // 5 wallets / 10 visitors = 50% = 5000 basis points
      expect(walletConv).to.equal(5000);
      // 3 submissions / 5 wallets = 60% = 6000 basis points
      expect(submitConv).to.equal(6000);
      // 2 verifications / 3 submissions = ~66.67% = 6666 basis points
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
