# CardIQ Frontend Architecture

## Overview
CardIQ's frontend is a high-performance, mobile-first Next.js 14 application leveraging the App Router. It acts as the face of the fintech platform, prioritizing speed, financial readability, and robust offline capabilities (PWA).

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + CSS Variables (Themes)
- **State Management:** Zustand (Global) + TanStack Query (Server State)
- **UI Components:** Radix UI primitives + Custom Shadcn-like components
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion + Tailwind keyframes
- **PWA:** `@ducanh2912/next-pwa`

## Directory Structure (App Router)
The `src/app` directory uses Route Groups to logically separate application domains without affecting the URL path:
- `(public)`: Landing pages, marketing content.
- `(auth)`: Login, signup, verification.
- `(dashboard)`: Main overview, financial summaries.
- `(optimizer)`: Real-time transaction optimizer.
- `(recommendation)`: Personalized card stack matching.
- `(ai)`: Conversational AI insights.
- `(settings)`: User configuration and preferences.

## Design System & Theming
- **CSS Variables:** Theming is handled via CSS variables in `src/app/globals.css`. We support `light`, `dark`, and `system` themes seamlessly.
- **Tailwind Config:** Custom spacing, typography (Inter), and semantic colors (`primary`, `success`, `destructive`, `warning`) are mapped in `tailwind.config.ts`.
- **Fintech Specifics:** Custom color tokens for financial metrics (`cashback`, `points`, `miles`) are embedded to ensure visual consistency across charts and indicators.

## Core UI Components
All reusable UI components live in `src/components/ui/`. They are built with accessibility and composability in mind:
- **Button:** Supports variants (`primary`, `secondary`, `ghost`, `destructive`) and a built-in `isLoading` state.
- **Cards:** Composable blocks (`CardHeader`, `CardTitle`, `CardContent`) for financial data presentation.
- **Indicators:** Standardized `Badge` and `Skeleton` for loading states.
- **Feedback:** `EmptyState` and `ErrorState` components for graceful degradation.

## Layout System
The layout is governed by `src/components/layout/AppShell.tsx`:
- **Desktop:** Features a persistent left `Sidebar` and top `Header`.
- **Mobile:** Drops the sidebar in favor of a fixed `MobileBottomNav` for ergonomic thumb reachability.
- **Theme Toggling:** Integrated directly into the Header.

## Data Fetching & Caching
- **API Client:** A centralized Axios instance (`src/lib/api.ts`) automatically attaches JWT tokens and handles global 401/5xx errors.
- **TanStack Query:** Wraps the application to provide query caching, automatic retries (2 times), and stale-while-revalidate behavior. Default stale time is set to 5 minutes.
- **Zustand:** Used purely for synchronous client state, such as the global `notificationStore` for toast messages.

## PWA Capabilities
- Configured via `next.config.mjs` and `public/manifest.json`.
- The app is fully installable on mobile devices.
- Service workers handle offline caching for critical assets and provide a fallback UI when network access is lost.
