# CardIQ Public Platform Architecture

## Overview
The public platform serves as the acquisition, discovery, and educational layer of CardIQ. It is built entirely on Next.js 14 App Router, heavily utilizing static generation and SEO-first practices to drive organic traffic.

## Core Concepts
- **Deterministic Trust:** The landing page explicitly highlights "Deterministic Engines" and "Daily Verified Data" over generic AI hype.
- **Conversion UX:** The `QuickOptimizer` component acts as a high-conversion lead magnet, simulating the core value proposition directly on the homepage before requiring signup.
- **Mobile-First Data Density:** Credit card comparisons (`ComparisonTable.tsx`) are notoriously difficult on mobile. We prioritize horizontal scrolling and fixed-headers to ensure readability.

## Route Architecture
The `src/app/(public)` group houses all marketing routes:
- `/` - Landing Page
- `/cards` - Discovery hub with filtering
- `/cards/[slug]` - Detailed individual card view
- `/compare` - Side-by-side selection and comparison
- `/categories/[slug]` - Highly targeted SEO pages (e.g., Best Lounge Cards)

## SEO Strategy
- **JSON-LD Injection:** A reusable `<JsonLd />` component injects Organization, SoftwareApplication, and FAQ schema directly into the `head`.
- **Dynamic Sitemaps:** `sitemap.ts` and `robots.ts` programmatically generate required crawler instructions.

## Onboarding Funnel
Located in `src/app/(auth)/onboarding`, the onboarding flow uses `zustand/middleware` (`persist`) to save the user's progress in `localStorage`. This ensures that if they drop off, they resume their exact spot (spend profile, preferences, current wallet).

## Performance Optimization
- Components heavily rely on Tailwind CSS for minimal styling overhead.
- React components use `lucide-react` for lightweight, scalable SVGs.
- Global Search implements a command palette pattern that prevents navigation unloads until a result is clicked.
