const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EcoActionVerifier V2", function () {
  let token, verifier, methodologyRegistry, baselineRegistry;
  let owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy token
    const Token = await ethers.getContractFactory("GreenCreditToken");
    token = await Token.deploy();

    // Deploy registries
    const MethodologyRegistry = await ethers.getContractFactory("MethodologyRegistry");
    methodologyRegistry = await MethodologyRegistry.deploy();

    const BaselineRegistry = await ethers.getContractFactory("BaselineRegistry");
    baselineRegistry = await BaselineRegistry.deploy();

    // Deploy verifier
    const Verifier = await ethers.getContractFactory("EcoActionVerifier");
    verifier = await Verifier.deploy(await token.getAddress());

    // Transfer token ownership to verifier
    await token.transferOwnership(await verifier.getAddress());
  });

  it("should submit action with V2 fields and verify", async function () {
    const methodologyId = ethers.id("Cookstove v1.2");
    const projectId = ethers.id("Project Kenya 001");
    const baselineId = ethers.id("Baseline Kenya 001 v1");

    // Upsert methodology and baseline
    await methodologyRegistry.upsert(
      methodologyId,
      "Clean Cookstove",
      "v1.2",
      "bafkreiexample123",
      true
    );
    await baselineRegistry.upsert(
      baselineId,
      projectId,
      "v1.0",
      "bafkreiexample456",
      true
    );

    // Submit action V2
    const tx = await verifier.connect(user).submitActionV2(
      "Installed 10 clean cookstoves",
      "bafkreiproofcid789",
      0, // CreditType.Reduction
      methodologyId,
      projectId,
      baselineId,
      1000000, // 1000 kg = 1,000,000 grams CO2e
      500, // 5% uncertainty (500 basis points)
      0, // not a removal, so 0 durability
      "bafkreimetadata012"
    );

    await tx.wait();

    // Check action was submitted
    const count = await verifier.getActionCount();
    expect(count).to.equal(1);

    // Verify the action
    const action = await verifier.actions(0);
    expect(action.user).to.equal(user.address);
    expect(action.description).to.equal("Installed 10 clean cookstoves");
    expect(action.proofCid).to.equal("bafkreiproofcid789");
    expect(action.creditType).to.equal(0); // Reduction
    expect(action.methodologyId).to.equal(methodologyId);
    expect(action.projectId).to.equal(projectId);
    expect(action.baselineId).to.equal(baselineId);
    expect(action.quantity).to.equal(1000000);
    expect(action.uncertaintyBps).to.equal(500);
    expect(action.durabilityYears).to.equal(0);
    expect(action.metadataCid).to.equal("bafkreimetadata012");
    expect(action.status).to.equal(0); // ActionStatus.Submitted

    // Verify action and mint reward
    await verifier.verifyAction(0, ethers.parseUnits("50", 18));
    const balance = await token.balanceOf(user.address);
    expect(balance).to.equal(ethers.parseUnits("50", 18));

    const verifiedAction = await verifier.actions(0);
    expect(verifiedAction.status).to.equal(2); // ActionStatus.Finalized
    expect(verifiedAction.reward).to.equal(ethers.parseUnits("50", 18));
  });

  it("should allow setting attestation UID", async function () {
    // Submit action V2
    await verifier.connect(user).submitActionV2(
      "Planted trees",
      "cidhere",
      0, // Reduction
      ethers.id("method1"),
      ethers.id("project1"),
      ethers.id("baseline1"),
      100000, // 100kg CO2e
      500, // 5% uncertainty
      0, // no durability
      "" // no metadata
    );

    const attestationUID = ethers.id("attestation-uid-123");

    // Set attestation (owner is also a verifier by default)
    await verifier.setAttestation(0, attestationUID);

    const action = await verifier.actions(0);
    expect(action.attestationUID).to.equal(attestationUID);
  });



  it("should get methodology and baseline from registries", async function () {
    const methodId = ethers.id("Test Methodology");
    const baselineId = ethers.id("Test Baseline");
    const projectId = ethers.id("Test Project");

    // Upsert
    await methodologyRegistry.upsert(methodId, "Test Method", "v1.0", "cid123", true);
    await baselineRegistry.upsert(baselineId, projectId, "v1.0", "cid456", true);

    // Get
    const methodology = await methodologyRegistry.get(methodId);
    expect(methodology.name).to.equal("Test Method");
    expect(methodology.version).to.equal("v1.0");
    expect(methodology.cid).to.equal("cid123");
    expect(methodology.active).to.equal(true);

    const baseline = await baselineRegistry.get(baselineId);
    expect(baseline.projectId).to.equal(projectId);
    expect(baseline.version).to.equal("v1.0");
    expect(baseline.cid).to.equal("cid456");
    expect(baseline.active).to.equal(true);
  });
});
