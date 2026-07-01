FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm run build

RUN pnpm prune --prod

FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3003

CMD ["node", "dist/main.js"]
