// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VerifierBadgeSBT is ERC721, Ownable {
    uint256 private _nextTokenId = 1;
    
    mapping(uint256 => uint8) public levelOf; // tokenId => badge level
    mapping(uint256 => address) private _tokenOwner; // tokenId => owner address
    mapping(address => uint256) public tokenOfOwner; // owner => tokenId (one badge per address)
    mapping(address => int256) public reputationOf; // verifier reputation score

    event BadgeMinted(address indexed to, uint256 indexed tokenId, uint8 level);
    event BadgeRevoked(uint256 indexed tokenId);
    event ReputationIncreased(address indexed verifier, int256 amount, int256 newTotal);
    event ReputationDecreased(address indexed verifier, int256 amount, int256 newTotal);

    constructor() ERC721("Verifier Badge SBT", "VBSBT") Ownable(msg.sender) {}

    // Mint a badge to a verifier (one badge per address)
    function mint(address to, uint256 tokenId, uint8 level) external onlyOwner {
        require(to != address(0), "Zero address");
        require(tokenOfOwner[to] == 0, "Address already has badge");
        require(_tokenOwner[tokenId] == address(0), "Token ID already exists");
        
        _tokenOwner[tokenId] = to;
        tokenOfOwner[to] = tokenId;
        levelOf[tokenId] = level;
        
        // Use internal _safeMint from ERC721
        _safeMint(to, tokenId);
        
        emit BadgeMinted(to, tokenId, level);
    }

    // Revoke a badge (owner only)
    function revoke(uint256 tokenId) external onlyOwner {
        address owner = _tokenOwner[tokenId];
        require(owner != address(0), "Token does not exist");
        
        tokenOfOwner[owner] = 0;
        levelOf[tokenId] = 0;
        delete _tokenOwner[tokenId];
        
        _burn(tokenId);
        
        emit BadgeRevoked(tokenId);
    }

    // Increase reputation for a verifier
    function increaseReputation(address verifier, int256 amount) external onlyOwner {
        require(verifier != address(0), "Zero address");
        require(amount > 0, "Amount must be positive");
        
        reputationOf[verifier] += amount;
        emit ReputationIncreased(verifier, amount, reputationOf[verifier]);
    }

    // Decrease reputation for a verifier
    function decreaseReputation(address verifier, int256 amount) external onlyOwner {
        require(verifier != address(0), "Zero address");
        require(amount > 0, "Amount must be positive");
        
        reputationOf[verifier] -= amount;
        emit ReputationDecreased(verifier, amount, reputationOf[verifier]);
    }

    // Override transfers to make tokens soulbound (non-transferable)
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) and burning (to == address(0))
        // Disallow transfers between addresses
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: token cannot be transferred");
        }
        
        return super._update(to, tokenId, auth);
    }

    // Override approval functions to prevent approvals
    function approve(address, uint256) public pure override {
        revert("Soulbound: approvals not allowed");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound: approvals not allowed");
    }

    function getApproved(uint256) public pure override returns (address) {
        return address(0);
    }

    function isApprovedForAll(address, address) public pure override returns (bool) {
        return false;
    }
}
