# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm db:generate
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package.json for reference
COPY --from=builder /app/package.json ./

# Copy node_modules with generated Prisma client
COPY --from=builder /app/node_modules ./node_modules

# Copy prisma schema (needed for migrations)
COPY --from=builder /app/prisma ./prisma

# Copy built files
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

EXPOSE 4000

CMD ["node", "dist/index.js"]
