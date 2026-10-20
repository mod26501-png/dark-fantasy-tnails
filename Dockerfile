# ==============================================================================
# The Demon Codex — Production Multi-Stage Dockerfile
# Full-Stack Express API + Vite Client Bundle
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build environment
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

ENV NODE_ENV=production
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production lean runtime environment
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache curl

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/firebase-applet-config.json* ./
COPY --from=builder /app/firebase.json* ./
COPY --from=builder /app/firestore.rules* ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

CMD ["node", "dist/server.cjs"]
