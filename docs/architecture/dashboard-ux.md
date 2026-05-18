# CardIQ Dashboard UX Architecture

## Overview
The authenticated dashboard is the core operational cockpit for CardIQ users. Built on Next.js 14 App Router, it prioritizes real-time financial visibility, high-performance data rendering (via TanStack Query and Recharts), and mobile-first ergonomics.

## Core Design Principles
1. **Financial Readability:** Colors carry semantic weight. `fintech-cashback` (Emerald), `fintech-points` (Indigo), and `fintech-miles` (Sky) are used consistently across charts, badges, and activity feeds to allow users to scan their optimizations instantly.
2. **Speed & Optimism:** Real-time optimizations happen instantly. We utilize TanStack Query's optimistic updates where possible and maintain a 5-minute stale-time for wallet data to prevent unnecessary loading spinners.
3. **Data Density without Clutter:** The `WalletGrid` and `FeeTracker` pack significant information (fee waivers, renewal dates, reward rates) into compact, visually distinct cards rather than overwhelming data tables.

## Data Fetching Strategy (Server State)
All external data fetching is centralized in `src/hooks/api/`. 
- **`useWallet()`**: Manages the user's current card stack. Employs `initialData` for skeleton-free loading where possible.
- **`useOptimizer()`**: Handles POST requests to the Phase 6 optimization engine. Wraps mutations to trigger global success/error toast notifications automatically.

## Client State Management
- **`walletStore` (Zustand):** Handles purely client-side concerns like search queries and sorting preferences within the `/wallet` page. This ensures instant filtering without API round-trips.
- **`notificationStore`**: A global queue for toast alerts (cap warnings, API errors, success states).

## AI Integration UX
AI reasoning is never presented as a generic chatbot block. Instead, it is highly contextualized:
- **`AIInsightPanel`**: Injected directly into the `OptimizationResultCard` to explain *why* a card was chosen (e.g., MCC mapping, exclusion checks).
- **`RecommendationPreview`**: Surfaces actionable insights (e.g., "Add Axis ATLAS") directly on the dashboard homepage, pulling from the Phase 5 recommendation engine.

## Financial Visualizations
Built with `recharts` for highly responsive, SVG-based rendering:
- **`SpendBreakdownChart` (PieChart):** Visualizes spending distribution across categories using the semantic fintech color scale.
- **`SavingsTrendChart` (AreaChart):** Shows the month-over-month compounding value of using the CardIQ optimizer.

## Mobile Ergonomics
The dashboard relies on the `AppShell` configured in Phase 10, which automatically degrades the desktop sidebar into a thumb-accessible `MobileBottomNav`, keeping the core actions (Home, Wallet, Optimize) always within reach.
