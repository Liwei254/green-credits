const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MatchingPoolQuadratic", function () {
  let token, matchingPool;
  let owner, donor1, donor2, project1, project2;
  const PROJECT_ID_1 = ethers.encodeBytes32String("project1");
  const PROJECT_ID_2 = ethers.encodeBytes32String("project2");

  beforeEach(async function () {
    [owner, donor1, donor2, project1, project2] = await ethers.getSigners();

    // Deploy token
    const Token = await ethers.getContractFactory("GreenCreditToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    // Deploy matching pool
    const MatchingPool = await ethers.getContractFactory("MatchingPoolQuadratic");
    matchingPool = await MatchingPool.deploy();
    await matchingPool.waitForDeployment();

    // Mint some tokens to donors
    await token.mint(donor1.address, ethers.parseUnits("1000", 18));
    await token.mint(donor2.address, ethers.parseUnits("1000", 18));
    
    // Fund the matching pool with matching budget
    await token.mint(matchingPool.target, ethers.parseUnits("5000", 18));
  });

  describe("Round Creation", function () {
    it("should create a new round", async function () {
      const now = Math.floor(Date.now() / 1000);
      const start = now;
      const end = now + 7 * 24 * 60 * 60; // 7 days
      const budget = ethers.parseUnits("1000", 18);

      await matchingPool.connect(owner).createRound(token.target, start, end, budget);
      
      const round = await matchingPool.getRound(1);
      expect(round.id).to.equal(1);
      expect(round.token).to.equal(token.target);
      expect(round.start).to.equal(start);
      expect(round.end).to.equal(end);
      expect(round.matchingBudget).to.equal(budget);
      expect(round.active).to.be.false;
    });

    it("should prevent non-owner from creating round", async function () {
      const now = Math.floor(Date.now() / 1000);
      await expect(
        matchingPool.connect(donor1).createRound(token.target, now, now + 1000, ethers.parseUnits("100", 18))
      ).to.be.revertedWithCustomError(matchingPool, "OwnableUnauthorizedAccount");
    });

    it("should reject invalid round parameters", async function () {
      const now = Math.floor(Date.now() / 1000);
      
      // End before start
      await expect(
        matchingPool.connect(owner).createRound(token.target, now + 1000, now, ethers.parseUnits("100", 18))
      ).to.be.revertedWith("End must be after start");
      
      // Zero budget
      await expect(
        matchingPool.connect(owner).createRound(token.target, now, now + 1000, 0)
      ).to.be.revertedWith("Budget must be positive");
    });
  });

  describe("Round Management", function () {
    let roundId;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      await matchingPool.connect(owner).createRound(
        token.target,
        now - 100,
        now + 7 * 24 * 60 * 60,
        ethers.parseUnits("1000", 18)
      );
      roundId = 1;
    });

    it("should activate a round", async function () {
      await matchingPool.connect(owner).activateRound(roundId);
      const round = await matchingPool.getRound(roundId);
      expect(round.active).to.be.true;
    });

    it("should deactivate a round", async function () {
      await matchingPool.connect(owner).activateRound(roundId);
      await matchingPool.connect(owner).deactivateRound(roundId);
      const round = await matchingPool.getRound(roundId);
      expect(round.active).to.be.false;
    });

    it("should add projects to round", async function () {
      await matchingPool.connect(owner).addProject(roundId, PROJECT_ID_1, project1.address);
      expect(await matchingPool.projectAddress(roundId, PROJECT_ID_1)).to.equal(project1.address);
    });

    it("should prevent duplicate project addition", async function () {
      await matchingPool.connect(owner).addProject(roundId, PROJECT_ID_1, project1.address);
      await expect(
        matchingPool.connect(owner).addProject(roundId, PROJECT_ID_1, project2.address)
      ).to.be.revertedWith("Project already added");
    });
  });

  describe("Donations", function () {
    let roundId;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      await matchingPool.connect(owner).createRound(
        token.target,
        now - 100,
        now + 7 * 24 * 60 * 60,
        ethers.parseUnits("1000", 18)
      );
      roundId = 1;
      await matchingPool.connect(owner).activateRound(roundId);
      await matchingPool.connect(owner).addProject(roundId, PROJECT_ID_1, project1.address);
      await matchingPool.connect(owner).addProject(roundId, PROJECT_ID_2, project2.address);
    });

    it("should accept donations to a project", async function () {
      const amount = ethers.parseUnits("100", 18);
      await token.connect(donor1).approve(matchingPool.target, amount);
      
      await matchingPool.connect(donor1).donate(roundId, PROJECT_ID_1, amount);
      
      expect(await matchingPool.getContribution(roundId, donor1.address, PROJECT_ID_1)).to.equal(amount);
      expect(await matchingPool.totalContributions(roundId, PROJECT_ID_1)).to.equal(amount);
    });

    it("should track multiple donations", async function () {
      const amount1 = ethers.parseUnits("100", 18);
      const amount2 = ethers.parseUnits("50", 18);
      
      await token.connect(donor1).approve(matchingPool.target, amount1);
      await matchingPool.connect(donor1).donate(roundId, PROJECT_ID_1, amount1);
      
      await token.connect(donor1).approve(matchingPool.target, amount2);
      await matchingPool.connect(donor1).donate(roundId, PROJECT_ID_1, amount2);
      
      expect(await matchingPool.getContribution(roundId, donor1.address, PROJECT_ID_1))
        .to.equal(amount1 + amount2);
    });

    it("should prevent donations to inactive rounds", async function () {
      await matchingPool.connect(owner).deactivateRound(roundId);
      
      const amount = ethers.parseUnits("100", 18);
      await token.connect(donor1).approve(matchingPool.target, amount);
      
      await expect(
        matchingPool.connect(donor1).donate(roundId, PROJECT_ID_1, amount)
      ).to.be.revertedWith("Round not active");
    });

    it("should prevent donations to non-existent projects", async function () {
      const INVALID_PROJECT = ethers.encodeBytes32String("invalid");
      const amount = ethers.parseUnits("100", 18);
      
      await token.connect(donor1).approve(matchingPool.target, amount);
      
      await expect(
        matchingPool.connect(donor1).donate(roundId, INVALID_PROJECT, amount)
      ).to.be.revertedWith("Project not in round");
    });
  });

  describe("Match Allocation", function () {
    let roundId;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      const endTime = now - 100; // Already ended
      await matchingPool.connect(owner).createRound(
        token.target,
        endTime - 1000,
        endTime,
        ethers.parseUnits("1000", 18)
      );
      roundId = 1;
      await matchingPool.connect(owner).activateRound(roundId);
      await matchingPool.connect(owner).addProject(roundId, PROJECT_ID_1, project1.address);
      await matchingPool.connect(owner).addProject(roundId, PROJECT_ID_2, project2.address);
    });

    it("should finalize round with match allocations", async function () {
      const match1 = ethers.parseUnits("400", 18);
      const match2 = ethers.parseUnits("600", 18);
      
      const initialBalance1 = await token.balanceOf(project1.address);
      const initialBalance2 = await token.balanceOf(project2.address);
      
      await matchingPool.connect(owner).setMatchAllocations(
        roundId,
        [PROJECT_ID_1, PROJECT_ID_2],
        [match1, match2]
      );
      
      expect(await token.balanceOf(project1.address)).to.equal(initialBalance1 + match1);
      expect(await token.balanceOf(project2.address)).to.equal(initialBalance2 + match2);
      expect(await matchingPool.roundFinalized(roundId)).to.be.true;
    });

    it("should reject allocations exceeding budget", async function () {
      await expect(
        matchingPool.connect(owner).setMatchAllocations(
          roundId,
          [PROJECT_ID_1, PROJECT_ID_2],
          [ethers.parseUnits("600", 18), ethers.parseUnits("600", 18)]
        )
      ).to.be.revertedWith("Exceeds matching budget");
    });

    it("should prevent finalizing before round ends", async function () {
      const now = Math.floor(Date.now() / 1000);
      await matchingPool.connect(owner).createRound(
        token.target,
        now - 100,
        now + 7 * 24 * 60 * 60, // Still active
        ethers.parseUnits("1000", 18)
      );
      
      await expect(
        matchingPool.connect(owner).setMatchAllocations(2, [], [])
      ).to.be.revertedWith("Round not ended");
    });

    it("should prevent double finalization", async function () {
      await matchingPool.connect(owner).setMatchAllocations(
        roundId,
        [PROJECT_ID_1],
        [ethers.parseUnits("500", 18)]
      );
      
      await expect(
        matchingPool.connect(owner).setMatchAllocations(
          roundId,
          [PROJECT_ID_1],
          [ethers.parseUnits("500", 18)]
        )
      ).to.be.revertedWith("Round already finalized");
    });
  });
});
