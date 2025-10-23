// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GreenCreditToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EcoActionVerifier is Ownable {
    GreenCreditToken public token;

    struct Action {
        address user;
        string description;     // short text
        string proofCid;        // IPFS CID for proof (image/metadata JSON)
        uint256 reward;
        bool verified;
        uint256 timestamp;
    }

    Action[] public actions;
    mapping(address => uint256) public totalEarned;

    // Role: verifiers managed by owner
    mapping(address => bool) public isVerifier;

    event ActionSubmitted(address indexed user, string description, string proofCid, uint256 indexed actionId, uint256 timestamp);
    event ActionVerified(address indexed user, uint256 indexed actionId, uint256 reward, address indexed verifier, uint256 timestamp);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    // OZ v5 Ownable requires initial owner to be passed
    constructor(address tokenAddress) Ownable(msg.sender) {
        token = GreenCreditToken(tokenAddress);
        // Optionally, set the deployer as a verifier for demos:
        isVerifier[msg.sender] = true;
        emit VerifierAdded(msg.sender);
    }

    modifier onlyVerifier() {
        require(isVerifier[msg.sender] || msg.sender == owner(), "Not verifier");
        _;
    }

    function addVerifier(address account) external onlyOwner {
        require(account != address(0), "Zero address");
        require(!isVerifier[account], "Already verifier");
        isVerifier[account] = true;
        emit VerifierAdded(account);
    }

    function removeVerifier(address account) external onlyOwner {
        require(isVerifier[account], "Not verifier");
        isVerifier[account] = false;
        emit VerifierRemoved(account);
    }

    // Submit a new eco-action with proof CID (IPFS)
    function submitAction(string memory description, string memory proofCid) external {
        actions.push(Action(msg.sender, description, proofCid, 0, false, block.timestamp));
        uint256 actionId = actions.length - 1;
        emit ActionSubmitted(msg.sender, description, proofCid, actionId, block.timestamp);
    }

    // Verify a user’s eco-action (verifier/owner)
    function verifyAction(uint256 actionId, uint256 reward) external onlyVerifier {
        require(actionId < actions.length, "Invalid actionId");
        Action storage act = actions[actionId];
        require(!act.verified, "Action already verified");

        act.verified = true;
        act.reward = reward;
        totalEarned[act.user] += reward;
        token.mint(act.user, reward); // This contract must own the token

        emit ActionVerified(act.user, actionId, reward, msg.sender, block.timestamp);
    }

    function getActionCount() external view returns (uint256) {
        return actions.length;
    }
}