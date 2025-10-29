// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GreenCreditToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EcoActionVerifier is Ownable {
    GreenCreditToken public token;

    enum CreditType { Reduction, Removal, Avoidance }

    struct Action {
        address user;
        string description;     // short text
        string proofCid;        // IPFS CID for proof (image/metadata JSON)
        uint256 reward;
        bool verified;
        uint256 timestamp;
        // V2 fields
        CreditType creditType;
        bytes32 methodologyId;
        bytes32 projectId;
        bytes32 baselineId;
        uint256 quantity;       // grams CO2e
        uint256 uncertaintyBps; // basis points (100 = 1%)
        uint256 durabilityYears;// applies to removals (0 else)
        string metadataCid;     // IPFS CID for additional metadata
        bytes32 attestationUID; // external attestation linkage
    }

    Action[] public actions;
    mapping(address => uint256) public totalEarned;

    // Role: verifiers managed by owner
    mapping(address => bool) public isVerifier;

    event ActionSubmitted(address indexed user, string description, string proofCid, uint256 indexed actionId, uint256 timestamp);
    event ActionSubmittedV2(
        address indexed user,
        uint256 indexed actionId,
        CreditType creditType,
        bytes32 methodologyId,
        bytes32 projectId,
        bytes32 baselineId,
        uint256 quantity,
        uint256 timestamp
    );
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

    // Submit a new eco-action with proof CID (IPFS) - legacy function for backward compatibility
    function submitAction(string memory description, string memory proofCid) external {
        actions.push(Action({
            user: msg.sender,
            description: description,
            proofCid: proofCid,
            reward: 0,
            verified: false,
            timestamp: block.timestamp,
            creditType: CreditType.Reduction,
            methodologyId: bytes32(0),
            projectId: bytes32(0),
            baselineId: bytes32(0),
            quantity: 0,
            uncertaintyBps: 0,
            durabilityYears: 0,
            metadataCid: "",
            attestationUID: bytes32(0)
        }));
        uint256 actionId = actions.length - 1;
        emit ActionSubmitted(msg.sender, description, proofCid, actionId, block.timestamp);
    }

    // Submit a new eco-action with V2 fields for trustable accounting
    function submitActionV2(
        string memory description,
        string memory proofCid,
        CreditType creditType,
        bytes32 methodologyId,
        bytes32 projectId,
        bytes32 baselineId,
        uint256 quantity,
        uint256 uncertaintyBps,
        uint256 durabilityYears,
        string memory metadataCid
    ) external {
        actions.push(Action({
            user: msg.sender,
            description: description,
            proofCid: proofCid,
            reward: 0,
            verified: false,
            timestamp: block.timestamp,
            creditType: creditType,
            methodologyId: methodologyId,
            projectId: projectId,
            baselineId: baselineId,
            quantity: quantity,
            uncertaintyBps: uncertaintyBps,
            durabilityYears: durabilityYears,
            metadataCid: metadataCid,
            attestationUID: bytes32(0)
        }));
        uint256 actionId = actions.length - 1;
        emit ActionSubmitted(msg.sender, description, proofCid, actionId, block.timestamp);
        emit ActionSubmittedV2(
            msg.sender,
            actionId,
            creditType,
            methodologyId,
            projectId,
            baselineId,
            quantity,
            block.timestamp
        );
    }

    // Set attestation UID for external attestation linkage (verifier only)
    function setAttestation(uint256 actionId, bytes32 uid) external onlyVerifier {
        require(actionId < actions.length, "Invalid actionId");
        actions[actionId].attestationUID = uid;
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