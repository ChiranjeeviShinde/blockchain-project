# Tixora — Blockchain-Based Event Ticketing Platform

> **"Every Ticket Has a Chain of Trust."**

Tixora is a modern, interactive decentralized event ticketing platform frontend prototype developed for an academic B.Tech CSE project. It demonstrates how blockchain technology and smart contracts (ERC-721 standard) eliminate counterfeit tickets, duplicate gate entries, and unauthorized scalping by maintaining transparent ownership records and enabling instant QR verification.

---

## 🌟 Key Features

1. **Web3 Startup Aesthetic**:
   - Deep navy and near-black cyber backgrounds with electric cyan, blue, and violet gradients.
   - Glassmorphism panels, glowing borders, holographic ticket sheen, and perforated ticket cutout aesthetics.
   - Micro-animations, responsive layout across desktop, tablet, and mobile.

2. **Simulated Wallet Interface (EIP-1193 Ready)**:
   - Connect simulated EVM wallets (Alice: Student, Bob: Peer Recipient, Organizer Vault) or custom hex addresses.
   - Displays shortened address (`0x71A...93F2`), balance in mock ETH / INR, copy address, and account switcher.

3. **Event Marketplace**:
   - Curated events (Blockchain Tech Summit, Neon Music Festival, Campus Innovation Expo, Web3 Developer Conference, Cyberpunk Game Jam).
   - Instant search by title or venue, category filtering, price range slider, date filter, and multi-mode sorting.
   - Availability progress indicators and detailed event view with on-chain smart contract details.

4. **3-Step Simulated Blockchain Minting Experience**:
   - Step 1: Confirming purchase & allocating token ID.
   - Step 2: Processing blockchain transaction & mining block on Sepolia testnet.
   - Step 3: Success state with token ID, transaction hash, interactive QR code, and celebratory confetti.

5. **My Tickets (Digital Collectible Wallet)**:
   - Collectible NFT card styling with perforated edges and holographic sheen.
   - Ticket statuses: `VALID`, `USED`, `TRANSFERRED`.
   - On-chain inspection modal displaying complete provenance chain (`MINT` → `TRANSFER`).

6. **Peer-to-Peer Ticket Transfers**:
   - Transfer custody directly between demo accounts (e.g., Alice to Bob).
   - Strict address validation (`0x` + 40 hex chars).
   - Prevents transfers of `USED` passes or transfers by non-owners.
   - Emphasizes: *"Every transfer updates the ticket's ownership record."*

7. **Gatekeeper Ticket Verification & Turnstile Admission**:
   - Camera-based QR scanner (using `html5-qrcode`) with instant manual input fallback.
   - One-click presentation test cases:
     - `CP-TK-8021` → **TICKET VERIFIED** (Valid pass)
     - `CP-TK-5509` → **ENTRY DENIED — TICKET ALREADY USED** (Double-entry prevention)
     - `CP-FAKE-9999` → Counterfeit ID rejection
   - **Approve Entry Button**: Changes status from `VALID` to `USED` on-chain, permanently denying duplicate entry attempts.

8. **Organizer Dashboard**:
   - Live platform metrics: Total Events, Tickets Sold, Active Tickets, Used Tickets, Transfers, Demo Revenue.
   - Events Management table with allocation progress.
   - **Create Event & Contract Deployer**: Compiles and simulates deployment of new ERC-721 event contracts with preset artwork pickers.

9. **Live Blockchain Activity Explorer**:
   - Chronological connected-node transaction timeline tracking mints, transfers, deployments, and admissions.
   - Copyable transaction hashes, block numbers, gas metrics, and filtering.

10. **About & Security by Design**:
    - Complete architecture flow: React Frontend → Wallet Interface → Smart Contract Layer → Blockchain Network.
    - Comprehensive security analysis and academic engineering disclosures.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or newer recommended)
- npm or pnpm

### Installation

```bash
# Clone or navigate to the project directory
cd blockchain-project

# Install dependencies
npm install
```

### Running Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173/`. Open it in any modern browser.

### Building for Production

```bash
npm run build
```

---

## 🏛️ System Architecture

```text
┌────────────────────────┐      ┌──────────────────────────┐
│   React 19 Frontend    │ ───► │     Wallet Interface     │
│ Vite + Tailwind CSS    │      │ Non-Custodial Simulation │
└───────────┬────────────┘      └────────────┬─────────────┘
            │                                │
            ▼                                ▼
┌────────────────────────┐      ┌──────────────────────────┐
│  Smart Contract Layer  │ ───► │    Blockchain Network    │
│   ERC-721 NFT Rules    │      │  Sepolia EVM (Simulated) │
└────────────────────────┘      └──────────────────────────┘
```

---

## 🎓 Viva / Faculty Presentation Demo Flow

1. **Home Page**: Show the hero section, the live 3D-styled collectible ticket, and explain the tagline: *"Every Ticket Has a Chain of Trust."*
2. **Wallet Connection**: Open the wallet modal and show how Alice's wallet is connected with test balance.
3. **Explore Events**: Filter by category, test the price slider, and click "Get Ticket" on an event.
4. **Minting Process**: Confirm the purchase and observe the 3-step simulated minting process and confetti.
5. **My Tickets**: Show the newly minted ticket. Click "Details" to show the cryptographic QR code and provenance timeline.
6. **Transfer Ticket**: Click "Transfer" on a ticket, select Bob (`0x48B2...`), and authorize. Switch wallet view to Bob to prove that Bob now owns the pass!
7. **Gate Verification**: Go to **Verify Ticket**.
   - Test `CP-TK-8021` → Click **Verify** → **TICKET VERIFIED** in green.
   - Click **Approve Entry** → State updates to `USED`.
   - Verify the same ticket again → **ENTRY DENIED — TICKET ALREADY USED** in bright red.
8. **Organizer Dashboard**: View revenue and ticket volume metrics. Click **Create Event** to deploy a new ERC-721 contract.
9. **Ledger Activity**: View the immutable activity timeline recording every action.
10. **Reset Demo State**: Click "Reset Demo State" in the navbar/footer anytime to restore initial presentation state.

---

## 📄 License
Academic Project Prototype developed for B.Tech Computer Science & Engineering.
