# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY apps/frontend ./apps/frontend
# Note: In a real monorepo setup like Turborepo, this would be optimized further
WORKDIR /app/apps/frontend
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

# Next.js standalone output runs server.js
CMD ["node", "server.js"]
