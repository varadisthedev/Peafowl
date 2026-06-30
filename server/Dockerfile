# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate the Prisma client for the target platform
RUN npx prisma generate

RUN npm run build


# ---- Production stage ----
FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output and the Prisma schema (needed by migrate deploy)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy the generated Prisma client from builder
COPY --from=builder /app/generated ./generated

EXPOSE 3000

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]