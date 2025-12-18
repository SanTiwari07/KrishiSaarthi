// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SaarthiCoin is ERC20, Ownable {

    address public registry;

    constructor()
        ERC20("Saarthi Coin", "SARTHI")
        Ownable(msg.sender)   // Fix: Ownable requires initial owner
    {}

    function setRegistry(address _registry) external onlyOwner {
        registry = _registry;
    }

    function mintToFarmer(address farmer, uint256 amount) external {
        require(msg.sender == registry, "Only registry can mint");
        _mint(farmer, amount);
    }
}
