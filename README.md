
# arc_bot
# 🤖 Arc Lending Bot

A lightweight automation bot that runs daily supply and borrow transactions on any lending protocol deployed on **Arc Testnet**. Built to generate organic transaction volume and climb the [Arc App Explorer](https://arc-app-explorer.vercel.app) leaderboard.

---

## ✨ What It Does

- Runs **20 transactions per day** automatically
- Alternates between **supply, withdraw, borrow, and repay**
- Uses **random amounts** so activity looks organic
- Checks your **health factor** before borrowing — won't borrow if HF drops below 2.0
- Logs every transaction with timestamp and hash
- Completes all 20 txns in ~10 minutes then exits cleanly

---

## 🔧 Requirements

- Node.js v18+
- A wallet with funds on Arc Testnet
- USDC balance (get from [Circle Faucet](https://faucet.circle.com))
- WETH deposited as collateral on the lending protocol (for borrow actions)

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/cipoklean/arc_bot.git
cd arc_bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your `.env` file

```bash
cp .env.example .env
```

Open `.env` and fill in your details:

```env
PRIVATE_KEY=0xYourPrivateKeyHere
RPC_URL=https://rpc.quicknode.testnet.arc.network
```

### 4. Run the bot

```bash
node bot.js
```

That's it. The bot will fire 20 transactions and exit.

---

## ⚙️ Adapting to Your Own Protocol

This bot was built for **Arc Lending** but works with any EVM lending protocol on Arc Testnet. To use it with your own contract:

**Step 1 — Update contract addresses** in `bot.js`:

```javascript
const USDC = '0xYourUSDCAddress';
const POOL = '0xYourLendingPoolAddress';
const WETH = '0xYourWETHAddress';
```

**Step 2 — Update the POOL_ABI** to match your contract's function names:

```javascript
const POOL_ABI = [
  { name: 'supply',  ... },  // change to your supply function name
  { name: 'withdraw', ... }, // change to your withdraw function name
  { name: 'borrow',  ... },  // change to your borrow function name
  { name: 'repay',   ... },  // change to your repay function name
];
```

**Step 3 — Update getUserData()** to match your contract's storage mappings or getter functions:

```javascript
// If your contract uses public mappings:
functionName: 'supplies',  // change to your mapping name
functionName: 'borrows',   // change to your mapping name

// If your contract uses getter functions:
functionName: 'getSupplyBalance',
functionName: 'getBorrowBalance',
```

**Step 4 — Run it:**

```bash
node bot.js
```

---

## 🌐 Arc Testnet Details

| Parameter | Value |
|---|---|
| Network | Arc Testnet |
| Chain ID | `5042002` |
| Native Gas | USDC |
| RPC (Primary) | `https://rpc.quicknode.testnet.arc.network` |
| RPC (Backup) | `https://rpc.blockdaemon.testnet.arc.network` |
| Explorer | https://testnet.arcscan.app |
| Faucet | https://faucet.circle.com |

---

## 📊 Sample Output

```
Using RPC: https://rpc.quicknode.testnet.arc.network
[12:31:12 PM] 🤖 Arc Lending Bot starting...
[12:31:12 PM] 📍 Wallet: 0x9888...a7fD
[12:31:12 PM] 🌐 Network: Arc Testnet (Chain ID 5042002)
[12:31:12 PM] 🎯 Running 20 transactions now...

[12:31:13 PM] ━━━ Transaction 1/20 ━━━
[12:31:14 PM] 📊 Supply: 570422.01 USDC | Borrow: 599.90 USDC | Collateral: 1 WETH | HF: 2.67
[12:31:14 PM] Withdrawing 1.03 USDC...
[12:31:17 PM] Withdrawn ✅ — 0xb0d5c676...
[12:31:17 PM] ⏳ Next transaction in 30 seconds...

...

[12:41:22 PM] ✅ All 20 transactions complete for today!
```

---

## 🔒 Security

- **Never commit your `.env` file** — it's already in `.gitignore`
- **Never share your private key**
- This bot is for **Arc Testnet only** — do not use with real funds
- Use a dedicated testnet wallet, not your main wallet

---

## 📁 Project Structure

```
arc_bot/
├── bot.js          # Main bot logic
├── .env            # Your private config (never commit this)
├── .env.example    # Template for others to copy
├── .gitignore      # Keeps .env out of GitHub
├── package.json    # Dependencies
└── README.md       # This file
```

---

## 🔗 Related Projects

| Project | Link |
|---|---|
| Arc App Explorer | https://arc-app-explorer.vercel.app |
| Arc Lending Frontend | https://arc-lending-frontend.vercel.app |
| Arc Ecosystem Registry | https://github.com/cipoklean/arc_ecosystem |
| Arc Docs | https://docs.arc.io |

---

## 🙋 Submit Your App

If you're building on Arc, add your app to the Explorer:
👉 [Submit via GitHub Issues](https://github.com/cipoklean/arc_ecosystem/issues/new?title=New+App+Submission)

---

## ⚠️ Disclaimer

This is a testnet tool for development and demonstration purposes only.
Do not use real funds. No audit has been performed.

---

*Built on Arc Testnet — Chain ID 5042002 — USDC Native Gas*

