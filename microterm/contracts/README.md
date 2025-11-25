# MicroTerm Smart Contracts

This directory contains the smart contracts for the MicroTerm platform:

1. **MicroTermReceipt.sol** - ERC-721 NFT receipts for content unlocks
2. **MicroToken.sol** - ERC-20 $MICRO loyalty token

## 🎯 Overview

### MicroTermReceipt (NFT)

- **Purpose**: Mint NFT receipts as proof-of-purchase for each unlock
- **Standard**: ERC-721 with URI storage
- **Features**:
  - Unique NFT for each unlock
  - Metadata includes content type, item ID, price paid, timestamp
  - Optional soulbound mode (non-transferable)
  - User receipt history tracking
  - OpenSea compatible

### MicroToken ($MICRO)

- **Purpose**: Loyalty rewards for platform engagement
- **Standard**: ERC-20
- **Supply**: 1,000,000 tokens
- **Features**:
  - 10 $MICRO reward per unlock
  - Token-gating: 100 $MICRO = 1 free unlock per day
  - Earn/spend tracking
  - Transferable (can trade on DEXs)

## 🚀 Quick Start (Testnet)

### Prerequisites

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Get testnet ETH
# Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
# Or: https://faucet.quicknode.com/base/sepolia
```

### One-Command Deployment

```bash
# Set your private key
export DEPLOYER_PRIVATE_KEY=0x...

# Optional: Set BaseScan API key for verification
export BASESCAN_API_KEY=...

# Deploy to testnet (Base Sepolia)
./deploy-all.sh

# Deploy to mainnet (when ready)
USE_TESTNET=false ./deploy-all.sh
```

The script will:

1. ✅ Check prerequisites
2. ✅ Install dependencies (OpenZeppelin)
3. ✅ Compile contracts
4. ✅ Deploy both contracts
5. ✅ Verify on BaseScan (if API key provided)
6. ✅ Generate .env configuration

### Manual Deployment

If you prefer manual control:

```bash
# 1. Initialize Foundry project
forge init --no-commit

# 2. Install OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts

# 3. Copy contracts to src/
cp MicroTermReceipt.sol src/
cp MicroToken.sol src/

# 4. Create remappings
echo "@openzeppelin/=lib/openzeppelin-contracts/" > remappings.txt

# 5. Compile
forge build

# 6. Deploy MicroToken
forge create \
  --rpc-url https://sepolia.base.org \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --verify --etherscan-api-key $BASESCAN_API_KEY \
  src/MicroToken.sol:MicroToken

# 7. Deploy MicroTermReceipt
forge create \
  --rpc-url https://sepolia.base.org \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --verify --etherscan-api-key $BASESCAN_API_KEY \
  src/MicroTermReceipt.sol:MicroTermReceipt
```

## 📝 Configuration

After deployment, add to `microterm/.env.local`:

```bash
# Testnet (Base Sepolia)
NEXT_PUBLIC_MICRO_TOKEN_CONTRACT=0x...
NEXT_PUBLIC_NFT_RECEIPT_CONTRACT=0x...
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# Mainnet (Base)
NEXT_PUBLIC_MICRO_TOKEN_CONTRACT=0x...
NEXT_PUBLIC_NFT_RECEIPT_CONTRACT=0x...
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_ALCHEMY_BASE_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# Treasury wallet (receives USDC payments)
NEXT_PUBLIC_TREASURY_WALLET=0x...

# USDC contract address
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913  # Base mainnet
# NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e  # Base Sepolia testnet
```

## 🔧 Post-Deployment Setup

### 1. Fund Treasury with $MICRO

The treasury needs $MICRO tokens to reward users:

```bash
# Transfer 500,000 $MICRO to treasury
cast send $MICRO_TOKEN_CONTRACT \
  "transfer(address,uint256)" \
  $TREASURY_WALLET \
  500000000000000000000000 \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### 2. Test Minting

```bash
# Mint a test receipt NFT
cast send $NFT_RECEIPT_CONTRACT \
  "mintReceipt(address,string,string,uint256,string)" \
  $YOUR_WALLET \
  "deal" \
  "test-deal-1" \
  500000 \
  "ipfs://..." \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### 3. Test Token Distribution

```bash
# Distribute 10 $MICRO reward
cast send $MICRO_TOKEN_CONTRACT \
  "distributeReward(address,uint256,string)" \
  $USER_WALLET \
  10000000000000000000 \
  "unlock_reward" \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY
```

## 📊 Contract Interactions

### MicroTermReceipt Functions

```solidity
// Mint a new receipt (owner only)
function mintReceipt(
    address to,
    string memory contentType,  // "deal", "alert", "news"
    string memory itemId,
    uint256 pricePaid,          // USDC amount (6 decimals)
    string memory tokenURI
) returns (uint256 tokenId)

// Get user's receipts
function getUserReceipts(address user) returns (uint256[] memory)

// Get receipt details
function getReceipt(uint256 tokenId) returns (Receipt memory)

// Toggle soulbound mode
function setSoulbound(bool _isSoulbound)
```

### MicroToken Functions

```solidity
// Distribute rewards (owner only)
function distributeReward(
    address to,
    uint256 amount,
    string memory reason
)

// Batch distribute (gas efficient)
function batchDistributeRewards(
    address[] memory recipients,
    uint256[] memory amounts,
    string memory reason
)

// Check if user qualifies for benefits
function qualifiesForBenefits(address user) returns (bool)

// Check if user can use free unlock
function canUseFreeUnlock(address user) returns (bool)

// Record free unlock usage (owner only)
function useFreeUnlock(address user)

// Get user statistics
function getUserStats(address user) returns (
    uint256 balance,
    uint256 earned,
    uint256 spent,
    bool hasBenefits,
    bool canFreeUnlock,
    uint256 nextFreeUnlock
)
```

## 🧪 Testing

### Local Testing with Anvil

```bash
# Start local testnet
anvil

# Deploy to local network
forge create \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  src/MicroToken.sol:MicroToken
```

### Forge Tests

```bash
# Run tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test testMintReceipt
```

## 🔐 Security Considerations

### Ownership

- Both contracts use OpenZeppelin's `Ownable`
- Only owner can mint NFTs and distribute tokens
- Transfer ownership carefully:
  ```solidity
  transferOwnership(newOwner);
  ```

### Soulbound NFTs

- Set `isSoulbound = true` to prevent receipt transfers
- Users can still view/prove ownership
- Cannot be sold on secondary markets

### Token Economics

- Fixed supply of 1M $MICRO
- Monitor treasury balance
- Consider implementing:
  - Rate limiting on rewards
  - Maximum rewards per user
  - Vesting schedule for team tokens

## 📈 Monitoring

### View on Block Explorers

**Testnet (Base Sepolia)**:

- https://sepolia.basescan.org/address/YOUR_CONTRACT

**Mainnet (Base)**:

- https://basescan.org/address/YOUR_CONTRACT

### Query Contract State

```bash
# Get $MICRO total supply
cast call $MICRO_TOKEN_CONTRACT "totalSupply()" --rpc-url $RPC_URL

# Get user's $MICRO balance
cast call $MICRO_TOKEN_CONTRACT "balanceOf(address)" $USER_WALLET --rpc-url $RPC_URL

# Get user's receipt count
cast call $NFT_RECEIPT_CONTRACT "balanceOf(address)" $USER_WALLET --rpc-url $RPC_URL

# Check if user qualifies for benefits
cast call $MICRO_TOKEN_CONTRACT "qualifiesForBenefits(address)" $USER_WALLET --rpc-url $RPC_URL
```

## 🚀 Mainnet Migration

When ready to deploy to mainnet:

1. **Test thoroughly on testnet**

   - Mint 10+ test receipts
   - Distribute rewards
   - Test token-gating
   - Verify UI integration

2. **Prepare mainnet wallet**

   - Fund with sufficient ETH for gas (~0.01 ETH)
   - Use hardware wallet or multi-sig for security

3. **Deploy to mainnet**

   ```bash
   USE_TESTNET=false ./deploy-all.sh
   ```

4. **Verify contracts**

   - Check on BaseScan
   - Test all functions
   - Transfer ownership to multi-sig

5. **Update frontend**
   - Switch .env.local to mainnet addresses
   - Update USDC address
   - Test payment flow

## 📚 Resources

- **Foundry Docs**: https://book.getfoundry.sh/
- **OpenZeppelin**: https://docs.openzeppelin.com/contracts/
- **Base Docs**: https://docs.base.org/
- **BaseScan**: https://basescan.org/
- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## 🆘 Troubleshooting

### "Insufficient funds" error

- Get testnet ETH from faucet
- Check balance: `cast balance $YOUR_WALLET --rpc-url $RPC_URL`

### "Contract verification failed"

- Check BaseScan API key
- Verify Solidity version matches (0.8.20)
- Try manual verification on BaseScan

### "Transaction reverted"

- Check gas limits
- Verify function parameters
- Check contract ownership

### Compilation errors

- Update Foundry: `foundryup`
- Clean build: `forge clean && forge build`
- Check OpenZeppelin version

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Test changes on local network (Anvil)
2. Deploy to testnet
3. Verify all functions work
4. Submit PR with test results

---

**Need help?** Check the main README or open an issue on GitHub.
