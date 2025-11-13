// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MethodologyRegistry is Ownable {
    struct Methodology {
        string name;
        string version;
        string cid;       // IPFS CID for methodology document
        bool active;
    }

    mapping(bytes32 => Methodology) private methodologies;

    event MethodologyUpserted(bytes32 indexed id, string name, string version, string cid, bool active);

    constructor() Ownable(msg.sender) {}

    function upsert(
        bytes32 id,
        string memory name,
        string memory version,
        string memory cid,
        bool active
    ) external onlyOwner {
        methodologies[id] = Methodology(name, version, cid, active);
        emit MethodologyUpserted(id, name, version, cid, active);
    }

    function get(bytes32 id) external view returns (Methodology memory) {
        return methodologies[id];
    }
}
