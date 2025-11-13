// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MetricsTracker is Ownable {
    struct DailyMetrics {
        uint256 actionsSubmitted;
        uint256 actionsVerified;
        uint256 gctMinted;
        uint256 donationsCount;
        uint256 donationsAmount;
        uint256 timestamp;
    }

    struct NGODonationMetrics {
        uint256 donationsCount;
        uint256 totalAmount;
    }

    // Daily metrics by date (YYYYMMDD)
    mapping(uint256 => DailyMetrics) public dailyMetrics;

    // NGO-specific donation metrics
    mapping(address => NGODonationMetrics) public ngoMetrics;

    // Conversion funnel metrics (tracked via events)
    uint256 public totalVisitors;
    uint256 public totalWalletsConnected;
    uint256 public totalActionsSubmitted;
    uint256 public totalActionsVerified;

    event VisitorTracked(uint256 timestamp);
    event WalletConnected(address indexed user, uint256 timestamp);
    event ActionSubmitted(address indexed user, uint256 timestamp);
    event ActionVerified(address indexed user, uint256 timestamp);
    event GCTMinted(address indexed to, uint256 amount, uint256 timestamp);
    event DonationMade(address indexed donor, address indexed ngo, uint256 amount, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    function trackVisitor() external onlyOwner {
        totalVisitors++;
        emit VisitorTracked(block.timestamp);
    }

    function trackWalletConnection(address user) external onlyOwner {
        totalWalletsConnected++;
        emit WalletConnected(user, block.timestamp);
    }

    function trackActionSubmission(address user) external onlyOwner {
        totalActionsSubmitted++;
        uint256 date = _getDate(block.timestamp);
        dailyMetrics[date].actionsSubmitted++;
        emit ActionSubmitted(user, block.timestamp);
    }

    function trackActionVerification(address user) external onlyOwner {
        totalActionsVerified++;
        uint256 date = _getDate(block.timestamp);
        dailyMetrics[date].actionsVerified++;
        emit ActionVerified(user, block.timestamp);
    }

    function trackGCTMint(address to, uint256 amount) external onlyOwner {
        uint256 date = _getDate(block.timestamp);
        dailyMetrics[date].gctMinted += amount;
        emit GCTMinted(to, amount, block.timestamp);
    }

    function trackDonation(address donor, address ngo, uint256 amount) external onlyOwner {
        uint256 date = _getDate(block.timestamp);
        dailyMetrics[date].donationsCount++;
        dailyMetrics[date].donationsAmount += amount;

        ngoMetrics[ngo].donationsCount++;
        ngoMetrics[ngo].totalAmount += amount;

        emit DonationMade(donor, ngo, amount, block.timestamp);
    }

    function getDailyMetrics(uint256 date) external view returns (DailyMetrics memory) {
        return dailyMetrics[date];
    }

    function getNGOMetrics(address ngo) external view returns (NGODonationMetrics memory) {
        return ngoMetrics[ngo];
    }

    function getConversionMetrics() external view returns (
        uint256 visitors,
        uint256 wallets,
        uint256 submitted,
        uint256 verified
    ) {
        return (totalVisitors, totalWalletsConnected, totalActionsSubmitted, totalActionsVerified);
    }

    function getConversionRates() external view returns (
        uint256 walletConversion, // wallets/visitors * 10000 (basis points)
        uint256 submissionConversion, // submitted/wallets * 10000
        uint256 verificationConversion // verified/submitted * 10000
    ) {
        uint256 walletConv = totalVisitors > 0 ? (totalWalletsConnected * 10000) / totalVisitors : 0;
        uint256 submitConv = totalWalletsConnected > 0 ? (totalActionsSubmitted * 10000) / totalWalletsConnected : 0;
        uint256 verifyConv = totalActionsSubmitted > 0 ? (totalActionsVerified * 10000) / totalActionsSubmitted : 0;
        return (walletConv, submitConv, verifyConv);
    }

    function _getDate(uint256 timestamp) internal pure returns (uint256) {
        // Convert timestamp to YYYYMMDD format
        uint256 year = (timestamp / 31536000) + 1970; // Approximate year
        uint256 month = ((timestamp % 31536000) / 2629743) + 1; // Approximate month
        uint256 day = ((timestamp % 2629743) / 86400) + 1; // Day of month

        return year * 10000 + month * 100 + day;
    }

    // Batch update function for efficiency
    function batchUpdateMetrics(
        uint256[] calldata dates,
        uint256[] calldata submitted,
        uint256[] calldata verified,
        uint256[] calldata minted,
        uint256[] calldata donationCounts,
        uint256[] calldata donationAmounts
    ) external onlyOwner {
        require(
            dates.length == submitted.length &&
            dates.length == verified.length &&
            dates.length == minted.length &&
            dates.length == donationCounts.length &&
            dates.length == donationAmounts.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < dates.length; i++) {
            dailyMetrics[dates[i]].actionsSubmitted += submitted[i];
            dailyMetrics[dates[i]].actionsVerified += verified[i];
            dailyMetrics[dates[i]].gctMinted += minted[i];
            dailyMetrics[dates[i]].donationsCount += donationCounts[i];
            dailyMetrics[dates[i]].donationsAmount += donationAmounts[i];
        }
    }
}
