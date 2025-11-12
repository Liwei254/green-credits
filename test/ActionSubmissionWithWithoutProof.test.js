const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Action Submission - With and Without Proof", function () {
  let token, verifier;
  let owner, user1, user2, verifier1;

  beforeEach(async function () {
    [owner, user1, user2, verifier1] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("GreenCreditToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    const Verifier = await ethers.getContractFactory("EcoActionVerifier");
    verifier = await Verifier.deploy(await token.getAddress());

    // Mint tokens to users before transferring ownership
    await token.mint(user1.address, ethers.parseEther("10"));
    await token.mint(user2.address, ethers.parseEther("10"));

    await token.transferOwnership(await verifier.getAddress());
    await verifier.waitForDeployment();

    await verifier.addVerifier(verifier1.address);
  });

  describe("Submission Without Proof", function () {
    it("should allow submission without proof CID", async function () {
      await token.connect(user1).approve(await verifier.getAddress(), ethers.parseEther("1"));
      await verifier.connect(user1).depositStake(ethers.parseEther("1"));
      await verifier.connect(user1).submitActionV2(
        "Planted trees",
        "",
        0, // Reduction
        ethers.id("method1"),
        ethers.id("project1"),
        ethers.id("baseline1"),
        100000, // 100kg CO2e
        500, // 5% uncertainty
        0, // no durability
        "" // no metadata
      );

      const action = await verifier.actions(0);
      expect(action.description).to.equal("Planted trees");
      expect(action.proofCid).to.equal("");
      expect(action.user).to.equal(user1.address);
    });

    it("should verify action without proof", async function () {
      await token.connect(user1).approve(await verifier.getAddress(), ethers.parseEther("1"));
      await verifier.connect(user1).depositStake(ethers.parseEther("1"));
      await verifier.connect(user1).submitActionV2(
        "Recycled waste",
        "",
        0, // Reduction
        ethers.id("method1"),
        ethers.id("project1"),
        ethers.id("baseline1"),
        100000, // 100kg CO2e
        500, // 5% uncertainty
        0, // no durability
        "" // no metadata
      );

      const initialBalance = await token.balanceOf(user1.address);
      await verifier.connect(verifier1).verifyAction(0, ethers.parseUnits("50", 18));

      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseUnits("50", 18));
    });

    it("should handle multiple submissions without proof", async function () {
      await token.connect(user1).approve(await verifier.getAddress(), ethers.parseEther("2"));
      await verifier.connect(user1).depositStake(ethers.parseEther("2"));

      await verifier.connect(user1).submitActionV2(
        "Action 1",
        "",
        0, // Reduction
        ethers.id("method1"),
        ethers.id("project1"),
        ethers.id("baseline1"),
        100000, // 100kg CO2e
        500, // 5% uncertainty
        0, // no durability
        "" // no metadata
      );
      await verifier.connect(user1).submitActionV2(
        "Action 2",
        "",
        0, // Reduction
        ethers.id("method2"),
        ethers.id("project2"),
        ethers.id("baseline2"),
        100000, // 100kg CO2e
        500, // 5% uncertainty
        0, // no durability
        "" // no metadata
      );

      expect(await verifier.getActionCount()).to.equal(2);

      const action1 = await verifier.actions(0);
      const action2 = await verifier.actions(1);

      expect(action1.proofCid).to.equal("");
      expect(action2.proofCid).to.equal("");
    });
  });

  describe("Submission With Proof", function () {
    const proofCid1 = "ipfs://QmProof1";
    const proofCid2 = "ipfs://QmProof2";

    it("should allow submission with proof CID", async function () {
      await token.connect(user1).approve(await verifier.getAddress(), ethers.parseEther("1"));
      await verifier.connect(user1).depositStake(ethers.parseEther("1"));
      await verifier.connect(user1).submitActionV2(
        "Planted trees",
        proofCid1,
        0, // Reduction
        ethers.id("method1"),
        ethers.id("project1"),
        ethers.id("baseline1"),
        100000, // 100kg CO2e
        500, // 5% uncertainty
        0, // no durability
        "" // no metadata
      );

      const action = await verifier.actions(0);
      expect(action.description).to.equal("Planted trees");
      expect(action.proofCid).to.equal(proofCid1);
    });

    it("should verify action with proof", async function () {
      await token.connect(user1).approve(await verifier.getAddress(), ethers.parseEther("1"));
      await verifier.connect(user1).depositStake(ethers.parseEther("1"));
      await verifier.connect(user1).submitActionV2(
        "Recycled waste",
        proofCid1,
        0, // Reduction
        ethers.id("method1"),
        ethers.id("project1"),
        ethers.id("baseline1"),
        100000, // 100kg CO2e
        500, // 5% uncertainty
        0, // no durability
        "" // no metadata
      );

      await verifier.connect(verifier1).verifyAction(0, ethers.parseUnits("75", 18));

      const action = await verifier.actions(0);
      expect(action.status).to.equal(2); // ActionStatus.Finalized
      expect(action.reward).to.equal(ethers.parseUnits("75", 18));
    });

    it("should handle different proof formats", async function () {
      await token.connect(user1).approve(await verifier.getAddress(), ethers.parseEther("3"));
      await verifier.connect(user1).depositStake(ethers.parseEther("3"));

      await verifier.connect(user1).submitActionV2("Action 1", "ipfs://Qm123", 0, ethers.id("method1"), ethers.id("project1"), ethers.id("baseline1"), 100000, 500, 0, "");
      await verifier.connect(user1).submitActionV2("Action 2", "ar://abc123", 0, ethers.id("method2"), ethers.id("project2"), ethers.id("baseline2"), 100000, 500, 0, "");
      await verifier.connect(user1).submitActionV2("Action 3", "https://example.com/proof.jpg", 0, ethers.id("method3"), ethers.id("project3"), ethers.id("baseline3"), 100000, 500, 0, "");

      const action1 = await verifier.actions(0);
      const action2 = await verifier.actions(1);
      const action3 = await verifier.actions(2);

      expect(action1.proofCid).to.equal("ipfs://Qm123");
      expect(action2.proofCid).to.equal("ar://abc123");
      expect(action3.proofCid).to.equal("https://example.com/proof.jpg");
    });

    it("should handle very long proof CIDs", async function () {
      await token.connect(user1).approve(await verifier.getAddress(), ethers.parseEther("1"));
      await verifier.connect(user1).depositStake(ethers.parseEther("1"));
      const longProof = "ipfs://" + "A".repeat(1000);
      await verifier.connect(user1).submitActionV2("Long proof action", longProof, 0, ethers.id("method1"), ethers.id("project1"), ethers.id("baseline1"), 100000, 500, 0, "");

      const action = await verifier.actions(0);
      expect(action.proofCid).to.equal(longProof);
    });
  });

  describe("Mixed Submissions", function () {
    it("should handle mix of submissions with and without proof", async function () {
      await token.connect(user1).approve(await verifier.getAddress(), ethers.parseEther("4"));
      await verifier.connect(user1).depositStake(ethers.parseEther("4"));

      // Submit with proof
      await verifier.connect(user1).submitActionV2("With proof 1", "ipfs://proof1", 0, ethers.id("method1"), ethers.id("project1"), ethers.id("baseline1"), 100000, 500, 0, "");
      // Submit without proof
      await verifier.connect(user1).submitActionV2("Without proof 1", "", 0, ethers.id("method2"), ethers.id("project2"), ethers.id("baseline2"), 100000, 500, 0, "");
      // Submit with proof
      await verifier.connect(user1).submitActionV2("With proof 2", "ipfs://proof2", 0, ethers.id("method3"), ethers.id("project3"), ethers.id("baseline3"), 100000, 500, 0, "");
      // Submit without proof
      await verifier.connect(user1).submitActionV2("Without proof 2", "", 0, ethers.id("method4"), ethers.id("project4"), ethers.id("baseline4"), 100000, 500, 0, "");

      expect(await verifier.getActionCount()).to.equal(4);

      // Verify all actions
      for (let i = 0; i < 4; i++) {
        await verifier.connect(verifier1).verifyAction(i, ethers.parseUnits("25", 18));
      }

      // Check balances
      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance).to.equal(ethers.parseUnits("100", 18)); // 4 * 25 GCT
    });

    it("should track total earned correctly for mixed submissions", async function () {
      await token.connect(user1).approve(await verifier.getAddress(), ethers.parseEther("2"));
      await verifier.connect(user1).depositStake(ethers.parseEther("2"));

      await verifier.connect(user1).submitActionV2("With proof", "ipfs://proof", 0, ethers.id("method1"), ethers.id("project1"), ethers.id("baseline1"), 100000, 500, 0, "");
      await verifier.connect(user1).submitActionV2("Without proof", "", 0, ethers.id("method2"), ethers.id("project2"), ethers.id("baseline2"), 100000, 500, 0, "");

      await verifier.connect(verifier1).verifyAction(0, ethers.parseUnits("100", 18));
      await verifier.connect(verifier1).verifyAction(1, ethers.parseUnits("50", 18));

      expect(await verifier.totalEarned(user1.address)).to.equal(ethers.parseUnits("150", 18));
    });
  });

  describe("V2 Submissions With Proof Variations", function () {
    it("should submit V2 action with proof", async function () {
      await token.connect(user1).approve(await verifier.getAddress(), ethers.parseEther("1"));
      await verifier.connect(user1).depositStake(ethers.parseEther("1"));

      await verifier.connect(user1).submitActionV2(
        "Carbon sequestration",
        "ipfs://proof123",
        2, // Removal
        ethers.encodeBytes32String("method1"),
        ethers.encodeBytes32String("project1"),
        ethers.encodeBytes32String("baseline1"),
        100000, // 100kg CO2e
        500, // 5% uncertainty
        100, // 100 years durability
        "ipfs://metadata"
      );

      const action = await verifier.actions(0);
      expect(action.description).to.equal("Carbon sequestration");
      expect(action.proofCid).to.equal("ipfs://proof123");
      expect(action.creditType).to.equal(2); // Removal
      expect(action.quantity).to.equal(100000);
      expect(action.metadataCid).to.equal("ipfs://metadata");
    });

    it("should submit V2 action without proof", async function () {
      await token.connect(user1).approve(await verifier.getAddress(), ethers.parseEther("1"));
      await verifier.connect(user1).depositStake(ethers.parseEther("1"));

      await verifier.connect(user1).submitActionV2(
        "Energy efficiency",
        "", // No proof
        0, // Reduction
        ethers.encodeBytes32String("method2"),
        ethers.encodeBytes32String("project2"),
        ethers.encodeBytes32String("baseline2"),
        50000, // 50kg CO2e
        200, // 2% uncertainty
        0, // No durability
        "" // No metadata
      );

      const action = await verifier.actions(0);
      expect(action.proofCid).to.equal("");
      expect(action.metadataCid).to.equal("");
      expect(action.creditType).to.equal(0); // Reduction
    });
  });
});
