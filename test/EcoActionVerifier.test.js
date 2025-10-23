const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EcoActionVerifier", function () {
  it("should submit and verify an eco-action", async function () {
    const [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("GreenCreditToken");
    const token = await Token.deploy();
    const Verifier = await ethers.getContractFactory("EcoActionVerifier");
    const verifier = await Verifier.deploy(await token.getAddress());
    await token.transferOwnership(await verifier.getAddress());

    await verifier.connect(user).submitAction("Planted 5 trees");
    const count = await verifier.getActionCount();
    expect(count).to.equal(1);

    await verifier.verifyAction(0, ethers.parseUnits("10", 18));
    const balance = await token.balanceOf(user.address);
    expect(balance).to.equal(ethers.parseUnits("10", 18));
  });
});
