# CardIQ Rewards Engine Architecture

This document describes the Phase 4 deterministic financial rewards engine.

## Core Philosophy
The Rewards Engine evaluates single or bulk transactions to determine the exact cash value or points yielded by a transaction. 
It uses a highly deterministic, JSON-based Domain Specific Language (DSL) to express card rules, completely avoiding non-deterministic AI calculations.

## Priority Execution Chain

Transactions are evaluated against card rules in the following strict order inside `RewardsEngineService.calculateReward()`:

1. **Global Exclusions**
   - The `ExclusionEngineService` checks if the transaction belongs to an excluded category (e.g., `wallet_loads`, `crypto`, `rent`).
   - If a match is found, the evaluation terminates immediately, returning 0 rewards.

2. **Custom Reward Rules**
   - Rules stored in `RewardRuleEntity` are fetched and sorted by `priority` (ascending).
   - The `RewardRuleParserService` evaluates the `conditions` JSON block against the `TransactionContext`.
   - The highest priority rule that perfectly matches the context is selected.

3. **Cap Tracking**
   - The selected rule's `reward` block is evaluated. If it has a `cap.monthly` or `cap.perTransaction` limit, the `CapTrackingService` calculates if the limit has been hit, simulating the partial reward.

4. **Base Reward Fallback**
   - If no custom rule matches the transaction, the card's `baseRewardRate` is applied.

5. **Effective Savings Calculation**
   - `EffectiveSavingsService` translates Points/Miles into INR based on the card's `pointValueInr` property.

6. **Milestone Tracking**
   - `MilestoneEngineService` evaluates if this specific transaction pushed the user's `yearlySpend` over a defined milestone target (e.g., Annual Fee Waiver).

## The JSON DSL

The engine is powered by JSON condition/action blocks.

### Example: SBI Cashback Card (5% on Online Spends)

```json
// Condition Block
{
  "merchant": [], // Applies to all
  "paymentMethod": ["ECOM"], // Must be online
  "excludedCategories": ["utilities", "insurance", "education"] // Overrides
}

// Reward Action Block
{
  "type": "cashback",
  "rate": 5,
  "cap": {
    "monthly": 5000
  }
}
```

## Traceability & Explainability
The output `RewardCalculationResult` includes `appliedRules`, `excludedRules`, and `warnings` arrays. This provides complete explainability for the UI to render exactly *why* a reward was granted, maintaining user trust.
