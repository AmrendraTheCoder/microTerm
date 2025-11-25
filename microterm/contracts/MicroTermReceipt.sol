// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MicroTermReceipt
 * @dev NFT Receipt system for MicroTerm unlocks
 * Each unlock generates a unique NFT as proof of purchase
 */
contract MicroTermReceipt is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Receipt metadata
    struct Receipt {
        string contentType; // "deal", "alert", "news"
        string itemId;
        uint256 pricePaid; // in USDC (6 decimals)
        uint256 timestamp;
        address purchaser;
    }

    // Token ID => Receipt data
    mapping(uint256 => Receipt) public receipts;
    
    // User => Token IDs
    mapping(address => uint256[]) public userReceipts;
    
    // Optional: Make receipts soulbound (non-transferable)
    bool public isSoulbound;

    event ReceiptMinted(
        uint256 indexed tokenId,
        address indexed purchaser,
        string contentType,
        string itemId,
        uint256 pricePaid
    );

    constructor() ERC721("MicroTerm Receipt", "MTRECEIPT") Ownable(msg.sender) {
        isSoulbound = false; // Can be changed to true for soulbound NFTs
    }

    /**
     * @dev Mint a new receipt NFT
     * @param to Address to mint to
     * @param contentType Type of content (deal/alert/news)
     * @param itemId ID of the unlocked item
     * @param pricePaid Price paid in USDC (6 decimals)
     * @param tokenURI Metadata URI
     */
    function mintReceipt(
        address to,
        string memory contentType,
        string memory itemId,
        uint256 pricePaid,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        receipts[tokenId] = Receipt({
            contentType: contentType,
            itemId: itemId,
            pricePaid: pricePaid,
            timestamp: block.timestamp,
            purchaser: to
        });
        
        userReceipts[to].push(tokenId);
        
        emit ReceiptMinted(tokenId, to, contentType, itemId, pricePaid);
        
        return tokenId;
    }

    /**
     * @dev Get all receipt token IDs for a user
     */
    function getUserReceipts(address user) public view returns (uint256[] memory) {
        return userReceipts[user];
    }

    /**
     * @dev Get receipt details
     */
    function getReceipt(uint256 tokenId) public view returns (Receipt memory) {
        require(_ownerOf(tokenId) != address(0), "Receipt does not exist");
        return receipts[tokenId];
    }

    /**
     * @dev Toggle soulbound status
     */
    function setSoulbound(bool _isSoulbound) public onlyOwner {
        isSoulbound = _isSoulbound;
    }

    /**
     * @dev Override transfer functions to implement soulbound if enabled
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0))
        // Block transfers if soulbound (from != address(0) && to != address(0))
        if (isSoulbound && from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer not allowed");
        }
        
        return super._update(to, tokenId, auth);
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

