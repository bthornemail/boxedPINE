/**
 * AttentionToken Engine - Knowledge-Backed Cryptocurrency System
 *
 * Implements the Universal Life Protocol's economic democracy framework
 * with knowledge-backed tokens, anti-colonization safeguards, mutual aid
 * distribution, and earth stewardship incentives.
 *
 * Following the Axiomatic Prime Directive and sacred geometry principles.
 */
import { AttentionToken, AttentionTokenBalance, AttentionTokenTransaction, TransactionType, EconomicDemocracyFramework } from '@/types/economic';
import { KnowledgeTriple } from '@/types/knowledge';
import { Logger } from '../types/ulp-core';
import { LogosIntegrationService } from '../services/logos-integration';
/**
 * Core engine for AttentionToken economic system with knowledge backing
 */
export declare class AttentionTokenEngine {
    private readonly logger;
    private readonly logosIntegration;
    private readonly economicFramework;
    private readonly PHI;
    private readonly FIBONACCI;
    private tokenNetwork;
    private balances;
    private transactionHistory;
    private mutualAidFund;
    private earthStewardshipFund;
    private consciousnessDevelopmentFund;
    constructor(logger: Logger, logosIntegration: LogosIntegrationService, economicFramework: EconomicDemocracyFramework);
    /**
     * Issue new AttentionTokens backed by knowledge
     */
    issueKnowledgeBackedTokens(knowledgeTriples: KnowledgeTriple[], recipientAddress: string, issuanceReason: string): Promise<AttentionToken[]>;
    /**
     * Process an AttentionToken transaction with full validation
     */
    processTransaction(fromAddress: string, toAddress: string, amount: number, transactionType: TransactionType, knowledgeReason: string): Promise<AttentionTokenTransaction | null>;
    /**
     * Distribute mutual aid from the community fund
     */
    distributeMutualAid(recipientAddress: string, amount: number, needCategory: string, urgencyLevel: number, justification: string): Promise<boolean>;
    /**
     * Reward earth stewardship activities with tokens
     */
    rewardEarthStewardship(stewardAddress: string, activity: string, impact: number, verification: any): Promise<number>;
    /**
     * Get current token balance for an address
     */
    getBalance(address: string): AttentionTokenBalance | null;
    /**
     * Get network statistics
     */
    getNetworkStatistics(): {
        totalTokens: number;
        totalAddresses: number;
        mutualAidFund: number;
        earthStewardshipFund: number;
        consciousnessFund: number;
        averageConsciousness: number;
        phiAlignment: number;
        wealthConcentration: number;
    };
    private initializeTokenNetwork;
    private calculateKnowledgeValue;
    private calculateKnowledgeValueFallback;
    private getGuidingStarBonus;
    private validateTokenIssuance;
    private validateTransactionAxiomatically;
    private calculateTransactionPhiCompliance;
    private getTransactionTypePhiBonus;
    private calculateTransactionConsciousness;
    private getTransactionTypeConsciousness;
    private validateTransactionAntiColonial;
    private calculateExtractionRisk;
    private getTransactionTypeRiskAdjustment;
    private requestCommunityConsent;
    private checkWealthConcentration;
    private triggerWealthRedistribution;
    private distributeUniversalBasicTokens;
    private executeTransaction;
    private updateBalance;
    private checkMutualAidTriggers;
    private updateNetworkState;
    private validateMutualAidNeed;
    private calculatePhiOptimizedAmount;
    private recordReciprocityExpectation;
    private calculateEarthStewardshipReward;
    private calculateLongTermStewardshipBonus;
    private calculateWealthConcentration;
}
//# sourceMappingURL=attention-token-engine.d.ts.map