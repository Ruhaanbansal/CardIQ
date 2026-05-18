# CardIQ Recommendation Engine Architecture

## Overview
The Recommendation Engine is a purely **deterministic, 11-step financial optimization pipeline**. No AI is used to rank cards. All outputs are reproducible from the same `SpendingProfile` input.

## 11-Step Execution Flow

```mermaid
flowchart TD
    A[SpendingProfile Input] --> B[ProfileAnalysisService\nCategory concentration, dominant spend]
    B --> C[Fetch All Active Cards]
    C --> D[EligibilityEngineService\nSalary · Credit Score · Employment]
    D --> E{Eligible?}
    E -- No --> F[Skip Card + Log Reason]
    E -- Yes --> G[AnnualSimulationService\nProject rewards per category]
    G --> H[ApprovalProbabilityService\nScore: Credit + Salary + Relationship]
    H --> I[RankingEngineService\n6-Dimension Weighted Score]
    I --> J[Sort by totalScore DESC]
    J --> K[StackRecommendationService\nBuild 2-card complementary stack]
    K --> L[OverlapDetectionService\nDetect redundant reward types + fees]
    L --> M[RecommendationExplainabilityService\nGenerate plain-English reasoning]
    M --> N[Confidence Scoring\nruleCoverage · freshness]
    N --> O[RecommendationResult]
```

## Ranking Weights

| Dimension | Weight |
|---|---|
| Cashback / Reward Alignment | 28% |
| Benefit Coverage | 20% |
| Fee Efficiency | 18% |
| Approval Likelihood | 16% |
| Travel Alignment | 12% |
| Lifestyle Alignment | 6% |

## Stack Optimization Logic
The `StackRecommendationService` builds a **complementary 2-card stack** by:
1. Taking the highest-ranked card as `primary`.
2. Finding the highest-ranked card with a **different reward type** as `secondary`.
3. Assigning spending categories to the most appropriate card.
4. Flagging overlapping reward types or duplicate lounge access.

## Confidence Scoring
- Drops when cards have no matching reward rules (zero simulated rewards).
- Penalized when `creditScore` is absent for premium cards.
- Freshness score reflects query latency (< 500ms = 100%).
