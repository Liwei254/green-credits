// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GreenCreditToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EcoActionVerifier is Ownable {
    IERC20 public stablecoin; // USDC
    GreenCreditToken public gct; // GCT token for rewards

    enum CreditType { Reduction, Removal, Avoidance }
    enum ActionStatus { Submitted, Verified, Finalized, Rejected }

    struct Action {
        address user;
        string description;
        string proofCid;
        uint256 reward;
        uint256 timestamp;
        CreditType creditType;
        bytes32 methodologyId;
        bytes32 projectId;
        bytes32 baselineId;
        uint256 quantity;
        uint256 uncertaintyBps;
        uint256 durabilityYears;
        string metadataCid;
        bytes32 attestationUID;
        ActionStatus status;
        uint256 verifiedAt;
        uint256 rewardPending;
    }

    struct Challenge {
        address challenger;
        string evidenceCid;
        uint256 timestamp;
        bool resolved;
        bool upheld;
    }

    Action[] public actions;
    mapping(address => uint256) public totalEarned;
    mapping(address => bool) public isVerifier;
    mapping(address => bool) public isOracle;
    mapping(uint256 => address) public verifierOfAction;

    bool public instantMint;
    uint256 public challengeWindowSecs;
    uint16 public bufferBps;
    address public bufferVault;

    uint256 public submitStakeWei;
    uint256 public verifyStakeWei;
    uint256 public challengeStakeWei;
    mapping(address => uint256) public usdStakeBalance; // USDC stake balance

    mapping(uint256 => string[]) private oracleReports;
    mapping(uint256 => Challenge[]) private challenges;

    event ActionSubmitted(address indexed user, string description, string proofCid, uint256 indexed actionId, uint256 timestamp);
    event ActionSubmittedV2(address indexed user, uint256 indexed actionId, CreditType creditType, bytes32 methodologyId, bytes32 projectId, bytes32 baselineId, uint256 quantity, uint256 timestamp);
    event ActionVerified(address indexed user, uint256 indexed actionId, uint256 reward, address indexed verifier, uint256 timestamp);
    event MetricsActionSubmitted(address indexed user, uint256 timestamp);
    event MetricsActionVerified(address indexed user, uint256 timestamp);
    event ActionFinalized(address indexed user, uint256 indexed actionId, uint256 reward, uint256 timestamp);
    event ActionRejected(uint256 indexed actionId, uint256 timestamp);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);
    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);
    event OracleReportAttached(uint256 indexed actionId, address indexed oracle, string cid, uint256 timestamp);
    event ActionChallenged(uint256 indexed actionId, address indexed challenger, string evidenceCid, uint256 timestamp);
    event ChallengeResolved(uint256 indexed actionId, uint256 challengeIdx, bool upheld, uint256 timestamp);
    event StakeDeposited(address indexed account, uint256 amount);
    event StakeWithdrawn(address indexed account, uint256 amount);
    event VerifierRecorded(uint256 indexed actionId, address indexed verifier);

    constructor(address stablecoinAddress, address gctAddress) Ownable(msg.sender) {
        stablecoin = IERC20(stablecoinAddress);
        gct = GreenCreditToken(gctAddress);
        isVerifier[msg.sender] = true;
        emit VerifierAdded(msg.sender);

        // Backwards compatible default: instant minting (Phase 1 behavior)
        instantMint = true;
        challengeWindowSecs = 0;
        bufferBps = 0;
        bufferVault = address(0);
    }

    modifier onlyVerifier() {
        require(isVerifier[msg.sender] || msg.sender == owner(), "Not verifier");
        _;
    }

    modifier onlyOracle() {
        require(isOracle[msg.sender] || msg.sender == owner(), "Not oracle");
        _;
    }

    // Role management
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

    function addOracle(address account) external onlyOwner {
        require(account != address(0), "Zero address");
        require(!isOracle[account], "Already oracle");
        isOracle[account] = true;
        emit OracleAdded(account);
    }

    function removeOracle(address account) external onlyOwner {
        require(isOracle[account], "Not oracle");
        isOracle[account] = false;
        emit OracleRemoved(account);
    }

    // Configuration
    function setConfig(
        bool _instantMint,
        uint256 _challengeWindowSecs,
        uint16 _bufferBps,
        address _bufferVault,
        uint256 _submitStakeWei,
        uint256 _verifyStakeWei,
        uint256 _challengeStakeWei
    ) external onlyOwner {
        require(_bufferBps <= 10000, "Buffer bps too high");
        instantMint = _instantMint;
        challengeWindowSecs = _challengeWindowSecs;
        bufferBps = _bufferBps;
        bufferVault = _bufferVault;
        submitStakeWei = _submitStakeWei;
        verifyStakeWei = _verifyStakeWei;
        challengeStakeWei = _challengeStakeWei;
    }

    // Staking with USDC
    function depositStake(uint256 amount) external {
        require(amount > 0, "Zero deposit");
        require(stablecoin.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        usdStakeBalance[msg.sender] += amount;
        emit StakeDeposited(msg.sender, amount);
    }

    function withdrawStake(uint256 amount) external {
        require(usdStakeBalance[msg.sender] >= amount, "Insufficient balance");
        usdStakeBalance[msg.sender] -= amount;
        require(stablecoin.transfer(msg.sender, amount), "Transfer failed");
        emit StakeWithdrawn(msg.sender, amount);
    }

    // Submission
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
        require(usdStakeBalance[msg.sender] >= submitStakeWei, "Insufficient submit stake");
        actions.push(Action({
            user: msg.sender,
            description: description,
            proofCid: proofCid,
            reward: 0,
            timestamp: block.timestamp,
            creditType: creditType,
            methodologyId: methodologyId,
            projectId: projectId,
            baselineId: baselineId,
            quantity: quantity,
            uncertaintyBps: uncertaintyBps,
            durabilityYears: durabilityYears,
            metadataCid: metadataCid,
            attestationUID: bytes32(0),
            status: ActionStatus.Submitted,
            verifiedAt: 0,
            rewardPending: 0
        }));

        uint256 actionId = actions.length - 1;
        emit ActionSubmitted(msg.sender, description, proofCid, actionId, block.timestamp);
        emit ActionSubmittedV2(msg.sender, actionId, creditType, methodologyId, projectId, baselineId, quantity, block.timestamp);
    }

    function setAttestation(uint256 actionId, bytes32 uid) external onlyVerifier {
        require(actionId < actions.length, "Invalid actionId");
        actions[actionId].attestationUID = uid;
    }

    // Verify action
    function verifyAction(uint256 actionId, uint256 reward) external onlyVerifier {
        require(actionId < actions.length, "Invalid actionId");
        require(usdStakeBalance[msg.sender] >= verifyStakeWei, "Insufficient verify stake");

        Action storage act = actions[actionId];
        require(act.status == ActionStatus.Submitted, "Action not in submitted state");

        // Set verified metadata
        act.verifiedAt = block.timestamp;
        act.rewardPending = reward;
        act.reward = 0;

        // If instantMint is true: mint now and finalize.
        // Otherwise mark as Verified for later finalization.
        if (instantMint) {
            // record verifier first
            verifierOfAction[actionId] = msg.sender;
            emit VerifierRecorded(actionId, msg.sender);

            uint256 userMinted = _mintWithBuffer(act.user, reward, act.creditType);
            act.status = ActionStatus.Finalized;
            act.reward = userMinted;
            act.rewardPending = 0; // clear pending after immediate mint
            totalEarned[act.user] += userMinted;
            emit ActionFinalized(act.user, actionId, userMinted, block.timestamp);
        } else {
            act.status = ActionStatus.Verified;
            verifierOfAction[actionId] = msg.sender;
            emit VerifierRecorded(actionId, msg.sender);
        }

        emit ActionVerified(act.user, actionId, reward, msg.sender, block.timestamp);
        emit MetricsActionVerified(act.user, block.timestamp);
    }

    // Finalize action (after challenge window)
    function finalizeAction(uint256 actionId) external {
        require(actionId < actions.length, "Invalid actionId");
        Action storage act = actions[actionId];
        require(act.status == ActionStatus.Verified, "Action not verified");
        require(block.timestamp >= act.verifiedAt + challengeWindowSecs, "Challenge window not passed");

        // Ensure all challenges resolved and none upheld
        Challenge[] storage actionChallenges = challenges[actionId];
        for (uint256 i = 0; i < actionChallenges.length; i++) {
            require(actionChallenges[i].resolved, "Unresolved challenge exists");
            if (actionChallenges[i].upheld) {
                act.status = ActionStatus.Rejected;
                emit ActionRejected(actionId, block.timestamp);
                return;
            }
        }

        // Mint pending reward once
        uint256 userMinted = _mintWithBuffer(act.user, act.rewardPending, act.creditType);
        act.status = ActionStatus.Finalized;
        act.reward = userMinted;
        act.rewardPending = 0;
        totalEarned[act.user] += userMinted;

        emit ActionFinalized(act.user, actionId, userMinted, block.timestamp);
    }

    // Mint helper — returns user portion actually minted for accounting
    function _mintWithBuffer(address user, uint256 reward, CreditType creditType) internal returns (uint256) {
        if (creditType == CreditType.Removal && bufferBps > 0 && bufferVault != address(0)) {
            uint256 bufferAmount = (reward * bufferBps) / 10000;
            uint256 userAmount = reward - bufferAmount;

            gct.mint(bufferVault, bufferAmount);
            gct.mint(user, userAmount);

            return userAmount;
        } else {
            gct.mint(user, reward);
            return reward;
        }
    }

    // Challenge functions
    function challengeAction(uint256 actionId, string memory evidenceCid) external {
        require(actionId < actions.length, "Invalid actionId");
        require(usdStakeBalance[msg.sender] >= challengeStakeWei, "Insufficient challenge stake");

        Action storage act = actions[actionId];
        require(act.status == ActionStatus.Verified, "Action not verified");
        require(block.timestamp < act.verifiedAt + challengeWindowSecs, "Challenge window passed");

        challenges[actionId].push(Challenge({
            challenger: msg.sender,
            evidenceCid: evidenceCid,
            timestamp: block.timestamp,
            resolved: false,
            upheld: false
        }));

        emit ActionChallenged(actionId, msg.sender, evidenceCid, block.timestamp);
    }

    // Resolve challenge; owner chooses loserSlashTo
    function resolveChallenge(uint256 actionId, uint256 challengeIdx, bool upheld, address loserSlashTo) external onlyOwner {
        require(actionId < actions.length, "Invalid actionId");
        Challenge[] storage actionChallenges = challenges[actionId];
        require(challengeIdx < actionChallenges.length, "Invalid challenge index");

        Challenge storage challenge = actionChallenges[challengeIdx];
        require(!challenge.resolved, "Already resolved");

        challenge.resolved = true;
        challenge.upheld = upheld;

        if (loserSlashTo != address(0)) {
            address partyToSlash = upheld ? verifierOfAction[actionId] : challenge.challenger;
            if (partyToSlash != address(0) && usdStakeBalance[partyToSlash] > 0) {
                uint256 slashAmount = usdStakeBalance[partyToSlash];
                usdStakeBalance[partyToSlash] = 0;
                usdStakeBalance[loserSlashTo] += slashAmount;
            }
        }

        emit ChallengeResolved(actionId, challengeIdx, upheld, block.timestamp);
    }

    function attachOracleReport(uint256 actionId, string memory cid) external onlyOracle {
        require(actionId < actions.length, "Invalid actionId");
        oracleReports[actionId].push(cid);
        emit OracleReportAttached(actionId, msg.sender, cid, block.timestamp);
    }

    function getOracleReports(uint256 actionId) external view returns (string[] memory) {
        require(actionId < actions.length, "Invalid actionId");
        return oracleReports[actionId];
    }

    function getChallenges(uint256 actionId) external view returns (Challenge[] memory) {
        require(actionId < actions.length, "Invalid actionId");
        return challenges[actionId];
    }

    function getActionCount() external view returns (uint256) {
        return actions.length;
    }
}
