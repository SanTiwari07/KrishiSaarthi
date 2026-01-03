// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SaarthiCoin.sol";

/**
 * @title SaarthiMarketplace
 * @dev Simple marketplace where token holders (farmers) can list
 *      SaarthiCoin for sale and buyers can purchase them.
 *      Payment in INR/fiat is assumed off-chain; this only moves tokens.
 */
contract SaarthiMarketplace {
    SaarthiCoin public token;

    struct Listing {
        address seller;
        uint256 totalAmount;      // total tokens initially listed
        uint256 remainingAmount;  // tokens still for sale
        bool active;
    }

    Listing[] public listings;

    event ListingCreated(uint indexed listingId, address indexed seller, uint256 amount);
    event ListingCancelled(uint indexed listingId);
    event ListingPurchased(uint indexed listingId, address indexed buyer, uint256 amount);

    constructor(address tokenAddress) {
        token = SaarthiCoin(tokenAddress);
    }

    /// @notice Seller lists tokens for sale (must approved marketplace first)
    function createListing(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(token.balanceOf(msg.sender) >= amount, "Not enough tokens");
        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "Approve tokens first"
        );

        listings.push(
            Listing({
                seller: msg.sender,
                totalAmount: amount,
                remainingAmount: amount,
                active: true
            })
        );

        emit ListingCreated(listings.length - 1, msg.sender, amount);
    }

    /// @notice Buyer purchases tokens from a listing
    /// @dev Off-chain payment; this only transfers tokens.
    function buy(uint256 listingId, uint256 amount) external {
        require(listingId < listings.length, "Invalid listing");
        Listing storage l = listings[listingId];

        require(l.active, "Listing inactive");
        require(amount > 0, "Amount must be > 0");
        require(amount <= l.remainingAmount, "Not enough remaining");

        bool ok = token.transferFrom(l.seller, msg.sender, amount);
        require(ok, "Transfer failed");

        l.remainingAmount -= amount;
        if (l.remainingAmount == 0) {
            l.active = false;
        }

        emit ListingPurchased(listingId, msg.sender, amount);
    }

    /// @notice Seller can deactivate listing
    function cancelListing(uint256 listingId) external {
        require(listingId < listings.length, "Invalid listing");
        Listing storage l = listings[listingId];

        require(msg.sender == l.seller, "Only seller");
        require(l.active, "Already inactive");

        l.active = false;
        emit ListingCancelled(listingId);
    }

    function getListingsCount() external view returns (uint256) {
        return listings.length;
    }
}
