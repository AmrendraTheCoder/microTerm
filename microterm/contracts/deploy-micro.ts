import { createWalletClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

/**
 * Deploy MicroToken ($MICRO) ERC-20 contract to Base Sepolia (testnet)
 * 
 * Requirements:
 * - DEPLOYER_PRIVATE_KEY in environment
 * - Solidity compiler (solc) installed
 * - Sufficient ETH on Base Sepolia for gas (get from faucet)
 */

// Toggle between testnet and mainnet
const USE_TESTNET = process.env.USE_TESTNET !== 'false'; // Default to testnet
const NETWORK = USE_TESTNET ? baseSepolia : base;
const NETWORK_NAME = USE_TESTNET ? 'Base Sepolia (Testnet)' : 'Base Mainnet';

async function deployMicroToken() {
  console.log(`🚀 Deploying MicroToken ($MICRO) to ${NETWORK_NAME}...\n`);

  // Check environment
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY not set in environment');
  }

  const rpcUrl = USE_TESTNET 
    ? process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_URL || 'https://sepolia.base.org'
    : process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL;

  // Setup wallet
  const account = privateKeyToAccount(privateKey);
  const client = createWalletClient({
    account,
    chain: NETWORK,
    transport: http(rpcUrl),
  });

  console.log('📍 Deploying from:', account.address);
  console.log(`⛓️  Network: ${NETWORK_NAME}`);
  console.log('💰 Initial Supply: 1,000,000 $MICRO\n');

  if (USE_TESTNET) {
    console.log('💡 TESTNET MODE - Get free testnet ETH:');
    console.log('   https://www.coinbase.com/faucets/base-ethereum-goerli-faucet');
    console.log('   or https://faucet.quicknode.com/base/sepolia\n');
  }

  console.log('⚠️  Manual deployment required:');
  console.log('1. Install Foundry: curl -L https://foundry.paradigm.xyz | bash');
  console.log('2. Run: foundryup');
  console.log('3. Initialize Foundry project (if not done):');
  console.log('   forge init --no-commit');
  console.log('4. Install OpenZeppelin:');
  console.log('   forge install OpenZeppelin/openzeppelin-contracts');
  console.log('5. Deploy with:');
  
  const rpcFlag = USE_TESTNET 
    ? '--rpc-url https://sepolia.base.org'
    : `--rpc-url ${process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL}`;
  
  const verifyFlag = USE_TESTNET
    ? '--verify --etherscan-api-key YOUR_BASESCAN_KEY'
    : '--verify --etherscan-api-key YOUR_BASESCAN_KEY';

  console.log(`
forge create ${rpcFlag} \\
  --private-key ${privateKey.slice(0, 10)}... \\
  ${verifyFlag} \\
  contracts/MicroToken.sol:MicroToken
  `);

  console.log('\n6. Save the deployed address to .env.local:');
  console.log('   NEXT_PUBLIC_MICRO_TOKEN_CONTRACT=0x...');
  console.log(`   NEXT_PUBLIC_NETWORK=${USE_TESTNET ? 'testnet' : 'mainnet'}`);

  console.log('\n7. Fund the treasury wallet with $MICRO tokens for rewards:');
  console.log('   - Transfer 500,000 $MICRO to treasury for user rewards');
  console.log('   - Keep 500,000 $MICRO for team/development');
  
  if (USE_TESTNET) {
    console.log('\n💡 Testnet tip: You can mint unlimited test tokens for testing!');
  }

  return {
    success: false,
    message: 'Manual deployment required - see instructions above',
  };
}

if (require.main === module) {
  deployMicroToken()
    .then((result) => {
      console.log('\n✅ Deployment process completed');
      console.log(result);
    })
    .catch((error) => {
      console.error('\n❌ Deployment failed:', error);
      process.exit(1);
    });
}

export { deployMicroToken };

