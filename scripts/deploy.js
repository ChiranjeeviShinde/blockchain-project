import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function main() {
  console.log('🚀 BlockTix Smart Contract Deployment Script');
  console.log('============================================');

  const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    console.error('❌ Error: DEPLOYER_PRIVATE_KEY environment variable is not set.');
    console.log('\nUsage:');
    console.log('  export DEPLOYER_PRIVATE_KEY="your_private_key_here"');
    console.log('  export SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" (optional)');
    console.log('  node scripts/deploy.js');
    console.log('\nAlternatively, for College Project Demonstrations, use Remix IDE (No private keys exposed!):');
    console.log('  1. Open https://remix.ethereum.org');
    console.log('  2. Create BlockTix.sol and paste contracts/BlockTix.sol');
    console.log('  3. In Environment tab, select "Injected Provider - MetaMask"');
    console.log('  4. Ensure MetaMask is on Sepolia Network and click "Deploy"');
    console.log('  5. Copy the deployed contract address and set VITE_CONTRACT_ADDRESS in .env\n');
    process.exit(1);
  }

  const abiPath = path.resolve(rootDir, 'src', 'contracts', 'BlockTixABI.json');
  const bytecodePath = path.resolve(rootDir, 'src', 'contracts', 'BlockTixBytecode.json');

  if (!fs.existsSync(abiPath) || !fs.existsSync(bytecodePath)) {
    console.error('❌ ABI or Bytecode not found. Run "node scripts/compile.js" first.');
    process.exit(1);
  }

  const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  const { bytecode } = JSON.parse(fs.readFileSync(bytecodePath, 'utf8'));

  console.log(`Connecting to Sepolia RPC: ${rpcUrl}...`);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const address = await wallet.getAddress();
  const balance = await provider.getBalance(address);
  console.log(`Deployer Address: ${address}`);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error('❌ Error: Deployer account has 0 ETH. Please request Sepolia testnet ETH from a faucet.');
    process.exit(1);
  }

  console.log('\nDeploying BlockTix contract to Sepolia testnet...');
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();

  console.log(`Deployment transaction submitted. Hash: ${contract.deploymentTransaction().hash}`);
  console.log('Waiting for block confirmation on Sepolia...');

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log('\n🎉 Contract successfully deployed!');
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);

  console.log('\nTo connect this contract to your BlockTix frontend:');
  console.log(`1. Add to your .env file:`);
  console.log(`   VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log('2. Restart the Vite dev server: npm run dev\n');
}

main().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
