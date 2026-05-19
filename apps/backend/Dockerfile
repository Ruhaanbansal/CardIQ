# ─── Stage 1: Build ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy workspace manifests first for layer caching
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY turbo.json ./

# Copy all workspace packages (needed for workspace:* deps)
COPY packages/ ./packages/

# Copy backend app
COPY apps/backend/ ./apps/backend/

# Install ALL deps (needed to resolve workspace:*)
RUN pnpm install --frozen-lockfile

# Build the backend
RUN pnpm --filter @cardiq/backend run build

# ─── Stage 2: Production ──────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install curl for Railway health checks
RUN apk --no-cache add curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy built output
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

USER nestjs

EXPOSE 3001

# Railway sets PORT automatically — respect it
CMD ["node", "dist/main"]
