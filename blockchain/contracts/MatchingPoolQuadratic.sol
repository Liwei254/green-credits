// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GreenCreditToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MatchingPoolQuadratic is Ownable {
    struct Round {
        uint256 id;
        address token;
        uint256 start;
        uint256 end;
        uint256 matchingBudget;
        bool active;
    }

    uint256 private nextRoundId = 1;
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => mapping(bytes32 => address)) public projectAddress; // roundId => projectId => address
    mapping(uint256 => mapping(address => mapping(bytes32 => uint256))) public contributed; // roundId => donor => projectId => amount
    mapping(uint256 => mapping(bytes32 => uint256)) public totalContributions; // roundId => projectId => total
    mapping(uint256 => bool) public roundFinalized; // roundId => finalized

    event RoundCreated(uint256 indexed roundId, address token, uint256 start, uint256 end, uint256 matchingBudget);
    event RoundActivated(uint256 indexed roundId);
    event RoundDeactivated(uint256 indexed roundId);
    event ProjectAdded(uint256 indexed roundId, bytes32 indexed projectId, address projectAddr);
    event Donation(uint256 indexed roundId, address indexed donor, bytes32 indexed projectId, uint256 amount, uint256 timestamp);
    event MatchAllocated(uint256 indexed roundId, bytes32 indexed projectId, uint256 amount);
    event RoundFinalized(uint256 indexed roundId);

    constructor() Ownable(msg.sender) {}

    // Create a new matching round
    function createRound(
        address token,
        uint256 start,
        uint256 end,
        uint256 matchingBudget
    ) external onlyOwner returns (uint256) {
        require(token != address(0), "Zero token address");
        require(end > start, "End must be after start");
        require(matchingBudget > 0, "Budget must be positive");

        uint256 roundId = nextRoundId++;
        rounds[roundId] = Round({
            id: roundId,
            token: token,
            start: start,
            end: end,
            matchingBudget: matchingBudget,
            active: false
        });

        emit RoundCreated(roundId, token, start, end, matchingBudget);
        return roundId;
    }

    // Activate a round
    function activateRound(uint256 roundId) external onlyOwner {
        require(rounds[roundId].id != 0, "Round does not exist");
        rounds[roundId].active = true;
        emit RoundActivated(roundId);
    }

    // Deactivate a round
    function deactivateRound(uint256 roundId) external onlyOwner {
        require(rounds[roundId].id != 0, "Round does not exist");
        rounds[roundId].active = false;
        emit RoundDeactivated(roundId);
    }

    // Add a project to a round
    function addProject(uint256 roundId, bytes32 projectId, address projectAddr) external onlyOwner {
        require(rounds[roundId].id != 0, "Round does not exist");
        require(projectAddr != address(0), "Zero project address");
        require(projectAddress[roundId][projectId] == address(0), "Project already added");

        projectAddress[roundId][projectId] = projectAddr;
        emit ProjectAdded(roundId, projectId, projectAddr);
    }

    // Donate to a project in a round
    function donate(uint256 roundId, bytes32 projectId, uint256 amount) external {
        Round storage round = rounds[roundId];
        require(round.id != 0, "Round does not exist");
        require(round.active, "Round not active");
        require(block.timestamp >= round.start, "Round not started");
        require(block.timestamp <= round.end, "Round ended");
        require(projectAddress[roundId][projectId] != address(0), "Project not in round");
        require(amount > 0, "Amount must be positive");

        // Transfer tokens from donor to this contract
        GreenCreditToken token = GreenCreditToken(round.token);
        bool ok = token.transferFrom(msg.sender, address(this), amount);
        require(ok, "Transfer failed");

        contributed[roundId][msg.sender][projectId] += amount;
        totalContributions[roundId][projectId] += amount;

        emit Donation(roundId, msg.sender, projectId, amount, block.timestamp);
    }

    // Admin submits match allocations for a round (QF calculated off-chain)
    function setMatchAllocations(
        uint256 roundId,
        bytes32[] memory projectIds,
        uint256[] memory amounts
    ) external onlyOwner {
        require(rounds[roundId].id != 0, "Round does not exist");
        require(!roundFinalized[roundId], "Round already finalized");
        require(block.timestamp > rounds[roundId].end, "Round not ended");
        require(projectIds.length == amounts.length, "Length mismatch");

        Round storage round = rounds[roundId];
        uint256 totalAllocation = 0;

        for (uint256 i = 0; i < projectIds.length; i++) {
            totalAllocation += amounts[i];
        }

        require(totalAllocation <= round.matchingBudget, "Exceeds matching budget");

        GreenCreditToken token = GreenCreditToken(round.token);

        // Disburse match allocations to project addresses
        for (uint256 i = 0; i < projectIds.length; i++) {
            bytes32 projectId = projectIds[i];
            uint256 matchAmount = amounts[i];
            address projectAddr = projectAddress[roundId][projectId];

            require(projectAddr != address(0), "Project not found");

            if (matchAmount > 0) {
                bool ok = token.transfer(projectAddr, matchAmount);
                require(ok, "Match transfer failed");
                emit MatchAllocated(roundId, projectId, matchAmount);
            }
        }

        // Also transfer direct contributions to projects
        for (uint256 i = 0; i < projectIds.length; i++) {
            bytes32 projectId = projectIds[i];
            uint256 directAmount = totalContributions[roundId][projectId];
            address projectAddr = projectAddress[roundId][projectId];

            if (directAmount > 0) {
                bool ok = token.transfer(projectAddr, directAmount);
                require(ok, "Direct transfer failed");
            }
        }

        roundFinalized[roundId] = true;
        emit RoundFinalized(roundId);
    }

    // View function to get round details
    function getRound(uint256 roundId) external view returns (Round memory) {
        require(rounds[roundId].id != 0, "Round does not exist");
        return rounds[roundId];
    }

    // View function to get contribution
    function getContribution(uint256 roundId, address donor, bytes32 projectId) external view returns (uint256) {
        return contributed[roundId][donor][projectId];
    }
}
