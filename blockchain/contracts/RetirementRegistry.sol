// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RetirementRegistry is Ownable {
    struct Retirement {
        uint256 serial;
        address account;
        uint256[] actionIds;
        uint256[] grams; // CO2e in grams
        string reason;
        string beneficiary;
        uint256 timestamp;
    }

    uint256 private nextSerial = 1;
    Retirement[] public retirements;
    
    // Mapping from account to list of retirement serials
    mapping(address => uint256[]) public retiredByAccount;

    event Retired(
        uint256 indexed serial,
        address indexed account,
        uint256[] actionIds,
        uint256[] grams,
        string reason,
        string beneficiary,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    function retire(
        uint256[] memory actionIds,
        uint256[] memory grams,
        string memory reason,
        string memory beneficiary
    ) external returns (uint256) {
        require(actionIds.length > 0, "No actions provided");
        require(actionIds.length == grams.length, "Length mismatch");

        uint256 serial = nextSerial++;
        
        retirements.push(Retirement({
            serial: serial,
            account: msg.sender,
            actionIds: actionIds,
            grams: grams,
            reason: reason,
            beneficiary: beneficiary,
            timestamp: block.timestamp
        }));

        retiredByAccount[msg.sender].push(serial);

        emit Retired(serial, msg.sender, actionIds, grams, reason, beneficiary, block.timestamp);
        
        return serial;
    }

    function getRetirement(uint256 serial) external view returns (Retirement memory) {
        require(serial > 0 && serial < nextSerial, "Invalid serial");
        return retirements[serial - 1];
    }

    function getRetirementsByAccount(address account) external view returns (uint256[] memory) {
        return retiredByAccount[account];
    }

    function getRetirementCount() external view returns (uint256) {
        return retirements.length;
    }
}
