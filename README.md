# CardIQ

CardIQ is an AI-powered Indian credit card intelligence and optimization platform.

## Architecture
CardIQ uses a modern Turborepo monorepo architecture:
- **Frontend**: Next.js 14 App Router, TailwindCSS, shadcn/ui
- **Admin**: Next.js 14 App Router
- **Backend**: NestJS 10, PostgreSQL (TypeORM), Redis, BullMQ
- **Packages**: Shared utilities, TS/ESLint configs, Design System (`ui`), and more.
- **Infrastructure**: Docker Compose, ChromaDB, Nginx.

## Prerequisites
- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose

## Quick Start
1. Clone the repository.
2. Run `pnpm install` at the root.
3. Copy `.env.example` to `.env.development` and populate with your credentials.
4. Run `docker-compose -f docker-compose.dev.yml up -d` to spin up infrastructure (PostgreSQL, Redis, ChromaDB).
5. Run `pnpm run dev` to start all applications in development mode.

## Development Workflows
- **Build All**: `pnpm run build`
- **Lint All**: `pnpm run lint`
- **Format**: `pnpm run format`

## Documentation
Please refer to the `docs/` directory for detailed architecture, API, and deployment documentation.
