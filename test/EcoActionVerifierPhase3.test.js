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

    // Deploy token
    const Token = await ethers.getContractFactory("GreenCreditToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    // Deploy verifier
    const Verifier = await ethers.getContractFactory("EcoActionVerifier");
    verifier = await Verifier.deploy(token.target);
    await verifier.waitForDeployment();

    // Transfer token ownership to verifier
    await token.transferOwnership(verifier.target);

    // Add verifier1 as a verifier
    await verifier.connect(owner).addVerifier(verifier1.address);
  });

  describe("Verifier Tracking", function () {
    it("should record verifier when action is verified", async function () {
      // Submit action
      await submitAction(user, "Test action", "QmTest");
      const actionId = 0;

      // Verify action
      const reward = ethers.parseUnits("100", 18);
      await verifier.connect(verifier1).verifyAction(actionId, reward);

      // Check verifier is recorded
      expect(await verifier.verifierOfAction(actionId)).to.equal(verifier1.address);
    });

    it("should emit VerifierRecorded event", async function () {
      // Submit action
      await submitAction(user, "Test action", "QmTest");
      const actionId = 0;

      // Verify action and check event
      const reward = ethers.parseUnits("100", 18);
      await expect(verifier.connect(verifier1).verifyAction(actionId, reward))
        .to.emit(verifier, "VerifierRecorded")
        .withArgs(actionId, verifier1.address);
    });

    it("should track different verifiers for different actions", async function () {
      // Add second verifier
      await verifier.connect(owner).addVerifier(verifier2.address);

      // Submit two actions
      await submitAction(user, "Action 1", "QmTest1");
      await submitAction(user, "Action 2", "QmTest2");

      // Verify by different verifiers
      const reward = ethers.parseUnits("100", 18);
      await verifier.connect(verifier1).verifyAction(0, reward);
      await verifier.connect(verifier2).verifyAction(1, reward);

      // Check verifiers are tracked correctly
      expect(await verifier.verifierOfAction(0)).to.equal(verifier1.address);
      expect(await verifier.verifierOfAction(1)).to.equal(verifier2.address);
    });

    it("should track owner when verifying as owner", async function () {
      // Submit action
      await submitAction(user, "Test action", "QmTest");
      const actionId = 0;

      // Verify as owner
      const reward = ethers.parseUnits("100", 18);
      await verifier.connect(owner).verifyAction(actionId, reward);

      // Check owner is recorded
      expect(await verifier.verifierOfAction(actionId)).to.equal(owner.address);
    });
  });

  describe("Phase 3 with Phase 2 Features", function () {
    beforeEach(async function () {
      // Configure for delayed minting (Phase 2)
      await verifier.connect(owner).setConfig(
        false, // instantMint = false
        2 * 24 * 60 * 60, // 2 days challenge window
        2000, // 20% buffer
        owner.address, // buffer vault
        0, 0, 0 // no stakes
      );
    });

    it("should track verifier with delayed minting", async function () {
      // Submit action
      await verifier.connect(user).submitActionV2(
        "Removal action",
        "QmTest",
        1, // Removal
        ethers.encodeBytes32String("methodology1"),
        ethers.encodeBytes32String("project1"),
        ethers.encodeBytes32String("baseline1"),
        1000000, // 1000 kg CO2e
        500, // 5% uncertainty
        25, // 25 years durability
        "QmMetadata"
      );
      const actionId = 0;

      // Verify action
      const reward = ethers.parseUnits("100", 18);
      await verifier.connect(verifier1).verifyAction(actionId, reward);

      // Check verifier is recorded even with delayed minting
      expect(await verifier.verifierOfAction(actionId)).to.equal(verifier1.address);
      
      // Check action status is Verified (not Finalized)
      const action = await verifier.actions(actionId);
      expect(action.status).to.equal(1); // Verified
    });
  });
});
