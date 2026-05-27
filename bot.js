import { createWalletClient, createPublicClient, http, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';
dotenv.config();

const RPC = process.env.RPC_URL || 'https://rpc.quicknode.testnet.arc.network';
console.log('Using RPC:', RPC);

const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: { default: { http: [RPC] } },
};

// ── Contracts ──────────────────────────────────────────────
const USDC = '0x3600000000000000000000000000000000000000';
const POOL = '0x34947554f4Be92b14BAB291F500e61c667a62072';
const WETH = '0x3881C83EE82e2F8Be4c9eB10cf39f3eB1C275353';
// ── ABIs ───────────────────────────────────────────────────
const ERC20_ABI = [
  { name: 'approve',   type: 'function', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { name: 'allowance', type: 'function', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
];

const POOL_ABI = [
  { name: 'supply',            type: 'function', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { name: 'withdraw',          type: 'function', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { name: 'depositCollateral', type: 'function', inputs: [{ name: 'asset', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { name: 'borrow',            type: 'function', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { name: 'repay',             type: 'function', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
];

// ── Setup ──────────────────────────────────────────────────
const account = privateKeyToAccount(process.env.PRIVATE_KEY);

const walletClient = createWalletClient({
  account,
  chain: arcTestnet,
  transport: http(RPC),
});

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(RPC),
});

// ── Helpers ────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const log = (msg) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${msg}`);
};

const randomAmount = (min, max) => {
  const val = Math.random() * (max - min) + min;
  return parseUnits(val.toFixed(2), 6);
};

// ── Actions ────────────────────────────────────────────────
async function approveIfNeeded(token, spender, amount) {
  const allowance = await publicClient.readContract({
    address: token,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [account.address, spender],
  });

  if (allowance < amount) {
    log('Approving USDC...');
    const hash = await walletClient.writeContract({
      address: token,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, parseUnits('999999', 6)],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    log(`Approved ✅ — ${hash}`);
  }
}

async function supplyUSDC(amount) {
  await approveIfNeeded(USDC, POOL, amount);
  log(`Supplying ${formatUnits(amount, 6)} USDC...`);
  const hash = await walletClient.writeContract({
    address: POOL,
    abi: POOL_ABI,
    functionName: 'supply',
    args: [amount],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  log(`Supplied ✅ — ${hash}`);
  return hash;
}

async function withdrawUSDC(amount) {
  log(`Withdrawing ${formatUnits(amount, 6)} USDC...`);
  const hash = await walletClient.writeContract({
    address: POOL,
    abi: POOL_ABI,
    functionName: 'withdraw',
    args: [amount],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  log(`Withdrawn ✅ — ${hash}`);
  return hash;
}

async function borrowUSDC(amount) {
  log(`Borrowing ${formatUnits(amount, 6)} USDC...`);
  const hash = await walletClient.writeContract({
    address: POOL,
    abi: POOL_ABI,
    functionName: 'borrow',
    args: [amount],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  log(`Borrowed ✅ — ${hash}`);
  return hash;
}

async function repayUSDC(amount) {
  await approveIfNeeded(USDC, POOL, amount);
  log(`Repaying ${formatUnits(amount, 6)} USDC...`);
  const hash = await walletClient.writeContract({
    address: POOL,
    abi: POOL_ABI,
    functionName: 'repay',
    args: [amount],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  log(`Repaid ✅ — ${hash}`);
  return hash;
}

async function getUserData() {
  try {
    const supplyData = await publicClient.readContract({
      address: POOL,
      abi: [{
        name: 'supplies',
        type: 'function',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
          { name: 'amount', type: 'uint256' },
          { name: 'lastUpdateTime', type: 'uint256' },
          { name: 'interestEarned', type: 'uint256' }
        ],
        stateMutability: 'view'
      }],
      functionName: 'supplies',
      args: [account.address],
    });

    const borrowData = await publicClient.readContract({
      address: POOL,
      abi: [{
        name: 'borrows',
        type: 'function',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
          { name: 'collateralAmount', type: 'uint256' },
          { name: 'collateralAsset', type: 'address' },
          { name: 'borrowedAmount', type: 'uint256' },
          { name: 'lastUpdateTime', type: 'uint256' },
          { name: 'interestOwed', type: 'uint256' }
        ],
        stateMutability: 'view'
      }],
      functionName: 'borrows',
      args: [account.address],
    });

    const supplyBalance     = supplyData[0];
    const borrowBalance     = borrowData[2];
    const collateralBalance = borrowData[0];

    let healthFactor = BigInt('3000000000000000000');
    if (borrowBalance > BigInt(0) && collateralBalance > BigInt(0)) {
      const collateralValueUSDC = (collateralBalance * BigInt(2000) * BigInt(1e6)) / BigInt(1e18);
      const threshold = BigInt(80) * collateralValueUSDC / BigInt(100);
      healthFactor = (threshold * BigInt(1e18)) / borrowBalance;
    }

    log(`📊 Supply: ${formatUnits(supplyBalance, 6)} USDC | Borrow: ${formatUnits(borrowBalance, 6)} USDC | Collateral: ${formatUnits(collateralBalance, 18)} WETH | HF: ${formatUnits(healthFactor, 18)}`);

    return { supplyBalance, borrowBalance, collateralBalance, healthFactor };

  } catch (err) {
    log(`⚠️ getUserData failed: ${err.message}`);
    return {
      supplyBalance:     BigInt(0),
      borrowBalance:     BigInt(0),
      collateralBalance: BigInt(0),
      healthFactor:      BigInt('3000000000000000000'),
    };
  }
}

// ── Transaction Sequence ───────────────────────────────────
async function runSequence(txNumber) {
  log(`\n━━━ Transaction ${txNumber}/20 ━━━`);

  const userData = await getUserData();
  const supplyBal = userData.supplyBalance;
  const borrowBal = userData.borrowBalance;
  const action = txNumber % 4;

  try {
    if (action === 0) {
      const amount = randomAmount(1, 5);
      await supplyUSDC(amount);

    } else if (action === 1) {
      if (supplyBal > parseUnits('2', 6)) {
        const amount = randomAmount(1, 2);
        await withdrawUSDC(amount);
      } else {
        const amount = randomAmount(1, 3);
        await supplyUSDC(amount);
      }

    } else if (action === 2) {
      const hf = Number(userData.healthFactor) / 1e18;
      if (userData.collateralBalance > 0n && hf > 2.0) {
        const amount = randomAmount(0.5, 2);
        await borrowUSDC(amount);
      } else {
        const amount = randomAmount(1, 3);
        await supplyUSDC(amount);
      }

    } else if (action === 3) {
      if (borrowBal > parseUnits('1', 6)) {
        const amount = randomAmount(0.5, 1);
        await repayUSDC(amount);
      } else {
        const amount = randomAmount(1, 3);
        await supplyUSDC(amount);
      }
    }

  } catch (err) {
    log(`❌ Error on tx ${txNumber}: ${err.message}`);
  }
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  log('🤖 Arc Lending Bot starting...');
  log(`📍 Wallet: ${account.address}`);
  log(`🌐 Network: Arc Testnet (Chain ID 5042002)`);
  log(`🎯 Running 20 transactions now...\n`);

  for (let i = 1; i <= 20; i++) {
    await runSequence(i);
    if (i < 20) {
      log(`⏳ Next transaction in 30 seconds...\n`);
      await sleep(30 * 1000);
    }
  }

  log('\n✅ All 20 transactions complete for today!');
  process.exit(0);
}

main().catch(console.error);
