// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GreenCreditToken is ERC20, ERC20Permit, ERC20Votes, ERC20Capped, Ownable {
    // Set a reasonable cap for hackathon demo (e.g., 10M)
    constructor()
        ERC20("Green Credit Token", "GCT")
        ERC20Permit("Green Credit Token")
        ERC20Capped(10_000_000 ether)
        Ownable(msg.sender)
    {
        // Optional: initial supply to owner/treasury for liquidity bootstrapping
        _mint(msg.sender, 1_000_000 ether);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Internal overrides
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes, ERC20Capped)
    {
        super._update(from, to, value);
    }

    function nonces(address owner) public view override(ERC20Permit) returns (uint256) {
        return super.nonces(owner);
    }
}