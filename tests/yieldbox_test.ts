
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';

Clarinet.test({
    name: "stake: user can deposit STX and updates total-staked",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall('yieldbox', 'stake', [types.uint(1000)], wallet1.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
        // Verify total staked
        const total = chain.callReadOnlyFn('yieldbox', 'get-total-staked', [], wallet1.address);
        total.result.expectUint(1000);
    }
});

Clarinet.test({
    name: "withdraw: early withdrawal incurs 10% penalty",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        // Stake 1000
        chain.mineBlock([
            Tx.contractCall('yieldbox', 'stake', [types.uint(1000)], wallet1.address)
        ]);

        // Withdraw immediately (early)
        let block = chain.mineBlock([
            Tx.contractCall('yieldbox', 'withdraw', [types.uint(1000)], wallet1.address)
        ]);

        // Payout should be 900 (1000 - 100 penalty)
        block.receipts[0].result.expectOk().expectUint(900);
    }
});

Clarinet.test({
    name: "withdraw: mature withdrawal has no penalty",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        chain.mineBlock([
            Tx.contractCall('yieldbox', 'stake', [types.uint(1000)], wallet1.address)
        ]);

        // Fast forward 2000 blocks (> 1440 cycles)
        chain.mineEmptyBlock(2000);

        let block = chain.mineBlock([
            Tx.contractCall('yieldbox', 'withdraw', [types.uint(1000)], wallet1.address)
        ]);

        // Payout should be 1000
        block.receipts[0].result.expectOk().expectUint(1000);
    }
});

Clarinet.test({
    name: "claim-rewards: accumulates over time",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        chain.mineBlock([
            Tx.contractCall('yieldbox', 'stake', [types.uint(10000)], wallet1.address)
        ]);

        // Fast forward 1 REWARD-CYCLE (144 blocks) -> 5% reward on 10000 = 500? 
        // Logic: (amount * cycles * 5) / 100
        // 10000 * 1 * 5 / 100 = 500
        chain.mineEmptyBlock(145);

        let block = chain.mineBlock([
            Tx.contractCall('yieldbox', 'claim-rewards', [], wallet1.address)
        ]);

        block.receipts[0].result.expectOk().expectUint(500);
    }
});
