#!/bin/bash

# MicroTerm Smart Contract Deployment Script
# Deploys both NFT Receipt and $MICRO token contracts
# Supports both testnet (Base Sepolia) and mainnet (Base)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       MicroTerm Smart Contract Deployment Suite         ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if USE_TESTNET is set, default to true
USE_TESTNET=${USE_TESTNET:-true}

if [ "$USE_TESTNET" = "true" ]; then
    NETWORK="Base Sepolia (Testnet)"
    RPC_URL=${ALCHEMY_BASE_SEPOLIA_URL:-"https://sepolia.base.org"}
    EXPLORER="https://sepolia.basescan.org"
else
    NETWORK="Base Mainnet"
    RPC_URL=$ALCHEMY_BASE_URL
    EXPLORER="https://basescan.org"
fi

echo -e "${YELLOW}Network: ${NETWORK}${NC}"
echo -e "${YELLOW}RPC URL: ${RPC_URL}${NC}"
echo ""

# Check prerequisites
echo -e "${CYAN}[1/7] Checking prerequisites...${NC}"

if ! command -v forge &> /dev/null; then
    echo -e "${RED}❌ Foundry not found. Installing...${NC}"
    curl -L https://foundry.paradigm.xyz | bash
    source ~/.bashrc
    foundryup
    echo -e "${GREEN}✅ Foundry installed${NC}"
else
    echo -e "${GREEN}✅ Foundry found${NC}"
fi

# Check for private key
if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
    echo -e "${RED}❌ DEPLOYER_PRIVATE_KEY not set${NC}"
    echo "Please set your deployer private key:"
    echo "export DEPLOYER_PRIVATE_KEY=0x..."
    exit 1
fi
echo -e "${GREEN}✅ Private key configured${NC}"

# Check for BaseScan API key
if [ -z "$BASESCAN_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  BASESCAN_API_KEY not set (contract verification will be skipped)${NC}"
    VERIFY_FLAG=""
else
    VERIFY_FLAG="--verify --etherscan-api-key $BASESCAN_API_KEY"
    echo -e "${GREEN}✅ BaseScan API key configured${NC}"
fi

# Initialize Foundry project if needed
echo ""
echo -e "${CYAN}[2/7] Setting up Foundry project...${NC}"

if [ ! -f "foundry.toml" ]; then
    echo "Initializing Foundry project..."
    forge init --no-commit --force
    echo -e "${GREEN}✅ Foundry project initialized${NC}"
else
    echo -e "${GREEN}✅ Foundry project already exists${NC}"
fi

# Install OpenZeppelin contracts
echo ""
echo -e "${CYAN}[3/7] Installing dependencies...${NC}"

if [ ! -d "lib/openzeppelin-contracts" ]; then
    echo "Installing OpenZeppelin contracts..."
    forge install OpenZeppelin/openzeppelin-contracts --no-commit
    echo -e "${GREEN}✅ OpenZeppelin installed${NC}"
else
    echo -e "${GREEN}✅ OpenZeppelin already installed${NC}"
fi

# Copy contracts to src directory (Foundry convention)
echo ""
echo -e "${CYAN}[4/7] Preparing contracts...${NC}"

mkdir -p src
cp MicroTermReceipt.sol src/
cp MicroToken.sol src/

# Create remappings for OpenZeppelin
cat > remappings.txt << EOF
@openzeppelin/=lib/openzeppelin-contracts/
EOF

echo -e "${GREEN}✅ Contracts prepared${NC}"

# Compile contracts
echo ""
echo -e "${CYAN}[5/7] Compiling contracts...${NC}"

forge build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contracts compiled successfully${NC}"
else
    echo -e "${RED}❌ Compilation failed${NC}"
    exit 1
fi

# Get testnet ETH reminder
if [ "$USE_TESTNET" = "true" ]; then
    echo ""
    echo -e "${YELLOW}💡 Make sure you have testnet ETH on Base Sepolia:${NC}"
    echo "   - Coinbase Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet"
    echo "   - QuickNode Faucet: https://faucet.quicknode.com/base/sepolia"
    echo ""
    read -p "Press Enter when you have testnet ETH..."
fi

# Deploy MicroToken
echo ""
echo -e "${CYAN}[6/7] Deploying MicroToken ($MICRO)...${NC}"

MICRO_ADDRESS=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY \
    $VERIFY_FLAG \
    src/MicroToken.sol:MicroToken \
    --json | jq -r '.deployedTo')

if [ -z "$MICRO_ADDRESS" ] || [ "$MICRO_ADDRESS" = "null" ]; then
    echo -e "${RED}❌ MicroToken deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ MicroToken deployed at: ${MICRO_ADDRESS}${NC}"
echo -e "${CYAN}   View on explorer: ${EXPLORER}/address/${MICRO_ADDRESS}${NC}"

# Deploy MicroTermReceipt
echo ""
echo -e "${CYAN}[7/7] Deploying MicroTermReceipt (NFT)...${NC}"

RECEIPT_ADDRESS=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY \
    $VERIFY_FLAG \
    src/MicroTermReceipt.sol:MicroTermReceipt \
    --json | jq -r '.deployedTo')

if [ -z "$RECEIPT_ADDRESS" ] || [ "$RECEIPT_ADDRESS" = "null" ]; then
    echo -e "${RED}❌ MicroTermReceipt deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ MicroTermReceipt deployed at: ${RECEIPT_ADDRESS}${NC}"
echo -e "${CYAN}   View on explorer: ${EXPLORER}/address/${RECEIPT_ADDRESS}${NC}"

# Generate .env configuration
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                  Deployment Complete!                    ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Add these to your .env.local file:${NC}"
echo ""
echo "# Smart Contract Addresses"
echo "NEXT_PUBLIC_MICRO_TOKEN_CONTRACT=$MICRO_ADDRESS"
echo "NEXT_PUBLIC_NFT_RECEIPT_CONTRACT=$RECEIPT_ADDRESS"
if [ "$USE_TESTNET" = "true" ]; then
    echo "NEXT_PUBLIC_NETWORK=testnet"
    echo "NEXT_PUBLIC_CHAIN_ID=84532"
else
    echo "NEXT_PUBLIC_NETWORK=mainnet"
    echo "NEXT_PUBLIC_CHAIN_ID=8453"
fi
echo ""

# Save to file
cat > .env.contracts << EOF
# Generated by deploy-all.sh on $(date)
# Network: $NETWORK

NEXT_PUBLIC_MICRO_TOKEN_CONTRACT=$MICRO_ADDRESS
NEXT_PUBLIC_NFT_RECEIPT_CONTRACT=$RECEIPT_ADDRESS
NEXT_PUBLIC_NETWORK=$([ "$USE_TESTNET" = "true" ] && echo "testnet" || echo "mainnet")
NEXT_PUBLIC_CHAIN_ID=$([ "$USE_TESTNET" = "true" ] && echo "84532" || echo "8453")
EOF

echo -e "${GREEN}✅ Configuration saved to .env.contracts${NC}"
echo ""

# Next steps
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Copy the environment variables above to microterm/.env.local"
echo "2. Fund the treasury wallet with $MICRO tokens:"
echo "   cast send $MICRO_ADDRESS \"transfer(address,uint256)\" YOUR_TREASURY_ADDRESS 500000000000000000000000 --rpc-url $RPC_URL --private-key \$DEPLOYER_PRIVATE_KEY"
echo "3. Test the contracts with the frontend"
echo ""

if [ "$USE_TESTNET" = "true" ]; then
    echo -e "${CYAN}💡 To deploy to mainnet, run:${NC}"
    echo "   USE_TESTNET=false ./deploy-all.sh"
fi

echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
