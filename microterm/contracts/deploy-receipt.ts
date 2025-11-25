import { createWalletClient, http, parseAbi } from "viem";
import { base, baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";
import path from "path";

/**
 * Deploy MicroTermReceipt NFT contract to Base Sepolia (testnet)
 *
 * Requirements:
 * - DEPLOYER_PRIVATE_KEY in environment
 * - Solidity compiler (solc) installed
 * - Sufficient ETH on Base Sepolia for gas (get from faucet)
 */

const RECEIPT_BYTECODE = ""; // Will be compiled separately

// Toggle between testnet and mainnet
const USE_TESTNET = process.env.USE_TESTNET !== "false"; // Default to testnet
const NETWORK = USE_TESTNET ? baseSepolia : base;
const NETWORK_NAME = USE_TESTNET ? "Base Sepolia (Testnet)" : "Base Mainnet";

async function deployReceiptContract() {
  console.log(`🚀 Deploying MicroTermReceipt to ${NETWORK_NAME}...\n`);

  // Check environment
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY not set in environment");
  }

  const rpcUrl = USE_TESTNET
    ? process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_URL ||
      "https://sepolia.base.org"
    : process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL;

  // Setup wallet
  const account = privateKeyToAccount(privateKey);
  const client = createWalletClient({
    account,
    chain: NETWORK,
    transport: http(rpcUrl),
  });

  console.log("📍 Deploying from:", account.address);
  console.log(`⛓️  Network: ${NETWORK_NAME}`);

  if (USE_TESTNET) {
    console.log("\n💡 TESTNET MODE - Get free testnet ETH:");
    console.log(
      "   https://www.coinbase.com/faucets/base-ethereum-goerli-faucet"
    );
    console.log("   or https://faucet.quicknode.com/base/sepolia\n");
  }

  console.log("⚠️  Manual deployment required:");
  console.log(
    "1. Install Foundry: curl -L https://foundry.paradigm.xyz | bash"
  );
  console.log("2. Run: foundryup");
  console.log("3. Initialize Foundry project:");
  console.log("   forge init --no-commit");
  console.log("4. Install OpenZeppelin:");
  console.log("   forge install OpenZeppelin/openzeppelin-contracts");
  console.log("5. Deploy with:");

  const rpcFlag = USE_TESTNET
    ? "--rpc-url https://sepolia.base.org"
    : `--rpc-url ${process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL}`;

  const verifyFlag = USE_TESTNET
    ? "--verify --etherscan-api-key YOUR_BASESCAN_KEY"
    : "--verify --etherscan-api-key YOUR_BASESCAN_KEY";

  console.log(`
forge create ${rpcFlag} \\
  --private-key ${privateKey.slice(0, 10)}... \\
  ${verifyFlag} \\
  contracts/MicroTermReceipt.sol:MicroTermReceipt
  `);

  console.log("\n6. Save the deployed address to .env.local:");
  console.log(`   NEXT_PUBLIC_NFT_RECEIPT_CONTRACT=0x...`);
  console.log(`   NEXT_PUBLIC_NETWORK=${USE_TESTNET ? "testnet" : "mainnet"}`);

  return {
    success: false,
    message: "Manual deployment required - see instructions above",
  };
}

// Alternative: Simple deployment function for pre-compiled bytecode
async function deployWithBytecode(bytecode: string, abi: any[]) {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  const account = privateKeyToAccount(privateKey);

  const client = createWalletClient({
    account,
    chain: base,
    transport: http(process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL),
  });

  const hash = await client.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
    args: [],
  });

  console.log("📝 Transaction hash:", hash);
  console.log("⏳ Waiting for confirmation...");

  // Note: You'd need to wait for the transaction receipt to get the contract address
  return hash;
}

if (require.main === module) {
  deployReceiptContract()
    .then((result) => {
      console.log("\n✅ Deployment process completed");
      console.log(result);
    })
    .catch((error) => {
      console.error("\n❌ Deployment failed:", error);
      process.exit(1);
    });
}

export { deployReceiptContract };
