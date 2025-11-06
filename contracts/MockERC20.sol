// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @dev Mock ERC20 token for testing and demo purposes
 * Used to simulate USDC and other stablecoins in development
 */
contract MockERC20 is ERC20 {
    uint8 private _decimals;

    /**
     * @dev Constructor that mints initial supply to deployer
     * @param name Token name
     * @param symbol Token symbol
     * @param decimals_ Number of decimals (6 for USDC, 18 for most tokens)
     * @param initialSupply Initial supply to mint to deployer
     */
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Returns the number of decimals used for user representation
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Public mint function for testing
     * In production, this should be restricted or removed
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    /**
     * @dev Public burn function for testing
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
