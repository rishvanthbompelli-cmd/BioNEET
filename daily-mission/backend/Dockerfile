FROM node:22-alpine AS builder

# Install build dependencies (required for Prisma and native modules)
RUN apk add --no-cache python3 make g++ dumb-init

WORKDIR /app

# Install only production dependencies first (caches layers)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY backend/ .

# If you use Prisma, generate client
# RUN npx prisma generate

# Runtime image
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app /app

EXPOSE 5000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
