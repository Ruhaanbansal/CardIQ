# CardIQ Merchant Resolution Flow

This document details the deterministic, multi-layered merchant resolution pipeline implemented in Phase 3.

## Overview
Bank transaction narrations are extremely messy and vary wildly across banks and payment gateways (e.g., POS vs UPI vs PayU). Our goal is to extract the true merchant identity and category consistently.

## The Normalization Pipeline

Before a transaction hits the resolution database, it is normalized:
1. **Narration Parsing**: Detects if the string is `POS`, `UPI`, or `ECOM`. Strips generic bank prefixes like `UPI/P2A/` and trailing VPA addresses.
2. **String Cleaning**: Removes special characters and standardizes whitespace.
3. **Stop Word Removal**: Automatically strips corporate suffixes (`PVT`, `LTD`, `INC`) and city suffixes (`BENGALURU`, `MUMBAI`) to isolate the core brand name.
4. **Token Standardization**: Normalizes known gateway tokens (`AMZN` -> `amazon`, `MKTPLACE` -> `marketplace`).

## The Resolution Fallback Chain

The `ResolutionEngineService` executes a strict, deterministic fallback chain:

1. **Exact Match (100% Confidence)**
   - Queries `slug` and `normalizedName` directly against the database.
   
2. **Database Trigram Match (>80% Confidence)**
   - Uses PostgreSQL's `pg_trgm` extension via `similarity()` function to find highly similar strings.
   - We verify the DB match in memory using Levenshtein distance to ensure we do not map false positives.

3. **Alias Fuzzy Match (>85% Confidence)**
   - If the name doesn't match the primary merchant name, the engine searches the `aliases` array for a fuzzy match using Levenshtein scoring.

4. **Unknown Merchant Queue (0% Confidence)**
   - If all deterministic algorithms fail, the narration is saved to the `unknown_merchants` table.
   - It tracks the `occurrenceCount` so administrators can prioritize mapping frequently occurring unknown merchants.
   - AI categorization is deferred as a fallback layer (to be triggered asynchronously or via admin dashboard).

## Security and Observability
- Every resolution attempt is logged in `merchant_resolution_logs` with the raw input, normalized string, resolved ID, and the `resolutionMethod` used. This guarantees complete observability into the engine's accuracy.
- Successful mappings are cached using Redis (`@nestjs/cache-manager`) for 24 hours to prevent redundant database queries for common transactions like "SWIGGY" and "ZOMATO".
