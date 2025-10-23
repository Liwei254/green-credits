// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GreenCreditToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationPool is Ownable {
    GreenCreditToken public immutable token;

    mapping(address => bool) public isNGO;

    event NGOToggled(address indexed ngo, bool allowed);
    event DonationMade(address indexed donor, address indexed ngo, uint256 amount, uint256 timestamp);

    constructor(address tokenAddress) Ownable(msg.sender) {
        token = GreenCreditToken(tokenAddress);
    }

    function setNGO(address ngo, bool allowed) external onlyOwner {
        require(ngo != address(0), "Zero address");
        isNGO[ngo] = allowed;
        emit NGOToggled(ngo, allowed);
    }

    function donateTo(address ngo, uint256 amount) external {
        require(isNGO[ngo], "NGO not allowed");
        require(amount > 0, "Zero amount");
        // Requires prior approval from donor
        bool ok = token.transferFrom(msg.sender, ngo, amount);
        require(ok, "Transfer failed");
        emit DonationMade(msg.sender, ngo, amount, block.timestamp);
    }
}