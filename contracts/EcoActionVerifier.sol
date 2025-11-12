// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GreenCreditToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract EcoActionVerifier is Ownable {
    using SafeERC20 for IERC20;
    
    GreenCreditToken public token;
    address public gctToken; // GCT token address for staking

    enum CreditType { Reduction, Removal, Avoidance }
    enum ActionStatus { Submitted, Verified, Finalized, Rejected }

    struct Action {
        address user;
        string description;     // short text
        string proofCid;        // IPFS CID for proof (image/metadata JSON)
        uint256 reward;
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
        // Phase 2 fields
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

    // Role: verifiers managed by owner
    mapping(address => bool) public isVerifier;

    // Phase 2: Oracle role
    mapping(address => bool) public isOracle;

    // Phase 3: Track verifier per action
    mapping(uint256 => address) public verifierOfAction;

    // Phase 2: Configuration
    bool public instantMint;
    uint256 public challengeWindowSecs;
    uint16 public bufferBps; // basis points, max 10000 (100%)
    address public bufferVault;

    // Phase 2: Stakes
    uint256 public submitStakeWei;
    uint256 public verifyStakeWei;
    uint256 public challengeStakeWei;
    mapping(address => uint256) public stakeBalance;
    
    // GCT Staking
    mapping(address => uint256) public gctStakes;

    // Phase 2: Oracle reports per action
    mapping(uint256 => string[]) private oracleReports;

    // Phase 2: Challenges per action
    mapping(uint256 => Challenge[]) private challenges;

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
    event Staked(address indexed user, address indexed token, uint256 amount);

    // OZ v5 Ownable requires initial owner to be passed
    constructor(address tokenAddress) Ownable(msg.sender) {
        token = GreenCreditToken(tokenAddress);
        gctToken = tokenAddress; // Initialize GCT token for staking
        // Optionally, set the deployer as a verifier for demos:
        isVerifier[msg.sender] = true;
        emit VerifierAdded(msg.sender);
        // Phase 2 defaults
        instantMint = true; // backward compatible
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

    function depositStake(uint256 amount) external {
        require(amount > 0, "Zero deposit");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        stakeBalance[msg.sender] += amount;
        emit StakeDeposited(msg.sender, amount);
    }

    function withdrawStake(uint256 amount) external {
        require(stakeBalance[msg.sender] >= amount, "Insufficient balance");
        stakeBalance[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit StakeWithdrawn(msg.sender, amount);
    }

    // GCT Staking functions
    function setGCTToken(address _gctToken) external onlyOwner {
        require(_gctToken != address(0), "Zero address");
        gctToken = _gctToken;
    }

    function stakeWithGCT(uint256 amount) external {
        require(amount > 0, "Zero stake");
        require(gctToken != address(0), "GCT token not set");
        IERC20(gctToken).safeTransferFrom(msg.sender, address(this), amount);
        gctStakes[msg.sender] += amount;
        emit Staked(msg.sender, gctToken, amount);
    }

    function withdrawGCTStake(uint256 amount) external {
        require(gctStakes[msg.sender] >= amount, "Insufficient GCT stake");
        gctStakes[msg.sender] -= amount;
        IERC20(gctToken).safeTransfer(msg.sender, amount);
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
        require(stakeBalance[msg.sender] >= submitStakeWei, "Insufficient submit stake");
        
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
        require(stakeBalance[msg.sender] >= verifyStakeWei, "Insufficient verify stake");
        
        Action storage act = actions[actionId];
        require(act.status == ActionStatus.Submitted, "Action not in submitted state");

        act.status = ActionStatus.Verified;
        act.verifiedAt = block.timestamp;
        act.rewardPending = reward;
        act.reward = reward;

        // Phase 3: Record the verifier
        verifierOfAction[actionId] = msg.sender;
        emit VerifierRecorded(actionId, msg.sender);

        if (instantMint) {
            // Immediate mint (Phase 1 behavior)
            act.status = ActionStatus.Finalized;
            totalEarned[act.user] += reward;
            _mintWithBuffer(act.user, reward, act.creditType);
        }

        emit ActionVerified(act.user, actionId, reward, msg.sender, block.timestamp);
        emit MetricsActionVerified(act.user, block.timestamp);
    }

    function finalizeAction(uint256 actionId) external {
        require(actionId < actions.length, "Invalid actionId");
        Action storage act = actions[actionId];
        require(act.status == ActionStatus.Verified, "Action not verified");
        require(block.timestamp >= act.verifiedAt + challengeWindowSecs, "Challenge window not passed");
        
        // Check if any challenge is unresolved
        Challenge[] storage actionChallenges = challenges[actionId];
        for (uint256 i = 0; i < actionChallenges.length; i++) {
            require(actionChallenges[i].resolved, "Unresolved challenge exists");
            if (actionChallenges[i].upheld) {
                // Challenge was upheld, action should be rejected
                act.status = ActionStatus.Rejected;
                emit ActionRejected(actionId, block.timestamp);
                return;
            }
        }

        act.status = ActionStatus.Finalized;
        totalEarned[act.user] += act.rewardPending;
        _mintWithBuffer(act.user, act.rewardPending, act.creditType);
        
        emit ActionFinalized(act.user, actionId, act.rewardPending, block.timestamp);
    }

    function _mintWithBuffer(address user, uint256 reward, CreditType creditType) internal {
        if (creditType == CreditType.Removal && bufferBps > 0 && bufferVault != address(0)) {
            uint256 bufferAmount = (reward * bufferBps) / 10000;
            uint256 userAmount = reward - bufferAmount;
            token.mint(bufferVault, bufferAmount);
            token.mint(user, userAmount);
        } else {
            token.mint(user, reward);
        }
    }

    function challengeAction(uint256 actionId, string memory evidenceCid) external {
        require(actionId < actions.length, "Invalid actionId");
        require(stakeBalance[msg.sender] >= challengeStakeWei, "Insufficient challenge stake");
        
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

    function resolveChallenge(uint256 actionId, uint256 challengeIdx, bool upheld, address loserSlashTo) external onlyOwner {
        require(actionId < actions.length, "Invalid actionId");
        Challenge[] storage actionChallenges = challenges[actionId];
        require(challengeIdx < actionChallenges.length, "Invalid challenge index");
        
        Challenge storage challenge = actionChallenges[challengeIdx];
        require(!challenge.resolved, "Already resolved");

        challenge.resolved = true;
        challenge.upheld = upheld;

        // Simplified slashing: slash the loser if specified
        // In a full implementation, track verifierOfAction[actionId] to slash the correct party
        if (loserSlashTo != address(0)) {
            address loser = upheld ? msg.sender : challenge.challenger; // placeholder logic
            if (stakeBalance[loser] > 0 && loserSlashTo != address(0)) {
                uint256 slashAmount = stakeBalance[loser];
                stakeBalance[loser] = 0;
                stakeBalance[loserSlashTo] += slashAmount;
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