
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import {
    makeContractCall,
    broadcastTransaction,
    callReadOnlyFunction,
    uintCV,
    standardPrincipalCV,
    AnchorMode,
    PostConditionMode,
    cvToJSON
} from '@stacks/transactions';

export interface YieldBoxConfig {
    contractAddress: string;
    contractName: string;
    network: 'mainnet' | 'testnet';
}

export class YieldBoxSDK {
    private config: YieldBoxConfig;
    private network: StacksMainnet | StacksTestnet;

    constructor(config: YieldBoxConfig) {
        this.config = config;
        this.network = config.network === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
    }

    /** Stake STX into the pool. */
    async stake(amount: number, senderKey: string): Promise<string> {
        const tx = await makeContractCall({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'stake',
            functionArgs: [uintCV(amount)],
            senderKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        });
        const result = await broadcastTransaction(tx, this.network);
        return result.txid;
    }

    /** Claim accrued rewards. */
    async claimRewards(senderKey: string): Promise<string> {
        const tx = await makeContractCall({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'claim-rewards',
            functionArgs: [],
            senderKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        });
        const result = await broadcastTransaction(tx, this.network);
        return result.txid;
    }

    /** Withdraw staked amount (penalty applies if early). */
    async withdraw(amount: number, senderKey: string): Promise<string> {
        const tx = await makeContractCall({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'withdraw',
            functionArgs: [uintCV(amount)],
            senderKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        });
        const result = await broadcastTransaction(tx, this.network);
        return result.txid;
    }

    /** Get current staked balance. */
    async getStake(user: string): Promise<any> {
        const result = await callReadOnlyFunction({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'get-stake',
            functionArgs: [standardPrincipalCV(user)],
            network: this.network,
            senderAddress: this.config.contractAddress,
        });
        return cvToJSON(result);
    }

    /** Calculate pending rewards. */
    async getPendingRewards(user: string): Promise<number> {
        const result = await callReadOnlyFunction({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'get-pending-rewards',
            functionArgs: [standardPrincipalCV(user)],
            network: this.network,
            senderAddress: this.config.contractAddress,
        });
        const json = cvToJSON(result);
        return parseInt(json.value?.value || '0');
    }
}
