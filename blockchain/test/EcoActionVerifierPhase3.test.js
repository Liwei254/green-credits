const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EcoActionVerifier Phase 3", function () {
  let token, verifier;
  let owner, user, verifier1, verifier2;

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
    [owner, user, verifier1, verifier2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("GreenCreditToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    const Verifier = await ethers.getContractFactory("EcoActionVerifier");
    verifier = await Verifier.deploy(token.target);
    await verifier.waitForDeployment();

    await token.transferOwnership(verifier.target);
    await verifier.connect(owner).addVerifier(verifier1.address);
  });

  describe("Verifier Tracking", function () {
    it("should record verifier when action is verified", async function () {
      await submitAction(user, "Test action", "QmTest");
      const actionId = 0;

      const reward = ethers.parseUnits("100", 18);
      await verifier.connect(verifier1).verifyAction(actionId, reward);

      expect(await verifier.verifierOfAction(actionId)).to.equal(verifier1.address);
    });

    it("should emit VerifierRecorded event", async function () {
      await submitAction(user, "Test action", "QmTest");
      const actionId = 0;

      const reward = ethers.parseUnits("100", 18);
      await expect(verifier.connect(verifier1).verifyAction(actionId, reward))
        .to.emit(verifier, "VerifierRecorded")
        .withArgs(actionId, verifier1.address);
    });

    it("should track different verifiers for different actions", async function () {
      await verifier.connect(owner).addVerifier(verifier2.address);

      await submitAction(user, "Action 1", "QmTest1");
      await submitAction(user, "Action 2", "QmTest2");

      const reward = ethers.parseUnits("100", 18);
      await verifier.connect(verifier1).verifyAction(0, reward);
      await verifier.connect(verifier2).verifyAction(1, reward);

      expect(await verifier.verifierOfAction(0)).to.equal(verifier1.address);
      expect(await verifier.verifierOfAction(1)).to.equal(verifier2.address);
    });

    it("should track owner when verifying as owner", async function () {
      await submitAction(user, "Test action", "QmTest");
      const actionId = 0;

      const reward = ethers.parseUnits("100", 18);
      await verifier.connect(owner).verifyAction(actionId, reward);

      expect(await verifier.verifierOfAction(actionId)).to.equal(owner.address);
    });
  });

  describe("Phase 3 with Phase 2 Features", function () {
    beforeEach(async function () {
      await verifier.connect(owner).setConfig(
        false, // instantMint = false
        2 * 24 * 60 * 60, // 2 days challenge window
        2000, // 20% buffer
        owner.address, // buffer vault
        0, 0, 0 // no stakes
      );
    });

    it("should track verifier with delayed minting", async function () {
      await verifier.connect(user).submitActionV2(
        "Removal action",
        "QmTest",
        1, // Removal
        ethers.encodeBytes32String("methodology1"),
        ethers.encodeBytes32String("project1"),
        ethers.encodeBytes32String("baseline1"),
        1000000,
        500,
        25,
        "QmMetadata"
      );
      const actionId = 0;

      const reward = ethers.parseUnits("100", 18);
      await verifier.connect(verifier1).verifyAction(actionId, reward);

      expect(await verifier.verifierOfAction(actionId)).to.equal(verifier1.address);

      const action = await verifier.actions(actionId);
      expect(action.status).to.equal(1);
    });
  });
});
