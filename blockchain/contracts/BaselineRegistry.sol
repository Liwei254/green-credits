// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract BaselineRegistry is Ownable {
    struct Baseline {
        bytes32 projectId;
        string version;
        string cid;       // IPFS CID for baseline document
        bool active;
    }

    mapping(bytes32 => Baseline) private baselines;

    event BaselineUpserted(bytes32 indexed id, bytes32 indexed projectId, string version, string cid, bool active);

    constructor() Ownable(msg.sender) {}

    function upsert(
        bytes32 id,
        bytes32 projectId,
        string memory version,
        string memory cid,
        bool active
    ) external onlyOwner {
        baselines[id] = Baseline(projectId, version, cid, active);
        emit BaselineUpserted(id, projectId, version, cid, active);
    }

    function get(bytes32 id) external view returns (Baseline memory) {
        return baselines[id];
    }
}
