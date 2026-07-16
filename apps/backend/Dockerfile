FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY package.json ./
RUN npm install --production && npm cache clean --force

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["node", "dist/src/index.js"]
