// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GreenCreditToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EcoActionVerifier is Ownable {
    GreenCreditToken public token;

    struct Action {
        address user;
        string description;
        uint256 reward;
        bool verified;
        uint256 timestamp;
    }

    Action[] public actions;
    mapping(address => uint256) public totalEarned;

    event ActionSubmitted(address indexed user, string description, uint256 timestamp);
    event ActionVerified(address indexed user, uint256 reward, uint256 timestamp);

    // ✅ FIX: Call Ownable(msg.sender)
    constructor(address tokenAddress) Ownable(msg.sender) {
        token = GreenCreditToken(tokenAddress);
    }

    // Submit a new eco-action (users)
    function submitAction(string memory description) external {
        actions.push(Action(msg.sender, description, 0, false, block.timestamp));
        emit ActionSubmitted(msg.sender, description, block.timestamp);
    }

    // Verify a user’s eco-action (admin/NGO)
    function verifyAction(uint256 actionId, uint256 reward) external onlyOwner {
        Action storage act = actions[actionId];
        require(!act.verified, "Action already verified");

        act.verified = true;
        act.reward = reward;
        totalEarned[act.user] += reward;
        token.mint(act.user, reward);

        emit ActionVerified(act.user, reward, block.timestamp);
    }

    // Get total actions count
    function getActionCount() external view returns (uint256) {
        return actions.length;
    }
}
