import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Test property addition by owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('property-shares', 'add-property', [
                types.ascii("123 Main St"),
                types.uint(1000),
                types.uint(100)
            ], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "Test share purchase",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const buyer = accounts.get('wallet_1')!;
        
        let setup = chain.mineBlock([
            Tx.contractCall('property-shares', 'add-property', [
                types.ascii("123 Main St"),
                types.uint(1000),
                types.uint(100)
            ], deployer.address)
        ]);
        
        let purchase = chain.mineBlock([
            Tx.contractCall('property-shares', 'purchase-shares', [
                types.principal(deployer.address),
                types.uint(100)
            ], buyer.address)
        ]);
        
        purchase.receipts[0].result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "Test share transfer between users",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const buyer = accounts.get('wallet_1')!;
        const recipient = accounts.get('wallet_2')!;
        
        chain.mineBlock([
            Tx.contractCall('property-shares', 'add-property', [
                types.ascii("123 Main St"),
                types.uint(1000),
                types.uint(100)
            ], deployer.address)
        ]);
        
        chain.mineBlock([
            Tx.contractCall('property-shares', 'purchase-shares', [
                types.principal(deployer.address),
                types.uint(100)
            ], buyer.address)
        ]);
        
        let transfer = chain.mineBlock([
            Tx.contractCall('property-shares', 'transfer-shares', [
                types.principal(recipient.address),
                types.uint(50)
            ], buyer.address)
        ]);
        
        transfer.receipts[0].result.expectOk().expectBool(true);
    }
});
