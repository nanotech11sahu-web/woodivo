# WOODIVO Backend — production image
# Multi-stage: full deps to build, prod-only deps to run.

# ---- Stage 1: build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---- Stage 2: production dependencies only ----
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Stage 3: runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# tini gives the Node process real signal handling (SIGTERM) so
# `docker stop` / orchestrator shutdowns trigger Nest's shutdown hooks
# (already enabled via app.enableShutdownHooks() in main.ts) instead of
# being force-killed after the grace period.
RUN apk add --no-cache tini

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json tsconfig.json ./

# Runs as the non-root `node` user baked into the base image, not root.
USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:4000/api/v1/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
