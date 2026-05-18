# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Install curl for healthchecks
RUN apk --no-cache add curl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/backend/package*.json ./
RUN npm ci --only=production

COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./dist

USER nestjs

EXPOSE 3001
ENV PORT 3001

CMD ["node", "dist/main"]
