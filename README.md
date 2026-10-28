# BlockTix — Blockchain-Based Event Ticketing & Verification System

> **"Every Ticket Has an Immutable Chain of Trust."**

BlockTix is a decentralized, full-stack event ticketing and gate verification application built with **React 19, Vite, ethers.js v6, and Solidity (ERC-721)**. Developed as a production-grade Web3 dApp for academic and capstone evaluation, BlockTix eliminates counterfeit tickets, black-market scalping, and duplicate gate entries through cryptographic ownership and smart contract-enforced state transitions on Ethereum's Sepolia Testnet.

---

## 🌟 Key Features & Capabilities

1. **Genuine MetaMask Wallet Integration (EIP-1193)**:
   - Real-time MetaMask extension detection with direct install guide fallback.
   - Automatic network detection and 1-click switching to **Ethereum Sepolia Testnet** (Chain ID: `11155111` / `0xaa36a7`).
   - Shortened address display (`0x71A9...93F2`), real testnet ETH balance lookup, copy address, and account change listener.
   - Dual-mode support: Seamlessly switch between **Live Sepolia Testnet** and **Demo Preset Wallets** for offline faculty evaluations.

2. **ERC-721 NFT Smart Contract (`contracts/BlockTix.sol`)**:
   - Built with **OpenZeppelin v5** contracts (`ERC721`, `Ownable`, `ReentrancyGuard`).
   - Supply-capped event creation with pricing in wei/ETH.
   - Non-fungible ticket minting with direct payout tracking.
   - **Anti-Scalping / Anti-Replay Guard**: Once a ticket is marked `USED` at gate check-in, its transfer is permanently blocked both in frontend UI and via the contract's internal `_update` hook.
   - Role-based gate verification restricted to contract owners, event organizers, or designated validator wallets.

3. **Event Marketplace & Checkout**:
   - Browse on-chain and curated events with real-time capacity meters and category filters.
   - Live 3-step checkout: Requesting signature in MetaMask → Mining block on Sepolia → Confetti celebration with direct Etherscan transaction link.

4. **Cryptographic QR Gate Turnstile Verification (`/verify`)**:
   - High-density camera QR scanner (`html5-qrcode`) with manual ticket/token ID input fallback.
   - Validates existence, authenticity, event match, and usage status directly on the blockchain.
   - Gate validator clicks **Approve Entry**, which broadcasts an on-chain `useTicket()` transaction, locking the pass permanently and denying any double-entry attempts.

5. **Organizer Dashboard (`/organizer`)**:
   - Real-time platform metrics: total events, tickets minted, active vs used tickets, and volume metrics.
   - On-chain event registration form creating live event contracts on Sepolia.
   - Clear authorization rules: Contract Owner, Event Creator, or Authorized Verifiers (with one-click presentation override for viva examinations).

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   Vite • Tailwind CSS • React Router • Lucide Icons    │
└───────────────────────────┬────────────────────────────┘
                            │
              EIP-1193 / window.ethereum
                            │
┌───────────────────────────▼────────────────────────────┐
│              ethers.js v6 Web3 Service                 │
│  MetaMask Provider • Signer • Fallback JSON-RPC Pool   │
└───────────────────────────┬────────────────────────────┘
                            │
               JSON-RPC Calls / Transactions
                            │
┌───────────────────────────▼────────────────────────────┐
│            BlockTix ERC-721 Smart Contract             │
│    OpenZeppelin ERC721 • Ownable • ReentrancyGuard     │
│   Deploys on: Ethereum Sepolia Testnet (ID: 11155111)  │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0 or newer recommended)
- **MetaMask** browser extension installed ([Download MetaMask](https://metamask.io/download/))
- A free testnet wallet with Sepolia ETH (e.g. from Google Cloud Web3 Faucet or Sepolia PoW Faucet)

### 2. Installation

```bash
git clone https://github.com/ChiranjeeviShinde/blockchain-project.git
cd blockchain-project

# Install dependencies
npm install
```

### 3. Environment Setup

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

Inside `.env`:
```env
# Optional: Set your deployed contract address after deploying
VITE_CONTRACT_ADDRESS=

# Default Sepolia RPC Endpoint
VITE_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

### 4. Run Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📜 Smart Contract Compilation & Deployment

The smart contract source code is located at [`contracts/BlockTix.sol`](./contracts/BlockTix.sol).

### Option A: Deploy via Remix IDE (Recommended for College Viva — No Private Keys Needed)

1. Open **[Remix Ethereum IDE](https://remix.ethereum.org/)** in your browser.
2. Under the `contracts` folder in Remix, create a file named `BlockTix.sol`.
3. Copy the entire contents of [`contracts/BlockTix.sol`](./contracts/BlockTix.sol) and paste it into Remix.
4. Go to the **Solidity Compiler** tab (left sidebar):
   - Compiler version: `0.8.20` or higher.
   - Click **Compile BlockTix.sol**.
5. Go to the **Deploy & Run Transactions** tab:
   - Environment: Select **"Injected Provider - MetaMask"**.
   - Make sure your MetaMask network is set to **Sepolia**.
   - Select contract `BlockTix`.
   - Click **Deploy** (orange button) and confirm the transaction in MetaMask.
6. Once mined, copy the deployed contract address from the bottom of Remix.
7. Paste this address into your `.env` as `VITE_CONTRACT_ADDRESS=<your_address>` or enter it directly in the app's **Wallet & Contract Settings** modal.

### Option B: Compile & Deploy via Node Scripts

1. Compile the Solidity contract:
   ```bash
   node scripts/compile.js
   ```
   *(This outputs `src/contracts/BlockTixABI.json` and `src/contracts/BlockTixBytecode.json`)*

2. Deploy using your Sepolia private key:
   ```bash
   export DEPLOYER_PRIVATE_KEY="your_testnet_private_key_without_0x"
   node scripts/deploy.js
   ```

---

## 🎓 College Viva & Demonstration Checklist

Follow this workflow to demonstrate the project to your faculty or evaluator:

1. **Connect MetaMask**:
   - Click **Connect Wallet** in the navbar.
   - Select **MetaMask (Real Web3)**. Approve the connection.
   - Notice the green **SEPOLIA** network badge and your shortened address.
2. **Examine Deployed Contract**:
   - Open **Organizer Dashboard** or click **Wallet & Contract Settings**.
   - Point out the contract address and show the link to **Sepolia Etherscan**.
3. **Purchase Ticket NFT**:
   - Go to **Explore Events**, choose an on-chain event (e.g. *Blockchain Tech Summit 2026*).
   - Click **Get Ticket**.
   - Approve the transaction in MetaMask (0.0001 Sepolia ETH).
   - Observe block mining state and celebration with real transaction hash.
4. **Inspect Ticket Provenance (`/my-tickets`)**:
   - Open **My Tickets** to view the minted pass with cryptographic QR code.
   - Click **Details** to show the provenance timeline (`MINT` → current owner).
5. **Demonstrate Peer-to-Peer Transfer**:
   - Click **Transfer** on the ticket card.
   - Enter a peer's wallet address (or quick-select Bob) and execute.
   - MetaMask prompts approval and updates ownership on-chain.
6. **Demonstrate Turnstile Verification & Double-Entry Prevention (`/verify`)**:
   - Enter your Ticket / Token ID or scan the QR code.
   - Status shows **TICKET VERIFIED (Valid for Admission)** in green.
   - Click **Approve Entry**. An on-chain `useTicket()` transaction is sent via MetaMask.
   - Re-verify the same ticket ID: The screen updates immediately to **ENTRY DENIED — TICKET ALREADY USED** in bright red.
   - Attempt to transfer the used ticket: The contract reverts, proving that redeemed tickets cannot be resold or scalped!

---

## 🔒 Security & Academic Disclosures

- **Anti-Scalping / Replay Invalidation**: The contract overrides OpenZeppelin's `_update` hook to prevent any token transfer once `tickets[tokenId].isUsed == true`.
- **Reentrancy Protection**: Uses OpenZeppelin's `ReentrancyGuard` on all payable functions.
- **Academic Note**: While blockchain enforces immutable digital ownership and deterministic state transitions, physical turnstiles also benefit from dynamic rotating QR codes to mitigate screenshot sharing across devices.

---

## 📄 License

Academic capstone project developed for B.Tech Computer Science & Engineering. Open source under the MIT License.
