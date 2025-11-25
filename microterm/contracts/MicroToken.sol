// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MicroToken
 * @dev $MICRO - Loyalty token for MicroTerm platform
 * Users earn tokens for unlocking content and can use them for benefits
 */
contract MicroToken is ERC20, Ownable {
    // Token economics 
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 1 million tokens
    uint256 public constant REWARD_PER_UNLOCK = 10 * 10**18; // 10 tokens per unlock
    uint256 public constant TOKEN_GATE_THRESHOLD = 100 * 10**18; // 100 tokens for benefits
    
    // Reward tracking
    mapping(address => uint256) public totalEarned;
    mapping(address => uint256) public totalSpent;
    
    // Token-gated features
    mapping(address => uint256) public lastFreeUnlock;
    uint256 public constant FREE_UNLOCK_COOLDOWN = 1 days;
    
    event RewardDistributed(address indexed user, uint256 amount, string reason);
    event TokensSpent(address indexed user, uint256 amount, string reason);
    event FreeUnlockUsed(address indexed user, uint256 timestamp);

    constructor() ERC20("MicroToken", "MICRO") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Distribute reward tokens to a user
     * @param to Address to receive tokens
     * @param amount Amount of tokens to distribute
     * @param reason Reason for reward
     */
    function distributeReward(
        address to,
        uint256 amount,
        string memory reason
    ) public onlyOwner {
        require(to != address(0), "Cannot reward zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _transfer(owner(), to, amount);
        totalEarned[to] += amount;
        
        emit RewardDistributed(to, amount, reason);
    }

    /**
     * @dev Batch distribute rewards (gas efficient)
     */
    function batchDistributeRewards(
        address[] memory recipients,
        uint256[] memory amounts,
        string memory reason
    ) public onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            distributeReward(recipients[i], amounts[i], reason);
        }
    }

    /**
     * @dev Record tokens spent (for analytics)
     */
    function recordSpending(
        address user,
        uint256 amount,
        string memory reason
    ) public onlyOwner {
        totalSpent[user] += amount;
        emit TokensSpent(user, amount, reason);
    }

    /**
     * @dev Check if user qualifies for token-gated benefits
     */
    function qualifiesForBenefits(address user) public view returns (bool) {
        return balanceOf(user) >= TOKEN_GATE_THRESHOLD;
    }

    /**
     * @dev Check if user can use free unlock
     */
    function canUseFreeUnlock(address user) public view returns (bool) {
        if (!qualifiesForBenefits(user)) {
            return false;
        }
        
        uint256 lastUsed = lastFreeUnlock[user];
        return block.timestamp >= lastUsed + FREE_UNLOCK_COOLDOWN;
    }

    /**
     * @dev Record free unlock usage
     */
    function useFreeUnlock(address user) public onlyOwner {
        require(canUseFreeUnlock(user), "User cannot use free unlock");
        
        lastFreeUnlock[user] = block.timestamp;
        emit FreeUnlockUsed(user, block.timestamp);
    }

    /**
     * @dev Get user statistics
     */
    function getUserStats(address user) public view returns (
        uint256 balance,
        uint256 earned,
        uint256 spent,
        bool hasBenefits,
        bool canFreeUnlock,
        uint256 nextFreeUnlock
    ) {
        balance = balanceOf(user);
        earned = totalEarned[user];
        spent = totalSpent[user];
        hasBenefits = qualifiesForBenefits(user);
        canFreeUnlock = canUseFreeUnlock(user);
        
        if (lastFreeUnlock[user] > 0) {
            nextFreeUnlock = lastFreeUnlock[user] + FREE_UNLOCK_COOLDOWN;
        } else {
            nextFreeUnlock = block.timestamp;
        }
    }

    /**
     * @dev Calculate number of free unlocks available
     */
    function getFreeUnlocksAvailable(address user) public view returns (uint256) {
        if (!qualifiesForBenefits(user)) {
            return 0;
        }
        
        // 1 free unlock per day for token holders
        if (canUseFreeUnlock(user)) {
            return 1;
        }
        
        return 0;
    }
}

