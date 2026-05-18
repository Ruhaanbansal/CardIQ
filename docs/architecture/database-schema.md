# CardIQ Database Architecture

This document describes the Phase 1 implementation of the CardIQ database architecture using PostgreSQL 15+ and TypeORM.

## Core Schema Principles
- **UUID Primary Keys**: Every table uses a `uuid-ossp` generated `id`.
- **Soft Deletes**: Every entity uses `deletedAt` for audit safety and data recovery.
- **Auditing**: `createdAt` and `updatedAt` are strictly managed via TypeORM.

## High-Level Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    BANK {
        uuid id PK
        string name
        string slug
        string logoUrl
        boolean isActive
    }

    CREDIT_CARD {
        uuid id PK
        uuid bankId FK
        string name
        string slug
        enum network
        enum cardType
        enum tier
        decimal joiningFee
        decimal annualFee
        decimal baseRewardRate
        boolean isActive
    }

    USER {
        uuid id PK
        string email
        string firstName
        enum role
    }

    USER_CARD {
        uuid id PK
        uuid userId FK
        uuid cardId FK
        boolean isActive
    }

    MERCHANT {
        uuid id PK
        string name
        string normalizedName
        enum category
        string[] aliases
    }

    MERCHANT_ALIAS {
        uuid id PK
        uuid merchantId FK
        string alias
        string aliasNormalized
    }

    BANK ||--o{ CREDIT_CARD : "issues"
    USER ||--o{ USER_CARD : "holds"
    CREDIT_CARD ||--o{ USER_CARD : "is held by"
    MERCHANT ||--o{ MERCHANT_ALIAS : "has"
```

## Indexing Strategy

> [!TIP]
> The database is heavily optimized for search using PostgreSQL extensions.

1. **pg_trgm**: Applied to `MerchantEntity.normalizedName` to allow for rapid fuzzy matching and alias detection.
2. **Standard Indices**: Applied to commonly queried fields like `slug`, `bankId`, `userId`, `isActive`.
3. **Unique Indices**: Enforced on `email` (Users) and `slug` (Banks, Cards, Merchants) to ensure deterministic data resolution.

## Seeding Infrastructure
The database includes an idempotent seeding strategy (`seed-banks.ts`, `seed-credit-cards.ts`, `seed-merchants.ts`). 
It securely drops the initial deterministic mapping of 24 Indian banks, 50 major credit cards, and top Indian merchants without duplicates.
