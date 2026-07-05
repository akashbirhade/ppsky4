FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production=false

COPY prisma ./prisma/
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src/

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY package.json ./

EXPOSE 5000

CMD ["node", "dist/server.js"]
